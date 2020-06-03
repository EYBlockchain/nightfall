/**
Contract to enable the management of private fungible token (ERC-20) transactions using zk-SNARKs.
@Author Westlad, Chaitanya-Konda, iAmMichaelConnor
*/

pragma solidity ^0.5.8;

import "./Ownable.sol";
import "./MerkleTree.sol";
import "./Verifier_Interface.sol";
import "./ERC20Interface.sol";
import "./PublicKeyTree.sol";

contract FTokenShield is Ownable, MerkleTree, PublicKeyTree {
  // ENUMS:
  enum TransactionTypes { Mint, Transfer, Burn, SimpleBatchTransfer, ConsolidationTransfer, MintRC, TransferRC, BurnRC}

  // EVENTS:
  // Observers may wish to listen for nullification of commitments:
  event MintRC(uint128 amount, bytes32 commitment, bytes32 zkpPublicKey);
  event Transfer(bytes32 nullifier1, bytes32 nullifier2);
  event TransferRC(bytes32[] publicInputs);
  event SimpleBatchTransfer(bytes32 nullifier);
  event ConsolidationTransfer(bytes32[] nullifiers);
  event Burn(bytes32 nullifier);
  event BurnRC(bytes32[] publicInputs);

  // Observers may wish to listen for zkSNARK-related changes:
  event VerifierChanged(address newVerifierContract);
  event VkChanged(TransactionTypes txType);

  // For testing only. This SHOULD be deleted before mainnet deployment:
  event GasUsed(uint256 byShieldContract, uint256 byVerifierContract);

  // CONTRACT INSTANCES:
  Verifier_Interface private verifier; // the verification smart contract

  // PRIVATE TRANSACTIONS' PUBLIC STATES:
  mapping(bytes32 => bytes32) public nullifiers; // store nullifiers of spent commitments
  mapping(bytes32 => bytes32) public roots; // holds each root we've calculated so that we can pull the one relevant to the prover
  mapping(uint => uint256[]) public vks; // mapped to by an enum uint(TransactionTypes):

  bytes32 public latestRoot; // holds the index for the latest root so that the prover can provide it later and this contract can look up the relevant root

  // FUNCTIONS:
  constructor(address _verifier) public {
      _owner = msg.sender;
      verifier = Verifier_Interface(_verifier);
  }

  /**
  self destruct
  */
  function close() external onlyOwner {
      selfdestruct(address(uint160(_owner)));
  }

  /**
  function to change the address of the underlying Verifier contract
  */
  function changeVerifier(address _verifier) external onlyOwner {
      verifier = Verifier_Interface(_verifier);
      emit VerifierChanged(_verifier);
  }

  /**
  returns the verifier-interface contract address that this shield contract is calling
  */
  function getVerifier() public view returns (address) {
      return address(verifier);
  }

  /**
  Stores verification keys (for the 'mint', 'transfer' and 'burn' computations).
  */
  function registerVerificationKey(uint256[] calldata _vk, TransactionTypes _txType) external onlyOwner {
      // CAUTION: we do not prevent overwrites of vk's. Users must listen for the emitted event to detect updates to a vk.
      vks[uint(_txType)] = _vk;

      emit VkChanged(_txType);
  }

  /**
  The mint function accepts fungible tokens from the specified fToken ERC-20 contract and creates the same amount as a commitment.
  */
  function mint(
      bytes32 tokenContractAddress, // Take in as bytes32 for consistent hashing
      uint256[] calldata _proof,
      uint256[] calldata _inputs,
      uint128 _value,
      bytes32 _commitment
    ) external {
      // gas measurement:
      uint256 gasCheckpoint = gasleft();

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(tokenContractAddress, uint128(_value), _commitment)) << 8); // Note that we force the _value to be left-padded with zeros to fill 128-bits, so as to match the padding in the hash calculation performed within the zokrates proof.
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      uint256 gasUsedByShieldContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, vks[uint(TransactionTypes.Mint)]);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      uint256 gasUsedByVerifierContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // update contract states
      latestRoot = insertLeaf(_commitment); // recalculate the root of the merkleTree as it's now different
      roots[latestRoot] = latestRoot; // and save the new root to the list of roots

      // Finally, transfer the fTokens from the sender to this contract

      // Need to cast from bytes32 to address.
      ERC20Interface tokenContract = ERC20Interface(address(uint160(uint256(tokenContractAddress))));
      bool transferCheck = tokenContract.transferFrom(msg.sender, address(this), _value);
      require(transferCheck, "Commitment cannot be minted");

      // gas measurement:
      gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
      emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
  }

  /**
  The transfer function transfers a commitment to a new owner
  */
  function transfer(
      uint256[] calldata _proof,
      uint256[] calldata _inputs,
      bytes32 _root,
      bytes32 _nullifierC,
      bytes32 _nullifierD,
      bytes32 _commitmentE,
      bytes32 _commitmentF
    ) external {

      // gas measurement:
      uint256[3] memory gasUsed; // array needed to stay below local stack limit
      gasUsed[0] = gasleft();

      // check inputs vs on-chain states
      require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
      require(_nullifierC != _nullifierD, "The two input nullifiers must be different!");
      require(_commitmentE != _commitmentF, "The new commitments (commitmentE and commitmentF) must be different!");
      require(nullifiers[_nullifierC] == 0, "The commitment being spent (commitmentE) has already been nullified!");
      require(nullifiers[_nullifierD] == 0, "The commitment being spent (commitmentF) has already been nullified!");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifierC, _nullifierD, _commitmentE, _commitmentF)) << 8);
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      gasUsed[1] = gasUsed[0] - gasleft();
      gasUsed[0] = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, vks[uint(TransactionTypes.Transfer)]);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      gasUsed[2] = gasUsed[0] - gasleft();
      gasUsed[0] = gasleft();

      // update contract states
      nullifiers[_nullifierC] = _nullifierC; //remember we spent it
      nullifiers[_nullifierD] = _nullifierD; //remember we spent it

      bytes32[] memory leaves = new bytes32[](2);
      leaves[0] = _commitmentE;
      leaves[1] = _commitmentF;

      latestRoot = insertLeaves(leaves); // recalculate the root of the merkleTree as it's now different
      roots[latestRoot] = latestRoot; // and save the new root to the list of roots

      emit Transfer(_nullifierC, _nullifierD);

      // gas measurement:
      gasUsed[1] = gasUsed[1] + gasUsed[0] - gasleft();
      emit GasUsed(gasUsed[1], gasUsed[2]);
  }

  /**
  The transfer function transfers 20 commitments to new owners
  */
  function simpleBatchTransfer(
      uint256[] calldata _proof,
      uint256[] calldata _inputs,
      bytes32 _root,
      bytes32 _nullifier,
      bytes32[] calldata _commitments
    ) external {

      // gas measurement:
      uint256 gasCheckpoint = gasleft();

      // check inputs vs on-chain states
      require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
      require(nullifiers[_nullifier] == 0, "The commitment being spent has already been nullified!");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifier, _commitments)) << 8);
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      uint256 gasUsedByShieldContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, vks[uint(TransactionTypes.SimpleBatchTransfer)]);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      uint256 gasUsedByVerifierContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // update contract states
      nullifiers[_nullifier] = _nullifier; //remember we spent it

      latestRoot = insertLeaves(_commitments);
      roots[latestRoot] = latestRoot; //and save the new root to the list of roots

      emit SimpleBatchTransfer(_nullifier);

      // gas measurement:
      gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
      emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
  }

  /**
  This transfer function transfers 20 commitments to a new owner
  */
  function consolidationTransfer(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _root, bytes32[] calldata _nullifiers, bytes32 _commitment) external {

      // gas measurement:
      uint256 gasCheckpoint = gasleft();

      // check inputs vs on-chain states
      require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
      for (uint i = 0; i < _nullifiers.length; i++) {
        require(nullifiers[_nullifiers[i]] == 0, "The commitment being spent has already been nullified!");
        nullifiers[_nullifiers[i]] = _nullifiers[i]; //remember we spent it
      }

      // Check that the publicInputHash equals the hash of the 'public inputs':
      // bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifiers, _commitment)) << 8);
      require(publicInputHashCheck == bytes31(bytes32(_inputs[0]) << 8), "publicInputHash cannot be reconciled");

      // gas measurement:
      uint256 gasUsedByShieldContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, vks[uint(TransactionTypes.ConsolidationTransfer)]);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      uint256 gasUsedByVerifierContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      latestRoot = insertLeaf(_commitment);
      roots[latestRoot] = latestRoot; //and save the new root to the list of roots

      emit ConsolidationTransfer(_nullifiers);

      // gas measurement:
      gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
      emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
  }

  function burn(bytes32 tokenContractAddress, uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _root, bytes32 _nullifier, uint128 _value, uint256 _payTo) external {

      // gas measurement:
      uint256 gasCheckpoint = gasleft();

      // check inputs vs on-chain states
      require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
      require(nullifiers[_nullifier]==0, "The commitment being spent has already been nullified!");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(tokenContractAddress, _root, _nullifier, uint128(_value), _payTo)) << 8); // Note that although _payTo represents an address, we have declared it as a uint256. This is because we want it to be abi-encoded as a bytes32 (left-padded with zeros) so as to match the padding in the hash calculation performed within the zokrates proof. Similarly, we force the _value to be left-padded with zeros to fill 128-bits.
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      uint256 gasUsedByShieldContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, vks[uint(TransactionTypes.Burn)]);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      uint256 gasUsedByVerifierContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      nullifiers[_nullifier] = _nullifier; // add the nullifier to the list of nullifiers

      // Need to cast from bytes32 to address.
      ERC20Interface tokenContract = ERC20Interface(address(uint160(uint256(tokenContractAddress))));
      bool transferCheck = tokenContract.transfer(address(_payTo), _value);
      require(transferCheck, "Commitment cannot be burned");

      emit Burn(_nullifier);

      // gas measurement:
      gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
      emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
  }

  /**
  The mint function accepts fungible tokens from the specified fToken ERC-20 contract and creates the same amount as a commitment.
  */
  function mintRC(
    bytes32 tokenContractAddress, // Take in as bytes32 for consistent hashing
    uint256[] calldata _proof,
    uint256[] calldata _inputs,
    uint128 _value,
    bytes32 _commitment,
    bytes32 zkpPublicKey)
    external onlyCheckedUser(zkpPublicKey) {

      // gas measurement:
      uint256 gasCheckpoint = gasleft();

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(tokenContractAddress, uint128(_value), _commitment, zkpPublicKey)) << 8); // Note that we force the _value to be left-padded with zeros to fill 128-bits, so as to match the padding in the hash calculation performed within the zokrates proof.
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      uint256 gasUsedByShieldContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, vks[uint(TransactionTypes.Mint)]);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      uint256 gasUsedByVerifierContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // update contract states
      latestRoot = insertLeaf(_commitment); // recalculate the root of the merkleTree as it's now different
      roots[latestRoot] = latestRoot; // and save the new root to the list of roots

      // Finally, transfer the fTokens from the sender to this contract
      // Need to cast from bytes32 to address.
      ERC20Interface tokenContract = ERC20Interface(address(uint160(uint256(tokenContractAddress))));
      bool transferCheck = tokenContract.transferFrom(msg.sender, address(this), _value);
      require(transferCheck, "Commitment cannot be minted");

      emit MintRC(_value, _commitment, zkpPublicKey);

      // gas measurement:
      gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
      emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
  }

  /**
  The transfer function transfers a commitment to a new owner
  */
  function transferRC(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32[] calldata publicInputs) external {

      // gas measurement:
      uint256[3] memory gasUsed; // array needed to stay below local stack limit
      gasUsed[0] = gasleft();

      //TODO - need to enforce correct public keys!!
      // Unfortunately stack depth constraints mandate an array, so we can't use more friendly names.
      // However, here's a handy guide:
      // publicInputs[0] - root (of the commitment Merkle tree)
      // publicInputs[1] - nullifierC
      // publicInputs[2] - nullifierD
      // publicInputs[3] - commitmentE
      // publicInputs[4] - commitmentF
      // publicInputs[5] - root (of public key Merkle tree)
      // publicInputs[6..] - elGamal

      // check inputs vs on-chain states
      require(roots[publicInputs[0]] == publicInputs[0], "The input root has never been the root of the Merkle Tree");
      require(publicInputs[1] != publicInputs[2], "The two input nullifiers must be different!");
      require(publicInputs[3] != publicInputs[4], "The new commitments (commitmentE and commitmentF) must be different!");
      require(nullifiers[publicInputs[1]] == 0, "The commitment being spent (commitmentE) has already been nullified!");
      require(nullifiers[publicInputs[2]] == 0, "The commitment being spent (commitmentF) has already been nullified!");
      require(publicKeyRoots[publicInputs[5]] != 0,"The input public key root has never been a root of the Merkle Tree");
      require(publicInputs[10] == compressedAdminPublicKeys[0], 'Admin public key 0 does not match');
      require(publicInputs[11] == compressedAdminPublicKeys[1], 'Admin public key 1 does not match');
      require(publicInputs[12] == compressedAdminPublicKeys[2], 'Admin public key 2 does not match');

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(publicInputs)) << 8);
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      gasUsed[1] = gasUsed[0] - gasleft();
      gasUsed[0] = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, vks[uint(TransactionTypes.Transfer)]);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      gasUsed[2] = gasUsed[0] - gasleft();
      gasUsed[0] = gasleft();

      // update contract states
      nullifiers[publicInputs[1]] = publicInputs[1]; //remember we spent it
      nullifiers[publicInputs[2]] = publicInputs[2]; //remember we spent it

      bytes32[] memory leaves = new bytes32[](2);
      leaves[0] = publicInputs[3];
      leaves[1] = publicInputs[4];

      latestRoot = insertLeaves(leaves); // recalculate the root of the merkleTree as it's now different
      roots[latestRoot] = latestRoot; // and save the new root to the list of roots

      emit TransferRC(publicInputs);

      // gas measurement:
      gasUsed[1] = gasUsed[1] + gasUsed[0] - gasleft();
      emit GasUsed(gasUsed[1], gasUsed[2]);
  }
  function burnRC(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32[] calldata publicInputs) external {

      // gas measurement:
      uint256 gasCheckpoint = gasleft();
      
      // Unfortunately stack depth constraints mandate an array, so we can't use more friendly names.
      // publicInputs[0] - tokenContractAddress (left-padded with 0s)
      // publicInputs[1] - root (of the commitment Merkle tree)
      // publicInputs[2] - nullifier
      // publicInputs[3] - value
      // publicInputs[4] - payTo address
      // publicInputs[5] - root (of public key Merkle tree)
      // publicInputs[6:12] - elGamal (6 elements)

      // check inputs vs on-chain states
      require(roots[publicInputs[1]] == publicInputs[1], "The input root has never been the root of the Merkle Tree");
      require(nullifiers[publicInputs[2]]==0, "The commitment being spent has already been nullified!");
      require(publicKeyRoots[publicInputs[5]] != 0,"The input public key root has never been a root of the Merkle Tree");
      require(publicInputs[8] == compressedAdminPublicKeys[0], 'Admin public key 0 does not match');

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      // This line can be made neater when we can use pragma 0.6.0 and array slices
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(publicInputs)) << 8); // Note that although _payTo represents an address, we have declared it as a uint256. This is because we want it to be abi-encoded as a bytes32 (left-padded with zeros) so as to match the padding in the hash calculation performed within the zokrates proof. Similarly, we force the _value to be left-padded with zeros to fill 128-bits.
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      uint256 gasUsedByShieldContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, vks[uint(TransactionTypes.Burn)]);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      uint256 gasUsedByVerifierContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      nullifiers[publicInputs[2]] = publicInputs[2]; // add the nullifier to the list of nullifiers

      // Need to cast from bytes32 to address.
      ERC20Interface tokenContract = ERC20Interface(address(uint160(uint256(publicInputs[0]))));
      bool transferCheck = tokenContract.transfer(address(uint256(publicInputs[4])), uint256(publicInputs[3]));
      require(transferCheck, "Commitment cannot be burned");

      emit BurnRC(publicInputs);

      // gas measurement:
      gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
      emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
  }
}

/**
Contract to enable the management of ZKSnark-hidden coin transactions.
@Author Westlad, Chaitanya-Konda, iAmMichaelConnor
*/

pragma solidity ^0.5.8;

import "./Ownable.sol";
import "./MerkleTree.sol";
import "./Verifier_Registry.sol"; //we import the implementation to have visibility of its 'getters'
import "./Verifier_Interface.sol";
import "./ERC20Interface.sol";

contract FTokenShield is Ownable, MerkleTree {
  // Observers may wish to listen for nullification of commitments:
  event Transfer(bytes32 nullifier1, bytes32 nullifier2);
  event SimpleBatchTransfer(bytes32 nullifier);
  event Burn(bytes32 nullifier);

  // Observers may wish to listen for zkSNARK-related changes:
  event VerifierChanged(address newVerifierContract);
  event VkIdsChanged(bytes32 mintVkId, bytes32 transferVkId, bytes32 simpleBatchTransferVkId, bytes32 burnVkId);

  // For testing only. This SHOULD be deleted before mainnet deployment:
  event GasUsed(uint256 byShieldContract, uint256 byVerifierContract);

  uint constant bitLength = 216; // the number of LSB that we use in a hash
  uint constant batchProofSize = 20; // the number of output commitments in the batch transfer proof

  mapping(bytes32 => bytes32) public nullifiers; // store nullifiers of spent commitments
  mapping(bytes32 => bytes32) public roots; // holds each root we've calculated so that we can pull the one relevant to the prover
  bytes32 public latestRoot; // holds the index for the latest root so that the prover can provide it later and this contract can look up the relevant root

  Verifier_Registry public verifierRegistry; // the Verifier Registry contract
  Verifier_Interface private verifier; // the verification smart contract
  ERC20Interface private fToken; // the  ERC-20 token contract

  //following registration of the vkId's with the Verifier Registry, we hard code their vkId's in setVkIds
  bytes32 public mintVkId;
  bytes32 public transferVkId;
  bytes32 public burnVkId;
  bytes32 public simpleBatchTransferVkId;

  constructor(address _verifierRegistry, address _verifier, address _fToken) public {
      _owner = msg.sender;
      verifierRegistry = Verifier_Registry(_verifierRegistry);
      verifier = Verifier_Interface(_verifier);
      fToken = ERC20Interface(_fToken);
  }

  /**
  function to change the address of the underlying Verifier contract
  */
  function changeVerifier(address _verifier) external onlyOwner {
      verifier = Verifier_Interface(_verifier);
      emit VerifierChanged(_verifier);
  }

  /**
  self destruct
  */
  function close() public onlyOwner {
      selfdestruct(address(uint160(_owner)));
  }

  /**
  returns the verifier-interface contract address that this shield contract is calling
  */
  function getVerifier() public view returns(address){
      return address(verifier);
  }

  /**
  Sets the vkIds (as registered with the Verifier Registry) which correspond to 'mint', 'transfer' and 'burn' computations respectively
  */
  function setVkIds(bytes32 _mintVkId, bytes32 _transferVkId, bytes32 _simpleBatchTransferVkId, bytes32 _burnVkId) external onlyOwner {
      //ensure the vkId's have been registered:
      require(_mintVkId == verifierRegistry.getVkEntryVkId(_mintVkId), "Mint vkId not registered.");
      require(_transferVkId == verifierRegistry.getVkEntryVkId(_transferVkId), "Transfer vkId not registered.");
      require(_simpleBatchTransferVkId == verifierRegistry.getVkEntryVkId(_simpleBatchTransferVkId), "SimpleBatchTransfer vkId not registered.");
      require(_burnVkId == verifierRegistry.getVkEntryVkId(_burnVkId), "Burn vkId not registered.");

      //store the vkIds
      mintVkId = _mintVkId;
      transferVkId = _transferVkId;
      simpleBatchTransferVkId = _simpleBatchTransferVkId;
      burnVkId = _burnVkId;

      emit VkIdsChanged(mintVkId, transferVkId, simpleBatchTransferVkId, burnVkId);
  }

  /**
  returns the ERC-20 contract address that this shield contract is calling
  */
  function getFToken() public view returns(address){
    return address(fToken);
  }


  /**
  The mint function accepts fungible tokens from the specified fToken ERC-20 contract and creates the same amount as a commitment.
  */
  function mint(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, uint128 _value, bytes32 _commitment) external {

      // gas measurement:
      uint256 gasCheckpoint = gasleft();

      require(_vkId == mintVkId, "Incorrect vkId");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(uint128(_value), _commitment)) << 8); // Note that we force the _value to be left-padded with zeros to fill 128-bits, so as to match the padding in the hash calculation performed within the zokrates proof.
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      uint256 gasUsedByShieldContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, _vkId);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      uint256 gasUsedByVerifierContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // update contract states
      latestRoot = insertLeaf(_commitment); // recalculate the root of the merkleTree as it's now different
      roots[latestRoot] = latestRoot; // and save the new root to the list of roots

      // Finally, transfer the fTokens from the sender to this contract
      fToken.transferFrom(msg.sender, address(this), _value);

      // gas measurement:
      gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
      emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
  }

  /**
  The transfer function transfers a commitment to a new owner
  */
  function transfer(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifierC, bytes32 _nullifierD, bytes32 _commitmentE, bytes32 _commitmentF) external {

      // gas measurement:
      uint256[3] memory gasUsed; // array needed to stay below local stack limit
      gasUsed[0] = gasleft();

      require(_vkId == transferVkId, "Incorrect vkId");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifierC, _nullifierD, _commitmentE, _commitmentF)) << 8);
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      gasUsed[1] = gasUsed[0] - gasleft();
      gasUsed[0] = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, _vkId);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      gasUsed[2] = gasUsed[0] - gasleft();
      gasUsed[0] = gasleft();

      // check inputs vs on-chain states
      require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
      require(_nullifierC != _nullifierD, "The two input nullifiers must be different!");
      require(_commitmentE != _commitmentF, "The new commitments (commitmentE and commitmentF) must be different!");
      require(nullifiers[_nullifierC] == 0, "The commitment being spent (commitmentE) has already been nullified!");
      require(nullifiers[_nullifierD] == 0, "The commitment being spent (commitmentF) has already been nullified!");

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
  function simpleBatchTransfer(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifier, bytes32[] calldata _commitments) external {

      // gas measurement:
      uint256 gasCheckpoint = gasleft();

      require(_vkId == simpleBatchTransferVkId, "Incorrect vkId");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifier, _commitments)) << 8);
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      uint256 gasUsedByShieldContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, _vkId);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      uint256 gasUsedByVerifierContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // check inputs vs on-chain states
      require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
      require(nullifiers[_nullifier] == 0, "The commitment being spent has already been nullified!");

      // update contract states
      nullifiers[_nullifier] = _nullifier; //remember we spent it

      latestRoot = insertLeaves(_commitments);
      roots[latestRoot] = latestRoot; //and save the new root to the list of roots

      emit SimpleBatchTransfer(_nullifier);

      // gas measurement:
      gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
      emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
  }


  function burn(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifier, uint128 _value, uint256 _payTo) external {

      // gas measurement:
      uint256 gasCheckpoint = gasleft();

      require(_vkId == burnVkId, "Incorrect vkId");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0]) << 8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifier, uint128(_value), _payTo)) << 8); // Note that although _payTo represents an address, we have declared it as a uint256. This is because we want it to be abi-encoded as a bytes32 (left-padded with zeros) so as to match the padding in the hash calculation performed within the zokrates proof. Similarly, we force the _value to be left-padded with zeros to fill 128-bits.
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // gas measurement:
      uint256 gasUsedByShieldContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, _vkId);
      require(result, "The proof has not been verified by the contract");

      // gas measurement:
      uint256 gasUsedByVerifierContract = gasCheckpoint - gasleft();
      gasCheckpoint = gasleft();

      // check inputs vs on-chain states
      require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
      require(nullifiers[_nullifier]==0, "The commitment being spent has already been nullified!");

      nullifiers[_nullifier] = _nullifier; // add the nullifier to the list of nullifiers

      //Finally, transfer the fungible tokens from this contract to the nominated address
      address payToAddress = address(_payTo); // we passed _payTo as a uint256, to ensure the packing was correct within the sha256() above
      fToken.transfer(payToAddress, _value);

      emit Burn(_nullifier);

      // gas measurement:
      gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
      emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
  }
}

/**
Contract to enable the management of hidden non fungible toke transactions.
@Author Westlad, Chaitanya-Konda, iAmMichaelConnor
*/
pragma solidity ^0.5.8;

import "./Ownable.sol";
import "./MerkleTree.sol";
import "./Verifier_Interface.sol";
import "./ERC721Interface.sol";

contract NFTokenShield is Ownable, MerkleTree {
    // ENUMS:
    enum TransactionTypes { Mint, Transfer, Burn }

    // EVENTS:
    // Observers may wish to listen for nullification of commitments:
    event Transfer(bytes32 nullifier);
    event Burn(bytes32 nullifier);

    // Observers may wish to listen for zkSNARK-related changes:
    event VerifierChanged(address newVerifierContract);
    event VkChanged(TransactionTypes txType);

    // For testing only. This SHOULD be deleted before mainnet deployment:
    event GasUsed(uint256 byShieldContract, uint256 byVerifierContract);

    // CONTRACT INSTANCES:
    Verifier_Interface public verifier; //the verification smart contract

    mapping(bytes32 => bytes32) public nullifiers;
    mapping(bytes32 => bytes32) public roots;
    mapping(uint => uint256[]) vks; // mapped to by an enum uint(TransactionTypes):

    // ERC721Interface public nfToken; //the NFToken ERC-721 token contract

    // holds the index for the latest root so that the prover can provide it later and this contract can look up the relevant root
    bytes32 public latestRoot;

    // FUNCTIONS:
    constructor (address _verifier) public {
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
    function getVerifier() external view returns (address) {
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
    * SafeTransferFrom implementation of ERC-721 contract checks the return value of onERC721Received of tokenShield contract.
    * If the correct value is not returned, then the transferFrom() function is rolled back as it has been  determined that the _to does not
    * implement the expected interface.
    * The correct value is Returns `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`
    */
    function onERC721Received(address, address, uint256, bytes memory) public pure returns (bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

    /**
    The mint function creates ('mints') a new commitment and stores it in the merkleTree
    */
    function mint(
        bytes32 tokenContractAddress,
        uint256[] calldata _proof,
        uint256[] calldata _inputs,
        uint256 _tokenId,
        bytes32 _commitment
    ) external {
        // gas measurement:
        uint256 gasCheckpoint = gasleft();

        // Check that the publicInputHash equals the hash of the 'public inputs':
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(tokenContractAddress, _tokenId, _commitment))<<8);
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

        // Finally, transfer token from the sender to this contract address
        ERC721Interface tokenContract = ERC721Interface(address(uint160(uint256(tokenContractAddress))));
        tokenContract.safeTransferFrom(msg.sender, address(this), _tokenId);

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
        bytes32 _nullifier,
        bytes32 _commitment
    ) external {

        // gas measurement:
        uint256 gasCheckpoint = gasleft();

        // check inputs vs on-chain states
        require(nullifiers[_nullifier] == 0, "The commitment being spent has already been nullified!");
        require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");

        // Check that the publicInputHash equals the hash of the 'public inputs':
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifier, _commitment))<<8);
        require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

        // gas measurement:
        uint256 gasUsedByShieldContract = gasCheckpoint - gasleft();
        gasCheckpoint = gasleft();

        // verify the proof
        bool result = verifier.verify(_proof, _inputs, vks[uint(TransactionTypes.Transfer)]);
        require(result, "The proof has not been verified by the contract");

        // gas measurement:
        uint256 gasUsedByVerifierContract = gasCheckpoint - gasleft();
        gasCheckpoint = gasleft();

        // update contract states
        nullifiers[_nullifier] = _nullifier; // remember we spent it

        latestRoot = insertLeaf(_commitment); // recalculate the root of the merkleTree as it's now different
        roots[latestRoot] = latestRoot; // and save the new root to the list of roots

        emit Transfer(_nullifier);

        // gas measurement:
        gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
        emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
    }

    /**
    The burn function burns a commitment and transfers the asset held within the commiment to the address payTo
    */
    function burn(
        bytes32 tokenContractAddress,
        uint256[] memory _proof,
        uint256[] memory _inputs,
        bytes32 _root,
        bytes32 _nullifier,
        uint256 _tokenId,
        uint256 _payTo
    ) public {

        // gas measurement:
        uint256 gasCheckpoint = gasleft();

        // check inputs vs on-chain states
        require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
        require(nullifiers[_nullifier] == 0, "The commitment being spent has already been nullified!");

        // Check that the publicInputHash equals the hash of the 'public inputs':
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(
            // Note that although _payTo represents an address, we have declared it as a uint256.
            // This is because we want it to be abi-encoded as a bytes32 (left-padded with zeros)
            // so as to match the padding in the hash calculation performed within the zokrates proof.
            sha256(abi.encodePacked(tokenContractAddress, _root, _nullifier, _tokenId, _payTo))<<8);
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

        // update contract states
        nullifiers[_nullifier] = _nullifier; //add the nullifier to the list of nullifiers

        //Finally, transfer NFToken from this contract address to the nominated address
        address payToAddress = address(_payTo); // we passed _payTo as a uint256, to ensure the packing was correct within the sha256() above
        ERC721Interface tokenContract = ERC721Interface(address(uint160(uint256(tokenContractAddress))));
        tokenContract.safeTransferFrom(address(this), payToAddress, _tokenId);

        emit Burn(_nullifier);

        // gas measurement:
        gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
        emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
    }
}

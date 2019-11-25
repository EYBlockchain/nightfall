/**
Contract to enable the management of hidden non fungible toke transactions.
@Author Westlad, Chaitanya-Konda, iAmMichaelConnor
*/
pragma solidity ^0.5.8;

import "./Ownable.sol";
import "./MerkleTree.sol";
import "./Verifier_Registry.sol"; //we import the implementation to have visibility of its 'getters'
import "./Verifier_Interface.sol";
import "./ERC721Interface.sol";

contract NFTokenShield is Ownable, MerkleTree {
    // Observers may wish to listen for nullification of commitments:
    event Transfer(bytes32 nullifier);
    event Burn(bytes32 nullifier);

    // Observers may wish to listen for zkSNARK-related changes:
    event VerifierChanged(address newVerifierContract);
    event VkIdsChanged(bytes32 mintVkId, bytes32 transferVkId, bytes32 burnVkId);

    // For testing only. This SHOULD be deleted before mainnet deployment:
    event GasUsed(uint256 byShieldContract, uint256 byVerifierContract);

    mapping(bytes32 => bytes32) public nullifiers; // store nullifiers of spent commitments
    mapping(bytes32 => bytes32) public roots; // holds each root we've calculated so that we can pull the one relevant to the prover

    bytes32 public latestRoot; //holds the index for the latest root so that the prover can provide it later and this contract can look up the relevant root

    Verifier_Registry public verifierRegistry; //the Verifier Registry contract
    Verifier_Interface public verifier; //the verification smart contract
    ERC721Interface public nfToken; //the NFToken ERC-721 token contract

    // following registration of the vkId's with the Verifier Registry, we hard code their vkId's in setVkIds
    bytes32 public mintVkId;
    bytes32 public transferVkId;
    bytes32 public burnVkId;

    constructor(address _verifierRegistry, address _verifier, address _nfToken) public {
        _owner = msg.sender;
        verifierRegistry = Verifier_Registry(_verifierRegistry);
        verifier = Verifier_Interface(_verifier);
        nfToken = ERC721Interface(_nfToken);
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
    function getVerifier() external view returns(address) {
        return address(verifier);
    }

    /**
    Sets the vkIds (as registered with the Verifier Registry) which correspond to 'mint', 'transfer' and 'burn' computations respectively
    */
    function setVkIds(bytes32 _mintVkId, bytes32 _transferVkId, bytes32 _burnVkId) external onlyOwner {
        // ensure the vkId's have been registered:
        require(_mintVkId == verifierRegistry.getVkEntryVkId(_mintVkId), "Mint vkId not registered.");
        require(_transferVkId == verifierRegistry.getVkEntryVkId(_transferVkId), "Transfer vkId not registered.");
        require(_burnVkId == verifierRegistry.getVkEntryVkId(_burnVkId), "Burn vkId not registered.");

        // store the vkIds
        mintVkId = _mintVkId;
        transferVkId = _transferVkId;
        burnVkId = _burnVkId;

        emit VkIdsChanged(mintVkId, transferVkId, burnVkId);
    }

    /**
    returns the ERC-721 contract address that this shield contract is calling
    */
    function getNFToken() public view returns(address){
        return address(nfToken);
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
    function mint(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, uint256 _tokenId, bytes32 _commitment) external {

        // gas measurement:
        uint256 gasCheckpoint = gasleft();

        require(_vkId == mintVkId, "Incorrect vkId");

        // Check that the publicInputHash equals the hash of the 'public inputs':
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_tokenId, _commitment))<<8);
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

        // Finally, transfer token from the sender to this contract address
        nfToken.safeTransferFrom(msg.sender, address(this), _tokenId);

        // gas measurement:
        gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
        emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
    }

    /**
    The transfer function transfers a commitment to a new owner
    */
    function transfer(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifier, bytes32 _commitment) external {

        // gas measurement:
        uint256 gasCheckpoint = gasleft();

        require(_vkId == transferVkId, "Incorrect vkId");

        // Check that the publicInputHash equals the hash of the 'public inputs':
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifier, _commitment))<<8);
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
        require(nullifiers[_nullifier] == 0, "The commitment being spent has already been nullified!");
        require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");

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
    function burn(uint256[] memory _proof, uint256[] memory _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifier, uint256 _tokenId, uint256 _payTo) public {

        // gas measurement:
        uint256 gasCheckpoint = gasleft();

        require(_vkId == burnVkId, "Incorrect vkId");

        // Check that the publicInputHash equals the hash of the 'public inputs':
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifier, _tokenId, _payTo))<<8); // Note that although _payTo represents an address, we have declared it as a uint256. This is because we want it to be abi-encoded as a bytes32 (left-padded with zeros) so as to match the padding in the hash calculation performed within the zokrates proof.
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

        // update contract states
        nullifiers[_nullifier] = _nullifier; //add the nullifier to the list of nullifiers

        //Finally, transfer NFToken from this contract address to the nominated address
        address payToAddress = address(_payTo); // we passed _payTo as a uint256, to ensure the packing was correct within the sha256() above
        nfToken.safeTransferFrom(address(this), payToAddress, _tokenId);

        emit Burn(_nullifier);

        // gas measurement:
        gasUsedByShieldContract = gasUsedByShieldContract + gasCheckpoint - gasleft();
        emit GasUsed(gasUsedByShieldContract, gasUsedByVerifierContract);
    }
}

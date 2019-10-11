/**
Contract to enable the management of hidden non fungible toke transactions.
@Author Westlad, Chaitanya-Konda, iAmMichaelConnor
*/
pragma solidity ^0.5.8;

import "./Ownable.sol";
import "./Verifier_Registry.sol"; //we import the implementation to have visibility of its 'getters'
import "./Verifier_Interface.sol";
import "./ERC721Interface.sol";



contract NFTokenShield is Ownable {

  /*
  @notice Explanation of the Merkle Tree, in this contract:
  We store the merkle tree nodes in a flat array.



                                      0  <-- this is our Merkle Root
                               /             \
                        1                             2
                    /       \                     /       \
                3             4               5               6
              /   \         /   \           /   \           /    \
            7       8      9      10      11      12      13      14
          /  \    /  \   /  \    /  \    /  \    /  \    /  \    /  \
         15  16  17 18  19  20  21  22  23  24  25  26  27  28  29  30

depth row  width  st#     end#
  1    0   2^0=1  w=0   2^1-1=0
  2    1   2^1=2  w=1   2^2-1=2
  3    2   2^2=4  w=3   2^3-1=6
  4    3   2^3=8  w=7   2^4-1=14
  5    4   2^4=16 w=15  2^5-1=30

  d = depth = 5
  r = row number
  w = width = 2^(depth-1) = 2^3 = 16
  #nodes = (2^depth)-1 = 2^5-2 = 30

  */

    event Mint(address from, address to, uint256 token_id, bytes32 commitment, uint256 commitment_index);
    event Transfer(bytes32 nullifier, bytes32 commitment, uint256 commitment_index);
    event Burn(uint256 tokenId, address payTo, bytes32 nullifier);

    event VerifierChanged(address newVerifierContract);
    event VkIdsChanged(bytes32 mintVkId, bytes32 transferVkId, bytes32 burnVkId);

    uint constant merkleWidth = 4294967296; //2^32
    uint constant merkleDepth = 33; //33

    mapping(bytes32 => bytes32) public nullifiers; // store nullifiers of spent commitments
    mapping(bytes32 => bytes32) public commitments; // array holding the commitments.  Basically the bottom row of the merkle tree
    mapping(uint256 => bytes27) public merkleTree; // the entire Merkle Tree of nodes, with the latter 'half' of merkleTree being the leaves.
    mapping(bytes32 => bytes32) public roots; // holds each root we've calculated so that we can pull the one relevant to the prover

    uint256 public leafCount; //remembers the number of commitments we hold
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

        require(_vkId == mintVkId, "Incorrect vkId");

        // Check that the publicInputHash equals the hash of the 'public inputs':
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_tokenId, _commitment))<<8);
        require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

        // verify the proof
        bool result = verifier.verify(_proof, _inputs, _vkId);
        require(result, "The proof has not been verified by the contract");

        // update contract states
        uint256 leafIndex = merkleWidth - 1 + leafCount; // specify the index of the commitment within the merkleTree
        merkleTree[leafIndex] = bytes27(_commitment<<40); // add the commitment to the merkleTree

        commitments[_commitment] = _commitment; // add the commitment

        bytes32 root = updatePathToRoot(leafIndex); // recalculate the root of the merkleTree as it's now different
        roots[root] = root; // and save the new root to the list of roots
        latestRoot = root;

        // Finally, transfer token from the sender to this contract address
        nfToken.safeTransferFrom(msg.sender, address(this), _tokenId);

        emit Mint(msg.sender, address(this), _tokenId, _commitment, leafCount++);
    }

    /**
    The transfer function transfers a commitment to a new owner
    */
    function transfer(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifier, bytes32 _commitment) external {

        require(_vkId == transferVkId, "Incorrect vkId");

        // Check that the publicInputHash equals the hash of the 'public inputs':
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifier, _commitment))<<8);
        require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

        // verify the proof
        bool result = verifier.verify(_proof, _inputs, _vkId);
        require(result, "The proof has not been verified by the contract");

        // check inputs vs on-chain states
        require(nullifiers[_nullifier] == 0, "The commitment being spent has already been nullified!");
        require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");

        // update contract states
        nullifiers[_nullifier] = _nullifier; // remember we spent it

        uint256 leafIndex = merkleWidth - 1 + leafCount; // specify the index of the commitment within the merkleTree
        merkleTree[leafIndex] = bytes27(_commitment<<40); // add the commitment to the merkleTree

        commitments[_commitment] = _commitment; // add Bob's commitment to the list of tokens

        latestRoot = updatePathToRoot(leafIndex); // recalculate the root of the merkleTree as it's now different
        roots[latestRoot] = latestRoot; // and save the new root to the list of roots

        emit Transfer(_nullifier, _commitment, leafCount++);
    }

    /**
    The burn function burns a commitment and transfers the asset held within the commiment to the address payTo
    */
    function burn(uint256[] memory _proof, uint256[] memory _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifier, uint256 _tokenId, uint256 _payTo) public {

        require(_vkId == burnVkId, "Incorrect vkId");

        // Check that the publicInputHash equals the hash of the 'public inputs':
        bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
        bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifier, _tokenId, _payTo))<<8); // Note that although _payTo represents an address, we have declared it as a uint256. This is because we want it to be abi-encoded as a bytes32 (left-padded with zeros) so as to match the padding in the hash calculation performed within the zokrates proof.
        require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

        // verify the proof
        bool result = verifier.verify(_proof, _inputs, _vkId);
        require(result, "The proof has not been verified by the contract");

        // check inputs vs on-chain states
        require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
        require(nullifiers[_nullifier]==0, "The commitment being spent has already been nullified!");

        // update contract states
        nullifiers[_nullifier] = _nullifier; //add the nullifier to the list of nullifiers

        //Finally, transfer NFToken from this contract address to the nominated address
        address payToAddress = address(_payTo); // we passed _payTo as a uint256, to ensure the packing was correct within the sha256() above
        nfToken.safeTransferFrom(address(this), payToAddress, _tokenId);

        emit Burn(_tokenId, payToAddress, _nullifier);
    }

    /**
    Updates each node of the Merkle Tree on the path from leaf to root.
    p - is the leafIndex of the new commitment within the merkleTree.
    */
    function updatePathToRoot(uint p) private returns (bytes32) {

        /*
        If Z were the commitment, then the p's mark the 'path', and the s's mark the 'sibling path'

                         p
                p                  s
           s         p        EF        GH
        A    B    Z    s    E    F    G    H
        */

        uint s; //s is the 'sister' path of p.
        uint t; //temp index for the next p (i.e. the path node of the row above)
        bytes32 h; //hash
        for (uint r = merkleDepth-1; r > 0; r--) {
            if (p%2 == 0) { //p even index in the merkleTree
                s = p-1;
                t = (p-1)/2;
                h = sha256(abi.encodePacked(merkleTree[s],merkleTree[p]));
                merkleTree[t] = bytes27(h<<40);
            } else { //p odd index in the merkleTree
                s = p+1;
                t = p/2;
                h = sha256(abi.encodePacked(merkleTree[p],merkleTree[s]));
                merkleTree[t] = bytes27(h<<40);
            }
            p = t; //move to the path node on the next highest row of the tree
        }
        return h; //the (256-bit) root of the merkleTree
    }

    function packToBytes32(uint256 low, uint256 high) private pure returns (bytes32) {
        return (bytes32(high)<<128) | bytes32(low);
    }

    function packToUint256(uint256 low, uint256 high) private pure returns (uint256) {
        return uint256((bytes32(high)<<128) | bytes32(low));
    }

}

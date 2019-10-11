/**
Contract to enable the management of ZKSnark-hidden coin transactions.
@Author Westlad, Chaitanya-Konda, iAmMichaelConnor
*/

pragma solidity ^0.5.8;
import "./Ownable.sol";
import "./Verifier_Registry.sol"; //we import the implementation to have visibility of its 'getters'
import "./Verifier_Interface.sol";
import "./ERC20Interface.sol";

contract FTokenShield is Ownable {

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

  event Mint(uint256 amount, bytes32 commitment, uint256 commitment_index);
  event Transfer(bytes32 nullifier1, bytes32 nullifier2, bytes32 commitment1, uint256 commitment1_index, bytes32 commitment2, uint256 commitment2_index);
  event Burn(uint256 amount, address payTo, bytes32 nullifier);

  event VerifierChanged(address newVerifierContract);
  event VkIdsChanged(bytes32 mintVkId, bytes32 transferVkId, bytes32 burnVkId);


  uint constant merkleWidth = 4294967296; //2^32
  uint constant merkleDepth = 33; //33
  uint private balance = 0;
  uint256 constant bn128Prime = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

  mapping(bytes32 => bytes32) public nullifiers; // store nullifiers of spent commitments
  mapping(bytes32 => bytes32) public commitments; // array holding the commitments.  Basically the bottom row of the merkle tree
  mapping(uint256 => bytes27) public merkleTree; // the entire Merkle Tree of nodes, with 0 being the root, and the latter 'half' of the merkleTree being the leaves.
  mapping(bytes32 => bytes32) public roots; // holds each root we've calculated so that we can pull the one relevant to the prover

  uint256 public leafCount; // remembers the number of commitments we hold
  bytes32 public latestRoot; // holds the index for the latest root so that the prover can provide it later and this contract can look up the relevant root

  Verifier_Registry public verifierRegistry; // the Verifier Registry contract
  Verifier_Interface private verifier; // the verification smart contract
  ERC20Interface private fToken; // the  ERC-20 token contract

  //following registration of the vkId's with the Verifier Registry, we hard code their vkId's in setVkIds
  bytes32 public mintVkId;
  bytes32 public transferVkId;
  bytes32 public burnVkId;

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
  function setVkIds(bytes32 _mintVkId, bytes32 _transferVkId, bytes32 _burnVkId) external onlyOwner {
      //ensure the vkId's have been registered:
      require(_mintVkId == verifierRegistry.getVkEntryVkId(_mintVkId), "Mint vkId not registered.");
      require(_transferVkId == verifierRegistry.getVkEntryVkId(_transferVkId), "Transfer vkId not registered.");
      require(_burnVkId == verifierRegistry.getVkEntryVkId(_burnVkId), "Burn vkId not registered.");

      //store the vkIds
      mintVkId = _mintVkId;
      transferVkId = _transferVkId;
      burnVkId = _burnVkId;

      emit VkIdsChanged(mintVkId, transferVkId, burnVkId);
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

      require(_vkId == mintVkId, "Incorrect vkId");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(uint128(_value), _commitment))<<8); // Note that we force the _value to be left-padded with zeros to fill 128-bits, so as to match the padding in the hash calculation performed within the zokrates proof.
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

      // Finally, transfer the fTokens from the sender to this contract
      fToken.transferFrom(msg.sender, address(this), _value);

      emit Mint(_value, _commitment, leafCount++);
  }

  /**
  The transfer function transfers a commitment to a new owner
  */
  function transfer(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifierC, bytes32 _nullifierD, bytes32 _commitmentE, bytes32 _commitmentF) external {

      require(_vkId == transferVkId, "Incorrect vkId");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifierC, _nullifierD, _commitmentE, _commitmentF))<<8);
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, _vkId);
      require(result, "The proof has not been verified by the contract");

      // check inputs vs on-chain states
      require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
      require(_nullifierC != _nullifierD, "The two input nullifiers must be different!");
      require(_commitmentE != _commitmentF, "The new commitments (commitmentE and commitmentF) must be different!");
      require(nullifiers[_nullifierC] == 0, "The commitment being spent (commitmentE) has already been nullified!");
      require(nullifiers[_nullifierD] == 0, "The commitment being spent (commitmentF) has already been nullified!");

      // update contract states
      nullifiers[_nullifierC] = _nullifierC; //remember we spent it
      nullifiers[_nullifierD] = _nullifierD; //remember we spent it

      commitments[_commitmentE] = _commitmentE; //add the commitment to the list of commitments

      uint256 leafIndex = merkleWidth - 1 + leafCount++; //specify the index of the commitment within the merkleTree
      merkleTree[leafIndex] = bytes27(_commitmentE<<40); //add the commitment to the merkleTree
      updatePathToRoot(leafIndex);

      commitments[_commitmentF] = _commitmentF; //add the commitment to the list of commitments

      leafIndex = merkleWidth - 1 + leafCount; //specify the index of the commitment within the merkleTree
      merkleTree[leafIndex] = bytes27(_commitmentF<<40); //add the commitment to the merkleTree
      latestRoot = updatePathToRoot(leafIndex);//recalculate the root of the merkleTree as it's now different
      
      roots[latestRoot] = latestRoot; //and save the new root to the list of roots

      emit Transfer(_nullifierC, _nullifierD, _commitmentE, leafCount - 1, _commitmentF, leafCount++);
  }


  function burn(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifier, uint128 _value, uint256 _payTo) external {

      require(_vkId == burnVkId, "Incorrect vkId");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes31 publicInputHash = bytes31(bytes32(_inputs[0])<<8);
      bytes31 publicInputHashCheck = bytes31(sha256(abi.encodePacked(_root, _nullifier, uint128(_value), _payTo))<<8); // Note that although _payTo represents an address, we have declared it as a uint256. This is because we want it to be abi-encoded as a bytes32 (left-padded with zeros) so as to match the padding in the hash calculation performed within the zokrates proof. Similarly, we force the _value to be left-padded with zeros to fill 128-bits.
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, _vkId);
      require(result, "The proof has not been verified by the contract");

      // check inputs vs on-chain states
      require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
      require(nullifiers[_nullifier]==0, "The commitment being spent has already been nullified!");

      nullifiers[_nullifier] = _nullifier; // add the nullifier to the list of nullifiers

      //Finally, transfer the fungible tokens from this contract to the nominated address
      address payToAddress = address(_payTo); // we passed _payTo as a uint256, to ensure the packing was correct within the sha256() above
      fToken.transfer(payToAddress, _value);

      emit Burn(_value, payToAddress, _nullifier);

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
      return h; //the (265-bit) root of the merkleTree
  }

  function packToBytes32(uint256 low, uint256 high) private pure returns (bytes32) {
      return (bytes32(high)<<128) | bytes32(low);
  }

  function packToUint256(uint256 low, uint256 high) private pure returns (uint256) {
      return uint256((bytes32(high)<<128) | bytes32(low));
  }

}

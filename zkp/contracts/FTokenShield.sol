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
  1    0   2**0=1  w=0   2**1-2=0
  2    1   2**1=2  w=1   2**2-2=2
  3    2   2**2=4  w=3   2**3-2=6
  4    3   2**3=8  w=7   2**4-2=14
  5    4   2**4=16 w=15  2**5-2=30

  d = depth = 5
  r = row number
  w = width = 2**(depth-1) = 2**3 = 16
  #nodes = (2**depth)-1 = 2**5-2 = 30

  */

  event Mint(uint256 amount, bytes32 commitment, uint256 commitment_index);
  event Transfer(bytes32 nullifier1, bytes32 nullifier2, bytes32 commitment1, uint256 commitment1_index, bytes32 commitment2, uint256 commitment2_index);
  event Burn(uint256 amount, address payTo, bytes32 nullifier);
  event SimpleBatchTransfer(bytes32 nullifier, bytes32[] commitments, uint256 commitment_index);

  event VerifierChanged(address newVerifierContract);
  event VkIdsChanged(bytes32 mintVkId, bytes32 transferVkId, bytes32 simpleBatchTransferVkId, bytes32 burnVkId);

  uint constant bitLength = 216; // the number of LSB that we use in a hash
  uint constant batchProofSize = 20; // the number of output commitments in the batch transfer proof
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

      require(_vkId == mintVkId, "Incorrect vkId");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes32 publicInputHash = bytes32(_inputs[0]);
      bytes32 publicInputHashCheck = zeroMSBs(bytes32(sha256(abi.encodePacked(uint128(_value), _commitment)))); // Note that we force the _value to be left-padded with zeros to fill 128-bits, so as to match the padding in the hash calculation performed within the zokrates proof.
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
      bytes32 publicInputHash = bytes32(_inputs[0]);
      bytes32 publicInputHashCheck = zeroMSBs(bytes32(sha256(abi.encodePacked(_root, _nullifierC, _nullifierD, _commitmentE, _commitmentF))));
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

  /**
  The transfer function transfers 20 commitments to new owners
  */
  function simpleBatchTransfer(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifier, bytes32[] calldata _commitments) external {

      require(_vkId == simpleBatchTransferVkId, "Incorrect vkId");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes32 publicInputHash = bytes32(_inputs[0]);
      bytes32 publicInputHashCheck = zeroMSBs(sha256(abi.encodePacked(_root, _nullifier, _commitments)));
      require(publicInputHashCheck == publicInputHash, "publicInputHash cannot be reconciled");

      // verify the proof
      bool result = verifier.verify(_proof, _inputs, _vkId);
      require(result, "The proof has not been verified by the contract");

      // check inputs vs on-chain states
      require(roots[_root] == _root, "The input root has never been the root of the Merkle Tree");
      require(nullifiers[_nullifier] == 0, "The commitment being spent has already been nullified!");

      // update contract states
      nullifiers[_nullifier] = _nullifier; //remember we spent it
      uint256 leafIndex = merkleWidth - 1 + leafCount;
      for (uint i = 0; i < batchProofSize; i++){
        commitments[_commitments[i]] = _commitments[i]; //add the commitment to the list of commitments
        merkleTree[leafIndex++] = bytes27(_commitments[i]<<40); //add the commitment to the merkleTree
      }
      leafCount += batchProofSize;
      latestRoot = updateMerkleTree(leafIndex-batchProofSize);
      roots[latestRoot] = latestRoot; //and save the new root to the list of roots
      emit SimpleBatchTransfer(_nullifier, _commitments, leafCount-1);
  }


  function burn(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, bytes32 _root, bytes32 _nullifier, uint128 _value, uint256 _payTo) external {

      require(_vkId == burnVkId, "Incorrect vkId");

      // Check that the publicInputHash equals the hash of the 'public inputs':
      bytes32 publicInputHash = bytes32(_inputs[0]);
      bytes32 publicInputHashCheck = zeroMSBs(bytes32(sha256(abi.encodePacked(_root, _nullifier, uint128(_value), _payTo)))); // Note that although _payTo represents an address, we have declared it as a uint256. This is because we want it to be abi-encoded as a bytes32 (left-padded with zeros) so as to match the padding in the hash calculation performed within the zokrates proof. Similarly, we force the _value to be left-padded with zeros to fill 128-bits.
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
      return zeroMSBs(h); //the (265-bit) root of the merkleTree
  }
  // This function update the Merkle tree when you are adding more than one commitment
  // in one go.  This is much more efficient than calling a function to add a single leaf
  // multiple times.
  // @params index - the index of the leaf where we start to add our commitments
  function updateMerkleTree(uint256 index) private returns (bytes32) {
    uint256 depth = merkleDepth;
    uint256 rowMax = 8589934590; //2**depth-2
    uint256 currentNode = index; // initialise
    uint256 startNode = currentNode;
    uint256 parentNode = 0;
    uint256 sisterNode = 0;
    bytes27 nodeA;
    bytes27 nodeB;
    bytes32 h;
    bytes27 def; // assign a default value (equals "" in this case)
    do {
      // find the sister node calculate the parent node and its hash
      //sisterNode = currentNode ^ 1; parentNode = currentNode >> 1;
      if (currentNode%2 == 0){ // calculation is different if node is even or odd
        sisterNode = currentNode - 1;
        parentNode = (currentNode - 1)/2;
        nodeA = merkleTree[sisterNode];
        nodeB = merkleTree[currentNode];
      } else {
        sisterNode = currentNode + 1;
        parentNode = currentNode/2;
        nodeB = merkleTree[sisterNode];
        nodeA = merkleTree[currentNode];
      }
      if (currentNode == startNode) startNode = parentNode; // remember where to start on the next row
      //check if we've gone past the end of the added commitments or run off the end of the row
      if (merkleTree[sisterNode] == def && merkleTree[currentNode] == def || currentNode > rowMax) {
        currentNode = startNode; // if we have, go to the next row
        rowMax = 2**--depth - 2; // oddly this seems to use less gas than the equivalent rowMax = (rowMax-2)>>1
      } else { // if not, add the hash to the Merkle tree and go to the next node
        h = sha256(abi.encodePacked(nodeA, nodeB));
        merkleTree[parentNode] = bytes27(h<<40);
        currentNode += 2;
      }
    } while(parentNode > 0); // stop when we get to the root and return the root hash
    return zeroMSBs(h);
  }

  function packToBytes32(uint256 low, uint256 high) private pure returns (bytes32) {
      return (bytes32(high)<<128) | bytes32(low);
  }

  function packToUint256(uint256 low, uint256 high) private pure returns (uint256) {
      return uint256((bytes32(high)<<128) | bytes32(low));
  }

  //function to zero out the b most siginficant bits
  function zeroMSBs(bytes32 value) private pure returns (bytes32) {
    uint256 shift = 256 - bitLength;
    return (value<<shift)>>shift;
  }

}

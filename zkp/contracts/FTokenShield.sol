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
  @notice Explanation of the Merkle Tree, M, in this contract:
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

  event Mint(uint256 amount, bytes27 coin, uint256 coin_index);
  event Transfer(bytes27 nullifier1, bytes27 nullifier2, bytes27 coin1, uint256 coin1_index, bytes27 coin2, uint256 coin2_index);
  event Burn(uint256 amount, address payTo, bytes27 nullifier);

  event VerifierChanged(address newVerifierContract);
  event VkIdsChanged(bytes32 mintVkId, bytes32 transferVkId, bytes32 burnVkId);

  address payable private _owner;

  uint constant merkleWidth = 4294967296; //2^32
  uint constant merkleDepth = 33; //33

  uint private balance = 0;

  mapping(bytes27 => bytes27) public ns; //store nullifiers of spent commitments
  mapping(bytes27 => bytes27) public zs; //array holding the commitments.  Basically the bottom row of the merkle tree
  mapping(uint256 => bytes27) public M; //the entire Merkle Tree of nodes, with 0 being the root, and the latter 'half' of M being the leaves.
  mapping(bytes27 => bytes27) public roots; //holds each root we've calculated so that we can pull the one relevant to the prover

  uint256 public zCount; //remembers the number of commitments we hold
  uint256 private leafIndex; //index for posting/getting leaves to/from M
  bytes27 public latestRoot; //holds the index for the latest root so that the prover can provide it later and this contract can look up the relevant root

  Verifier_Registry public verifierRegistry; //the Verifier Registry contract
  Verifier_Interface private verifier; //the verification smart contract
  ERC20Interface private fToken; //the  ERC-20 token contract

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
      selfdestruct(_owner);
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
  function mint(uint256[] memory _proof, uint256[] memory _inputs, bytes32 _vkId) public {

    require(_vkId == mintVkId, "Incorrect vkId");

    // verify the proof
    bool result = verifier.verify(_proof, _inputs, _vkId);
    require(result, "The proof has not been verified by the contract");

    bytes27 z = packedToBytes27(_inputs[2], _inputs[1]);//recover the input params from MintVerifier

    zs[z] = z; //add the token

    leafIndex = merkleWidth - 1 + zCount;//specify the index of z within M
    M[leafIndex] = z;//add z to M

    bytes27 root = updatePathToRoot(leafIndex);//recalculate the root of M as it's now different
    roots[root] = root; //and save the new root to the list of roots
    latestRoot = root;

    //Finally, transfer the fTokens from the sender to this contract
    fToken.transferFrom(msg.sender, address(this), _inputs[0]);

    emit Mint(_inputs[0], z, zCount++);
  }

  /**
  The transfer function transfers a commitment to a new owner
  */
  function transfer(uint256[] memory _proof, uint256[] memory _inputs, bytes32 _vkId) public {

    require(_vkId == transferVkId, "Incorrect vkId");

    // verify the proof
    bool result = verifier.verify(_proof, _inputs, _vkId);
    require(result, "The proof has not been verified by the contract");

    bytes27 nc = packedToBytes27(_inputs[1], _inputs[0]);
    bytes27 nd = packedToBytes27(_inputs[3], _inputs[2]);
    bytes27 ze = packedToBytes27(_inputs[5], _inputs[4]);
    bytes27 zf = packedToBytes27(_inputs[7], _inputs[6]);
    bytes27 inputRoot = packedToBytes27(_inputs[9],_inputs[8]);


    require(roots[inputRoot] == inputRoot, "The input root has never been the root of the Merkle Tree");
    require(nc != nd, "The nullifiers nc and nd must be different!");
    require(ze != zf, "The token commitments ze and zf must be different!");
    require(ns[nc] == 0, "The token has already been nullified!");
    require(ns[nd] == 0, "The token has already been nullified!");

    ns[nc] = nc; //remember we spent it
    ns[nd] = nd; //remember we spent it
    zs[ze] = ze; //add Bob's commitment to the list of commitments

    leafIndex = merkleWidth - 1 + zCount++; //specify the index of z within M
    M[leafIndex] = ze; //add z to M

    updatePathToRoot(leafIndex);

    zs[zf] = zf; //add Alice's commitment to the list of commitment

    leafIndex = merkleWidth - 1 + zCount; //specify the index of z within M
    M[leafIndex] = zf; //add z to M

    bytes27 root = updatePathToRoot(leafIndex);//recalculate the root of M as it's now different
    roots[root] = root; //and save the new root to the list of roots
    latestRoot = root;

    emit Transfer(nc, nd, ze, zCount - 1, zf, zCount++);
  }


  function burn(uint256[] memory _proof, uint256[] memory _inputs, bytes32 _vkId) public {

    require(_vkId == burnVkId, "Incorrect vkId");

    // verify the proof
    bool result = verifier.verify(_proof, _inputs, _vkId);
    require(result, "The proof has not been verified by the contract");

    uint256 payToUint = combineUint256(_inputs[1], _inputs[0]); //recover the payTo address
    address payTo = address(payToUint); // explicitly convert to address (because we're sure no data loss will result from this)
    uint256 value = _inputs[2]; //the coin value being cashed-out
    bytes27 nc = packedToBytes27(_inputs[4], _inputs[3]); //recover the nullifier
    bytes27 inputRoot = packedToBytes27(_inputs[6], _inputs[5]); //recover the root

    require(roots[inputRoot] == inputRoot, "The input root has never been the root of the Merkle Tree");
    require(ns[nc]==0, "The token has already been nullified!");

    ns[nc] = nc; //add the nullifier to the list of nullifiers

    //Finally, transfer the fungible tokens from this contract to the nominated address
    fToken.transfer(payTo, value);

    emit Burn(value, payTo, nc);

  }


  /**
  Updates each node of the Merkle Tree on the path from leaf to root.
  p - is the leafIndex of the new token within M.
  */
  function updatePathToRoot(uint p) private returns (bytes27) {

  /*
  If Z were the token, then the p's mark the 'path', and the s's mark the 'sibling path'

                   p
          p                  s
     s         p        EF        GH
  A    B    Z    s    E    F    G    H
  */

      uint s; //s is the 'sister' path of p.
      uint t; //temp index for the next p (i.e. the path node of the row above)
      for (uint r = merkleDepth-1; r > 0; r--) {
          if (p%2 == 0) { //p even index in M
              s = p-1;
              t = (p-1)/2;
              M[t] = bytes27(sha256(abi.encodePacked(M[s],M[p]))<<40);
          } else { //p odd index in M
              s = p+1;
              t = p/2;
              M[t] = bytes27(sha256(abi.encodePacked(M[p],M[s]))<<40);
          }
          p = t; //move to the path node on the next highest row of the tree
      }
      return M[0]; //the root of M
  }

  function packedToBytes27(uint256 low, uint256 high) private pure returns (bytes27){
    return bytes27(uint216(low)) | (bytes27(uint216(high))<<128);
  }

  function combineUint256(uint256 low, uint256 high) private pure returns (uint256){
    return uint256((bytes32(high)<<128) | bytes32(low));
  }

}

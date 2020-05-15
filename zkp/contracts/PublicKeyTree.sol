
pragma solidity ^0.5.8;

import "./MiMC.sol";
import "./Ownable.sol";

contract PublicKeyTree is MiMC, Ownable {
  uint256 internal constant TREE_HEIGHT = 32; // here we define height so that a tree consisting of just a root would have a height of 0
  uint256 internal constant FIRST_LEAF_INDEX = 2**(TREE_HEIGHT) - 1; //this is the difference between a node index (numbered from the root=0) and a leaf index (numbered from the first leaf on the left=0)
  uint256 private constant q = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001;
  mapping (uint256 => bytes32) public M; //storage for the Merkle Tree nodes
  mapping (bytes32 => uint256) public L; // lookup for a leaf index
  mapping (address => bytes32) internal keyLookup; // stores a lookup of the zkp public key if you know the ETH address
  uint256 internal nextAvailableIndex = FIRST_LEAF_INDEX; //holds the next empty slot that we can store a key in
  mapping (address => uint256) internal blacklist;
  mapping (bytes32 => bytes32) public publicKeyRoots; //linked list of all valid roots each value points to the previous root to enable them all to be deleted
  bytes32 private constant ONE = 0x0000000000000000000000000000000000000000000000000000000000000001;
  bytes32 public currentPublicKeyRoot = ONE;
  uint256 public rootPruningInterval = 50; // the number of historic roots that are remembered
  uint256 public publicKeyRootComputations; // the total number of roots currently
  bytes32[3] public compressedAdminPublicKeys;

  /**
  This function adds a key to the Merkle tree at the next available leaf
  updating state variables as needed.
  */
  function addPublicKeyToTree(bytes32 key) internal {
    // firstly we need to mod the key to Fq(zok) because that's what Zokrates and MiMC will do
    key = bytes32(uint256(key) % q);
    require(L[key] == 0, "The key being added is already in the Public Key tree");
    M[nextAvailableIndex] = key;
    L[key] = nextAvailableIndex; // reverse lookup for a leaf
    bytes32 root = updatePathToRoot(nextAvailableIndex++);
    updatePublicKeyRootsLinkedList(root);
  }

  /**
  This modifier registers a new user (adds them to the Public Key Tree provided they
  are not previously registed and are not on a blacklist). If they are an existing
  user, it just does the blacklist check
  */
  function checkUser(bytes32 zkpPublicKey) public {
    if (keyLookup[msg.sender] == 0) {
      keyLookup[msg.sender] = zkpPublicKey; // add unknown user to key lookup
      addPublicKeyToTree(zkpPublicKey); // update the Merkle tree with the new leaf
    }
    require (keyLookup[msg.sender] == zkpPublicKey, "The ZKP public key has not been registered to this address");
    require (blacklist[msg.sender] == 0, "This address is blacklisted - transaction stopped");
  }

  modifier onlyCheckedUser(bytes32 zkpPublicKey) {
    checkUser(zkpPublicKey);
    _;
  }

  function blacklistAddress(address addr) external onlyOwner {
    //add the malfeasant to the blacklist
    blacklist[addr] = 1; // there is scope here for different 'blacklisting codes'
    // remove them from the Merkle tree
    bytes32 blacklistedKey = bytes32(uint256(keyLookup[addr]) % q); //keyLookup stores the key before conversition to Fq
    require(uint256(blacklistedKey) != 0, 'The key being blacklisted does not exist');
    uint256 blacklistedIndex = L[blacklistedKey];
    delete M[blacklistedIndex];
    // and recalculate the root
    bytes32 root = updatePathToRoot(blacklistedIndex);
    // next, traverse the linked list, deleting each element (could be expensive if we have many transactions)
    deleteHistoricRoots(currentPublicKeyRoot);
    publicKeyRoots[root] = ONE; //we're starting a new list of historic roots have to label it with something other than 0
    currentPublicKeyRoot = root;
    publicKeyRootComputations = 1; //have to reset this so we prune correctly
  }

  /**
  function to recursively delete historic roots. Normally called automatically by `blacklistAddress`
  However, if we ever had so many roots that we exceeded the block gas limit, we could call this
  function directly to iteratively remove roots. This is public onlyOwner, rather than private so
  it can be called directly in case of emergency (e.g. some bug prevents it working as part of blacklisting).
  */
  function deleteHistoricRoots(bytes32 publicKeyRoot) public onlyOwner {
    bytes32 nextPublicKeyRoot = publicKeyRoots[publicKeyRoot];
    delete publicKeyRoots[publicKeyRoot];
    if (nextPublicKeyRoot != 0) deleteHistoricRoots(nextPublicKeyRoot);
    return;  // we've deleted the whole linked list
  }

  /**
  To avoid having so many roots stored that deleting them (in the event of a blacklisting)
  would be very expensive, we only keep publicKeyRootComputations of them.  Once we have that
  many, we need to remove the oldest one each time we add a new one.
  */
  function pruneOldestRoot(bytes32 publicKeyRoot) private {
    //note, we must have at least two historic roots for this to work
    bytes32 nextPublicKeyRoot = publicKeyRoot;
    bytes32 nextNextPublicKeyRoot = ONE;
    while(nextNextPublicKeyRoot != 0) { // decend to the end of the list, remembering the previous item
      publicKeyRoot = nextPublicKeyRoot;
      nextPublicKeyRoot = publicKeyRoots[publicKeyRoot];
      nextNextPublicKeyRoot = publicKeyRoots[nextPublicKeyRoot];
    }
    delete publicKeyRoots[publicKeyRoot]; //remove the oldest (non-zero) root
    return;
  }

  function unBlacklistAddress(address addr) external onlyOwner {
    //remove the reformed charater from the blacklist
    delete blacklist[addr];
    // add them back to the Merkle tree
    bytes32 blacklistedKey = bytes32(uint256(keyLookup[addr]) % q); //keyLookup stores the key before conversition to Fq
    require(uint256(blacklistedKey) != 0, 'The key being unblacklisted does not exist');
    uint256 blacklistedIndex = L[blacklistedKey];
    M[blacklistedIndex] = blacklistedKey;
    // and recalculate the root
    bytes32 root = updatePathToRoot(blacklistedIndex);
    updatePublicKeyRootsLinkedList(root);
  }

  /**
  A function to update the linked list of roots and associated state variables
  */
  function updatePublicKeyRootsLinkedList(bytes32 root) private {
    publicKeyRoots[root] = currentPublicKeyRoot;
    currentPublicKeyRoot = root;
    publicKeyRootComputations++;
    if (publicKeyRootComputations > rootPruningInterval) pruneOldestRoot(currentPublicKeyRoot);
  }

  function setRootPruningInterval(uint256 interval) external onlyOwner {
    rootPruningInterval = interval;
  }

  function setCompressedAdminPublicKeys(bytes32[3] calldata keys) external onlyOwner {
    compressedAdminPublicKeys = keys;
  }

  /**
  To implement blacklisting, we need a merkle tree of whitelisted public keys. Unfortunately
  this can't use Timber because we need to change leaves after creating them.  Therefore we
  need to store the tree in this contract and use a full update algorithm:
  Updates each node of the Merkle Tree on the path from leaf to root.
  p - is the Index of the new token within M.
  */
  function updatePathToRoot(uint256 p) private returns (bytes32) {

  /*
  If Z were the token, then the p's mark the 'path', and the s's mark the 'sibling path'
                   p
          p                  s
     s         p        EF        GH
  A    B    Z    s    E    F    G    H
  */

    uint256 s; //s is the 'sister' path of p.
    uint256 t; //temp index for the next p (i.e. the path node of the row above)
    for (uint256 r = TREE_HEIGHT; r > 0; r--) {
      if (p%2 == 0) { //p even index in M
        s = p-1;
        t = (p-1)/2;
        M[t] = mimcHash2([M[s],M[p]]);
      } else { //p odd index in M
        s = p+1;
        t = p/2;
        M[t] = mimcHash2([M[p],M[s]]);
      }
      p = t; //move to the path node on the next highest row of the tree
    }
    return M[0]; //the root of M
  }
}

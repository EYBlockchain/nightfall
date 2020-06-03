pragma solidity ^0.5.8;
/**
This contract acts as a Public Key Directory for looking up ZKP public keys if you know
the Ethereum address.  It also works as a simple Name Service
@author Westlad
*/
contract PKD{
  struct User {
    bytes32 name;
    address accountAddress;
    string WhisperPublicKey;
    bytes32 ZkpPublicKey;
  }

  mapping (address => User) private users;

  mapping (bytes32 => address) private byName;
  mapping (bytes32 => address) private byZkpPublicKey;

  bytes32[] private names;

  function getWhisperPublicKeyFromName(bytes32 name) public view returns(string memory){
    return users[byName[name]].WhisperPublicKey;
  }

  function getWhisperPublicKeyFromAddress(address addr) public view returns(string memory){
    return users[addr].WhisperPublicKey;
  }

  function getZkpPublicKeyFromAddress(address addr) public view returns(bytes32){
    return users[addr].ZkpPublicKey;
  }

  function getZkpPublicKeyFromName(bytes32 name) public view returns(bytes32){
    return users[byName[name]].ZkpPublicKey;
  }

  function setWhisperPublicKey(string  memory pk) public{
    users[msg.sender].WhisperPublicKey = pk;
  }

  function setZkpPublicKey(bytes32 pk) public{
    users[msg.sender].ZkpPublicKey = pk;
    byZkpPublicKey[pk] = msg.sender;
  }

  function getNameFromAddress(address addr) public view returns(bytes32){
    return users[addr].name;
  }

  function getNameFromZkpPublicKey(bytes32 pk) public view returns(bytes32){
    return users[byZkpPublicKey[pk]].name;
  }

  function getAddressFromName(bytes32 name) public view returns(address){
    return users[byName[name]].accountAddress;
  }

  function getNames() public view returns(bytes32[] memory){
    return names;
  }

  function isNameInUse(bytes32 name) public view returns(bool){
    if (byName[name] == address(0)) return false;
    return true;
  }

  function setName(bytes32 name) public {
    require(byName[name] == address(0), "Name already in use"); //you can only use a name once
    require(users[msg.sender].name == bytes32(0), "Address has a already associated name"); //you can only use a name once
    users[msg.sender] = User(name, msg.sender, '', bytes32(0));
    byName[name] = msg.sender;
    names.push(name);
  }

  function getPublicKeysFromName(bytes32 name) public view returns(
  string  memory whisperPublicKey,
  bytes32 zkpPublicKey
  ){
    whisperPublicKey = users[byName[name]].WhisperPublicKey;
    zkpPublicKey = users[byName[name]].ZkpPublicKey;
  }

  function getPublicKeysFromAddress(address addr) public view returns(
  string  memory whisperPublicKey,
  bytes32 zkpPublicKey
  ){
    whisperPublicKey = users[addr].WhisperPublicKey;
    zkpPublicKey = users[addr].ZkpPublicKey;
  }

  function setPublicKeys(
  string  memory whisperPublicKey,
  bytes32 zkpPublicKey
  ) public{
    users[msg.sender].WhisperPublicKey = whisperPublicKey;
    users[msg.sender].ZkpPublicKey = zkpPublicKey;
  }
}

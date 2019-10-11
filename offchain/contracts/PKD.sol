pragma solidity ^0.5.8;
/**
This contract acts as a Public Key Directory for looking up ZKP public keys if you know
the Ethereum address.  It also works as a simple Name Service
@author Westlad
*/
contract PKD{

  mapping ( bytes32 => address) private byName;
  mapping ( address => bytes32) private byAddress;
  mapping ( address => string) private WhisperPublicKeyByAddress;
  mapping ( address => bytes32) private ZkpPublicKeyByAddress;
  bytes32[] private names;

  function getWhisperPublicKeyFromName(bytes32 name) public view returns(string memory){
    return WhisperPublicKeyByAddress[byName[name]];
  }

  function getWhisperPublicKeyFromAddress(address addr) public view returns(string memory){
    return WhisperPublicKeyByAddress[addr];
  }

  function getZkpPublicKeyFromAddress(address addr) public view returns(bytes32){
    return ZkpPublicKeyByAddress[addr];
  }

  function getZkpPublicKeyFromName(bytes32 name) public view returns(bytes32){
    return ZkpPublicKeyByAddress[byName[name]];
  }

  function getPublicKeysFromName(bytes32 name) public view returns(
    string  memory whisperPublicKey,
    bytes32 zkpPublicKey
    ){
      whisperPublicKey = WhisperPublicKeyByAddress[byName[name]];
      zkpPublicKey = ZkpPublicKeyByAddress[byName[name]];
    }

  function getPublicKeysFromAddress(address addr) public view returns(
    string  memory whisperPublicKey,
    bytes32 zkpPublicKey
    ){
      whisperPublicKey = WhisperPublicKeyByAddress[addr];
      zkpPublicKey = ZkpPublicKeyByAddress[addr];
    }

  function setPublicKeys(
    string  memory whisperPublicKey,
    bytes32 zkpPublicKey
    ) public{
    WhisperPublicKeyByAddress[msg.sender] = whisperPublicKey;
    ZkpPublicKeyByAddress[msg.sender] = zkpPublicKey;
  }

  function setWhisperPublicKey(string  memory pk) public{
    WhisperPublicKeyByAddress[msg.sender] = pk;
  }

  function setZkpPublicKey(bytes32 pk) public{
    ZkpPublicKeyByAddress[msg.sender] = pk;
  }

  function setName(bytes32 name) public {
    require(byName[name] == address(0), "Name already in use"); //you can only use a name once
    byName[name] = msg.sender;
    byAddress[msg.sender] = name;
    names.push(name);
  }

  function getNameFromAddress(address addr) public view returns(bytes32){
    return byAddress[addr];
  }

  function getAddressFromName(bytes32 name) public view returns(address){
    return byName[name];
  }

  function getNames() public view returns(bytes32[] memory){
    return names;
  }

  function isNameInUse(bytes32 name) public view returns(bool){
    if (byName[name] == address(0)) return false;
    return true;
  }

}

pragma solidity 0.5.8;

/**
 * @dev Xcert revokable interface.
 */
interface XcertRevokable // is Xcert
{
  
  /**
   * @dev Revokes a specified Xcert. Reverts if not called from contract owner or authorized 
   * address.
   * @param _tokenId Id of the Xcert we want to destroy.
   */
  function revoke(
    uint256 _tokenId
  )
    external;

}
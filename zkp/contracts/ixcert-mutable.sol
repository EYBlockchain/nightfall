pragma solidity 0.5.8;

/**
 * @dev Xcert nutable interface.
 */
interface XcertMutable // is Xcert
{
  
  /**
   * @dev Updates Xcert imprint.
   * @param _tokenId Id of the Xcert.
   * @param _imprint New imprint.
   */
  function updateTokenImprint(
    uint256 _tokenId,
    bytes32 _imprint
  )
    external;

}
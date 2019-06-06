pragma solidity 0.5.8;

/**
 * @dev Xcert burnable interface.
 */
interface XcertBurnable // is Xcert
{

  /**
   * @dev Destroys a specified Xcert. Reverts if not called from Xcert owner or operator.
   * @param _tokenId Id of the Xcert we want to destroy.
   */
  function destroy(
    uint256 _tokenId
  )
    external;

}
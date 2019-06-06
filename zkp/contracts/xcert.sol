pragma solidity 0.5.8;

import "./ixcert.sol";
import "./ixcert-burnable.sol";
import "./ixcert-mutable.sol";
import "./ixcert-pausable.sol";
import "./ixcert-revokable.sol";
import "./abilitable.sol";
import "./nf-token-metadata-enumerable.sol";

/**
 * @dev Xcert implementation.
 */
contract XcertToken is
  Xcert,
  XcertBurnable,
  XcertMutable,
  XcertPausable,
  XcertRevokable,
  NFTokenMetadataEnumerable,
  Abilitable
{

  /**
   * @dev List of abilities (gathered from all extensions):
   */
  uint8 constant ABILITY_CREATE_ASSET = 2;
  uint8 constant ABILITY_REVOKE_ASSET = 4;
  uint8 constant ABILITY_TOGGLE_TRANSFERS = 8;
  uint8 constant ABILITY_UPDATE_ASSET_IMPRINT = 16;
  /// ABILITY_ALLOW_CREATE_ASSET = 32 - A specific ability that is bounded to atomic orders.
  /// When creating a new Xcert trough `OrderGateway`, the order maker has to have this ability.
  uint8 constant ABILITY_UPDATE_URI_BASE = 64;
  /// ABILITY_ALLOW_UPDATE_ASSET = 128 - A specific ability that is bounded to atomic orders.
  /// When updating imprint of an Xcert trough `OrderGateway`, the order maker has to have this
  /// ability.


  /**
   * @dev List of capabilities (supportInterface bytes4 representations).
   */
  bytes4 constant MUTABLE = 0xbda0e852;
  bytes4 constant BURNABLE = 0x9d118770;
  bytes4 constant PAUSABLE = 0xbedb86fb;
  bytes4 constant REVOKABLE = 0x20c5429b;

  /**
   * @dev Error constants.
   */
  string constant CAPABILITY_NOT_SUPPORTED = "007001";
  string constant TRANSFERS_DISABLED = "007002";
  string constant NOT_VALID_XCERT = "007003";
  string constant NOT_OWNER_OR_OPERATOR = "007004";

  /**
   * @dev This emits when ability of beeing able to transfer Xcerts changes (paused/unpaused).
   */
  event IsPaused(bool isPaused);

  /**
   * @dev Emits when imprint of a token is changed.
   * @param _tokenId Id of the Xcert.
   * @param _imprint Cryptographic asset imprint.
   */
  event TokenImprintUpdate(
    uint256 indexed _tokenId,
    bytes32 _imprint
  );

  /**
   * @dev Unique ID which determines each Xcert smart contract type by its JSON convention.
   * @notice Calculated as keccak256(jsonSchema).
   */
  bytes32 internal nftSchemaId;

  /**
   * @dev Maps NFT ID to imprint.
   */
  mapping (uint256 => bytes32) internal idToImprint;

  /**
   * @dev Maps address to authorization of contract.
   */
  mapping (address => bool) internal addressToAuthorized;

  /**
   * @dev Are Xcerts transfers paused (can be performed) or not.
   */
  bool public isPaused;

  /**
   * @dev Contract constructor.
   * @notice When implementing this contract don't forget to set nftSchemaId, nftName, nftSymbol
   * and uriBase.
   */
  constructor()
    public
  {
    nftName = "PCCToken"; // Private crypto collectable
    nftSymbol = "PCC";
    uriBase = "http://nightfall.docker/nft/metadata/";
    /// Crypto collectable:
    /// https://github.com/0xcert/framework/blob/master/conventions/88-crypto-collectible-schema.md
    nftSchemaId = 0xa4cf0407b223849773430feaf0949827373c40feb3258d82dd605ed41c5e9a2c;
    supportedInterfaces[0xe08725ee] = true; // Xcert
    addressToAbility[msg.sender] = 255; // Assigns all available abilities to creator.
  }

  /**
   * @notice Originaly create need ability to create asset. For this demo this has been removed.
   * @dev Creates a new Xcert.
   * @param _to The address that will own the created Xcert.
   * @param _id The Xcert to be created by the msg.sender.
   * @param _imprint Cryptographic asset imprint.
   */
  function create(
    address _to,
    uint256 _id,
    bytes32 _imprint
  )
    external
    // hasAbilities(ABILITY_CREATE_ASSET)
  {
    super._create(_to, _id);
    idToImprint[_id] = _imprint;
  }

  /**
   * @dev Change URI base.
   * @param _uriBase New uriBase.
   */
  function setUriBase(
    string calldata _uriBase
  )
    external
    hasAbilities(ABILITY_UPDATE_URI_BASE)
  {
    super._setUriBase(_uriBase);
  }

  /**
   * @dev Revokes(destroys) a specified Xcert. Reverts if not called from contract owner or 
   * authorized address.
   * @param _tokenId Id of the Xcert we want to destroy.
   */
  function revoke(
    uint256 _tokenId
  )
    external
    hasAbilities(ABILITY_REVOKE_ASSET)
  {
    require(supportedInterfaces[REVOKABLE], CAPABILITY_NOT_SUPPORTED);
    super._destroy(_tokenId);
    delete idToImprint[_tokenId];
  }

  /**
   * @dev Sets if Xcerts transfers are paused (can be performed) or not.
   * @param _isPaused Pause status.
   */
  function setPause(
    bool _isPaused
  )
    external
    hasAbilities(ABILITY_TOGGLE_TRANSFERS)
  {
    require(supportedInterfaces[PAUSABLE], CAPABILITY_NOT_SUPPORTED);
    isPaused = _isPaused;
    emit IsPaused(_isPaused);
  }

  /**
   * @dev Updates Xcert imprint.
   * @param _tokenId Id of the Xcert.
   * @param _imprint New imprint.
   */
  function updateTokenImprint(
    uint256 _tokenId,
    bytes32 _imprint
  )
    external
    hasAbilities(ABILITY_UPDATE_ASSET_IMPRINT)
  {
    require(supportedInterfaces[MUTABLE], CAPABILITY_NOT_SUPPORTED);
    require(idToOwner[_tokenId] != address(0), NOT_VALID_XCERT);
    idToImprint[_tokenId] = _imprint;
    emit TokenImprintUpdate(_tokenId, _imprint);
  }

  /**
   * @dev Destroys a specified Xcert. Reverts if not called from Xcert owner or operator.
   * @param _tokenId Id of the Xcert we want to destroy.
   */
  function destroy(
    uint256 _tokenId
  )
    external
  {
    require(supportedInterfaces[BURNABLE], CAPABILITY_NOT_SUPPORTED);
    address tokenOwner = idToOwner[_tokenId];
    super._destroy(_tokenId);
    require(
      tokenOwner == msg.sender || ownerToOperators[tokenOwner][msg.sender],
      NOT_OWNER_OR_OPERATOR
    );
    delete idToImprint[_tokenId];
  }

  /**
   * @dev Returns a bytes32 of sha256 of json schema representing 0xcert Protocol convention.
   * @return Schema id.
   */
  function schemaId()
    external
    view
    returns (bytes32 _schemaId)
  {
    _schemaId = nftSchemaId;
  }

  /**
   * @dev Returns imprint for Xcert.
   * @param _tokenId Id of the Xcert.
   * @return Token imprint.
   */
  function tokenImprint(
    uint256 _tokenId
  )
    external
    view
    returns(bytes32 imprint)
  {
    imprint = idToImprint[_tokenId];
  }

  /**
   * @dev Helper methods that actually does the transfer.
   * @param _from The current owner of the NFT.
   * @param _to The new owner.
   * @param _tokenId The NFT to transfer.
   */
  function _transferFrom(
    address _from,
    address _to,
    uint256 _tokenId
  )
    internal
  {
    /**
     * if (supportedInterfaces[0xbedb86fb])
     * {
     *   require(!isPaused, TRANSFERS_DISABLED);
     * }
     * There is no need to check for pausable capability here since by using logical deduction we 
     * can say based on code above that:
     * !supportedInterfaces[0xbedb86fb] => !isPaused
     * isPaused => supportedInterfaces[0xbedb86fb]
     * (supportedInterfaces[0xbedb86fb] ∧ isPaused) <=> isPaused. 
     * This saves 200 gas.
     */
    require(!isPaused, TRANSFERS_DISABLED); 
    super._transferFrom(_from, _to, _tokenId);
  }
}

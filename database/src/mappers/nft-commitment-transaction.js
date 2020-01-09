export default function({
  tokenURI,
  tokenId,
  salt,
  shieldContractAddress,

  commitment,
  commitmentIndex,

  owner,

  isMinted,
  isTransferred,
  isBurned,
  isReceived,

  zCorrect,
  zOnchainCorrect,
}) {
  return {
    token_uri: tokenURI,
    token_id: tokenId,
    [shieldContractAddress ? 'shield_contract_address' : undefined]: shieldContractAddress,
    salt,
    commitment,
    commitment_index: commitmentIndex,

    [owner ? 'owner' : undefined]: owner,

    [isMinted ? 'is_minted' : undefined]: isMinted,
    [isTransferred ? 'is_transferred' : undefined]: isTransferred,
    [isBurned ? 'is_burned' : undefined]: isBurned,
    [isReceived ? 'is_received' : undefined]: isReceived,

    [zCorrect || zCorrect === false ? 'token_commitment_reconciles' : undefined]: zCorrect,
    [zOnchainCorrect || zOnchainCorrect === false
      ? 'token_commitment_exists_onchain'
      : undefined]: zOnchainCorrect,
  };
}

export default function({
  tokenUri,
  tokenId,
  salt,
  shieldContractAddress,

  commitment,
  commitmentIndex,

  receiver,

  transferredSalt,
  transferredCommitment,
  transferredCommitmentIndex,

  isMinted,
  isTransferred,
  isBurned,
  isReceived,

  zCorrect,
  zOnchainCorrect,
}) {
  return {
    token_uri: tokenUri,
    token_id: tokenId,
    [shieldContractAddress ? 'shield_contract_address' : undefined]: shieldContractAddress,
    salt,
    token_commitment: commitment,
    token_commitment_index: commitmentIndex,

    [receiver ? 'receiver' : undefined]: receiver,
    [transferredSalt ? 'transferred_salt' : undefined]: transferredSalt,
    [transferredCommitment ? 'transferred_token_commitment' : undefined]: transferredCommitment,
    [transferredCommitmentIndex
      ? 'transferred_token_commitment_index'
      : undefined]: transferredCommitmentIndex,

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

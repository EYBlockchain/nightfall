export default function({
  amount,
  salt,
  commitment,
  commitmentIndex,

  transferredAmount,
  transferredSalt,
  transferredCommitment,
  transferredCommitmentIndex,

  changeAmount,
  changeSalt,
  changeCommitment,
  changeCommitmentIndex,

  transferee,

  isMinted,
  isTransferred,
  isBurned,
  isReceived,
  isChange,

  zCorrect,
  zOnchainCorrect,
}) {
  return {
    coin_value: amount,
    salt,
    coin_commitment: commitment,
    coin_commitment_index: commitmentIndex,

    [transferredAmount ? 'transferred_coin_value' : undefined]: transferredAmount,
    [transferredSalt ? 'transferred_salt' : undefined]: transferredSalt,
    [transferredCommitment ? 'transferred_coin_commitment' : undefined]: transferredCommitment,
    [transferredCommitmentIndex
      ? 'transferred_coin_commitment_index'
      : undefined]: transferredCommitmentIndex,

    [changeAmount ? 'change_coin_value' : undefined]: changeAmount,
    [changeSalt ? 'change_salt' : undefined]: changeSalt,
    [changeCommitment ? 'change_coin_commitment' : undefined]: changeCommitment,
    [changeCommitmentIndex ? 'change_coin_commitment_index' : undefined]: changeCommitmentIndex,

    [transferee ? 'transferee' : undefined]: transferee,

    [isMinted ? 'is_minted' : undefined]: isMinted,
    [isTransferred ? 'is_transferred' : undefined]: isTransferred,
    [isBurned ? 'is_burned' : undefined]: isBurned,
    [isReceived ? 'is_received' : undefined]: isReceived,
    [isChange ? 'is_change' : undefined]: isChange,

    [zCorrect || zCorrect === false ? 'coin_commitment_reconciles' : undefined]: zCorrect,
    [zOnchainCorrect || zOnchainCorrect === false
      ? 'coin_commitment_exists_onchain'
      : undefined]: zOnchainCorrect,
  };
}

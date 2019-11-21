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

  receiver,

  isMinted,
  isTransferred,
  isBurned,
  isReceived,
  isChange,

  zCorrect,
  zOnchainCorrect,
}) {
  return {
    ft_commitment_value: amount,
    salt,
    ft_commitment: commitment,
    ft_commitment_index: commitmentIndex,

    [transferredAmount ? 'transferred_ft_commitment_value' : undefined]: transferredAmount,
    [transferredSalt ? 'transferred_salt' : undefined]: transferredSalt,
    [transferredCommitment ? 'transferred_ft_commitment' : undefined]: transferredCommitment,
    [transferredCommitmentIndex
      ? 'transferred_ft_commitment_index'
      : undefined]: transferredCommitmentIndex,

    [changeAmount ? 'change_ft_commitment_value' : undefined]: changeAmount,
    [changeSalt ? 'change_salt' : undefined]: changeSalt,
    [changeCommitment ? 'change_coin_commitment' : undefined]: changeCommitment,
    [changeCommitmentIndex ? 'change_ft_commitment_index' : undefined]: changeCommitmentIndex,

    [receiver ? 'receiver' : undefined]: receiver,

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

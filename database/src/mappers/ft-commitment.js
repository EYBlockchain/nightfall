export default function({
  amount,
  salt,
  commitment,
  commitmentIndex,

  transferredAmount,
  transferredSalt,
  transferredCommitment,
  transferredCommitmentIndex,

  batchTransfer,

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
  isBatchTransferred,

  zCorrect,
  zOnchainCorrect,
}) {
  let parsedBatchTranferData;

  if (Array.isArray(batchTransfer))
    parsedBatchTranferData = batchTransfer.map(ft => ({
      ft_commitment_value: ft.value,
      salt: ft.salt,
      ft_commitment: ft.commitment,
      ft_commitment_index: ft.commitmentIndex,
      receiver: ft.receiverName,
    }));

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

    [batchTransfer ? 'batch_transfer' : undefined]: parsedBatchTranferData,

    [changeAmount ? 'change_ft_commitment_value' : undefined]: changeAmount,
    [changeSalt ? 'change_salt' : undefined]: changeSalt,
    [changeCommitment ? 'change_ft_ommitment' : undefined]: changeCommitment,
    [changeCommitmentIndex ? 'change_ft_commitment_index' : undefined]: changeCommitmentIndex,

    [receiver ? 'receiver' : undefined]: receiver,

    [isMinted ? 'is_minted' : undefined]: isMinted,
    [isTransferred ? 'is_transferred' : undefined]: isTransferred,
    [isBurned ? 'is_burned' : undefined]: isBurned,
    [isReceived ? 'is_received' : undefined]: isReceived,
    [isChange ? 'is_change' : undefined]: isChange,
    [isBatchTransferred ? 'is_batch_transferred' : undefined]: isBatchTransferred,

    [zCorrect || zCorrect === false ? 'coin_commitment_reconciles' : undefined]: zCorrect,
    [zOnchainCorrect || zOnchainCorrect === false
      ? 'coin_commitment_exists_onchain'
      : undefined]: zOnchainCorrect,
  };
}

export default function({
  amount,
  salt,
  commitment,
  commitmentIndex,

  transferredAmount,
  transferredSalt,
  transferredCommitment,
  transferredCommitmentIndex,

  bulkTransfer,

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
  isBulkTransferred,

  zCorrect,
  zOnchainCorrect,
}) {
  let parsedBulkTranferData;

  if (Array.isArray(bulkTransfer))
    parsedBulkTranferData = bulkTransfer.map(ft => ({
      ft_commitment_value: ft.value,
      salt: ft.salt,
      ft_commitment: ft.z_E,
      ft_commitment_index: ft.z_E_index,
      receiver: ft.receiver_name,
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

    [bulkTransfer ? 'bulk_transfer' : undefined]: parsedBulkTranferData,

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
    [isBulkTransferred ? 'is_bulk_transferred' : undefined]: isBulkTransferred,

    [zCorrect || zCorrect === false ? 'coin_commitment_reconciles' : undefined]: zCorrect,
    [zOnchainCorrect || zOnchainCorrect === false
      ? 'coin_commitment_exists_onchain'
      : undefined]: zOnchainCorrect,
  };
}

/*
 *  this mapper on transfer case.
 *  for rest of the operation erc20Commitment mapper is used.
 *  as usecase is identical
 */

export default function({
  amount,
  salt,
  commitment,
  commitmentIndex,

  bulkTransfer,

  changeAmount,
  changeSalt,
  changeCommitment,
  changeCommitmentIndex,

  receiver,
  usedFTCommitments,
}) {
  let parsedUsedCoin, parsedBulkTranferData;

  if (Array.isArray(usedFTCommitments))
    parsedUsedCoin = usedFTCommitments.map(ft => ({
      ft_commitment_value: ft.amount,
      ft_commitment: ft.commitment,
    }));

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

    [bulkTransfer ? 'bulk_transfer' : undefined]: parsedBulkTranferData,

    [changeAmount ? 'change_ft_commitment_value' : undefined]: changeAmount,
    [changeSalt ? 'change_salt' : undefined]: changeSalt,
    [changeCommitment ? 'change_ft_ommitment' : undefined]: changeCommitment,
    [changeCommitmentIndex ? 'change_ft_commitment_index' : undefined]: changeCommitmentIndex,

    [receiver ? 'receiver' : undefined]: receiver,
    [usedFTCommitments ? 'used_ft_commitments' : undefined]: parsedUsedCoin,
  };
}

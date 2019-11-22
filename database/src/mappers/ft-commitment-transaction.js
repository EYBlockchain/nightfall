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

  batchTransfer,

  changeAmount,
  changeSalt,
  changeCommitment,
  changeCommitmentIndex,

  receiver,
  usedFTCommitments,
}) {
  let parsedUsedCoin;
  let parsedBatchTranferData;

  if (Array.isArray(usedFTCommitments))
    parsedUsedCoin = usedFTCommitments.map(ft => ({
      ft_commitment_value: ft.amount,
      ft_commitment: ft.commitment,
    }));

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

    [batchTransfer ? 'batch_transfer' : undefined]: parsedBatchTranferData,

    [changeAmount ? 'change_ft_commitment_value' : undefined]: changeAmount,
    [changeSalt ? 'change_salt' : undefined]: changeSalt,
    [changeCommitment ? 'change_ft_ommitment' : undefined]: changeCommitment,
    [changeCommitmentIndex ? 'change_ft_commitment_index' : undefined]: changeCommitmentIndex,

    [receiver ? 'receiver' : undefined]: receiver,
    [usedFTCommitments ? 'used_ft_commitments' : undefined]: parsedUsedCoin,
  };
}

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

  changeAmount,
  changeSalt,
  changeCommitment,
  changeCommitmentIndex,

  receiver,
  usedFTCommitments,
}) {
  let parsedUsedCoin;

  if (Array.isArray(usedFTCommitments))
    parsedUsedCoin = usedFTCommitments.map(ft => ({
      ft_commitment_value: ft.amount,
      ft_commitment: ft.commitment,
    }));

  return {
    ft_commitment_value: amount,
    salt,
    ft_commitment: commitment,
    ft_commitment_index: commitmentIndex,

    [changeAmount ? 'change_ft_commitment_value' : undefined]: changeAmount,
    [changeSalt ? 'change_salt' : undefined]: changeSalt,
    [changeCommitment ? 'change_coin_commitment' : undefined]: changeCommitment,
    [changeCommitmentIndex ? 'change_ft_commitment_index' : undefined]: changeCommitmentIndex,

    [receiver ? 'receiver' : undefined]: receiver,
    [usedFTCommitments ? 'used_ft_commitments' : undefined]: parsedUsedCoin,
  };
}

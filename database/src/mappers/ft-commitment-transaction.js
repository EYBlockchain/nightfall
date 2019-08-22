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

  transferee,
  usedCoins,
}) {
  let parsedUsedCoin;

  if (Array.isArray(usedCoins))
    parsedUsedCoin = usedCoins.map(coin => ({
      coin_value: coin.amount,
      coin_commitment: coin.commitment,
    }));

  return {
    coin_value: amount,
    salt,
    coin_commitment: commitment,
    coin_commitment_index: commitmentIndex,

    [changeAmount ? 'change_coin_value' : undefined]: changeAmount,
    [changeSalt ? 'change_salt' : undefined]: changeSalt,
    [changeCommitment ? 'change_coin_commitment' : undefined]: changeCommitment,
    [changeCommitmentIndex ? 'change_coin_commitment_index' : undefined]: changeCommitmentIndex,

    [transferee ? 'transferee' : undefined]: transferee,
    [usedCoins ? 'used_coin_commitments' : undefined]: parsedUsedCoin,
  };
}

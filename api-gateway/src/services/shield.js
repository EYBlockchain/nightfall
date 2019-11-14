import { zkp } from '../rest';

/**
 * This is used to get available shield address from blockchain.
 * @param {*} req
 * @param {*} res
 */
// eslint-disable-next-line import/prefer-default-export
export async function getShieldAddresses(req, res, next) {
  try {
    const ftCommitmentShield = await zkp.getCoinShield(req.user);
    const nftCommitmentShield = await zkp.getTokenShield(req.user);

    res.data = {
      ftCommitmentShield: {
        contract_address: ftCommitmentShield.shieldAddress,
        contract_name: ftCommitmentShield.name,
      },
      nftCommitmentShield: {
        contract_address: nftCommitmentShield.shieldAddress,
        contract_name: nftCommitmentShield.name,
      },
    };
    next();
  } catch (err) {
    next(err);
  }
}

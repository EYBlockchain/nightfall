import { zkp } from '../rest';

/**
 * This is used to get available shield address from blockchain.
 * @param {*} req
 * @param {*} res
 */
// eslint-disable-next-line import/prefer-default-export
export async function getShieldAddresses(req, res, next) {
  try {
    const ftCommitmentShield = await zkp.getFTCommitmentShield(req.user);
    const nftCommitmentShield = await zkp.getNFTCommitmentShield(req.user);

    res.data = { ftCommitmentShield, nftCommitmentShield };
    next();
  } catch (err) {
    next(err);
  }
}

import { zkp } from '../rest';

/**
 * This is used to get available shield address from blockchain.
 * @param {*} req
 * @param {*} res
 */
// eslint-disable-next-line import/prefer-default-export
export async function getShieldAddresses(req, res, next) {
  try {
    const coinShield = await zkp.getCoinShield(req.user);
    const tokenShield = await zkp.getTokenShield(req.user);

    res.data = {
      coinShield: {
        contract_address: coinShield.data.shieldAddress,
        contract_name: coinShield.data.name,
      },
      tokenShield: {
        contract_address: tokenShield.data.shieldAddress,
        contract_name: tokenShield.data.name,
      },
    };
    next();
  } catch (err) {
    next(err);
  }
}

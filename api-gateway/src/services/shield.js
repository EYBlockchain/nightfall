import { zkp } from '../rest';
import Response from '../routes/response/response';
/**
 * This is used to get available shield address from blockchain.
 * @param {*} req
 * @param {*} res
 */
// eslint-disable-next-line import/prefer-default-export
export async function getShieldAddresses(req, res, next) {
  const response = new Response();

  try {
    const coinShield = await zkp.getCoinShield(req.user);
    const tokenShield = await zkp.getTokenShield(req.user);
    response.statusCode = 200;

    response.data = {
      coinShield: {
        contract_address: coinShield.data.shieldAddress,
        contract_name: coinShield.data.name,
      },
      tokenShield: {
        contract_address: tokenShield.data.shieldAddress,
        contract_name: tokenShield.data.name,
      },
    };
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}

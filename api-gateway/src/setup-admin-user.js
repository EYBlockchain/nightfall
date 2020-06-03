import { accounts, db, offchain } from './rest';
import logger from './logger';

export default async function() {
  try {
    const status = await offchain.isNameInUse('admin');
    if (status) return; // admin registered in another system

    // get coinbase address
    const address = await accounts.getCoinbase();

    const data = await db.createUser({
      name: 'admin',
      password: 'admin',
      email: 'admin@ey.com',
      address,
    });

    await offchain.setName(address, 'admin');
    await offchain.setZkpPublicKey(address, {
      publicKey: data.publicKey,
    });
    logger.info('Admin user created');
  } catch (err) {
    console.log(err);
  }
}

import { whisperTransaction } from './whisper';
import { accounts, db, offchain, zkp } from '../rest';
import Response from '../routes/response/response';

export async function checkCorrectnessCoin(req, res, next) {
  const response = new Response();

  try {
    const { data } = await zkp.checkCorrectnessCoin(req.headers, req.body);

    response.statusCode = 200;
    response.data = data;
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}

// ERC-20 commitment
/**
 * This function will mint a coin and add transaction in db
 * req.user {
 		address: '0x3bd5ae4b9ae233843d9ccd30b16d3dbc0acc5b7f',
		name: 'alice',
		pk_A: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8',
		password: 'alicesPassword'
	}
 * req.body {
 		A: '0x00000000000000000000000000002710',
	}
 * @param {*} req
 * @param {*} res
 */
export async function mintCoin(req, res, next) {
  const response = new Response();

  try {
    const { data } = await zkp.mintCoin(req.user, {
      A: req.body.A,
      pk_A: req.user.pk_A,
    });

    data.coin_index = parseInt(data.coin_index, 16);
    data.action_type = 'minted';

    await db.addCoin(req.user, {
      amount: req.body.A,
      salt: data.S_A,
      commitment: data.coin,
      commitmentIndex: data.coin_index,
      isMinted: true,
    });

    response.statusCode = 200;
    response.data = data;
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}

/**
 * This function will transfer a coin and update db
 * req.user {
     address: '0x3bd5ae4b9ae233843d9ccd30b16d3dbc0acc5b7f',
    name: 'alice',
    pk_A: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8',
    password: 'alicesPassword'
  }
 * req.body {
     C: '0x00000000000000000000000000002710',
      D: '0x00000000000000000000000000001388',
    E: '0x00000000000000000000000000001770',
    F: '0x00000000000000000000000000002328',
    S_C: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
    S_D: '0xdd22d29b452a36d4f9fc3b2ad00e9034cc0a4175b52aa35fb7cd92',
    z_C_index: 0,
    z_D_index: 1,
    S_E: '0xEDCE5B0A6607149ECC1293F721924128ABFDCDE553506C792F3DA3',
    S_F: '0x4432C08959B75A846A2E50007B5FAC86B18446B910C67B0255BDE7',
    sk_A: '0x41ced159d5690ef0ccfe5742783057fc9eb12809af2f16f6f98ffd',
    z_C: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
    z_D: '0x0ca8040181b3fc505eed1ee6892622054ae877ddf8f9dafe93b072',
    pk_A: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8',
    receiver_name: 'bob',
    pk_B: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef'
  }
 * @param {*} req
 * @param {*} res
 */
export async function transferCoin(req, res, next) {
  const response = new Response();

  try {
    // Generate a new one-time-use Ethereum address for the transferor to use
    const password = (req.user.address + Date.now()).toString();
    const address = (await accounts.createAccount(password)).data;
    await db.updateUserWithPrivateAccount(req.user, { address, password });
    await accounts.unlockAccount({ address, password });

    const { pk } = await offchain.getZkpPublicKeyFromName(req.body.receiver_name); // fetch pk from PKD by passing username
    req.body.pk_B = pk;

    const { data } = await zkp.transferCoin({ address }, req.body);
    data.z_E_index = parseInt(data.z_E_index, 16);
    data.z_F_index = parseInt(data.z_F_index, 16);

    // update slected coin1 with tansferred data
    await db.updateCoin(req.user, {
      amount: req.body.C,
      salt: req.body.S_C,
      commitment: req.body.z_C,
      commitmentIndex: req.body.z_C_index,
      transferredAmount: req.body.E,
      transferredSalt: data.S_E,
      transferredCommitment: data.z_E,
      transferredCommitmentIndex: data.z_E_index,
      changeAmount: req.body.F,
      changeSalt: data.S_F,
      changeCommitment: data.z_F,
      changeCommitmentIndex: data.z_F_index,
      transferee: req.body.receiver_name,
      isTransferred: true,
    });

    // update slected coin2 with tansferred data
    await db.updateCoin(req.user, {
      amount: req.body.D,
      salt: req.body.S_D,
      commitment: req.body.z_D,
      commitmentIndex: req.body.z_D_index,
      transferredAmount: req.body.E,
      transferredSalt: data.S_E,
      transferredCommitment: data.z_E,
      transferredCommitmentIndex: data.z_E_index,
      changeAmount: req.body.F,
      changeSalt: data.S_F,
      changeCommitment: data.z_F,
      changeCommitmentIndex: data.z_F_index,
      transferee: req.body.receiver_name,
      isTransferred: true,
    });

    // transfer is only case where we need to call api to add coin transaction
    // rest of case inserting coin or updating coin will add respective transfer log.
    await db.addCoinTransaction(req.user, {
      amount: req.body.E,
      salt: data.S_E,
      commitment: data.z_E,
      commitmentIndex: data.z_E_index,
      changeAmount: req.body.F,
      changeSalt: data.S_F,
      changeCommitment: data.z_F,
      changeCommitmentIndex: data.z_F_index,
      transferee: req.body.receiver_name,
      isTransferred: true,
      usedCoins: [
        {
          amount: req.body.C,
          commitment: req.body.z_C,
        },
        {
          amount: req.body.D,
          commitment: req.body.z_D,
        },
      ],
    });

    // add change to user database
    if (parseInt(req.body.F, 16)) {
      await db.addCoin(req.user, {
        amount: req.body.F,
        salt: data.S_F,
        commitment: data.z_F,
        commitmentIndex: data.z_F_index,
        isChange: true,
      });
    }

    // note:
    // E is the value transferred to the transferee
    // F is the value returned as 'change' to the transferor
    await whisperTransaction(req, {
      amount: req.body.E,
      salt: data.S_E,
      pk: req.body.pk_B,
      commitment: data.z_E,
      commitmentIndex: data.z_E_index,
      transferee: req.body.receiver_name,
      for: 'coin',
    });

    response.statusCode = 200;
    response.data = data;
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}

/**
 * This function will burn a coin
 * req.body {
  A: '0x00000000000000000000000000000001',
  sk_A: '0x283ccbfada111a31df7617deeff4d0daaa3f73b05ba100821d17cc',
  S_A: '0xa31adb1074f977413fddd3953e333529a3494e110251368cc823fb',
  z_A_index: 0,
  z_A: '0x1ec4a9b406fd3d79a01360ccd14c8530443ea9869f8e9560dafa56',
  payTo: 'bob',
 }
 * @param {*} req
 * @param {*} res
 */
export async function burnCoin(req, res, next) {
  const response = new Response();

  try {
    const payToAddress = req.body.payTo
      ? (await offchain.getAddressFromName(req.body.payTo)).address
      : req.user.address;

    const { data } = await zkp.burnCoin({ ...req.body, payTo: payToAddress }, req.user);

    // update slected coin with tansferred data
    await db.updateCoin(req.user, {
      amount: req.body.A,
      salt: req.body.S_A,
      commitment: req.body.z_A,
      commitmentIndex: req.body.z_A_index,
      transferee: req.body.payTo || req.user.name,
      isBurned: true,
    });

    const user = await db.fetchUser(req.user);

    if (req.body.payTo) {
      await whisperTransaction(req, {
        amount: Number(req.body.A),
        shieldContractAddress: user.selected_coin_shield_contract,
        transferee: req.body.payTo,
        transferor: req.user.name,
        transferorAddress: req.user.address,
        for: 'FToken',
      }); // send ft token data to BOB side
    } else {
      await db.addFTTransaction(req.user, {
        amount: Number(req.body.A),
        shieldContractAddress: user.selected_coin_shield_contract,
        transferee: req.body.payTo,
        transferor: req.user.name,
        transferorAddress: req.user.address,
        isReceived: true,
      });
    }

    response.statusCode = 200;
    response.data = data;
    res.json(response);
  } catch (err) {
    console.log('error response burnCoin', err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}

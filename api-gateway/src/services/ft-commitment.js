import { whisperTransaction } from './whisper';
import { accounts, db, offchain, zkp } from '../rest';

/**
 * This function will insert FT commitment in database
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    pk_A: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.body {
    amount: 0x0000002,
    salt: '0xE9A313C89C449AF6E630C25AB3ACC0FC3BAB821638E0D55599B518',
    commitment: '0xdd3434566',
    commitmentIndex: 1,
    isReceived: true,
    zCorrect: true,
    zOnchainCorrect: true,
  }
 * @param {*} req
 * @param {*} res
 */
export async function insertFTCommitmentToDb(req, res, next) {
  try {
    res.data = await db.insertFTCommitment(req.user, req.body);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch FT commitments from database
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    pk_A: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.query {
    pageNo: 1,
    limit: 4
  }
 * @param {*} req
 * @param {*} res
 */
export async function getFTCommitments(req, res, next) {
  try {
    res.data = await db.getFTCommitments(req.user, req.query);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch FT commitment transactions from database
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    pk_A: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.query {
    pageNo: 1,
    limit: 4
  }
 * @param {*} req
 * @param {*} res
 */
export async function getFTCommitmentTransactions(req, res, next) {
  try {
    res.data = await db.getFTCommitmentTransactions(req.user, req.query);
    next();
  } catch (err) {
    next(err);
  }
}

export async function checkCorrectnessForFTCommitment(req, res, next) {
  try {
    res.data = await zkp.checkCorrectnessForFTCommitment(req.headers, req.body);
    next();
  } catch (err) {
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
  try {
    const data = await zkp.mintCoin(req.user, {
      amount: req.body.A,
      ownerPublicKey: req.user.pk_A,
    });

    data.ft_commitment_index = parseInt(data.ft_commitment_index, 16);

    await db.insertFTCommitment(req.user, {
      amount: req.body.A,
      salt: data.S_A,
      commitment: data.ft_commitment,
      commitmentIndex: data.ft_commitment_index,
      isMinted: true,
    });

    res.data = data;
    next();
  } catch (err) {
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
  try {
    // Generate a new one-time-use Ethereum address for the sender to use
    const password = (req.user.address + Date.now()).toString();
    const address = (await accounts.createAccount(password)).data;
    await db.updateUserWithPrivateAccount(req.user, { address, password });
    await accounts.unlockAccount({ address, password });

    req.body.pk_B = await offchain.getZkpPublicKeyFromName(req.body.receiver_name); // fetch pk from PKD by passing username

    // get logged in user's secretkey.
    const user = await db.fetchUser(req.user);
    req.body.sk_A = user.secretkey;

    const data = await zkp.transferCoin({ address }, req.body);
    data.z_E_index = parseInt(data.z_E_index, 16);
    data.z_F_index = parseInt(data.z_F_index, 16);

    // update slected coin1 with tansferred data
    await db.updateFTCommitmentByCommitmentHash(req.user, req.body.z_C, {
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
      receiver: req.body.receiver_name,
      isTransferred: true,
    });

    // update slected coin with tansferred data
    await db.updateFTCommitmentByCommitmentHash(req.user, req.body.z_D, {
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
      receiver: req.body.receiver_name,
      isTransferred: true,
    });

    // transfer is only case where we need to call api to add coin transaction
    // rest of case inserting coin or updating coin will add respective transfer log.
    await db.insertFTCommitmentTransaction(req.user, {
      amount: req.body.E,
      salt: data.S_E,
      commitment: data.z_E,
      commitmentIndex: data.z_E_index,
      changeAmount: req.body.F,
      changeSalt: data.S_F,
      changeCommitment: data.z_F,
      changeCommitmentIndex: data.z_F_index,
      receiver: req.body.receiver_name,
      isTransferred: true,
      usedFTCommitments: [
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
      await db.insertFTCommitment(req.user, {
        amount: req.body.F,
        salt: data.S_F,
        commitment: data.z_F,
        commitmentIndex: data.z_F_index,
        isChange: true,
      });
    }

    // note:
    // E is the value transferred to the receiver
    // F is the value returned as 'change' to the sender
    await whisperTransaction(req, {
      amount: req.body.E,
      salt: data.S_E,
      pk: req.body.pk_B,
      commitment: data.z_E,
      commitmentIndex: data.z_E_index,
      receiver: req.body.receiver_name,
      for: 'FTCommitment',
    });

    res.data = data;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will burn a coin
 * req.body {
  A: '0x00000000000000000000000000000001',
  S_A: '0xa31adb1074f977413fddd3953e333529a3494e110251368cc823fb',
  z_A_index: 0,
  z_A: '0x1ec4a9b406fd3d79a01360ccd14c8530443ea9869f8e9560dafa56',
  payTo: 'bob',
 }
 * @param {*} req
 * @param {*} res
 */
export async function burnCoin(req, res, next) {
  try {
    const payToAddress = req.body.payTo
      ? await offchain.getAddressFromName(req.body.payTo)
      : req.user.address;

    const user = await db.fetchUser(req.user);
    req.body.sk_A = user.secretkey; // get logged in user's secretkey.

    const burnCoinBody = {
      amount: req.body.A,
      receiverSecretKey: req.body.sk_A,
      salt: req.body.S_A,
      commitment: req.body.z_A,
      commitmentIndex: req.body.z_A_index,
      receiver: req.body.payTo || req.user.name,
    };
    res.data = await zkp.burnCoin({ ...burnCoinBody, payTo: payToAddress }, req.user);

    // update slected coin2 with tansferred data
    await db.updateFTCommitmentByCommitmentHash(req.user, req.body.z_A, {
      amount: req.body.A,
      salt: req.body.S_A,
      commitment: req.body.z_A,
      commitmentIndex: req.body.z_A_index,
      receiver: req.body.payTo || req.user.name,
      isBurned: true,
    });

    if (req.body.payTo) {
      await whisperTransaction(req, {
        amount: Number(req.body.A),
        shieldContractAddress: user.selected_coin_shield_contract,
        receiver: req.body.payTo,
        sender: req.user.name,
        senderAddress: req.user.address,
        for: 'FToken',
      }); // send ft token data to BOB side
    } else {
      await db.insertFTTransaction(req.user, {
        amount: Number(req.body.A),
        shieldContractAddress: user.selected_coin_shield_contract,
        receiver: req.body.payTo,
        sender: req.user.name,
        senderAddress: req.user.address,
        isReceived: true,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will do batch fungible commitment transfer
 * req.user {
    address: '0x3bd5ae4b9ae233843d9ccd30b16d3dbc0acc5b7f',
    name: 'alice',
    pk_A: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8',
    password: 'alicesPassword'
  }
 * req.body {
    "amount": "0x00000000000000000000000000000028",
    "salt": "0x75f9ceee5b886382c4fe81958da985cd812303b875210b9ca2d75378bb9bd801",
    "commitment": "0x00000000008ec724591fde260927e3fcf85f039de689f4198ee841fcb63b16ed",
    "commitmentIndex": 21,
    "transferData": [
      {
        "value": "0x00000000000000000000000000000002",
        "receiverName": "b"
      },
      {
        "value": "0x00000000000000000000000000000002",
        "receiverName: "a"
      }
    ]
  }
 * @param {*} req
 * @param {*} res
 */
export async function simpleFTCommitmentBatchTransfer(req, res, next) {
  let changeIndex;
  let changeData = [{}];

  try {
    // Generate a new one-time-use Ethereum address for the sender to use
    const password = (req.user.address + Date.now()).toString();
    const address = (await accounts.createAccount(password)).data;
    await db.updateUserWithPrivateAccount(req.user, { address, password });
    await accounts.unlockAccount({ address, password });

    // get logged in user's secretkey.
    const user = await db.fetchUser(req.user);
    req.body.senderSecretKey = user.secretkey;

    const { transferData } = req.body;
    let selectedCommitmentValue = Number(req.body.amount); // amount of selected commitment

    for (const data of transferData) {
      /* eslint-disable no-await-in-loop */
      data.pkB = await offchain.getZkpPublicKeyFromName(data.receiverName); // fetch pk from PKD by passing username
      selectedCommitmentValue -= Number(data.value);
    }

    if (selectedCommitmentValue < 0)
      throw new Error('Transfer value exceeds selected commitment amount');

    for (let i = transferData.length; i < 20; i++) {
      if (selectedCommitmentValue) changeIndex = i; // array index where change amount is added

      transferData[i] = {
        value: `0x${selectedCommitmentValue.toString(16).padStart(32, 0)}`,
        pkB: req.user.pk_A,
        receiverName: req.user.name,
      };
      selectedCommitmentValue = 0;
    }

    const conmitments = await zkp.simpleFTCommitmentBatchTransfer({ address }, req.body);
    if (changeIndex) changeData = conmitments.splice(changeIndex, 19);

    // update slected coin1 with tansferred data
    await db.updateFTCommitmentByCommitmentHash(req.user, req.body.commitment, {
      amount: req.body.amount,
      salt: req.body.salt,
      commitment: req.body.commitment,
      commitmentIndex: req.body.commitmentIndex,
      batchTransfer: conmitments,
      changeAmount: changeData[0].value,
      changeSalt: changeData[0].salt,
      changeCommitment: changeData[0].commitment,
      changeCommitmentIndex: changeData[0].commitmentIndex,
      isBatchTransferred: true,
    });

    // add change to user database
    if (changeIndex) {
      await db.insertFTCommitment(req.user, {
        amount: changeData[0].value,
        salt: changeData[0].salt,
        commitment: changeData[0].commitment,
        commitmentIndex: changeData[0].commitmentIndex,
        isChange: true,
      });
    }

    for (const data of conmitments) {
      /* eslint-disable no-continue */
      if (!Number(data.value)) continue;
      await whisperTransaction(req, {
        amount: data.value,
        salt: data.salt,
        pk: data.pkB,
        commitment: data.commitment,
        commitmentIndex: data.commitmentIndex,
        receiver: data.receiverName,
        for: 'FTCommitment',
      });
    }

    res.data = conmitments;
    next();
  } catch (err) {
    next(err);
  }
}

import { sendWhisperMessage } from './whisper';
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
    value: 0x0000002,
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
    outputCommitments: [{
      value: '0x00000000000000000000000000002710',
    }],
  }
 * @param {*} req
 * @param {*} res
 */
export async function mintFTCommitment(req, res, next) {
  const {
    outputCommitments: [outputCommitment],
  } = req.body;
  outputCommitment.owner = {
    name: req.user.name,
    publicKey: req.user.pk_A,
  };
  try {
    const data = await zkp.mintFTCommitment(req.user, outputCommitment);

    data.commitmentIndex = parseInt(data.commitmentIndex, 16);

    await db.insertFTCommitment(req.user, {
      outputCommitments: [
        {
          ...outputCommitment,
          ...data,
        },
      ],
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
    inputCommitments: [
      {
        value: '0x00000000000000000000000000002710',
        salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
        commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
        commitmentIndex: 0,
        owner,
      },
      {
        value: '0x00000000000000000000000000001388',
        salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
        commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
        commitmentIndex: 1,
        owner,
      },
    ],
    outputCommitments: [
      {
        value: '0x00000000000000000000000000001770',
      },
      {
        value: '0x00000000000000000000000000002328',
      }
    ],
    receiver: {
      name: 'Bob'
    },
  }
 * @param {*} req
 * @param {*} res
 */
export async function transferFTCommitment(req, res, next) {
  const { receiver, inputCommitments } = req.body;
  try {
    // Generate a new one-time-use Ethereum address for the sender to use
    const password = (req.user.address + Date.now()).toString();
    const address = (await accounts.createAccount(password)).data;
    await db.updateUserWithPrivateAccount(req.user, { address, password });
    await accounts.unlockAccount({ address, password });

    receiver.publicKey = await offchain.getZkpPublicKeyFromName(receiver.name); // fetch pk from PKD by passing username

    // get logged in user's secretkey.
    req.body.sender = {};
    req.body.sender.secretKey = (await db.fetchUser(req.user)).secretkey;

    const { outputCommitments, txReceipt } = await zkp.transferFTCommitment({ address }, req.body);

    const [transferCommitment, changeCommitment] = outputCommitments;
    transferCommitment.owner = receiver;
    transferCommitment.commitmentIndex = parseInt(transferCommitment.commitmentIndex, 16);
    changeCommitment.owner = {
      name: req.user.name,
      publicKey: req.user.pk_A,
    };
    changeCommitment.commitmentIndex = parseInt(changeCommitment.commitmentIndex, 16);

    // update slected coin1 with tansferred data
    await db.updateFTCommitmentByCommitmentHash(req.user, inputCommitments[0].commitment, {
      outputCommitments: [{ owner: receiver }],
      isTransferred: true,
    });

    // update slected coin with tansferred data
    await db.updateFTCommitmentByCommitmentHash(req.user, inputCommitments[1].commitment, {
      outputCommitments: [{ owner: receiver }],
      isTransferred: true,
    });

    // transfer is only case where we need to call api to add coin transaction
    // rest of case inserting coin or updating coin will add respective transfer log.
    await db.insertFTCommitmentTransaction(req.user, {
      inputCommitments,
      outputCommitments,
      receiver,
      sender: {
        name: req.user.name,
        publicKey: req.user.pk_A,
      },
      isTransferred: true,
    });

    // add change to user database
    if (parseInt(changeCommitment.value, 16)) {
      await db.insertFTCommitment(req.user, {
        outputCommitments: [changeCommitment],
        isChange: true,
      });
    }

    const user = await db.fetchUser(req.user);
    // note:
    // E is the value transferred to the receiver
    // F is the value returned as 'change' to the sender
    await sendWhisperMessage(user.shh_identity, {
      outputCommitments: [transferCommitment],
      blockNumber: txReceipt.receipt.blockNumber,
      receiver,
      sender: {
        name: req.user.name,
        publicKey: req.user.pk_A,
      },
      isReceived: true,
      for: 'FTCommitment',
    });

    res.data = outputCommitments;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will burn a coin
 * req.body {
    inputCommitments: [
      {
        value: '0x00000000000000000000000000000001',
        salt: '0xa31adb1074f977413fddd3953e333529a3494e110251368cc823fb',
        commitment: '0x1ec4a9b406fd3d79a01360ccd14c8530443ea9869f8e9560dafa56',
        commitmentIndex: 0,
      }
    ],
    receiver: {
      name: 'bob'
    }
 }
 * @param {*} req
 * @param {*} res
 */
export async function burnFTCommitment(req, res, next) {
  const {
    receiver,
    inputCommitments: [commitment],
  } = req.body;
  try {
    receiver.address = await offchain.getAddressFromName(receiver.name);
    const user = await db.fetchUser(req.user);

    res.data = await zkp.burnFTCommitment(req.user, {
      ...commitment,
      sender: {
        secretKey: user.secretkey,
      },
      receiver,
    });

    // update slected coin2 with tansferred data
    await db.updateFTCommitmentByCommitmentHash(req.user, commitment.commitment, {
      isBurned: true,
    });

    await db.insertFTCommitmentTransaction(req.user, {
      inputCommitments: [commitment],
      receiver,
      sender: {
        name: req.user.name,
        publicKey: req.user.pk_A,
      },
      isBurned: true,
    });

    await sendWhisperMessage(user.shh_identity, {
      value: Number(commitment.value),
      shieldContractAddress: user.selected_coin_shield_contract,
      receiver,
      sender: req.user,
      isReceived: true,
      for: 'FToken',
    }); // send ft token data to BOB side

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
    inputCommitments: [{
      value: "0x00000000000000000000000000000028",
      salt: "0x75f9ceee5b886382c4fe81958da985cd812303b875210b9ca2d75378bb9bd801",
      commitment: "0x00000000008ec724591fde260927e3fcf85f039de689f4198ee841fcb63b16ed",
      commitmentIndex: 1,
    }],
    outputCommitments: [
      {
        "value": "0x00000000000000000000000000000002",
        "receiver": {
          name: "b",
        }
      },
      {
        "value": "0x00000000000000000000000000000002",
        "receiver": {
          name: "a",
        }
      }
    ]
  }
 * @param {*} req
 * @param {*} res
 */
export async function simpleFTCommitmentBatchTransfer(req, res, next) {
  let changeIndex;
  let changeData = {};

  const {
    inputCommitments: [inputCommitment],
    outputCommitments,
  } = req.body;
  let selectedCommitmentValue = Number(inputCommitment.value); // amount of selected commitment

  try {
    // Generate a new one-time-use Ethereum address for the sender to use
    const password = (req.user.address + Date.now()).toString();
    const address = (await accounts.createAccount(password)).data;
    await db.updateUserWithPrivateAccount(req.user, { address, password });
    await accounts.unlockAccount({ address, password });

    // get logged in user's secretkey.
    const user = await db.fetchUser(req.user);

    for (const data of outputCommitments) {
      /* eslint-disable no-await-in-loop */
      data.receiver.publicKey = await offchain.getZkpPublicKeyFromName(data.receiver.name); // fetch pk from PKD by passing username
      selectedCommitmentValue -= Number(data.value);
    }

    if (selectedCommitmentValue < 0)
      throw new Error('Transfer value exceeds selected commitment amount');

    for (let i = outputCommitments.length; i < 20; i++) {
      if (selectedCommitmentValue) changeIndex = i; // array index where change amount is added

      outputCommitments[i] = {
        value: `0x${selectedCommitmentValue.toString(16).padStart(32, 0)}`,
        receiver: {
          name: req.user.name,
          publicKey: req.user.pk_A,
        },
      };
      selectedCommitmentValue = 0;
    }
    const { outputCommitments: commitments, txReceipt } = await zkp.simpleFTCommitmentBatchTransfer(
      { address },
      {
        inputCommitment,
        outputCommitments,
        sender: {
          secretKey: user.secretkey,
        },
      },
    );
    // update slected coin1 with tansferred data
    await db.updateFTCommitmentByCommitmentHash(req.user, inputCommitment.commitment, {
      isBatchTransferred: true,
    });

    // add change to user database
    if (changeIndex) {
      [changeData] = commitments.splice(changeIndex, 19);
      changeData.owner = changeData.receiver;
      await db.insertFTCommitment(req.user, {
        outputCommitments: [changeData],
        isChange: true,
      });
    }

    for (const data of commitments) {
      /* eslint-disable no-continue */
      if (!Number(data.value)) continue;
      data.owner = data.receiver;
      await sendWhisperMessage(user.shh_identity, {
        outputCommitments: [data],
        blockNumber: txReceipt.receipt.blockNumber,
        receiver: data.receiver,
        sender: req.user,
        isReceived: true,
        for: 'FTCommitment',
      });
    }

    await db.insertFTCommitmentTransaction(req.user, {
      inputCommitments: [inputCommitment],
      outputCommitments: commitments,
      sender: {
        name: req.user.name,
        publicKey: req.user.pk_A,
      },
      isBatchTransferred: true,
    });

    res.data = commitments;
    next();
  } catch (err) {
    next(err);
  }
}

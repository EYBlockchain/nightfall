import apiGateway from './rest/api-gateway';

async function insertNFTToDb(data, userData) {
  console.log('\noffchain/src/listeners.js', 'insertNFTToDb', '\ndata', data);

  await apiGateway.insertNFTToDb(
    {
      authorization: userData.jwtToken,
    },
    {
      uri: data.uri,
      tokenId: data.tokenId,
      shieldContractAddress: data.shieldContractAddress,
      sender: data.sender,
      senderAddress: data.senderAddress,
      isReceived: true,
    },
  );
}

async function insertFTTransactionToDb(data, userData) {
  console.log('\noffchain/src/listeners.js', 'insertFTTransactionToDb', '\ndata', data);

  await apiGateway.insertFTTransactionToDb(
    {
      authorization: userData.jwtToken,
    },
    {
      amount: data.amount,
      shieldContractAddress: data.shieldContractAddress,
      sender: data.sender,
      senderAddress: data.senderAddress,
      isReceived: true,
    },
  );
}

async function insertNFTCommitmentToDb(data, userData) {
  console.log('\noffchain/src/listeners.js', '\naddToken', '\ndata', data, '\nuserData', userData);

  const correctnessChecks = await apiGateway.checkCorrectnessForNFTCommitment(
    {
      authorization: userData.jwtToken,
    },
    {
      A: data.tokenId,
      pk: data.receiverPublicKey,
      S_A: data.salt,
      z_A: data.commitment,
      z_A_index: data.commitmentIndex,
    },
  );

  console.log(
    '\noffchain/src/listeners.js',
    '\ninsertNFTCommitmentToDb',
    '\ncorrectnessChecks',
    correctnessChecks,
  );

  await apiGateway.insertNFTCommitmentToDb(
    {
      authorization: userData.jwtToken,
    },
    {
      tokenUri: data.tokenUri,
      tokenId: data.tokenId,
      salt: data.salt,
      commitment: data.commitment,
      commitmentIndex: data.commitmentIndex,
      isReceived: true,
      zCorrect: correctnessChecks.data.z_correct,
      zOnchainCorrect: correctnessChecks.data.z_onchain_correct,
    },
  );
}

async function insertFTCommitmentToDb(data, userData) {
  console.log(
    '\noffchain/src/listeners.js',
    '\ninsertFTCommitmentToDb',
    '\ndata',
    data,
    '\nuserData',
    userData,
  );

  const correctnessChecks = await apiGateway.checkCorrectnessForFTCommitment(
    {
      authorization: userData.jwtToken,
    },
    {
      E: data.amount,
      S_E: data.salt,
      pk: data.pk,
      z_E: data.commitment,
      z_E_index: data.commitmentIndex,
    },
  );

  console.log(
    '\noffchain/src/listeners.js',
    '\ninsertFTCommitmentToDb',
    '\ncorrectnessChecks',
    correctnessChecks,
  );

  await apiGateway.insertFTCommitmentToDb(
    {
      authorization: userData.jwtToken,
    },
    {
      amount: data.amount,
      salt: data.salt,
      commitment: data.commitment,
      commitmentIndex: data.commitmentIndex,
      isReceived: true,
      zCorrect: correctnessChecks.data.zCorrect,
      zOnchainCorrect: correctnessChecks.data.zOnchainCorrect,
    },
  );
}

function listeners(data, userData) {
  console.log('\noffchain/src/listeners.js', '\nlisteners', '\ndata', data, '\nuserData', userData);

  const actualPayload = data.payload;
  switch (actualPayload.for) {
    case 'FTCommitment':
      return insertFTCommitmentToDb(actualPayload, userData);
    case 'NFTCommitment':
      return insertNFTCommitmentToDb(actualPayload, userData);
    case 'NFTToken':
      return insertNFTToDb(actualPayload, userData);
    case 'FToken':
      return insertFTTransactionToDb(actualPayload, userData);
    default:
      throw Error('payload.for is invalid');
  }
}

export default listeners;

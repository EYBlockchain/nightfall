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

async function insertFTTransactionToDb(data, { jwtToken }) {
  console.log('\noffchain/src/listeners.js', 'insertFTTransactionToDb', '\ndata', data);

  await apiGateway.insertFTTransactionToDb({ authorization: jwtToken }, data);
}

async function insertNFTCommitmentToDb(data, userData) {
  console.log(
    '\noffchain/src/listeners.js',
    '\ninsertNFTCommitmentToDb',
    '\ndata',
    data,
    '\nuserData',
    userData,
  );

  const {
    tokenUri,
    tokenId,
    salt,
    receiverPublicKey,
    commitment,
    commitmentIndex,
    blockNumber,
  } = data;

  const correctnessChecks = await apiGateway.checkCorrectnessForNFTCommitment(
    {
      authorization: userData.jwtToken,
    },
    {
      tokenId,
      receiverPublicKey,
      salt,
      commitment,
      commitmentIndex,
      blockNumber,
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
      tokenUri,
      tokenId,
      salt,
      commitment,
      commitmentIndex,
      isReceived: true,
      zCorrect: correctnessChecks.data.zCorrect,
      zOnchainCorrect: correctnessChecks.data.zOnchainCorrect,
    },
  );
}

async function insertFTCommitmentToDb(data, { jwtToken }) {
  console.log('\noffchain/src/listeners.js', '\ninsertFTCommitmentToDb', '\ndata', data);

  const { blockNumber, outputCommitments } = data;
  const [{ value, salt, pk, commitment, commitmentIndex }] = outputCommitments;

  const correctnessChecks = await apiGateway.checkCorrectnessForFTCommitment(
    {
      authorization: jwtToken,
    },
    {
      value,
      salt,
      pk,
      commitment,
      commitmentIndex,
      blockNumber,
    },
  );

  console.log(
    '\noffchain/src/listeners.js',
    '\ninsertFTCommitmentToDb',
    '\ncorrectnessChecks',
    correctnessChecks,
  );

  const { zCorrect, zOnchainCorrect } = correctnessChecks.data;

  await apiGateway.insertFTCommitmentToDb(
    { authorization: jwtToken },
    { ...data, zCorrect, zOnchainCorrect },
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

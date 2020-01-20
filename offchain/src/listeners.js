import apiGateway from './rest/api-gateway';

async function insertNFTToDb(data, { jwtToken }) {
  console.log('\noffchain/src/listeners.js', 'insertNFTToDb', '\ndata', data);

  await apiGateway.insertNFTToDb({ authorization: jwtToken }, data);
}

async function insertFTTransactionToDb(data, { jwtToken }) {
  console.log('\noffchain/src/listeners.js', 'insertFTTransactionToDb', '\ndata', data);

  await apiGateway.insertFTTransactionToDb({ authorization: jwtToken }, data);
}

async function insertNFTCommitmentToDb(data, { jwtToken }) {
  console.log('\noffchain/src/listeners.js', '\ninsertNFTCommitmentToDb', '\ndata', data);

  const { blockNumber, outputCommitments } = data;
  const [{ tokenId, salt, owner, commitment, commitmentIndex }] = outputCommitments;

  const correctnessChecks = await apiGateway.checkCorrectnessForNFTCommitment(
    {
      authorization: jwtToken,
    },
    {
      tokenId,
      publicKey: owner.publicKey,
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

  const { zCorrect, zOnchainCorrect } = correctnessChecks.data;

  await apiGateway.insertNFTCommitmentToDb(
    { authorization: jwtToken },
    { ...data, zCorrect, zOnchainCorrect },
  );
}

async function insertFTCommitmentToDb(data, { jwtToken }) {
  console.log('\noffchain/src/listeners.js', '\ninsertFTCommitmentToDb', '\ndata', data);

  const { blockNumber, outputCommitments } = data;
  const [{ value, salt, owner, commitment, commitmentIndex }] = outputCommitments;

  const correctnessChecks = await apiGateway.checkCorrectnessForFTCommitment(
    {
      authorization: jwtToken,
    },
    {
      value,
      salt,
      publicKey: owner.publicKey,
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

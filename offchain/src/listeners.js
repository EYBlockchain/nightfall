import apiGateway from './rest/api-gateway';

async function addFToken(data, userData) {
  try {
    console.log('\noffchain/src/listeners.js', 'addFToken', '\ndata', data);

    await apiGateway.addFTokenToDB(
      {
        authorization: userData.jwtToken,
      },
      {
        amount: data.amount,
        shieldContractAddress: data.shieldContractAddress,
        transferor: data.transferor,
        transferorAddress: data.transferorAddress,
        isReceived: true,
      },
    );
  } catch (err) {
    console.log(err);
  }
}

async function addNFToken(data, userData) {
  try {
    console.log('\noffchain/src/listeners.js', 'addNFToken', '\ndata', data);

    await apiGateway.addNFTokenToDB(
      {
        authorization: userData.jwtToken,
      },
      {
        uri: data.uri,
        tokenId: data.tokenId,
        shieldContractAddress: data.shieldContractAddress,
        transferor: data.transferor,
        transferorAddress: data.transferorAddress,
        isReceived: true,
      },
    );
  } catch (err) {
    console.log(err);
  }
}

async function addTokenCommitment(data, userData) {
  try {
    console.log(
      '\noffchain/src/listeners.js',
      '\naddToken',
      '\ndata',
      data,
      '\nuserData',
      userData,
    );

    const correctnessChecks = await apiGateway.checkCorrectnessToken(
      {
        authorization: userData.jwtToken,
      },
      {
        A: data.tokenId,
        pk: data.transfereePublicKey,
        S_A: data.salt,
        z_A: data.commitment,
        z_A_index: data.commitmentIndex,
      },
    );

    console.log(
      '\noffchain/src/listeners.js',
      '\naddTokenCommitment',
      '\ncorrectnessChecks',
      correctnessChecks,
    );

    await apiGateway.addTokenCommitmentToDB(
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
  } catch (err) {
    console.log(err);
  }
}

async function addCoinCommitment(data, userData) {
  try {
    console.log(
      '\noffchain/src/listeners.js',
      '\naddCoinCommitment',
      '\ndata',
      data,
      '\nuserData',
      userData,
    );

    const correctnessChecks = await apiGateway.checkCorrectnessCoin(
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
      '\naddCoinCommitment',
      '\ncorrectnessChecks',
      correctnessChecks,
    );

    await apiGateway.addCoinCommitmentToDB(
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
  } catch (err) {
    console.log(err);
  }
}

function listeners(data, userData) {
  console.log('\noffchain/src/listeners.js', '\nlisteners', '\ndata', data, '\nuserData', userData);

  const actualPayload = data.payload;
  switch (actualPayload.for) {
    case 'coin':
      return addCoinCommitment(actualPayload, userData);
    case 'token':
      return addTokenCommitment(actualPayload, userData);
    case 'NFTToken':
      return addNFToken(actualPayload, userData);
    case 'FToken':
      return addFToken(actualPayload, userData);
    default:
      throw Error('payload.for is invalid');
  }
}

export default listeners;

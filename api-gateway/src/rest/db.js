import request from 'request';
import config from 'config';

const url = config.get('database.url');

const requestWrapper = options =>
  new Promise(function promiseHandler(resolve, reject) {
    request(options, function responseHandler(err, res, body) {
      if (err || res.statusCode !== 200) {
        return reject(err || res.body.error);
      }
      return resolve(body.data);
    });
  });

/*
 * rest calls to database microservice
 */
export default {
  // insert user data intro user collection
  createUser(body) {
    const options = {
      url: `${url}/users`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // initalize db connection at time first login
  configureDBconnection(body) {
    const options = {
      url: `${url}/db-connection`,
      method: 'POST',
      body,
      json: true,
    };
    return requestWrapper(options);
  },

  // fetch logged in user info from. user collection
  fetchUser({ name }) {
    const options = {
      url: `${url}/users/${name}`,
      method: 'GET',
      json: true,
    };
    return requestWrapper(options);
  },

  // update user info in user collection
  updateUser({ name }, body) {
    const options = {
      url: `${url}/users/${name}`,
      method: 'PATCH',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // insert new coin shield contract info for user in user collection
  addFTShieldContractInfo({ name }, body) {
    const options = {
      url: `${url}/users/${name}/ft-shield-contracts`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // insert new token shield contract info for user in user collection
  addNFTShieldContractInfo({ name }, body) {
    const options = {
      url: `${url}/users/${name}/nft-shield-contracts`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // update coin shield contract info for user in user collection
  updateFTShieldContractInfoByContractAddress({ name }, contractAdress, body) {
    const options = {
      url: `${url}/users/${name}/ft-shield-contracts/${contractAdress}`,
      method: 'PUT',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // update token shield contract info for user in user collection
  updateNFTShieldContractInfoByContractAddress({ name }, contractAdress, body) {
    const options = {
      url: `${url}/users/${name}/nft-shield-contracts/${contractAdress}`,
      method: 'PUT',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // delete coin shield contract info for user from user collection
  deleteFTShieldContractInfoByContractAddress({ name }, contractAdress) {
    const options = {
      url: `${url}/users/${name}/ft-shield-contracts/${contractAdress}`,
      method: 'DELETE',
      json: true,
    };
    return requestWrapper(options);
  },

  // delete token shield contract info for user from user collection
  deleteNFTShieldContractInfoByContractAddress({ name }, contractAdress) {
    const options = {
      url: `${url}/users/${name}/nft-shield-contracts/${contractAdress}`,
      method: 'DELETE',
      json: true,
    };
    return requestWrapper(options);
  },

  // add anonymous one time used account to user collection
  updateUserWithPrivateAccount({ name }, body) {
    const options = {
      url: `${url}/users/${name}/private-accounts`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // insert non-fungible token info in nft collection
  insertNFToken({ name }, body) {
    const options = {
      url: `${url}/nfts`,
      method: 'POST',
      json: true,
      headers: { loggedInUsername: name },
      body,
    };
    return requestWrapper(options);
  },

  // update non-fungible token info in nft collection
  updateNFTokenByTokenId({ name }, tokenId, body) {
    const options = {
      url: `${url}/nfts/${tokenId}`,
      method: 'PATCH',
      json: true,
      headers: { loggedInUsername: name },
      body,
    };
    return requestWrapper(options);
  },

  // fetch non-fungible tokens
  getNFTokens({ name }, qs) {
    const options = {
      url: `${url}/nfts`,
      method: 'GET',
      json: true,
      headers: { loggedInUsername: name },
      qs,
    };
    return requestWrapper(options);
  },

  // fetch NFT transactions
  getNFTTransactions({ name }, qs) {
    const options = {
      url: `${url}/nfts/transactions`,
      method: 'GET',
      json: true,
      headers: { loggedInUsername: name },
      qs,
    };
    return requestWrapper(options);
  },

  // insert non-fungible token commitment info in nft_commitment collection
  insertNFTCommitment({ name }, body) {
    const options = {
      url: `${url}/nft-commitments`,
      method: 'POST',
      json: true,
      headers: { loggedInUsername: name },
      body,
    };
    return requestWrapper(options);
  },

  // update non-fungible token commitment info in nft_commitment collection
  updateNFTCommitmentByTokenId({ name }, tokenId, body) {
    const options = {
      url: `${url}/nft-commitments/${tokenId}`,
      method: 'PATCH',
      json: true,
      headers: { loggedInUsername: name },
      body,
    };
    return requestWrapper(options);
  },

  // fetch NFT commitments
  getNFTCommitments({ name }, qs) {
    const options = {
      url: `${url}/nft-commitments`,
      method: 'GET',
      json: true,
      headers: { loggedInUsername: name },
      qs,
    };
    return requestWrapper(options);
  },

  // fetch NFT commitment transactions
  getNFTCommitmentTransactions({ name }, qs) {
    const options = {
      url: `${url}/nft-commitments/transactions`,
      method: 'GET',
      json: true,
      headers: { loggedInUsername: name },
      qs,
    };
    return requestWrapper(options);
  },

  // insert fungible token trantion info in ft_transaction collection
  insertFTTransaction({ name }, body) {
    const options = {
      url: `${url}/fts/transactions`,
      method: 'POST',
      json: true,
      headers: { loggedInUsername: name },
      body,
    };
    return requestWrapper(options);
  },

  // fetch FT transactions
  getFTTransactions({ name }, qs) {
    const options = {
      url: `${url}/fts/transactions`,
      method: 'GET',
      json: true,
      headers: { loggedInUsername: name },
      qs,
    };
    return requestWrapper(options);
  },

  // insert fungible token commitment info in ft_commitment collection
  insertFTCommitment({ name }, body) {
    const options = {
      url: `${url}/ft-commitments`,
      method: 'POST',
      json: true,
      headers: { loggedInUsername: name },
      body,
    };
    return requestWrapper(options);
  },

  // update fungible token commitment info in ft_commitment collection
  updateFTCommitmentByCommitmentHash({ name }, commitmentHash, body) {
    const options = {
      url: `${url}/ft-commitments/${commitmentHash}`,
      method: 'PATCH',
      json: true,
      headers: { loggedInUsername: name },
      body,
    };
    return requestWrapper(options);
  },

  // fetch FT Commitments
  getFTCommitments({ name }) {
    const options = {
      url: `${url}/ft-commitments`,
      method: 'GET',
      json: true,
      headers: { loggedInUsername: name },
    };
    return requestWrapper(options);
  },

  // insert fungible token commitment transaction info in ft_commitment_transaction collection
  insertFTCommitmentTransaction({ name }, body) {
    const options = {
      url: `${url}/ft-commitments/transactions`,
      method: 'POST',
      json: true,
      headers: { loggedInUsername: name },
      body,
    };
    return requestWrapper(options);
  },

  // fetch FT Commitments transactions
  getFTCommitmentTransactions({ name }, qs) {
    const options = {
      url: `${url}/ft-commitments/transactions`,
      method: 'GET',
      json: true,
      headers: { loggedInUsername: name },
      qs,
    };
    return requestWrapper(options);
  },
};

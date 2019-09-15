const Web3 = require('web3');

const getEthAccounts = async () => {
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `${process.env.BLOCKCHAIN_HOST}:${process.env.BLOCKCHAIN_PORT}`,
    ),
  );
  const accounts = await web3.eth.getAccounts();
  return accounts;
};

module.exports = {
  getEthAccounts,
};

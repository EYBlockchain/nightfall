const Web3 = require('web3');

const getEthAccounts = async () => {
  const web3 = new Web3(new Web3.providers.HttpProvider('http://ganache:8545'));
  const accounts = await web3.eth.getAccounts();
  return accounts;
};

module.exports = {
  getEthAccounts,
};

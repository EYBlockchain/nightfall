/** ***************************************************************************
 * Presents an API which can be used to control Ethereum account creation
 *
 * version 0.0.1
 **************************************************************************** */

import Web3 from '../web3';

/**
 * Returns ether balance of an account
 * @param {*} address - address of the account
 */
export async function getBalance(address) {
  const web3 = Web3.connection();
  const balance = await web3.eth.getBalance(address);
  return web3.utils.fromWei(balance, 'ether').toString();
}

/**
 * Creates an account in blockchain
 * @param {*} password - password to create account in blockchain
 */
export function newAccount(password) {
  const web3 = Web3.connection();
  return web3.eth.personal.newAccount(password);
}

/**
 * This method will unlock an account to sign transaction
 * @param {*} account - address of the account
 * @param {*} password - password of the account
 */
export function unlockAccount(account, password) {
  const web3 = Web3.connection();
  return web3.eth.personal.unlockAccount(account, password, 0);
}

/**
 * Sends ether from coinbase to account
 * @param {*} to - to address
 * @param {*} from - from address
 * @param {*} amount - amount of ether
 */
export function pay(to, from, amount) {
  const web3 = Web3.connection();

  return web3.eth.sendTransaction({
    from,
    to,
    value: amount,
    gas: 3000000,
  });
}

export async function sendEtherToAccount(address) {
  const web3 = Web3.connection();
  const coinbase = await web3.eth.getCoinbase();

  return web3.eth.sendTransaction({
    from: coinbase,
    to: address,
    value: 2000000000000000000,
    gas: 3000000,
    gasPrice: 20000000000,
  });
}

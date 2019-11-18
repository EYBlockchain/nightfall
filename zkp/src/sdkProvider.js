/*
 * This is a temporary module for setting a provider for the library functions.
 * We want Nightfall to be as stand-alone as possible.
 * This module will eventually be pulled out into its own library.
 */

import contract from 'truffle-contract';
import Web3 from 'web3';

let provider = null;

/**
 * Sets the provider that will be used for the library functions
 * @param {String} uri
 */
export function setProvider(uri) {
  if (!uri) throw new Error('No uri was provided');
  provider = new Web3.providers.WebsocketProvider(uri);
}

/**
 * Get the instantiated provider
 * @throws {Error} - if no provider is instantiated
 * @returns {Web3.eth.WebsocketProvider}
 */
export function getProvider() {
  if (!provider) throw new Error('No provider was set for sdk');
  return provider;
}

/**
 * Helper function to instantiate contracts given their JSON and address
 * @param {Object} json
 * @param {String} address
 * @returns {truffle-contract.contract}
 */
export async function instantiateContract(json, address) {
  const contractObject = contract(json);
  contractObject.setProvider(getProvider());
  const instance = await contractObject.at(address);
  return instance;
}

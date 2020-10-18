/**
 * this file over default confidurtation of Nightlite
 * for test environment.
 */
import { overrideDefaultConfig } from '@eyblockchain/nightlite';
import config from 'config';
import utils from 'zkp-utils';
import Web3 from '../../src/web3';

Web3.connect();

utils.setZokratesPrime(config.ZOKRATES_PRIME);

overrideDefaultConfig({
  NODE_HASHLENGTH: config.NODE_HASHLENGTH,
});

jest.setTimeout(7200000);

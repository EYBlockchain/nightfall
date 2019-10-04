import { environment } from '../../environments/environment';

const BaseUrl = environment.url;
const assetSwarm = '/assets-swarm/';
const accountsBaseUrl = '/accounts/';
const assetBlockchain = '/asset-blockchain/';
const settlement = '/settlement/';

/**
 * @ignore
 */
export const api = {
  root: 'http://localhost:3000/',
  assetsList: +'asset',
  account: 'account',
};

/**
 * @ignore
 */
export const config = {
  apiGateway: {
    root: BaseUrl
  },
  zkp: {
    root: BaseUrl
  },
  offchain: {
    root: BaseUrl
  },
  user : {
    root: BaseUrl + 'user/'
  },
};
/**
 * @ignore
 */
export const roles = {
  '0': 'Unauthorized',
  '1': 'Authorized',
  '2': 'Admin',
};
/**
 * @ignore
 */
export const tokenTypes = {
  'legal-ownership' : '0' ,
  'asset' : '1',
  'loan-beneficiary' : '2',
  'insurance' : '3'
};

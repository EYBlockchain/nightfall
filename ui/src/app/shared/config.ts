import { environment } from '../../environments/environment';

const assetSwarm = '/assets-swarm/';
const accountsBaseUrl = '/accounts/';
const assetBlockchain = '/asset-blockchain/';
const settlement = '/settlement/';

/**
 * @ignore
 */
export const config = {
  apiGateway: {
    root: environment.api_server_url,
  },
  rabbitmq: {
    root: environment.rabbitmq_server_url,
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

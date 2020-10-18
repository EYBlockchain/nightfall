/**
 * @module restapi.js
 * @author Liju, AsishAP
 * @desc
 */

import express from 'express';
import bodyParser from 'body-parser';
import { merkleTree, overrideDefaultConfig } from '@eyblockchain/nightlite';
import config from 'config';
import { ftCommitmentRoutes, ftRoutes, nftCommitmentRoutes, nftRoutes } from './routes';
import vkController from './vk-controller'; // this import TRIGGERS the runController() script within.
import { formatResponse, formatError, errorHandler } from './middlewares';
import complianceInit from './compliance-init';
import logger from './logger';
import Web3 from './web3';

const app = express();

Web3.connect();

if (process.env.NODE_ENV !== 'test') vkController.runController();

overrideDefaultConfig({
  NODE_HASHLENGTH: config.NODE_HASHLENGTH,
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  if (req.method === 'OPTIONS') {
    res.end();
  } else {
    next();
  }
});

app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);

app.use(bodyParser.json());

app.use('/', nftCommitmentRoutes);
app.use('/', ftCommitmentRoutes);
app.use('/', ftRoutes);
app.use('/', nftRoutes);

app.route('/vk').post(async function runVkController(req, res, next) {
  try {
    await vkController.runController();
    res.data = { message: 'verification keys loaded' };
    next();
  } catch (err) {
    next(err);
  }
});

app.use(formatResponse);

app.use((err, req, res, next) => {
  logger.error(
    `${req.method}:${req.url}
    ${JSON.stringify({ error: err.message })}
    ${JSON.stringify({ errorStack: err.stack.split('\n') }, null, 1)}
    ${JSON.stringify({ body: req.body })}
    ${JSON.stringify({ params: req.params })}
    ${JSON.stringify({ query: req.query })}
  `,
  );
  logger.error(JSON.stringify(err, null, 2));
  next(err);
});

app.use(formatError);
app.use(errorHandler);

/**
We TRIGGER the merkle-tree microservice's event filter from here.
TODO: consider whether there is a better way to do this when the application starts-up.
*/
if (process.env.NODE_ENV !== 'test') merkleTree.startEventFilter();
if (process.env.COMPLIANCE === 'true') complianceInit.startCompliance();

const server = app.listen(80, '0.0.0.0', () =>
  logger.info('Zero-Knowledge-Proof RESTful API server started on ::: 80'),
);
server.timeout = 0;

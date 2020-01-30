/**
 * @module restapi.js
 * @author Liju, AsishAP
 * @desc
 */

import express from 'express';
import bodyParser from 'body-parser';
import { merkleTree, provider } from '@eyblockchain/nightlite';
import { ftCommitmentRoutes, ftRoutes, nftCommitmentRoutes, nftRoutes } from './routes';
import vkController from './vk-controller'; // this import TRIGGERS the runController() script within.
import { formatResponse, formatError, errorHandler } from './middlewares';

const app = express();

app.use(function cros(req, res, next) {
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

provider.connect();

app.route('/vk').post(async function runVkController(req, res, next) {
  try {
    await vkController.runController();
    res.data = { message: 'vk loaded' };
    next();
  } catch (err) {
    next(err);
  }
});

app.use(formatResponse);

app.use(function logError(err, req, res, next) {
  console.error(
    `${req.method}:${req.url}
    ${JSON.stringify({ error: err.message })}
    ${JSON.stringify({ errorStack: err.stack.split('\n') }, null, 1)}
    ${JSON.stringify({ body: req.body })}
    ${JSON.stringify({ params: req.params })}
    ${JSON.stringify({ query: req.query })}
  `,
  );
  console.error(JSON.stringify(err, null, 2));
  next(err);
});

app.use(formatError);
app.use(errorHandler);

/**
We TRIGGER the merkle-tree microservice's event filter from here.
TODO: consider whether there is a better way to do this when the application starts-up.
*/
if (process.env.NODE_ENV !== 'test') merkleTree.startEventFilter();

const server = app.listen(80, '0.0.0.0', () =>
  console.log('Zero-Knowledge-Proof RESTful API server started on ::: 80'),
);
server.timeout = 0;

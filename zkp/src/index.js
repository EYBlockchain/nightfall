/**
 * @module restapi.js
 * @author Liju, AsishAP
 * @desc This restapi.js file gives api endpoints to access the functions of Asset, Auth, TokenHolder, TokenHolderList smart contracts */
//

import express from 'express';
import bodyParser from 'body-parser';
import { ftCommitmentRoutes, ftRoutes, nftCommitmentRoutes, nftRoutes } from './routes';
import vkController from './vk-controller';
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

app.use('/token', nftCommitmentRoutes);
app.use('/coin', ftCommitmentRoutes);
app.use('/ft', ftRoutes);
app.use('/nft', nftRoutes);

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

const server = app.listen(80, '0.0.0.0', () =>
  console.log('Zero-Knowledge-Proof RESTful API server started on ::: 80'),
);
server.timeout = 0;

/**
 * @module restapi.js
 * @author Liju, AsishAP
 * @desc This restapi.js file gives api endpoints to access the functions of Asset, Auth, TokenHolder, TokenHolderList smart contracts */
//

import express from 'express';
import bodyParser from 'body-parser';
import { ftCommitmentRoutes, ftRoutes, nftCommitmentRoutes, nftRoutes } from './routes';
import vkController from './vk-controller';
import Response from '../response'; // class for creating response object

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

app.route('/vk').post(async function runVkController(req, res) {
  const response = new Response();

  try {
    await vkController.runController();
    response.statusCode = 200;
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

const server = app.listen(80, '0.0.0.0', () =>
  console.log('Zero-Knowledge-Proof RESTful API server started on ::: 80'),
);
server.timeout = 0;

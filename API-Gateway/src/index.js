/** **************************************************************************
*                      index.js
* This is the rest API for the Authentication  microservice, which provides
* Authentication and AUthorisation from  the Blockchain

**************************************************************************** */

import rootRouter from './routes/api-gateway';
import nftCommitmentRoutes from './routes/nft_commitment';
import ftCommitmentRoutes from './routes/ft_commitment';
import ftRoutes from './routes/ft';
import nftRoutes from './routes/nft';
import userRoutes from './routes/user';
import shieldRoutes from './routes/shield';

const express = require('express');
const cors = require('cors'); // cors is used to allow cross origin requests

const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const proxy = require('express-http-proxy');

const Config = require('./config/config').getProps(); // get the properties of environment

const logger = require('./logger');

const {
  authentication,
} = require('./middlewares/authMiddleware'); /* Authorization filter used to verify Role of the user */
const { unlockAccount } = require('./middlewares/passwordMiddleware');

app.use(bodyParser.json()); // set up a filter to parse JSON

app.use(cors()); // cross origin filter
app.use(authentication);

app.use('/zkp', unlockAccount, proxy(`${Config.zkp.host}:${Config.zkp.port}`));
app.use('/database', proxy(`${Config.database.host}:${Config.database.port}`));
app.use(
  '/offchain-service',
  unlockAccount,
  proxy(`${Config.offchain.host}:${Config.offchain.port}`),
);
app.use('/', unlockAccount, router);
app.use('/', rootRouter);
app.use('/token', nftCommitmentRoutes);
app.use('/coin', ftCommitmentRoutes);
app.use('/ft', ftRoutes);
app.use('/nft', nftRoutes);
app.use('/user', userRoutes);
app.use('/shield', shieldRoutes);

// handle bad calls
app.use((req, res) => res.status(404).send({ url: `${req.originalUrl} not found` }));

app.use(function errorLogger(err, req, res, next) {
  logger.error(
    `${req.method}:${req.url}
		${JSON.stringify({ error: err.message })}
		${JSON.stringify({ body: req.body })}
		${JSON.stringify({ params: req.params })}
		${JSON.stringify({ query: req.query })}
	`,
  );
  next(err);
});

// handle unhandled promise rejects
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

const server = app.listen(80, '0.0.0.0', () =>
  logger.info('API-Gateway API server running on port 80'),
);

server.setTimeout(120 * 60 * 1000);

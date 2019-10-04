/** **************************************************************************
*                      index.js
* This is the rest API for the Authentication  microservice, which provides
* Authentication and AUthorisation from  the Blockchain

**************************************************************************** */

import express, { Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from './logger';
import {
  rootRouter,
  nftCommitmentRoutes,
  ftCommitmentRoutes,
  ftRoutes,
  nftRoutes,
  userRoutes,
  shieldRoutes,
} from './routes';
import {
  authentication, // Authorization filter to verify Role of the user
  unlockAccount,
  formatResponse,
  formatError,
  errorHandler,
} from './middlewares';

const app = express();
const router = Router();

app.use(bodyParser.json()); // set up a filter to parse JSON

app.use(cors()); // cross origin filter
app.use(authentication);

app.use('/', unlockAccount, router);
app.use('/', rootRouter);
app.use('/', nftCommitmentRoutes);
app.use('/', ftCommitmentRoutes);
app.use('/', ftRoutes);
app.use('/', nftRoutes);
app.use('/user', userRoutes);
app.use('/shield', shieldRoutes);

app.use(formatResponse);

app.use(function logError(err, req, res, next) {
  if (err instanceof Error) {
    logger.error(
      `${req.method}:${req.url}
      ${JSON.stringify({ error: err.message })}
      ${JSON.stringify({ errorStack: err.stack.split('\n') }, null, 1)}
      ${JSON.stringify({ body: req.body })}
      ${JSON.stringify({ params: req.params })}
      ${JSON.stringify({ query: req.query })}
    `,
    );
  }
  next(err);
});

app.use(formatError);
app.use(errorHandler);

// handle unhandled promise rejects
process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at:', p, 'reason:', reason);
});

const server = app.listen(80, '0.0.0.0', () =>
  logger.info('API-Gateway API server running on port 80'),
);

server.setTimeout(120 * 60 * 1000);

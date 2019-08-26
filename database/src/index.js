import express, { Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from './logger';
import { setDB, dbConnection } from './middlewares';
import {
  initializeAccountRoutes,
  initializeNftRoutes,
  initializeNftCommitmentRoutes,
  initializeFtRoutes,
  initializeFtCommitmentRoutes,
} from './routes';

const app = express();
const router = Router();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(dbConnection);
app.use(setDB);
app.use('/', router);

initializeAccountRoutes(router);
initializeNftRoutes(router);
initializeNftCommitmentRoutes(router);
initializeFtRoutes(router);
initializeFtCommitmentRoutes(router);

app.use(function logError(err, req, res) {
  logger.error(
    `${req.method}:${req.url}
    ${JSON.stringify({ error: err.message })}
    ${JSON.stringify({ body: req.body })}
    ${JSON.stringify({ params: req.params })}
    ${JSON.stringify({ query: req.query })}
  `,
  );
  res
    .status(err.status || 500)
    .send({ hasError: true, statusCode: err.status, message: err.message, error: err });
});

const server = app.listen(80, '0.0.0.0', () =>
  console.log('zkp database RESTful API server started on ::: 80'),
);
server.timeout = 0;

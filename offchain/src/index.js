import express from 'express';
import bodyParser from 'body-parser';
import { pkdRouter, whisperRouter } from './routes';
import { formatResponse, formatError, errorHandler } from './middlewares';

const app = express();

app.use(function cors(req, res, next) {
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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', pkdRouter);
app.use('/', whisperRouter);

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
  next(err);
});

app.use(formatError);
app.use(errorHandler);

app.listen(80, '0.0.0.0', () => console.log('zkp OffChain RESTful API server started on ::: 80'));

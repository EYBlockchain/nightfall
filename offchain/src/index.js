import express from 'express';
import bodyParser from 'body-parser';
import { pkdRouter, whisperRouter } from './routes';

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

app.use('/pkd', pkdRouter);
app.use('/whisper', whisperRouter);

app.listen(80, '0.0.0.0', () => console.log('zkp OffChain RESTful API server started on ::: 80'));

/* eslint-disable func-names */

import express from 'express';
import {
  setZkpPublicKey,
  setWhisperPublicKey,
  setPublicKeys,
  setName,
  getZkpPublicKeyFromName,
  getWhisperPublicKeyFromName,
  getNames,
  getNameFromAddress,
  getAddressFromName,
  isNameInUse,
} from '../pkd-controller';
import Response from '../../response'; // class for creating response object

const router = express.Router();

router.get('/name/exists', async function(req, res) {
  const response = Response();
  try {
    const status = await isNameInUse(req.query.name);
    response.statusCode = 200;
    response.status = status;
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.err = { message: err.message };
    res.status(500).json(response);
  }
});

router
  .route('/name')
  .post(async function(req, res) {
    const { name } = req.body;
    const { address } = req.headers;
    console.log(address, 'name post');
    const response = Response();
    try {
      await setName(name, address);
      response.statusCode = 200;
      response.data = { message: 'Name Added.' };
      res.json(response);
    } catch (err) {
      response.statusCode = 500;
      response.err = { message: err.message };
      res.status(500).json(response);
    }
  })
  .get(async function(req, res) {
    const { address } = req.headers;
    console.log(address, 'name get');
    const response = Response();
    try {
      const name = await getNameFromAddress(address);
      response.statusCode = 200;
      response.name = name;
      res.json(response);
    } catch (err) {
      response.statusCode = 500;
      response.err = { message: err.message };
      res.status(500).json(response);
    }
  });

router.post('/set-all-publickey', async function(req, res) {
  const { pk, whisper_pk: whisperPk } = req.body;
  const { address } = req.headers;
  const response = Response();

  try {
    await setPublicKeys([whisperPk, pk], address);
    response.statusCode = 200;
    response.data = { message: 'Keys Added.' };
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.err = { message: err.message };
    res.status(500).json(response);
  }
});

router
  .route('/zkp-publickey')
  .post(async function(req, res) {
    const { pk } = req.body;
    const { address } = req.headers;
    const response = Response();

    try {
      await setZkpPublicKey(pk, address);
      response.statusCode = 200;
      response.data = { message: 'Keys Added.' };
      res.json(response);
    } catch (err) {
      response.statusCode = 500;
      response.err = { message: err.message };
      res.status(500).json(response);
    }
  })
  .get(async function(req, res) {
    const { name } = req.query;
    const response = Response();

    try {
      const data = await getZkpPublicKeyFromName(name);
      response.statusCode = 200;
      response.pk = data;
      res.json(response);
    } catch (err) {
      response.statusCode = 500;
      response.err = { message: err.message };
      res.status(500).json(response);
    }
  });

router
  .route('/whisperkey')
  .post(async function(req, res) {
    const { whisper_pk: whisperPk } = req.body;
    const { address } = req.headers;
    const response = Response();

    try {
      console.log(whisperPk, address);
      await setWhisperPublicKey(whisperPk, address);
      response.statusCode = 200;
      response.data = { message: 'Keys Added.' };
      res.json(response);
    } catch (err) {
      response.statusCode = 500;
      response.err = { message: err.message };
      res.status(500).json(response);
    }
  })
  .get(async function(req, res) {
    const { name } = req.query;
    const response = Response();

    try {
      const data = await getWhisperPublicKeyFromName(name);
      response.statusCode = 200;
      response.user_whisper_pk = data;
      res.json(response);
    } catch (err) {
      response.statusCode = 500;
      response.err = { message: err.message };
      res.status(500).json(response);
    }
  });

router.get('/address', async function(req, res) {
  const { name } = req.query;
  const response = Response();

  try {
    const data = await getAddressFromName(name);
    response.statusCode = 200;
    response.address = data;
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.err = { message: err.message };
    res.status(500).json(response);
  }
});

router.get('/names', async function(req, res) {
  const response = Response();
  try {
    const data = await getNames();
    response.statusCode = 200;
    response.data = data;
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.err = { message: err.message };
    res.status(500).json(response);
  }
});

export default router;

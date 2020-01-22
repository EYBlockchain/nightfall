/* eslint-disable func-names */

import express from 'express';
import {
  setZkpPublicKey,
  setWhisperPublicKey,
  setName,
  getZkpPublicKeyFromName,
  getWhisperPublicKeyFromName,
  getNames,
  getNameFromAddress,
  getAddressFromName,
  isNameInUse,
} from '../pkd-controller';

const router = express.Router();

async function checkNameExistence(req, res, next) {
  try {
    res.data = await isNameInUse(req.query.name);
    next();
  } catch (err) {
    next(err);
  }
}

async function assignNameToAccount(req, res, next) {
  const { name } = req.body;
  const { address } = req.headers;

  try {
    await setName(name, address);
    res.data = { message: 'Name Added.' };
    next();
  } catch (err) {
    next(err);
  }
}

async function getNameForAccount(req, res, next) {
  const { address } = req.headers;

  try {
    res.data = await getNameFromAddress(address);
    next();
  } catch (err) {
    next(err);
  }
}

async function assignZkpPublicKeyToAccount(req, res, next) {
  const { publicKey } = req.body;
  const { address } = req.headers;

  try {
    await setZkpPublicKey(publicKey, address);
    res.data = { message: 'Keys Added.' };
    next();
  } catch (err) {
    next(err);
  }
}

async function getZkpPublicKeyForAccountByName(req, res, next) {
  const { name } = req.query;

  try {
    res.data = await getZkpPublicKeyFromName(name);
    next();
  } catch (err) {
    next(err);
  }
}

async function assignWhisperKeyToAccount(req, res, next) {
  const { whisper_pk: whisperPk } = req.body;
  const { address } = req.headers;

  try {
    await setWhisperPublicKey(whisperPk, address);
    res.data = { message: 'Keys Added.' };
    next();
  } catch (err) {
    next(err);
  }
}

async function getWhisperKeyForAccountByName(req, res, next) {
  const { name } = req.query;

  try {
    res.data = await getWhisperPublicKeyFromName(name);
    next();
  } catch (err) {
    next(err);
  }
}

async function getAllRegisteredAddresses(req, res, next) {
  const { name } = req.query;
  try {
    res.data = await getAddressFromName(name);
    next();
  } catch (err) {
    next(err);
  }
}

async function getAllRegisteredNames(req, res, next) {
  try {
    res.data = await getNames();
    next();
  } catch (err) {
    next(err);
  }
}

router.get('/nameExists', checkNameExistence);
router.get('/getAllRegisteredAddresses', getAllRegisteredAddresses);
router.get('/getAllRegisteredNames', getAllRegisteredNames);
router.post('/setNameToAccount', assignNameToAccount);
router.get('/getNameForAccount', getNameForAccount);
router.post('/setPublickeyToAddressInPKD', assignZkpPublicKeyToAccount);
router.get('/getZkpPublicKeyForAccount', getZkpPublicKeyForAccountByName);
router.post('/setWhisperKeyToAccount', assignWhisperKeyToAccount);
router.get('/getWhisperKeyForAccount', getWhisperKeyForAccountByName);

export default router;

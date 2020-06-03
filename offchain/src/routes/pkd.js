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
  getNameFromZkpPublicKey,
} from '../pkd-controller';

const router = express.Router();

/**
 * This function is to check the existance of username
 * req.query : {
 *    "name":"b"
 * }
 *
 * res.data : {
 *    "name":"b"
 * }
 * @param {*} req
 * @param {*} res
 */
async function checkNameExistence(req, res, next) {
  try {
    res.data = await isNameInUse(req.query.name);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to assign the username to an account creatred
 * req.body : {
 *    "name":"b"
 * }
 *
 * res.data : {
 *    "message":"Name Added."
 * }
 * @param {*} req
 * @param {*} res
 */
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

/**
 * This function is to get name from an account address
 * @param {*} req
 * @param {*} res
 */
async function getNameForAccount(req, res, next) {
  const { address } = req.headers;

  try {
    res.data = await getNameFromAddress(address);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to assign zkp public key to an account created
 * req.body : {
 *    "publicKey":"0xb10a408906580cf1f8835bde49e92dcfcbcd8e27c518f1a51cff7c074d379b4d"
 * }
 *
 * res.data : {
 *    "message":"Keys Added."
 * }
 * @param {*} req
 * @param {*} res
 */
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

/**
 * This function is to get Zkp PublicKey from name
 * @param {*} req
 * @param {*} res
 */
async function getZkpPublicKeyForAccountByName(req, res, next) {
  const { name } = req.query;

  try {
    res.data = await getZkpPublicKeyFromName(name);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to assign whisper key to an account created
 * req.body : {
 *    "whisper_pk":"0xd59947be553be8cd6ab4d27393d537d3ac1bb74eb5cbf96c0ce011bbf7b4f27546a524d2c9a4bd5b3656f93092a5fcb2098f23c682e1912fd8470d6e5336f237f3"
 * }
 *
 * res.data : {
 *    "message":"Keys Added."
 * }
 * @param {*} req
 * @param {*} res
 */
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

/**
 * This function is to get Whisper key from name
 * @param {*} req
 * @param {*} res
 */
async function getWhisperKeyForAccountByName(req, res, next) {
  const { name } = req.query;

  try {
    res.data = await getWhisperPublicKeyFromName(name);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to get all registered addresses from name
 * @param {*} req
 * @param {*} res
 */
async function getAllRegisteredAddresses(req, res, next) {
  const { name } = req.query;
  try {
    res.data = await getAddressFromName(name);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to get all names
 * @param {*} req
 * @param {*} res
 */
async function getAllRegisteredNames(req, res, next) {
  try {
    const names = await getNames();
    const adminIndex = names.indexOf('admin');
    if (adminIndex > -1) {
      names.splice(adminIndex, 1);
    }
    res.data = names;
    next();
  } catch (err) {
    next(err);
  }
}

async function getNameFromZkpPublicKeyService(req, res, next) {
  const { zkp } = req.query;
  try {
    res.data = await getNameFromZkpPublicKey(zkp);
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
router.get('/getNameFromZkpPublicKey', getNameFromZkpPublicKeyService);

export default router;

import { Router } from 'express';
import nfController from '../nf-token-controller';

const router = Router();
/**
 * This function is to mint a non fungible token
 * const data = {
 *   tokenUri: 'unique token URI',
 *   "tokenId":"0x1542f342b6220000000000000000000000000000000000000000000000000000"
 * }
 * @param {*} req
 * @param {*} res
 */
async function mint(req, res, next) {
  const { address } = req.headers;
  const { tokenId, tokenUri } = req.body;

  try {
    await nfController.mintNFToken(tokenId, tokenUri, address);
    res.data = {
      message: 'NFT Mint Successful',
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to transfer a non fungible token to a reciever
 * const data = {
 *    tokenUri: "sample"
 *    tokenId: "0x1542f342b6220000000000000000000000000000000000000000000000000000"
 *    receiver: {
 *      name: "bob",
 *      address: "0x666fA6a40F7bc990De774857eCf35e3C82f07505"
 *    }
 * }
 * @param {*} req
 * @param {*} res
 */
async function transfer(req, res, next) {
  const { address } = req.headers;
  const { tokenId, receiver } = req.body;

  try {
    await nfController.transferNFToken(tokenId, address, receiver.address);
    res.data = {
      message: 'NFT Transfer Successful',
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to burn a non fungible token
 * const data = {
 *    tokenUri: "sample"
 *    tokenId: "0x1542f342b6220000000000000000000000000000000000000000000000000000"
 *  }
 * @param {*} req
 * @param {*} res
 */
async function burn(req, res, next) {
  const { address } = req.headers;
  const { tokenId } = req.body;

  try {
    await nfController.burnNFToken(tokenId, address);
    res.data = {
      message: 'NFT Burn Successful',
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to retrieve address of a non fungible token
 * @param {*} req
 * @param {*} res
 */
async function getAddress(req, res, next) {
  const { address } = req.headers;

  try {
    const nftAddress = await nfController.getNFTAddress(address);
    res.data = {
      nftAddress,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to retrieve information of a non fungible token
 * @param {*} req
 * @param {*} res
 */
async function getInfo(req, res, next) {
  const { address } = req.headers;

  try {
    const balance = await nfController.getBalance(address);
    const nftName = await nfController.getNFTName(address);
    const nftSymbol = await nfController.getNFTSymbol(address);
    res.data = {
      balance,
      nftName,
      nftSymbol,
    };
    next();
  } catch (err) {
    next(err);
  }
}

router.post('/mintNFToken', mint);
router.post('/transferNFToken', transfer);
router.post('/burnNFToken', burn);
router.get('/getNFTokenContractAddress', getAddress);
router.get('/getNFTokenInfo', getInfo);

export default router;

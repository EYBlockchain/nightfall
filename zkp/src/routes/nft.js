import {Router} from 'express';
import nfController from '../nf-token-controller';

const router = Router();

async function mint(req, res, next) {
  const {address} = req.headers;
  const {tokenId, tokenUri} = req.body;

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

async function transfer(req, res, next) {
  const {address} = req.headers;
  const {tokenId, receiver} = req.body;

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

async function burn(req, res, next) {
  const {address} = req.headers;
  const {tokenId} = req.body;

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

async function getAddress(req, res, next) {
  const {address} = req.headers;

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

async function getInfo(req, res, next) {
  const {address} = req.headers;

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

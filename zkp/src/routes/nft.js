import { Router } from 'express';
import nfController from '../nf-token-controller';

const router = Router();

async function mint(req, res, next) {
  const { address } = req.headers;
  const { tokenID, tokenURI } = req.body;

  try {
    await nfController.mintNFToken(tokenID, tokenURI, address);
    res.data = {
      message: 'NFT Mint Successful',
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function transfer(req, res, next) {
  const { address } = req.headers;
  const { tokenID, to } = req.body;

  try {
    await nfController.transferNFToken(tokenID, address, to);
    res.data = {
      message: 'NFT Transfer Successful',
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function burn(req, res, next) {
  const { address } = req.headers;
  const { tokenID } = req.body;

  try {
    await nfController.burnNFToken(tokenID, address);
    res.data = {
      message: 'NFT Burn Successful',
    };
    next();
  } catch (err) {
    next(err);
  }
}

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

router.route('/mint').post(mint);
router.route('/transfer').post(transfer);
router.route('/burn').post(burn);
router.route('/address').get(getAddress);
router.route('/details').get(getInfo);

export default router;

import { Router } from 'express';
import nfController from '../nf-token-controller';
import Response from '../../response'; // class for creating response object

const router = Router();

async function mint(req, res) {
  const { address } = req.headers;
  const { tokenID, tokenURI } = req.body;

  const response = new Response();

  try {
    await nfController.mintNFToken(tokenID, tokenURI, address);

    response.statusCode = 200;
    response.data = {
      message: 'NFT Mint Successful',
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function transfer(req, res) {
  const { address } = req.headers;
  const { tokenID, to } = req.body;

  const response = new Response();

  try {
    await nfController.transferNFToken(tokenID, address, to);

    response.statusCode = 200;
    response.data = {
      message: 'NFT Transfer Successful',
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function burn(req, res) {
  const { address } = req.headers;
  const { tokenID } = req.body;

  const response = new Response();

  try {
    await nfController.burnNFToken(tokenID, address);

    response.statusCode = 200;
    response.data = {
      message: 'NFT Burn Successful',
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function getAddress(req, res) {
  const { address } = req.headers;
  const response = new Response();

  try {
    const nftAddress = await nfController.getNFTAddress(address);
    response.statusCode = 200;
    response.data = {
      nftAddress,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function getInfo(req, res) {
  const { address } = req.headers;
  const response = new Response();

  try {
    const balance = await nfController.getBalance(address);
    const nftName = await nfController.getNFTName(address);
    const nftSymbol = await nfController.getNFTSymbol(address);
    response.statusCode = 200;
    response.data = {
      balance,
      nftName,
      nftSymbol,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

router.route('/mint').post(mint);
router.route('/transfer').post(transfer);
router.route('/burn').post(burn);
router.route('/address').get(getAddress);
router.route('/details').get(getInfo);

export default router;

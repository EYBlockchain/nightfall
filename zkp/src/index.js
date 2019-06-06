/**
 * @module restapi.js
 * @author Liju, AsishAP
 * @desc This restapi.js file gives api endpoints to access the functions of Asset, Auth, TokenHolder, TokenHolderList smart contracts */
//

/* eslint-disable camelcase */

import express from 'express';
import bodyParser from 'body-parser';
import { argv } from 'yargs';
import Response from '../response/response'; // class for creating response object
import nfController from './nf-token-controller';
import fController from './f-token-controller';
import vkController from './vk-controller';
import config from './config';
import fTokenController from './f-token-controller';

config.setEnv(argv.environment);

const app = express();

app.use((req, res, next) => {
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

app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());

app.route('/vk').post(async (req, res) => {
  const response = new Response();

  try {
    await vkController.runController();
    response.statusCode = 200;
    // response.data = {};
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/token/mint').post(async (req, res) => {
  const { address } = req.headers;

  const { A, pk_A, S_A } = req.body;

  const response = new Response();

  try {
    const [z_A, z_A_index] = await nfController.mint(A, pk_A, S_A, address);

    response.statusCode = 200;
    response.data = {
      z_A,
      z_A_index,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/token/transfer').post(async (req, res) => {
  const { A, pk_B, S_A, S_B, sk_A, z_A, z_A_index } = req.body;
  const { address } = req.headers;
  const response = new Response();
  try {
    const { z_B, z_B_index, txObj } = await nfController.transfer(
      A,
      pk_B,
      S_A,
      S_B,
      sk_A,
      z_A,
      z_A_index,
      address,
    );

    response.statusCode = 200;
    response.data = {
      z_B,
      z_B_index,
      txObj,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/token/burn').post(async (req, res) => {
  const { A, S_A, Sk_A, z_A, z_A_index } = req.body;
  const { address } = req.headers;
  const response = new Response();
  try {
    await nfController.burn(
      A,
      Sk_A,
      S_A,
      z_A,
      z_A_index,
      address,
      address, // payed to same user.
    );
    response.statusCode = 200;
    response.data = {
      z_A,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/token/checkCorrectness').post(async (req, res) => {
  const response = new Response();

  console.log('\nzkp/src/restapi', '\n/token/checkCorrectness', '\nreq.body', req.body);

  try {
    const { address } = req.headers;

    const { A, pk, S_A, z_A, z_A_index } = req.body;

    const results = await nfController.checkCorrectness(A, pk, S_A, z_A, z_A_index, address);

    console.log('\nzkp/src/restapi', '\n/token/checkCorrectness', '\nresults', results);

    response.statusCode = 200;
    response.data = results;
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app
  .route('/coin/shield')
  .post(async (req, res) => {
    const { address } = req.headers;
    const { coinShield } = req.body;

    const response = new Response();

    try {
      await fController.setShield(coinShield, address);
      await fController.getBalance(address);
      response.statusCode = 200;
      response.data = {
        message: 'CoinShield Address Set.',
      };
      res.json(response);
    } catch (err) {
      console.log('/coin/shield', err);
      fController.unSetShield(address);
      response.statusCode = 500;
      response.data = err;
      res.status(500).json(response);
    }
  })
  .delete(async (req, res) => {
    const { address } = req.headers;

    const response = new Response();

    try {
      fController.unSetShield(address);
      response.statusCode = 200;
      response.data = {
        message: 'CoinShield Address Unset.',
      };
      res.json(response);
    } catch (err) {
      response.statusCode = 500;
      response.data = err;
      res.status(500).json(response);
    }
  })
  .get(async (req, res) => {
    const { address } = req.headers;

    const response = new Response();

    try {
      const shieldAddress = await fController.getShieldAddress(address);
      const { name } = await fController.getTokenInfo(address);
      response.statusCode = 200;
      response.data = {
        shieldAddress,
        name,
      };
      res.json(response);
    } catch (err) {
      console.log(err);
      response.statusCode = 500;
      response.data = err;
      res.status(500).json(response);
    }
  });

app.route('/coin/mint').post(async (req, res) => {
  const { address } = req.headers;
  const { A, pk_A, S_A } = req.body;

  const response = new Response();

  try {
    const [coin, coin_index] = await fController.mint(A, pk_A, S_A, address);
    response.statusCode = 200;
    response.data = {
      coin,
      coin_index,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/coin/transfer').post(async (req, res) => {
  const { address } = req.headers;
  const { C, D, E, F, pk_B, S_C, S_D, S_E, S_F, sk_A, z_C, z_C_index, z_D, z_D_index } = req.body;

  const response = new Response();
  try {
    const { z_E, z_E_index, z_F, z_F_index, txObj } = await fController.transfer(
      C,
      D,
      E,
      F,
      pk_B,
      S_C,
      S_D,
      S_E,
      S_F,
      sk_A,
      z_C,
      z_C_index,
      z_D,
      z_D_index,
      address,
    );
    response.statusCode = 200;
    response.data = {
      z_E,
      z_E_index,
      z_F,
      z_F_index,
      txObj,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/coin/burn').post(async (req, res) => {
  const { A, sk_A, S_A, z_A, z_A_index, payTo } = req.body;
  const { address } = req.headers;

  const response = new Response();
  try {
    await fController.burn(A, sk_A, S_A, z_A, z_A_index, address, payTo);
    response.statusCode = 200;
    response.data = {
      z_C: z_A,
      z_C_index: z_A_index,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/coin/checkCorrectness').post(async (req, res) => {
  const response = new Response();

  console.log('\nzkp/src/restapi', '\n/coin/checkCorrectness', '\nreq.body', req.body);

  try {
    const { address } = req.headers;
    console.log('BODY', req.body);
    const { E, pk, S_E, z_E, z_E_index } = req.body;

    const results = await fController.checkCorrectness(E, pk, S_E, z_E, z_E_index, address);

    console.log('\nzkp/src/restapi', '\n/coin/checkCorrectness', '\nresults', results);

    response.statusCode = 200;
    response.data = results;
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/ft/mint').post(async (req, res) => {
  const { amount } = req.body;
  const { address } = req.headers;
  const response = new Response();

  try {
    const status = await fController.buyFToken(amount, address);
    response.statusCode = 200;
    response.data = status;
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/ft/transfer').post(async (req, res) => {
  const { amount, toAddress } = req.body;
  const { address } = req.headers;
  const response = new Response();

  try {
    const status = await fController.transferFToken(amount, address, toAddress);
    response.statusCode = 200;
    response.data = status;
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/ft/burn').post(async (req, res) => {
  const { amount } = req.body;
  const { address } = req.headers;
  const response = new Response();

  try {
    const status = await fController.burnFToken(amount, address);
    response.statusCode = 200;
    response.data = status;
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/address/coin').get(async (req, res) => {
  const { address } = req.headers;
  const response = new Response();

  try {
    const balance = await fController.getBalance(address);
    const { symbol, name } = await fController.getTokenInfo(address);
    response.statusCode = 200;
    response.data = {
      balance,
      symbol,
      name,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/nft/mint').post(async (req, res) => {
  const { address } = req.headers;

  const { tokenID, tokenImprint } = req.body;

  const response = new Response();

  try {
    await nfController.mintNFToken(tokenID, tokenImprint, address);

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
});

app.route('/nft/transfer').post(async (req, res) => {
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
});

app.route('/nft/burn').post(async (req, res) => {
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
});

app
  .route('/token/shield')
  .post(async (req, res) => {
    const { address } = req.headers;
    const { tokenShield } = req.body;

    const response = new Response();

    try {
      await nfController.setShield(tokenShield, address);
      await nfController.getNFTName(address);
      response.statusCode = 200;
      response.data = {
        message: 'TokenShield Address Set.',
      };
      res.json(response);
    } catch (err) {
      console.log('/token/shield', err);
      nfController.unSetShield(address);
      response.statusCode = 500;
      response.data = err;
      res.status(500).json(response);
    }
  })
  .delete(async (req, res) => {
    const { address } = req.headers;

    const response = new Response();

    try {
      nfController.unSetShield(address);
      response.statusCode = 200;
      response.data = {
        message: 'TokenShield Address Unset.',
      };
      res.json(response);
    } catch (err) {
      response.statusCode = 500;
      response.data = err;
      res.status(500).json(response);
    }
  })
  .get(async (req, res) => {
    const { address } = req.headers;

    const response = new Response();

    try {
      const shieldAddress = await nfController.getShieldAddress(address);
      const name = await nfController.getNFTName(address);
      response.statusCode = 200;
      response.data = {
        shieldAddress,
        name,
      };
      res.json(response);
    } catch (err) {
      console.log(err);
      response.statusCode = 500;
      response.data = err;
      res.status(500).json(response);
    }
  });

app.route('/address/nft-balance').get(async (req, res) => {
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
});

app.route('/nft/address').get(async (req, res) => {
  const { address } = req.headers;
  const response = new Response();

  try {
    const nftAddress = await nfController.getNFTAddress(address);
    response.statusCode = 200;
    response.data = {
      nftAddress
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

app.route('/ft/address').get(async (req, res) => {
  const { address } = req.headers;
  const response = new Response();

  try {
    const ftAddress = await fTokenController.getFTAddress(address);
    response.statusCode = 200;
    response.data = {
      ftAddress
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
});

const server = app.listen(80, '0.0.0.0', () => {
  console.log('Zero-Knowledge-Proof RESTful API server started on ::: 80');
});
server.timeout = 0;

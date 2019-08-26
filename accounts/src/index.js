import app from './app';
import web3 from './web3';

try {
  // web3.js connect to geth.
  web3.connect();

  // Account microservice listening in port 80.
  app.listen(80);
} catch (err) {
  console.error(err);
  process.exit(1);
}

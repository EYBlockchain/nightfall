import { writeFile } from 'fs';
import { argv } from 'yargs';

// This is good for local dev environments, when it's better to
// store a projects environment variables in a .gitignore'd file
require('dotenv').config();

const {
  API_GATEWAY_HOST,
  API_GATEWAY_PORT,
  RABBITMQ_HOST,
  RABBITMQ_PORT,
} = process.env;

const targetPath = './src/environments/environment.ts';

const envConfigFile = `
export const environment = {
  production: false,
  api_server_url: '${API_GATEWAY_HOST}:${API_GATEWAY_PORT}/',
  rabbitmq_server_url: '${RABBITMQ_HOST}:${RABBITMQ_PORT}/ws'
};
`
writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  }

  console.log(`Output generated at ${targetPath}`);
});

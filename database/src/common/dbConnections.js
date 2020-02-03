import mongoose from 'mongoose';
import config from 'config';

const { host, port, databaseName, admin, adminPassword } = config.get('mongo');

export const dbConnections = {};
export const userDBs = {};

dbConnections.admin = mongoose.createConnection(
  `mongodb://${admin}:${adminPassword}@${host}:${port}/${databaseName}`,
  { useNewUrlParser: true, useCreateIndex: true },
);

import mongoose from 'mongoose';
import config from 'config';

const { host, port, databaseName, admin, adminPassword } = config.get('mongo');
const dbConnections = {};

dbConnections.admin = mongoose.createConnection(
  `mongodb://${admin}:${adminPassword}@${host}:${port}/${databaseName}`,
  { useNewUrlParser: true, useCreateIndex: true },
);

export default dbConnections;

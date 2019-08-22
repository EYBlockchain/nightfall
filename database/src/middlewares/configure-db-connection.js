import mongoose from 'mongoose';
import { getProps } from '../config';

const config = getProps();
const { host, port, databaseName, admin, adminPassword } = config.mongo;

const connections = {
  admin: mongoose.createConnection(
    `mongodb://${admin}:${adminPassword}@${host}:${port}/${databaseName}`,
    { useNewUrlParser: true, useCreateIndex: true },
  ),
};

export default async function(req, res, next) {
  try {
    // signup need admin privalage as it create user sepcific tables.
    if (req.path === '/createAccount') {
      req.user = req.user || {};
      req.user.connection = connections.admin;
      return next();
    }

    if (req.path === '/login') {
      const { name, password } = req.body;
      if (!connections[name]) {
        connections[name] = await mongoose.createConnection(
          `mongodb://${name}:${password}@${host}:${port}/${databaseName}`,
          { useNewUrlParser: true },
        );
      }

      req.user = req.user || {};
      req.user.connection = connections[name];
      return next();
    }

    const name = req.headers.name || req.body.name || req.query.name;
    if (name) {
      if (!connections[name]) next(new Error('user never loggedIn in'));
      req.user = req.user || {};
      req.user.connection = connections[name];
      return next();
    }
    throw new Error('DB connection assign failed');
  } catch (err) {
    console.log(err);
    return next(err);
  }
}

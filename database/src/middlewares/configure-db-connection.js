import { dbConnections, userDBs } from '../common/dbConnections';
import DB from '../mongodb/db';

export default async function(req, res, next) {
  const name =
    req.body.name || // while signup and login
    req.username || // all users routes except signup
    req.headers.loggedinusername;

  req.user = {};

  try {
    // signup need admin privalage as it create user sepcific tables.
    if (req.path === '/users' && req.method === 'POST') {
      userDBs[name] = new DB(dbConnections.admin, name);
      req.user.db = userDBs[name];
      return next();
    }

    if (req.path === '/db-connection' && req.method === 'POST') {
      if (!userDBs[name]) userDBs[name] = new DB(dbConnections.admin, name);
      return next();
    }

    if (name) {
      if (!dbConnections[name]) next(new Error('user never loggedIn in'));
      req.user.db = userDBs[name];
      return next();
    }
    throw new Error('DB connection assign failed');
  } catch (err) {
    console.log(err);
    return next(err);
  }
}

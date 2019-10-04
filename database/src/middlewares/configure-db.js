import DB from '../mongodb/db';

const userDb = [];

export default function(req, res, next) {
  if (!req.user.connection) return next();

  try {
    const username = req.headers.loggedinusername || req.body.name || req.username;
    if (!userDb[username]) {
      userDb[username] = new DB(req.user.connection, username);
    }
    req.user.db = userDb[username];
    return next();
  } catch (err) {
    return next(err);
  }
}

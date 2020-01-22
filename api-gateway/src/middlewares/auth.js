import jwt from 'jsonwebtoken';
import { encryptPassword, decryptPassword } from './password';

const noAuthRoutes = ['/login', 'createAccount'];
const JWT_SECRET = 'secret';

export function createToken(data, password) {
  const jwtData = { ...data, password: encryptPassword(password) };
  // delete all secret info user info before creating jwt token.
  delete jwtData.secretKey;
  delete jwtData.shhIdentity;

  return jwt.sign(jwtData, JWT_SECRET);
}

export function authentication(req, res, next) {
  for (let i = 0; i < noAuthRoutes.length; i += 1) {
    if (req.path.indexOf(noAuthRoutes[i]) !== -1) {
      return next();
    }
  }
  const token = req.headers.authorization;
  if (token) {
    try {
      return jwt.verify(token, JWT_SECRET, function callback(err, decoded) {
        if (err) {
          return next(err);
        }
        req.user = {};
        req.user.address = decoded.address; // this mostly siging transaction and unlocking account at top most middleware
        req.user.name = decoded.name; // this is to get public keys from blockchain
        req.user.publicKey = decoded.publicKey; // for zkp purpose.
        req.user.password = decryptPassword(decoded.password); // decrypting password for unlocking account
        req.headers.name = decoded.name; // used when call database microservice directly (proxy call).
        req.headers.address = decoded.address;
        return next();
      });
    } catch (error) {
      return next(error);
    }
  }
  const error = new Error('No Token Provided');
  error.status = 499;
  return next(error);
}

function parseParams(req, res, next) {
  req.username = req.params.name;
  next();
}

export default function configureRoutesToPraseParams(app) {
  app.all('/users/:name', parseParams);
  app.all('/users/:name/private-accounts', parseParams);
  app.all('/users/:name/ft-shield-contracts', parseParams);
  app.all('/users/:name/nft-shield-contracts', parseParams);
  app.all('/users/:name/ft-shield-contracts/:address', parseParams);
  app.all('/users/:name/nft-shield-contracts/:address', parseParams);
}

export { default as initializeNftRoutes } from './nft.routes';
export { default as initializeNftCommitmentRoutes } from './nft-commitment.routes';
export { default as initializeFtRoutes } from './ft.routes';
export { default as initializeFtCommitmentRoutes } from './ft-commitment.routes';
export { default as initializeUserRoutes } from './user.routes';

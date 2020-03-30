import rabbitmq from '../rabbitmq';

export function formatResponse(req, res, next) {
  const { data } = res;
  if (!data) {
    res.sendStatus(404);
  }
  try {
    res.status(200).send({
      error: null,
      data,
    });
  } catch (err) {
    rabbitmq.sendMessage(req.user.name, {
      type: req.path,
      ...data,
    });
  }
  return next();
}

export function formatError(err, req, res, next) {
  next({
    code: err.code,
    message: err.message,
    [process.env.NODE_ENV !== 'production' ? 'errorStack' : undefined]:
      process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
}

export function errorHandler(err, req, res, next) {
  try {
    res.status(500).send({
      error: err,
      data: null,
    });
  } catch (_err) {
    rabbitmq.sendMessage(req.user.name, {
      type: req.path,
      error: err,
    });
  }
  next(err);
}

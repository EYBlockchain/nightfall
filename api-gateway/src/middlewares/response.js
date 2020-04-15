import rabbitmq from '../rabbitmq';

export function formatResponse(req, res, next) {
  const { data } = res;
  if (!data) {
    res.sendStatus(404);
  }
  try {
    // code will throw error if response is already send
    // only such cases are APIs for which response has to be publish to RabbitMQ
    res.status(200).send({
      error: null,
      data,
    });
  } catch (err) {
    // handle case: send result data to user specific queue of RabbitMQ
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
    // code will throw error if error response is already send
    // only such cases are AP's for which error response has to be publish to RabbitMQ
    res.status(500).send({
      error: err,
      data: null,
    });
  } catch (_err) {
    // handle case: send error to user specific queue of RabbitMQ
    rabbitmq.sendMessage(req.user.name, {
      type: req.path,
      error: err,
    });
  }
  next(err);
}

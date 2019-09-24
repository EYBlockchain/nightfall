export function formatResponse(req, res) {
  const { data } = res;
  if (!data) {
    return res.sendStatus(404);
  }
  return res.status(200).send({
    error: null,
    data,
  });
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
  res.status(err.status || 500).send({
    error: err,
    data: null,
  });
  next(err);
}

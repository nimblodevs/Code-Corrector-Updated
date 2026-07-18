export function notFound(req, res) {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
  });
}

export function errorHandler(err, req, res, _next) {
  req.log?.error({ err }, "Unhandled request error");

  const statusCode = Number(err.statusCode || err.status || 500);

  res.status(statusCode).json({
    error: statusCode >= 500 ? "Internal server error" : err.message,
  });
}

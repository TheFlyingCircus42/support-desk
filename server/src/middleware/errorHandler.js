import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../constants/index.js";

export function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
  }

  console.error(err);
  res.status(500).json({
    error: { code: ERROR_CODES.INTERNAL, message: "something went wrong" },
  });
}

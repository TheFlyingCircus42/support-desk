import { ERROR_CODES } from "../constants/index.js";

export class AppError extends Error {
  constructor(message, status = 500, code = ERROR_CODES.INTERNAL) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }

  static notFound(message) {
    return new AppError(message, 404, ERROR_CODES.NOT_FOUND);
  }

  static validation(message) {
    return new AppError(message, 400, ERROR_CODES.VALIDATION);
  }
}

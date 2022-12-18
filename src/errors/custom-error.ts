import { StatusCodes } from "http-status-codes";

export class CustomError extends Error {
  statusCode = StatusCodes.BAD_REQUEST;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

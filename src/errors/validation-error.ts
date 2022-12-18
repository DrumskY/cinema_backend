import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST;
  }
}

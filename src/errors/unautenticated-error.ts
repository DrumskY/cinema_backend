import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class UnautenticatedError extends CustomError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

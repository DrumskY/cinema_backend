import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}

import { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors";

const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ message: "Something went wrong try again later" });
};

export { errorHandlerMiddleware };

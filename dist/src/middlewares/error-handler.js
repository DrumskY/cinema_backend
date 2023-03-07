"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandlerMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../errors");
const errorHandlerMiddleware = (err, req, res, next) => {
    console.log(err);
    console.log("NAJPOTĘŻNIEJSZY CONSOLE LOG");
    if (err instanceof errors_1.CustomError) {
        console.log("potężny console log");
        return res.status(err.statusCode).json({ message: err.message });
    }
    return res
        .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Something went wrong try again later" });
};
exports.errorHandlerMiddleware = errorHandlerMiddleware;

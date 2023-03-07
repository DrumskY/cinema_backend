"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnautenticatedError = void 0;
const custom_error_1 = require("./custom-error");
const http_status_codes_1 = require("http-status-codes");
class UnautenticatedError extends custom_error_1.CustomError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
    }
}
exports.UnautenticatedError = UnautenticatedError;

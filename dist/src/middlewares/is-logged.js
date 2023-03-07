"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const unautenticated_error_1 = require("../errors/unautenticated-error");
const authMiddleware = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
        throw new unautenticated_error_1.UnautenticatedError("Authentication invalid!");
    }
    const token = authorizationHeader.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, 
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        process.env.SESSION_SECRET);
        // req.user = {
        //   id: payload.user_id,
        //   usernmame: payload.login,
        // };
        // next();
        // req.userId = {
        //   userId: payload.user_id,
        //   username: payload.login,
        // };
        req.username = payload.login;
        next();
    }
    catch (err) {
        throw new unautenticated_error_1.UnautenticatedError("Authentication invalid!!!");
    }
};
exports.default = authMiddleware;

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnautenticatedError } from "../errors/unautenticated-error";
import { JwtTokenPayload } from "../types/jwt-token";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new UnautenticatedError("Authentication invalid!");
  }

  const token = authorizationHeader.slice(7);
  try {
    const payload = jwt.verify(
      token,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      process.env.SESSION_SECRET!
    ) as JwtTokenPayload;
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
  } catch (err) {
    throw new UnautenticatedError("Authentication invalid!!!");
  }
};

export default authMiddleware;

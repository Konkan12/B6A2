import { NextFunction, Request, Response } from "express";

import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import sendJson from "../helper/sendJson";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader.split(" ")[0] !== "Bearer") {
        return sendJson(
          res,
          {
            success: false,
            message: "Unauthorized",
            error: "No token provided",
          },
          401
        );
      }
      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token!, config.jwt_secret!) as JwtPayload;
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return sendJson(
          res,
          {
            success: false,
            message: "Forbidden",
            error: "You are not authorized to perform this action",
          },
          403
        );
      }

      next();
    } catch (error: any) {
      const data = {
        success: false,
        message: "Unauthorized",
        error: error.message,
      };
      sendJson(res, data, 401);
    }
  };
};

export default auth;
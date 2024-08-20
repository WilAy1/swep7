import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { env } from "process";
import APIResponse from '../../interface/api.interface';
import { NextFunction, Request, Response } from 'express';

export function authenticateAdmin(req, res, next) {
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        const response: APIResponse = {
            success: false,
            message: "Unauthorized access",
            data: {}
        }
      return res.status(StatusCodes.UNAUTHORIZED).json(response); // Unauthorized if token is missing
    }
  
    jwt.verify(token, env.SECURE_ADMIN_AUTH_KEY, (err, user) => {
      if (err) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, error: "Access forbidden" }); // Forbidden if token is invalid
      }
      req.user = user;
      next();
    });
}


export function excludeFromAdminAuth(paths: string[]) {
  return function(req: Request, res: Response, next: NextFunction) {
      if (paths.includes(req.path)) {
          next();
      } else {
          authenticateAdmin(req, res, next);
      }
  };
}
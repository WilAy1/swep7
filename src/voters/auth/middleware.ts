import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { env } from "process";
import APIResponse from '../../interface/api.interface';
import { NextFunction, Request, Response } from 'express';

export function authenticate(req, res, next) {
    
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
  
    // Verify the token using the secret key
    jwt.verify(token, env.SECURE_VOTER_AUTH_KEY, (err, voter) => {
      if (err) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, error: "Access forbidden" }); // Forbidden if token is invalid
      }
      req.voter = voter;
      next(); // Proceed to the next middleware
    });
}

export function excludeFromAuth(paths: string[]) {
  return function(req: Request, res: Response, next: NextFunction) {
      // Check if the request path matches any of the excluded paths
      if (paths.includes(req.path)) {
          // If the path is in the exclusion list, skip authentication and call next()
          //console.log(`Skipping authentication for path: ${req.path}`);
          next();
      } else {
          // If the path is not in the exclusion list, proceed with authentication
          authenticate(req, res, next);
      }
  };
}
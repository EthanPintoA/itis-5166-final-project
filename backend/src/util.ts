import jwt from "jsonwebtoken";
import { Request } from "express";

import { secretKey } from "./config";

interface JwtPayload extends jwt.JwtPayload {
  username: string;
}

function generateJwt(username: string): string {
  const payload: JwtPayload = { username };
  return jwt.sign(payload, secretKey, { expiresIn: "1m" });
}

/**
 *  Get the JWT token from the Authorization header.
 */
function getJwtToken(req: Request): string | null {
  return req.headers.authorization?.split(" ")[1] ?? null;
}

/**
 * Get the username from the JWT token payload in the Authorization header.
 *
 * @param req The request object.
 * @returns The username if the token is valid, otherwise null.
 */
function getJwtUsername(req: Request): string | null {
  const token = getJwtToken(req);
  if (!token) {
    return null;
  }
  try {
    const payload = jwt.verify(token, secretKey) as JwtPayload;
    return payload.username;
  } catch {
    return null;
  }
}

export { generateJwt, getJwtUsername };

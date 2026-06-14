import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === "production" && !secret) {
  throw new Error("JWT_SECRET is required in production");
}
export const JWT_SECRET = secret || "default-secret";

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

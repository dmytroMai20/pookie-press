export interface AuthTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

export interface AuthPort {
  signToken(subject: string): Promise<string>;
  verifyToken(token: string): Promise<AuthTokenPayload | null>;
}

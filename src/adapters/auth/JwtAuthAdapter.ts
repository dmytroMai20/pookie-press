import { SignJWT, jwtVerify } from "jose";
import type { AuthPort, AuthTokenPayload } from "@/ports/AuthPort";

export class JwtAuthAdapter implements AuthPort {
  private readonly secret: Uint8Array;
  private readonly expiresIn: string;

  constructor(jwtSecret: string, expiresIn: string = "24h") {
    this.secret = new TextEncoder().encode(jwtSecret);
    this.expiresIn = expiresIn;
  }

  async signToken(subject: string): Promise<string> {
    return new SignJWT({ sub: subject })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);
  }

  async verifyToken(token: string): Promise<AuthTokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: ["HS256"],
      });
      return {
        sub: payload.sub ?? "",
        iat: payload.iat ?? 0,
        exp: payload.exp ?? 0,
      };
    } catch {
      return null;
    }
  }
}

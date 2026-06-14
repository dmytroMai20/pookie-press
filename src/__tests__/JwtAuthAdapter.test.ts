// @vitest-environment node
import { describe, it, expect } from "vitest";
import { JwtAuthAdapter } from "@/adapters/auth/JwtAuthAdapter";

const TEST_SECRET = "a-very-long-secret-key-for-testing-purposes-only-32chars+";

describe("JwtAuthAdapter", () => {
  const adapter = new JwtAuthAdapter(TEST_SECRET);

  describe("signToken", () => {
    it("returns a JWT string", async () => {
      const token = await adapter.signToken("admin");
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });
  });

  describe("verifyToken", () => {
    it("verifies a valid token and returns payload", async () => {
      const token = await adapter.signToken("admin");
      const payload = await adapter.verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload!.sub).toBe("admin");
      expect(payload!.iat).toBeGreaterThan(0);
      expect(payload!.exp).toBeGreaterThan(payload!.iat);
    });

    it("returns null for an invalid token", async () => {
      const payload = await adapter.verifyToken("invalid.token.here");
      expect(payload).toBeNull();
    });

    it("returns null for a token signed with a different secret", async () => {
      const otherAdapter = new JwtAuthAdapter("different-secret-that-is-at-least-32-chars-long!");
      const token = await otherAdapter.signToken("admin");

      const payload = await adapter.verifyToken(token);
      expect(payload).toBeNull();
    });

    it("returns null for an expired token", async () => {
      const shortLivedAdapter = new JwtAuthAdapter(TEST_SECRET, "0s");
      const token = await shortLivedAdapter.signToken("admin");

      await new Promise((r) => setTimeout(r, 1100));

      const payload = await adapter.verifyToken(token);
      expect(payload).toBeNull();
    });
  });
});

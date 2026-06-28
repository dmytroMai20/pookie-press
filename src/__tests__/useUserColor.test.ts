import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";


describe("useUserColor", () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    localStorageMock = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
    });
    vi.stubGlobal("crypto", {
      randomUUID: () => "test-uuid-1234-5678-abcd-ef0123456789",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("generates and persists a user ID on first call", async () => {
    const { getUserColor } = await import("@/hooks/useUserColor");
    getUserColor();
    expect(localStorageMock["pookie-press-user-id"]).toBe(
      "test-uuid-1234-5678-abcd-ef0123456789"
    );
  });

  it("returns a valid hex color from the palette", async () => {
    const { getUserColor } = await import("@/hooks/useUserColor");
    const color = getUserColor();
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("returns the same color for the same stored user ID", async () => {
    localStorageMock["pookie-press-user-id"] = "fixed-user-id";
    const { getUserColor } = await import("@/hooks/useUserColor");
    const color1 = getUserColor();
    const color2 = getUserColor();
    expect(color1).toBe(color2);
  });

  it("returns a color from the defined palette", async () => {
    const { getUserColor } = await import("@/hooks/useUserColor");
    const PALETTE = [
      "#7EB8DA",
      "#F2A7C3",
      "#8ECFA0",
      "#B8A9E8",
      "#F5C28D",
      "#7DD4C0",
      "#E8879B",
      "#A3C4F3",
      "#D4A5E5",
      "#9ED8B5",
    ];
    const color = getUserColor();
    expect(PALETTE).toContain(color);
  });

  it("different user IDs produce deterministic but potentially different colors", async () => {
    const { getUserColor } = await import("@/hooks/useUserColor");

    localStorageMock["pookie-press-user-id"] = "user-a";
    const colorA = getUserColor();

    localStorageMock["pookie-press-user-id"] = "user-b";
    const colorB = getUserColor();

    expect(colorA).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(colorB).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("reuses existing user ID from localStorage", async () => {
    localStorageMock["pookie-press-user-id"] = "existing-user-id";
    const { getUserColor } = await import("@/hooks/useUserColor");
    getUserColor();
    expect(localStorageMock["pookie-press-user-id"]).toBe("existing-user-id");
  });
});

import { describe, it, expect } from "vitest";
import { randomHeartProps } from "@/app/(main)/components/FloatingHearts";

describe("FloatingHearts", () => {
  describe("randomHeartProps", () => {
    it("uses provided color when given", () => {
      const props = randomHeartProps("#7EB8DA");
      expect(props.color).toBe("#7EB8DA");
    });

    it("falls back to default pink when no color provided", () => {
      const props = randomHeartProps();
      expect(props.color).toBe("#F2A7C3");
    });

    it("falls back to default pink when undefined passed", () => {
      const props = randomHeartProps(undefined);
      expect(props.color).toBe("#F2A7C3");
    });

    it("generates valid position values", () => {
      const props = randomHeartProps("#8ECFA0");
      expect(props.x).toBeGreaterThanOrEqual(10);
      expect(props.x).toBeLessThanOrEqual(90);
      expect(props.y).toBeGreaterThanOrEqual(10);
      expect(props.y).toBeLessThanOrEqual(90);
    });

    it("generates valid size values", () => {
      const props = randomHeartProps();
      expect(props.size).toBeGreaterThanOrEqual(28);
      expect(props.size).toBeLessThanOrEqual(60);
    });

    it("generates valid duration values", () => {
      const props = randomHeartProps();
      expect(props.duration).toBeGreaterThanOrEqual(1.2);
      expect(props.duration).toBeLessThanOrEqual(2.0);
    });
  });
});

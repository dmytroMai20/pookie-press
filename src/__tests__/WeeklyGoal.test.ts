import { describe, it, expect } from "vitest";
import { WeeklyGoal, calculateProgress } from "@/domain/models/WeeklyGoal";

describe("calculateProgress", () => {
  it("returns 0 for zero count", () => {
    expect(calculateProgress(0, 50)).toBe(0);
  });

  it("returns correct percentage", () => {
    expect(calculateProgress(25, 50)).toBe(50);
  });

  it("caps at 100%", () => {
    expect(calculateProgress(100, 50)).toBe(100);
  });

  it("returns 0 when goal is 0", () => {
    expect(calculateProgress(10, 0)).toBe(0);
  });

  it("rounds to nearest integer", () => {
    expect(calculateProgress(1, 3)).toBe(33);
  });
});

describe("WeeklyGoal", () => {
  it("creates with default target of 50", () => {
    const goal = new WeeklyGoal();
    expect(goal.target).toBe(50);
  });

  it("creates with custom target", () => {
    const goal = new WeeklyGoal(100);
    expect(goal.target).toBe(100);
  });

  it("calculates progress correctly", () => {
    const goal = new WeeklyGoal(50);
    expect(goal.calculateProgress(25)).toBe(50);
  });

  it("determines completion", () => {
    const goal = new WeeklyGoal(50);
    expect(goal.isComplete(49)).toBe(false);
    expect(goal.isComplete(50)).toBe(true);
    expect(goal.isComplete(51)).toBe(true);
  });
});

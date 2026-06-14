export class WeeklyGoal {
  constructor(public readonly target: number = 50) {}

  calculateProgress(count: number): number {
    return Math.min(Math.round((count / this.target) * 100), 100);
  }

  isComplete(count: number): boolean {
    return count >= this.target;
  }
}

export function calculateProgress(count: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(Math.round((count / goal) * 100), 100);
}

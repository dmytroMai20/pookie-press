import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { TapRepository } from "@/ports/TapRepository";
import type { LoveTap } from "@/domain/models/LoveTap";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export class PrismaTapRepository implements TapRepository {
  async recordTap(tap: Omit<LoveTap, "id">): Promise<LoveTap> {
    const result = await prisma.loveTap.create({
      data: {
        timestamp: tap.timestamp,
        userId: tap.userId,
        count: tap.count,
      },
    });
    return {
      id: result.id,
      timestamp: result.timestamp,
      userId: result.userId ?? undefined,
      count: result.count,
    };
  }

  async getWeeklyCount(since: Date): Promise<number> {
    const result = await prisma.loveTap.aggregate({
      _sum: { count: true },
      where: {
        timestamp: { gte: since },
      },
    });
    return result._sum.count ?? 0;
  }

  async getTapsInRange(start: Date, end: Date): Promise<LoveTap[]> {
    const results = await prisma.loveTap.findMany({
      where: {
        timestamp: { gte: start, lte: end },
      },
      orderBy: { timestamp: "desc" },
    });
    return results.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      userId: r.userId ?? undefined,
      count: r.count,
    }));
  }
}

import { TapService } from "@/domain/services/TapService";
import { AnalyticsService } from "@/domain/services/AnalyticsService";
import { PrismaTapRepository } from "@/adapters/prisma/PrismaTapRepository";
import { PusherServerAdapter } from "@/adapters/pusher/PusherServerAdapter";
import { RedisAdapter } from "@/adapters/redis/RedisAdapter";
import { JwtAuthAdapter } from "@/adapters/auth/JwtAuthAdapter";
import { getConfig } from "@/lib/config";
import type { AuthPort } from "@/ports/AuthPort";

let _tapService: TapService | null = null;
let _analyticsService: AnalyticsService | null = null;
let _authAdapter: AuthPort | null = null;

export function getTapService(): TapService {
  if (!_tapService) {
    const tapRepository = new PrismaTapRepository();
    const realtimeGateway = new PusherServerAdapter();
    const cache = new RedisAdapter();
    _tapService = new TapService(tapRepository, realtimeGateway, cache);
  }
  return _tapService;
}

export function getAnalyticsService(): AnalyticsService {
  if (!_analyticsService) {
    const tapRepository = new PrismaTapRepository();
    _analyticsService = new AnalyticsService(tapRepository);
  }
  return _analyticsService;
}

export function getAuthAdapter(): AuthPort {
  if (!_authAdapter) {
    const config = getConfig();
    _authAdapter = new JwtAuthAdapter(config.JWT_SECRET);
  }
  return _authAdapter;
}

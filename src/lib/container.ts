import { TapService } from "@/domain/services/TapService";
import { PrismaTapRepository } from "@/adapters/prisma/PrismaTapRepository";
import { PusherServerAdapter } from "@/adapters/pusher/PusherServerAdapter";
import { RedisAdapter } from "@/adapters/redis/RedisAdapter";

let _tapService: TapService | null = null;

export function getTapService(): TapService {
  if (!_tapService) {
    const tapRepository = new PrismaTapRepository();
    const realtimeGateway = new PusherServerAdapter();
    const cache = new RedisAdapter();
    _tapService = new TapService(tapRepository, realtimeGateway, cache);
  }
  return _tapService;
}

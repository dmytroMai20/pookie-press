export interface TapEvent {
  id: string;
  timestamp: string;
  count: number;
}

export interface RealtimeGateway {
  broadcastTap(event: TapEvent): Promise<void>;
}

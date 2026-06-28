export interface TapEvent {
  id: string;
  timestamp: string;
  count: number;
  color?: string;
}

export interface ImageEvent {
  imageId: string;
  url: string;
  displaySeconds: number;
  timestamp: string;
}

export interface RealtimeGateway {
  broadcastTap(event: TapEvent): Promise<void>;
  broadcastImage(event: ImageEvent): Promise<void>;
}

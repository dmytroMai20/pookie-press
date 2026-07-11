export interface TapEvent {
  id: string;
  timestamp: string;
  count: number;
  color?: string;
}

export interface ImageEvent {
  imageId: string;
  url: string;
  timestamp: string;
}

export type InboundMessage =
  | { type: "tap"; payload: TapEvent }
  | { type: "image"; payload: ImageEvent };

export type OutboundMessage =
  | { type: "tap"; payload: TapEvent }
  | { type: "image"; payload: ImageEvent }
  | { type: "tap_batch"; payload: TapEvent[] }
  | { type: "image_batch"; payload: ImageEvent[] };

export type ServerError = { error: "rate_limited" | "invalid_message" };

export type ServerMessage = OutboundMessage | ServerError;

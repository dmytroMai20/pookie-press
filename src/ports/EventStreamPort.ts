export interface StreamEvent {
  topic: string;
  key: string;
  value: unknown;
  timestamp: Date;
}

export interface EventStreamPort {
  publish(event: StreamEvent): Promise<void>;
  subscribe(topic: string, handler: (event: StreamEvent) => Promise<void>): Promise<void>;
}

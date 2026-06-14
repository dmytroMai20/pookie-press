export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
}

export interface AnalyticsPort {
  track(event: AnalyticsEvent): Promise<void>;
}

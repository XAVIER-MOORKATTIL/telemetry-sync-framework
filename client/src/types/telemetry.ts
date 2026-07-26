export type EventType = 'LATENCY' | 'RESOURCE';

export interface BaseTelemetry {
  readonly sourceNode: string;
  readonly sequenceId: number;
  readonly eventType: EventType;
  readonly timestamp?: Date;
}

export interface LatencyPayload extends BaseTelemetry {
  readonly eventType: 'LATENCY';
  readonly data: {
    readonly responseTimeMs: number;
    readonly endpoint: string;
  };
}

export interface ResourcePayload extends BaseTelemetry {
  readonly eventType: 'RESOURCE';
  readonly data: {
    readonly heapUsedMB: number;
    readonly cpuUsagePct: number;
  };
}

export type TelemetryPayload = LatencyPayload | ResourcePayload;
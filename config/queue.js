const Queue = require('bull');

let telemetryQueue;

// Only instantiate Bull if a valid external Redis URI is provided
if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('redis')) {
  telemetryQueue = new Queue('telemetry-processing', process.env.REDIS_URL, {
    redis: {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    },
  });

  telemetryQueue.on('error', (err) => {
    // Suppress connection logs
  });

  telemetryQueue.process(async (job) => {
    const { sourceNode, eventType, data } = job.data;
    console.log(`[WORKER PROCESSING] Job ID: ${job.id} for Node: ${sourceNode}`);

    if (eventType === 'LATENCY' && data.responseTimeMs > 100) {
      console.warn(`[ALERT TRIGGERED] Critical Latency detected on ${sourceNode}: ${data.responseTimeMs}ms`);
    }

    return { status: 'SUCCESS' };
  });
} else {
  // Safe In-Memory Mock Queue for Local Dev without Redis
  telemetryQueue = {
    add: async (data) => {
      // Process job immediately in memory asynchronously
      setImmediate(() => {
        if (data.eventType === 'LATENCY' && data.data?.responseTimeMs > 100) {
          console.warn(`[ASYNC WORKER] Critical Latency on ${data.sourceNode}: ${data.data.responseTimeMs}ms`);
        }
      });
      return { id: Date.now() };
    },
  };
}

module.exports = telemetryQueue;
const mongoose = require('mongoose');

// Base Schema - Common properties across all telemetry streams
const options = { discriminatorKey: 'eventType', timestamps: true };

const baseTelemetrySchema = new mongoose.Schema(
  {
    sourceNode: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    sequenceId: {
      type: Number,
      required: true,
      unique: true // Prevents duplicate delivery state drifts
    },
    status: {
      type: String,
      enum: ['OK', 'WARNING', 'CRITICAL'],
      default: 'OK'
    }
  },
  options
);

const Telemetry = mongoose.model('Telemetry', baseTelemetrySchema);

// Discriminator 1: System Latency Events
const LatencyTelemetry = Telemetry.discriminator(
  'LATENCY',
  new mongoose.Schema({
    responseTimeMs: { type: Number, required: true },
    endpoint: { type: String, required: true }
  })
);

// Discriminator 2: Memory & Resource Leak Events
const ResourceTelemetry = Telemetry.discriminator(
  'RESOURCE',
  new mongoose.Schema({
    heapUsedMB: { type: Number, required: true },
    cpuUsagePct: { type: Number, required: true }
  })
);

module.exports = { Telemetry, LatencyTelemetry, ResourceTelemetry };
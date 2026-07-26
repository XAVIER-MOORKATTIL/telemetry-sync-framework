const { Telemetry, LatencyTelemetry, ResourceTelemetry } = require('../models/Telemetry');

exports.ingestTelemetry = async (req, res) => {
  try {
    const { eventType, sourceNode, sequenceId, data } = req.body;

    let payload;
    if (eventType === 'LATENCY') {
      payload = new LatencyTelemetry({
        sourceNode,
        sequenceId,
        responseTimeMs: data.responseTimeMs,
        endpoint: data.endpoint,
      });
    } else {
      payload = new ResourceTelemetry({
        sourceNode,
        sequenceId,
        heapUsedMB: data.heapUsedMB,
        cpuUsagePct: data.cpuUsagePct,
      });
    }

    const savedRecord = await payload.save();

    // Broadcast live event over WebSocket
    const io = req.app.get('socketio');
    if (io) {
      io.emit('telemetry_stream', savedRecord);
    }

    return res.status(201).json({
      success: true,
      data: savedRecord,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'DUPLICATE_SEQUENCE_ID_DETECTED' });
    }
    return res.status(500).json({ error: error.message });
  }
};
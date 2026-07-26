const { Telemetry } = require('../models/Telemetry');

const ingestTelemetry = async (req, res) => {
  try {
    const { sourceNode, sequenceId, responseTimeMs } = req.body;

    if (!sourceNode || sequenceId === undefined || responseTimeMs === undefined) {
      return res.status(400).json({ error: 'Missing required telemetry parameters.' });
    }

    const payload = {
      sourceNode,
      sequenceId,
      responseTimeMs,
      createdAt: new Date()
    };

    // 1. Instantly broadcast to all connected WebSocket clients (Vercel Dashboard)
    const io = req.app.get('socketio');
    if (io) {
      io.emit('telemetry_stream', payload);
    }

    // 2. Persist to MongoDB Atlas asynchronously
    try {
      await Telemetry.create(payload);
    } catch (dbErr) {
      console.error('[DB PERSIST WARN]', dbErr.message);
    }

    return res.status(201).json({
      status: 'ACCEPTED',
      message: 'Telemetry ingested successfully',
      data: payload
    });
  } catch (error) {
    console.error('[INGEST ERROR]', error);
    return res.status(500).json({
      error: 'Internal Server Error during telemetry ingestion',
      details: error.message
    });
  }
};

module.exports = {
  ingestTelemetry,
  ingestTelemetryStrict: ingestTelemetry
};
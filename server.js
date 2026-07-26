const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Import Controller & Middleware Handlers
const telemetryController = require('./controllers/telemetryController');
const { authenticateHTTP } = require('./middleware/auth');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Cross-Origin Resource Sharing (CORS) Configuration
const corsOptions = {
  origin: '*', // Allows Vercel frontend, Render backend, and local dev
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.io with Cross-Origin Fallbacks
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Pass socket instance into Express pipeline for controller emission
app.set('socketio', io);

// Database Connection
connectDB();

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ONLINE', timestamp: new Date().toISOString() });
});

// Telemetry Ingestion Endpoint
const ingestHandler = telemetryController.ingestTelemetry || telemetryController.ingestTelemetryStrict;
app.post('/api/v1/telemetry', authenticateHTTP, ingestHandler);

// Serve Static Frontend Assets (When running in Monolithic Mode on Render)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Express v5 syntax for SPA catch-all fallback
  app.get('/*splat', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Socket.io Middleware Guard: Validate Handshake Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const expectedSecret = process.env.JWT_SECRET || 'strict_equality_super_secret_key_2026';

  if (token && token.includes(expectedSecret)) {
    return next();
  }
  
  console.warn(`[WEBSOCKET AUTH FAILED] Unauthorized connection attempt: ${socket.id}`);
  return next(new Error('Authentication error: Invalid or missing token'));
});

// WebSocket Event Lifecycle
io.on('connection', (socket) => {
  console.log(`[WEBSOCKET ACTIVE] Connected client ID: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[WEBSOCKET CLOSED] Disconnected client ID: ${socket.id} (${reason})`);
  });
});

// Server Initialization
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVER RUNNING] Gateway operational on port ${PORT}`);
});
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

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Pass socket reference to Express pipeline
app.set('socketio', io);

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// API Routing
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ONLINE', timestamp: new Date().toISOString() });
});

// Route Binding with Fallback Function Guard
const ingestHandler = telemetryController.ingestTelemetry || telemetryController.ingestTelemetryStrict;
app.post('/api/v1/telemetry', authenticateHTTP, ingestHandler);

// Serve Static Frontend Assets (Production Mode)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('/*splat', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Socket Lifecycle
io.on('connection', (socket) => {
  console.log(`[WEBSOCKET ACTIVE] Connected client ID: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[WEBSOCKET CLOSED] Disconnected client ID: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[SERVER RUNNING] Gateway operational on http://localhost:${PORT}`);
});


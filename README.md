# ⚡ Distributed Telemetry & Real-Time Sync Framework

A production-grade, full-stack distributed system built with Node.js, Express, Socket.io, React, Redux Toolkit, and MongoDB Atlas. It ingests high-frequency telemetry data via authenticated REST endpoints and streams dynamic metrics in real time over WebSockets to an interactive Recharts dashboard.

---

## 📐 Architecture Overview

```text
[ React + Redux Web UI (Recharts) ]
               │
      (HTTP / WebSockets)
               │
               ▼
[ Node.js / Express Gateway (MVC Architecture) ]
          ┌────┴────────────────────────┐
          ▼                             ▼
[ MongoDB Atlas (Polymorphic DB) ]  [ Socket.io Real-Time Stream ]
Core Stack & Features
Backend Gateway: Node.js & Express with JWT Bearer authentication guardrails.

Database & Polymorphism: MongoDB Atlas managed via Mongoose ORM utilizing polymorphic discriminator schemas.

Real-Time Engine: Socket.io dual HTTP/WebSocket integration with automatic client connection state handling.

Frontend Dashboard: React SPA, Redux Toolkit state management, and live Recharts dynamic visualization.

🚀 Quick Start (Local Development)
Prerequisites
Node.js (v18+)

MongoDB Atlas connection URI

1. Repository Setup
Bash
git clone [https://github.com/YOUR_USERNAME/telemetry-sync-framework.git](https://github.com/YOUR_USERNAME/telemetry-sync-framework.git)
cd telemetry-sync-framework
2. Environment Configuration
Create a .env file in the root folder:

Code snippet
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/telemetry?retryWrites=true&w=majority
JWT_SECRET=strict_equality_super_secret_key_2026
NODE_ENV=development
3. Install Dependencies
Bash
# Install backend dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
4. Build & Launch
Bash
# Build production client bundle
cd client
npm run build
cd ..

# Start backend server & serve static build
node server.js
Access the dashboard in your browser at http://localhost:5000.

🔌 API Endpoints & Auth
Telemetry Ingestion Endpoint
URL: /api/v1/telemetry

Method: POST

Headers:

Content-Type: application/json

Authorization: Bearer <YOUR_JWT_SECRET>

Example JSON Payload (LATENCY)
JSON
{
  "eventType": "LATENCY",
  "sourceNode": "mumbai-node-prod",
  "sequenceId": 100008,
  "data": {
    "responseTimeMs": 72.4,
    "endpoint": "/api/v1/telemetry"
  }
}
Example Response (201 Created)
JSON
{
  "success": true,
  "data": {
    "_id": "6a65be3a7f324ec84891e9b1",
    "eventType": "LATENCY",
    "sourceNode": "mumbai-node-prod",
    "sequenceId": 100008,
    "responseTimeMs": 72.4,
    "endpoint": "/api/v1/telemetry",
    "createdAt": "2026-07-26T08:00:00.000Z"
  }
}
☁️ Deployment Guide
Option 1: Full-Stack Deployment on Render
Push your repository to GitHub.

Log into Render and create a new Web Service.

Connect your GitHub repository.

Configure service settings:

Build Command: npm install && cd client && npm install && npm run build && cd ..

Start Command: node server.js

Add Environment Variables under Environment:

PORT: 10000 (or leave default)

MONGO_URI: <your_mongodb_atlas_connection_string>

JWT_SECRET: <your_secret_key>

Click Deploy Web Service.

Option 2: Split Deployment (Backend on Render + Frontend on Vercel)
Backend (Render)
Deploy as a Web Service on Render with Start Command: node server.js.

Ensure MONGO_URI and JWT_SECRET are configured in Environment Variables.

Frontend (Vercel)
Import the client directory in Vercel.

Set Framework Preset to Create React App.

Set Root Directory to client.

Deploy to generate your public dashboard URL.

📜 License
Distributed under the MIT License.
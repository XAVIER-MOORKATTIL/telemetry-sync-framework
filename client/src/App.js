import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { setConnectionStatus, telemetryReceived } from './store/telemetrySlice';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const socket = io('http://localhost:5000', {
  autoConnect: false,
  auth: {
    token: 'Bearer strict_equality_super_secret_key_2026'
  }
});

function App() {
  const dispatch = useDispatch();
  const metrics = useSelector((state) => state.telemetry?.metrics || []);
  const connectionStatus = useSelector((state) => state.telemetry?.connectionStatus || 'DISCONNECTED');

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => dispatch(setConnectionStatus('CONNECTED')));
    socket.on('disconnect', () => dispatch(setConnectionStatus('DISCONNECTED')));
    socket.on('telemetry_stream', (data) => dispatch(telemetryReceived(data)));

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  const chartData = [...metrics].reverse().map((m) => ({
    time: new Date(m.createdAt || Date.now()).toLocaleTimeString(),
    latency: m.responseTimeMs || 0,
    sequenceId: `#${m.sequenceId}`,
  }));

  return (
    <div style={{ padding: '2rem', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'monospace' }}>
      <h2>⚡ Telemetry Real-Time Dashboard</h2>
      <p>
        System Status:{' '}
        <span style={{ color: connectionStatus === 'CONNECTED' ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
          {connectionStatus}
        </span>
      </p>

      {/* Live Latency Trend Chart */}
      <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Live Latency Trend (ms)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
            <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Live Stream Table */}
      <h3>Live Event Stream ({metrics.length} Captured)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {metrics.map((item) => (
          <div
            key={item._id || item.sequenceId}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              backgroundColor: '#1e293b',
              borderLeft: '4px solid #3b82f6',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span><strong>Node:</strong> {item.sourceNode} | <strong>Seq:</strong> #{item.sequenceId}</span>
            <span><strong>Latency:</strong> {item.responseTimeMs} ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
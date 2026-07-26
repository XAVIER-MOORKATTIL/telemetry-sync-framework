module.exports = {
  apps: [
    {
      name: 'telemetry-sync-gateway',
      script: 'server.js',
      instances: 'max', // Scale dynamically to all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
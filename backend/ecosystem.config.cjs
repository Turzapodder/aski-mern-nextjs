// ecosystem.config.cjs - PM2 Configuration for Production (CommonJS)
module.exports = {
  apps: [{
    name: 'nayon-server',
    script: 'app.js',
    instances: 1, // Use 1 for single instance or 'max' for cluster mode
    exec_mode: 'fork', // Use 'cluster' for cluster mode
    watch: false, // Set to true in development
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 5000,
      watch: true,
      ignore_watch: ['node_modules', 'uploads', 'logs']
    },
    error_file: './logs/error.log',
    out_file: './logs/app.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    // Advanced PM2 features
    instance_var: 'INSTANCE_ID',
    combine_logs: true,
    merge_logs: true,
    // Monitoring
    pmx: true,
    // Auto restart on file changes in development
    watch_options: {
      followSymlinks: false,
      usePolling: false,
      alwaysStat: false,
      depth: 2,
      ignoreInitial: true
    }
  }]
};
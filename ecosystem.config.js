module.exports = {
  apps: [
    {
      name: 'tracket-dev',
      script: 'server/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader tsx',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      watch: [
        'server/**/*',
        'client/**/*',
        'shared/**/*'
      ],
      ignore_watch: [
        'node_modules',
        'dist',
        '.git'
      ],
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}; 
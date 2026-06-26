module.exports = {
  apps: [
    {
      name: "eie-backend",
      script: "dist/main.js",
      instances: "max",       // Clones the app across all available CPU cores
      exec_mode: "cluster",   // Enables Node.js cluster mode (micro-horizontal scaling)
      watch: false,
      env: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      }
    }
  ]
};

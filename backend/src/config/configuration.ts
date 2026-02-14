// TODO: Add configuration validation schemas
// TODO: Add environment-specific configurations

export default () => ({
  port: parseInt(process.env.PORT ?? '5000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  // TODO: Add Redis configuration for future cache layer
  // redis: {
  //   host: process.env.REDIS_HOST,
  //   port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  // },
});

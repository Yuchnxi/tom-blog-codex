'use strict';

module.exports = () => {
  const config = {};

  config.keys = process.env.EGG_KEYS || process.env.APP_KEYS || 'tom_blog_prod_secret';

  config.cluster = {
    listen: {
      port: Number(process.env.PORT || 7001),
      hostname: process.env.HOST || '127.0.0.1',
    },
  };

  config.jwt = {
    secret: process.env.JWT_SECRET || 'tom_blog_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };

  config.admin = {
    initialUsername: process.env.ADMIN_INITIAL_USERNAME || '',
    initialPassword: process.env.ADMIN_INITIAL_PASSWORD || '',
  };

  config.sequelize = {
    dialect: 'mysql',
    database: process.env.DB_NAME || 'tom_blog_codex',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    timezone: '+08:00',
    define: {
      underscored: true,
      freezeTableName: true,
    },
  };

  config.cos = {
    secretId: process.env.COS_SECRET_ID || '',
    secretKey: process.env.COS_SECRET_KEY || '',
    bucket: process.env.COS_BUCKET || '',
    region: process.env.COS_REGION || '',
    domain: process.env.COS_DOMAIN || '',
  };

  return config;
};

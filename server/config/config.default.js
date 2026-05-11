'use strict';

module.exports = appInfo => {
  const config = {};

  config.keys = `${appInfo.name}_tom_blog_secret`;

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  };

  config.middleware = [ 'errorHandler' ];

  config.jwt = {
    secret: 'tom_blog_jwt_secret',
    expiresIn: '7d',
  };

  config.admin = {
    initialUsername: '',
    initialPassword: '',
  };

  config.sequelize = {
    dialect: 'mysql',
    database: 'tom_blog_codex',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '',
    timezone: '+08:00',
    define: {
      underscored: true,
      freezeTableName: true,
    },
  };

  config.multipart = {
    mode: 'stream',
    fileSize: '5mb',
    fileExtensions: [ '.jpg', '.jpeg', '.png', '.gif', '.webp' ],
  };

  config.cos = {
    secretId: '',
    secretKey: '',
    bucket: '',
    region: '',
    domain: '',
  };

  return config;
};

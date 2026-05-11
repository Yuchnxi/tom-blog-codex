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

  config.jwt = {
    secret: 'tom_blog_jwt_secret',
  };

  config.sequelize = {
    dialect: 'mysql',
    database: 'tom_blog',
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

  config.cos = {
    secretId: '',
    secretKey: '',
    bucket: '',
    region: '',
  };

  return config;
};

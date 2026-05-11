'use strict';

exports.cors = {
  enable: true,
  package: 'egg-cors',
};

exports.jwt = {
  enable: true,
  package: 'egg-jwt',
};

exports.sequelize = {
  enable: process.env.ENABLE_SEQUELIZE === 'true',
  package: 'egg-sequelize',
};

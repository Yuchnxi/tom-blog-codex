'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Admin = app.model.define(
    'Admin',
    {
      id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '管理员ID',
      },
      username: {
        type: STRING(50),
        allowNull: false,
        unique: true,
        comment: '管理员用户名',
      },
      password: {
        type: STRING(255),
        allowNull: false,
        comment: 'bcrypt 加密后的登录密码',
      },
    },
    {
      tableName: 'admins',
      comment: '管理员表',
      timestamps: true,
      underscored: true,
    }
  );

  return Admin;
};

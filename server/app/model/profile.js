'use strict';

module.exports = app => {
  const { STRING, TEXT, INTEGER } = app.Sequelize;

  const Profile = app.model.define(
    'Profile',
    {
      id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '个人信息ID',
      },
      avatar: {
        type: STRING(500),
        allowNull: true,
        comment: '头像URL',
      },
      nickname: {
        type: STRING(50),
        allowNull: false,
        defaultValue: '',
        comment: '昵称',
      },
      bio: {
        type: STRING(200),
        allowNull: true,
        comment: '一句话简介',
      },
      description: {
        type: TEXT,
        allowNull: true,
        comment: '详细介绍',
      },
      email: {
        type: STRING(100),
        allowNull: true,
        comment: '邮箱',
      },
      github: {
        type: STRING(500),
        allowNull: true,
        comment: 'GitHub链接',
      },
    },
    {
      tableName: 'profiles',
      comment: '个人信息表',
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    }
  );

  return Profile;
};

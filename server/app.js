'use strict';

const bcrypt = require('bcryptjs');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async didReady() {
    const { app } = this;

    if (!app.model) {
      return;
    }

    await app.model.sync({ force: false });
    await this.syncModelComments();

    const { initialUsername, initialPassword } = app.config.admin || {};
    if (!initialUsername || !initialPassword) {
      return;
    }

    const existedAdmin = await app.model.Admin.findOne({
      where: { username: initialUsername },
    });

    if (existedAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash(initialPassword, 10);
    await app.model.Admin.create({
      username: initialUsername,
      password: hashedPassword,
    });
  }

  async syncModelComments() {
    const { app } = this;

    await app.model.query("ALTER TABLE `admins` COMMENT = '管理员表'");
    await app.model.query("ALTER TABLE `admins` MODIFY COLUMN `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID'");
    await app.model.query("ALTER TABLE `admins` MODIFY COLUMN `username` VARCHAR(50) NOT NULL COMMENT '管理员用户名'");
    await app.model.query("ALTER TABLE `admins` MODIFY COLUMN `password` VARCHAR(255) NOT NULL COMMENT 'bcrypt 加密后的登录密码'");
    await app.model.query("ALTER TABLE `admins` MODIFY COLUMN `created_at` DATETIME NOT NULL COMMENT '创建时间'");
    await app.model.query("ALTER TABLE `admins` MODIFY COLUMN `updated_at` DATETIME NOT NULL COMMENT '更新时间'");
  }
}

module.exports = AppBootHook;

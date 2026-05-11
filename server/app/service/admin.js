'use strict';

const bcrypt = require('bcryptjs');
const Service = require('egg').Service;

class AdminService extends Service {
  async findById(id) {
    return this.ctx.model.Admin.findByPk(id, {
      attributes: [ 'id', 'username', 'createdAt' ],
    });
  }

  async verifyLogin(username, password) {
    const admin = await this.ctx.model.Admin.findOne({
      where: { username },
    });

    if (!admin) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    return isPasswordValid ? admin : null;
  }

  async changePassword(adminId, oldPassword, newPassword) {
    const admin = await this.ctx.model.Admin.findByPk(adminId);

    if (!admin) {
      return { success: false, message: '管理员不存在' };
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isOldPasswordValid) {
      return { success: false, message: '旧密码错误' };
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return { success: true };
  }
}

module.exports = AdminService;

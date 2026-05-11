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
}

module.exports = AdminService;

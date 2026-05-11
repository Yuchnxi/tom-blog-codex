'use strict';

const Controller = require('egg').Controller;

class AdminController extends Controller {
  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body || {};

    if (!username || !password) {
      ctx.fail('用户名和密码不能为空');
      return;
    }

    const admin = await ctx.service.admin.verifyLogin(username, password);
    if (!admin) {
      ctx.fail('用户名或密码错误', 401);
      return;
    }

    const token = app.jwt.sign(
      {
        id: admin.id,
        username: admin.username,
      },
      app.config.jwt.secret,
      {
        expiresIn: app.config.jwt.expiresIn,
      }
    );

    ctx.success({ token });
  }

  async info() {
    const { ctx } = this;
    const admin = await ctx.service.admin.findById(ctx.state.admin.id);

    if (!admin) {
      ctx.fail('管理员不存在', 404);
      return;
    }

    ctx.success({
      id: admin.id,
      username: admin.username,
      created_at: admin.createdAt,
    });
  }

  async changePassword() {
    const { ctx } = this;
    const { oldPassword, newPassword } = ctx.request.body || {};

    if (!oldPassword || !newPassword) {
      ctx.fail('旧密码和新密码不能为空');
      return;
    }

    if (newPassword.length < 6) {
      ctx.fail('新密码不少于6位');
      return;
    }

    const result = await ctx.service.admin.changePassword(ctx.state.admin.id, oldPassword, newPassword);
    if (!result.success) {
      ctx.fail(result.message);
      return;
    }

    ctx.success(null);
  }
}

module.exports = AdminController;

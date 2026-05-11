'use strict';

const Controller = require('egg').Controller;

class AdminController extends Controller {
  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body || {};

    if (!username || !password) {
      ctx.status = 400;
      ctx.body = {
        code: 1,
        message: '用户名和密码不能为空',
        data: null,
      };
      return;
    }

    const admin = await ctx.service.admin.verifyLogin(username, password);
    if (!admin) {
      ctx.status = 401;
      ctx.body = {
        code: 1,
        message: '用户名或密码错误',
        data: null,
      };
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

    ctx.body = {
      code: 0,
      message: 'success',
      data: {
        token,
      },
    };
  }

  async info() {
    const { ctx } = this;
    const admin = await ctx.service.admin.findById(ctx.state.admin.id);

    if (!admin) {
      ctx.status = 404;
      ctx.body = {
        code: 1,
        message: '管理员不存在',
        data: null,
      };
      return;
    }

    ctx.body = {
      code: 0,
      message: 'success',
      data: {
        id: admin.id,
        username: admin.username,
        created_at: admin.createdAt,
      },
    };
  }
}

module.exports = AdminController;

'use strict';

const Controller = require('egg').Controller;

class ProfileController extends Controller {
  async detail() {
    const profile = await this.ctx.service.profile.get();
    this.ctx.success(profile);
  }

  async update() {
    const { ctx } = this;
    const payload = ctx.request.body || {};

    if (!payload.nickname || !payload.nickname.trim()) {
      ctx.fail('昵称不能为空');
      return;
    }

    const profile = await ctx.service.profile.save({
      avatar: payload.avatar,
      nickname: payload.nickname.trim(),
      bio: payload.bio,
      description: payload.description,
      email: payload.email,
      github: payload.github,
    });
    ctx.success(profile);
  }
}

module.exports = ProfileController;

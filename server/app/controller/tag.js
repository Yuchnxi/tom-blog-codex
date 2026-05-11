'use strict';

const Controller = require('egg').Controller;

class TagController extends Controller {
  async list() {
    const list = await this.ctx.service.tag.list();
    this.ctx.success(list);
  }

  async create() {
    const { ctx } = this;
    const { name } = ctx.request.body || {};

    if (!name) {
      ctx.fail('标签名称不能为空');
      return;
    }

    const tag = await ctx.service.tag.create(name);
    ctx.success(tag);
  }

  async update() {
    const { ctx } = this;
    const { name } = ctx.request.body || {};

    if (!name) {
      ctx.fail('标签名称不能为空');
      return;
    }

    const tag = await ctx.service.tag.update(ctx.params.id, name);
    if (!tag) {
      ctx.fail('标签不存在', 404);
      return;
    }

    ctx.success(tag);
  }

  async remove() {
    const { ctx } = this;
    const success = await ctx.service.tag.remove(ctx.params.id);

    if (!success) {
      ctx.fail('标签不存在', 404);
      return;
    }

    ctx.success(null);
  }
}

module.exports = TagController;

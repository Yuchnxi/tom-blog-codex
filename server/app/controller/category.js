'use strict';

const Controller = require('egg').Controller;

class CategoryController extends Controller {
  async list() {
    const list = await this.ctx.service.category.list();
    this.ctx.success(list);
  }

  async create() {
    const { ctx } = this;
    const { name } = ctx.request.body || {};

    if (!name) {
      ctx.fail('分类名称不能为空');
      return;
    }

    const category = await ctx.service.category.create(name);
    ctx.success(category);
  }

  async update() {
    const { ctx } = this;
    const { name } = ctx.request.body || {};

    if (!name) {
      ctx.fail('分类名称不能为空');
      return;
    }

    const category = await ctx.service.category.update(ctx.params.id, name);
    if (!category) {
      ctx.fail('分类不存在', 404);
      return;
    }

    ctx.success(category);
  }

  async remove() {
    const { ctx } = this;
    const result = await ctx.service.category.remove(ctx.params.id);

    if (!result.success && result.reason === 'not_found') {
      ctx.fail('分类不存在', 404);
      return;
    }

    if (!result.success && result.reason === 'in_use') {
      ctx.fail('该分类下仍有关联文章，不能删除');
      return;
    }

    ctx.success(null);
  }
}

module.exports = CategoryController;

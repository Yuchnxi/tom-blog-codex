'use strict';

const Service = require('egg').Service;

class CategoryService extends Service {
  async list() {
    return this.ctx.model.Category.findAll({
      order: [[ 'id', 'DESC' ]],
    });
  }

  async create(name) {
    return this.ctx.model.Category.create({ name });
  }

  async update(id, name) {
    const category = await this.ctx.model.Category.findByPk(id);
    if (!category) {
      return null;
    }

    category.name = name;
    await category.save();
    return category;
  }

  async remove(id) {
    const category = await this.ctx.model.Category.findByPk(id);
    if (!category) {
      return { success: false, reason: 'not_found' };
    }

    const articleCount = await this.ctx.model.Article.count({
      where: { category_id: id },
    });
    if (articleCount > 0) {
      return { success: false, reason: 'in_use' };
    }

    await category.destroy();
    return { success: true };
  }
}

module.exports = CategoryService;

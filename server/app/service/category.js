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
      return false;
    }

    await category.destroy();
    return true;
  }
}

module.exports = CategoryService;

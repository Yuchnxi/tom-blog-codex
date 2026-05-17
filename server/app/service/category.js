'use strict';

const Service = require('egg').Service;

class CategoryService extends Service {
  async list() {
    const categories = await this.ctx.model.Category.findAll({
      order: [[ 'id', 'DESC' ]],
    });

    return Promise.all(categories.map(async category => {
      const data = category.toJSON();
      data.article_count = await this.ctx.model.Article.count({
        where: {
          category_id: category.id,
          is_published: 1,
        },
      });
      return data;
    }));
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
    const fallbackName = '未分类';

    return this.ctx.model.transaction(async transaction => {
      const category = await this.ctx.model.Category.findByPk(id, { transaction });
      if (!category) {
        return { success: false, reason: 'not_found' };
      }

      if (category.name === fallbackName) {
        return { success: false, reason: 'default_category' };
      }

      let fallback = await this.ctx.model.Category.findOne({
        where: { name: fallbackName },
        transaction,
      });
      if (!fallback) {
        fallback = await this.ctx.model.Category.create({ name: fallbackName }, { transaction });
      }

      const articleCount = await this.ctx.model.Article.count({
        where: { category_id: id },
        paranoid: false,
        transaction,
      });
      if (articleCount > 0) {
        await this.ctx.model.Article.update(
          { category_id: fallback.id },
          {
            where: { category_id: id },
            paranoid: false,
            transaction,
          }
        );
      }

      await category.destroy({ transaction });
      return { success: true, movedCount: articleCount, fallbackName };
    });
  }
}

module.exports = CategoryService;

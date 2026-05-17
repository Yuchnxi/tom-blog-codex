'use strict';

const Service = require('egg').Service;

class TagService extends Service {
  async list() {
    const tags = await this.ctx.model.Tag.findAll({
      order: [[ 'id', 'DESC' ]],
    });

    return Promise.all(tags.map(async tag => {
      const data = tag.toJSON();
      data.article_count = await tag.countArticles({
        where: {
          is_published: 1,
        },
      });
      return data;
    }));
  }

  async create(name) {
    return this.ctx.model.Tag.create({ name });
  }

  async update(id, name) {
    const tag = await this.ctx.model.Tag.findByPk(id);
    if (!tag) {
      return null;
    }

    tag.name = name;
    await tag.save();
    return tag;
  }

  async remove(id) {
    const tag = await this.ctx.model.Tag.findByPk(id);
    if (!tag) {
      return { success: false, reason: 'not_found' };
    }

    const articleCount = await tag.countArticles();
    if (articleCount > 0) {
      return { success: false, reason: 'in_use' };
    }

    await tag.destroy();
    return { success: true };
  }
}

module.exports = TagService;

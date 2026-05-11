'use strict';

const Service = require('egg').Service;

class ArticleService extends Service {
  buildWhere(query, adminMode = false) {
    const { Op } = this.app.Sequelize;
    const where = {};

    if (!adminMode) {
      where.is_published = 1;
    }

    if (query.categoryId) {
      where.category_id = Number(query.categoryId);
    }

    if (query.keyword) {
      where.title = {
        [Op.like]: `%${query.keyword}%`,
      };
    }

    return where;
  }

  async list(query, adminMode = false) {
    const page = Math.max(Number(query.page) || 1, 1);
    const pageSize = Math.max(Number(query.pageSize) || 10, 1);
    const where = this.buildWhere(query, adminMode);
    const include = [
      {
        model: this.ctx.model.Category,
        as: 'category',
      },
      {
        model: this.ctx.model.Tag,
        as: 'tags',
        through: {
          attributes: [],
        },
      },
    ];

    if (query.tagId) {
      include[1].where = { id: Number(query.tagId) };
    }

    const { count, rows } = await this.ctx.model.Article.findAndCountAll({
      where,
      include,
      distinct: true,
      order: [[ 'id', 'DESC' ]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return {
      list: rows,
      pagination: {
        page,
        pageSize,
        total: count,
      },
    };
  }

  async detail(id, adminMode = false) {
    const where = { id };

    if (!adminMode) {
      where.is_published = 1;
    }

    return this.ctx.model.Article.findOne({
      where,
      include: [
        {
          model: this.ctx.model.Category,
          as: 'category',
        },
        {
          model: this.ctx.model.Tag,
          as: 'tags',
          through: {
            attributes: [],
          },
        },
      ],
    });
  }

  async create(payload) {
    const { ctx } = this;
    const article = await ctx.model.Article.create({
      title: payload.title,
      cover: payload.cover || '',
      content: payload.content,
      category_id: payload.categoryId,
      is_published: payload.isPublished ? 1 : 0,
    });

    await this.syncTags(article, payload.tagIds);
    return this.detail(article.id, true);
  }

  async update(id, payload) {
    const article = await this.ctx.model.Article.findByPk(id);
    if (!article) {
      return null;
    }

    article.title = payload.title;
    article.cover = payload.cover || '';
    article.content = payload.content;
    article.category_id = payload.categoryId;
    article.is_published = payload.isPublished ? 1 : 0;
    await article.save();

    await this.syncTags(article, payload.tagIds);
    return this.detail(article.id, true);
  }

  async remove(id) {
    const article = await this.ctx.model.Article.findByPk(id);
    if (!article) {
      return false;
    }

    await article.destroy();
    return true;
  }

  async togglePublish(id, isPublished) {
    const article = await this.ctx.model.Article.findByPk(id);
    if (!article) {
      return null;
    }

    article.is_published = isPublished ? 1 : 0;
    await article.save();
    return article;
  }

  async syncTags(article, tagIds = []) {
    const ids = Array.isArray(tagIds) ? tagIds.map(Number).filter(Boolean) : [];
    await article.setTags(ids);
  }
}

module.exports = ArticleService;

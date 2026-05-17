'use strict';

const crypto = require('crypto');
const Service = require('egg').Service;

class ArticleService extends Service {
  normalizeSlug(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 160);
  }

  async ensureUniqueSlug(rawSlug, excludeId = null, fallback = '') {
    const { Op } = this.app.Sequelize;
    let base = this.normalizeSlug(rawSlug) || this.normalizeSlug(fallback);
    if (/^\d+$/.test(base)) {
      base = this.normalizeSlug(fallback) || `article-${base}`;
    }
    let slug = base || 'article';
    let index = 2;

    while (true) {
      const where = { slug };
      if (excludeId) {
        where.id = { [Op.ne]: excludeId };
      }

      const existed = await this.ctx.model.Article.findOne({
        where,
        attributes: [ 'id' ],
        paranoid: false,
      });
      if (!existed) {
        return slug;
      }

      const suffix = `-${index}`;
      slug = `${base.slice(0, 160 - suffix.length)}${suffix}`;
      index += 1;
    }
  }

  async isSlugUsed(slug, excludeId = null) {
    const { Op } = this.app.Sequelize;
    const where = { slug };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const existed = await this.ctx.model.Article.findOne({
      where,
      attributes: [ 'id' ],
      paranoid: false,
    });
    return Boolean(existed);
  }

  async resolveArticleSlug(payload, article) {
    const manualSlug = this.normalizeSlug(payload.slug);
    if (manualSlug) {
      if (/^\d+$/.test(manualSlug)) {
        const error = new Error('文章 slug 不能为纯数字');
        error.status = 400;
        throw error;
      }

      if (await this.isSlugUsed(manualSlug, article.id)) {
        const error = new Error('文章 slug 已存在');
        error.status = 400;
        throw error;
      }

      return manualSlug;
    }

    return this.ensureUniqueSlug(payload.title, article.id, `article-${article.id}`);
  }


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

  async detail(identifier, adminMode = false) {
    const where = /^\d+$/.test(String(identifier))
      ? { id: Number(identifier) }
      : { slug: identifier };

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

  getClientIp() {
    const { ctx } = this;
    const forwardedFor = ctx.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    return ctx.get('x-real-ip') || ctx.ip || 'unknown';
  }

  getToday() {
    return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }

  hashIp(ip) {
    const secret = this.app.config.keys || 'tom_blog_view_secret';
    return crypto.createHash('sha256').update(`${secret}:${ip}`).digest('hex');
  }

  async recordView(id) {
    const { ctx } = this;
    const article = await ctx.model.Article.findOne({
      where: {
        id,
        is_published: 1,
      },
    });

    if (!article) {
      return null;
    }

    await article.increment('view_count');

    const ipHash = this.hashIp(this.getClientIp());
    const viewDate = this.getToday();
    let shouldIncreaseVisitor = false;

    try {
      await ctx.model.ArticleView.create({
        article_id: article.id,
        ip_hash: ipHash,
        view_date: viewDate,
        user_agent: (ctx.get('user-agent') || '').slice(0, 500),
      });
      shouldIncreaseVisitor = true;
    } catch (error) {
      if (error.name !== 'SequelizeUniqueConstraintError') {
        throw error;
      }
    }

    if (shouldIncreaseVisitor) {
      await article.increment('visitor_count');
    }

    const latest = await ctx.model.Article.findByPk(article.id, {
      attributes: [ 'id', 'view_count', 'visitor_count' ],
    });

    return {
      id: latest.id,
      view_count: latest.view_count,
      visitor_count: latest.visitor_count,
    };
  }

  async create(payload) {
    const { ctx } = this;
    const article = await ctx.model.Article.create({
      title: payload.title,
      slug: null,
      cover: payload.cover || '',
      content: payload.content,
      category_id: payload.categoryId,
      is_published: payload.isPublished ? 1 : 0,
    });
    article.slug = await this.resolveArticleSlug(payload, article);
    await article.save();

    await this.syncTags(article, payload.tagIds);
    return this.detail(article.id, true);
  }

  async update(id, payload) {
    const article = await this.ctx.model.Article.findByPk(id);
    if (!article) {
      return null;
    }

    article.title = payload.title;
    article.slug = await this.resolveArticleSlug(payload, article);
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

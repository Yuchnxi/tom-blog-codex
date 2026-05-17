'use strict';

const Controller = require('egg').Controller;

class ArticleController extends Controller {
  async publicList() {
    const data = await this.ctx.service.article.list(this.ctx.query, false);
    this.ctx.success(data);
  }

  async publicDetail() {
    const article = await this.ctx.service.article.detail(this.ctx.params.id, false);

    if (!article) {
      this.ctx.fail('文章不存在', 404);
      return;
    }

    this.ctx.success(article);
  }

  async recordView() {
    const data = await this.ctx.service.article.recordView(this.ctx.params.id);

    if (!data) {
      this.ctx.fail('文章不存在或未发布', 404);
      return;
    }

    this.ctx.success(data);
  }

  async adminList() {
    const data = await this.ctx.service.article.list(this.ctx.query, true);
    this.ctx.success(data);
  }

  async adminDetail() {
    const article = await this.ctx.service.article.detail(this.ctx.params.id, true);

    if (!article) {
      this.ctx.fail('文章不存在', 404);
      return;
    }

    this.ctx.success(article);
  }

  async create() {
    const payload = this.validatePayload();
    if (!payload) {
      return;
    }

    const article = await this.ctx.service.article.create(payload);
    this.ctx.success(article);
  }

  async update() {
    const payload = this.validatePayload();
    if (!payload) {
      return;
    }

    const article = await this.ctx.service.article.update(this.ctx.params.id, payload);
    if (!article) {
      this.ctx.fail('文章不存在', 404);
      return;
    }

    this.ctx.success(article);
  }

  async remove() {
    const success = await this.ctx.service.article.remove(this.ctx.params.id);
    if (!success) {
      this.ctx.fail('文章不存在', 404);
      return;
    }

    this.ctx.success(null);
  }

  async togglePublish() {
    const { isPublished } = this.ctx.request.body || {};

    if (![ 0, 1, false, true ].includes(isPublished)) {
      this.ctx.fail('发布状态参数错误');
      return;
    }

    const article = await this.ctx.service.article.togglePublish(this.ctx.params.id, isPublished);
    if (!article) {
      this.ctx.fail('文章不存在', 404);
      return;
    }

    this.ctx.success(article);
  }

  validatePayload() {
    const { ctx } = this;
    const payload = ctx.request.body || {};

    if (!payload.title) {
      ctx.fail('文章标题不能为空');
      return null;
    }

    if (!payload.content) {
      ctx.fail('文章内容不能为空');
      return null;
    }

    if (!payload.categoryId) {
      ctx.fail('文章分类不能为空');
      return null;
    }

    return {
      title: payload.title,
      slug: payload.slug,
      cover: payload.cover,
      content: payload.content,
      categoryId: Number(payload.categoryId),
      tagIds: payload.tagIds || [],
      isPublished: payload.isPublished,
    };
  }
}

module.exports = ArticleController;

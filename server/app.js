'use strict';

const bcrypt = require('bcryptjs');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async didReady() {
    const { app } = this;

    if (!app.model) {
      return;
    }

    await app.model.sync({ force: false });
    await this.ensureArticleViewColumns();
    await this.ensureArticleSlugColumn();
    await this.syncModelComments();

    const { initialUsername, initialPassword } = app.config.admin || {};
    if (!initialUsername || !initialPassword) {
      return;
    }

    const existedAdmin = await app.model.Admin.findOne({
      where: { username: initialUsername },
    });

    if (existedAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash(initialPassword, 10);
    await app.model.Admin.create({
      username: initialUsername,
      password: hashedPassword,
    });
  }

  async ensureArticleViewColumns() {
    const { app } = this;
    const queryInterface = app.model.getQueryInterface();
    const columns = await queryInterface.describeTable('articles');

    if (!columns.view_count) {
      await queryInterface.addColumn('articles', 'view_count', {
        type: app.Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '文章阅读量',
      });
    }

    if (!columns.visitor_count) {
      await queryInterface.addColumn('articles', 'visitor_count', {
        type: app.Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '文章访客数',
      });
    }
  }

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

  async buildUniqueArticleSlug(rawSlug, id, usedSlugs) {
    const fallback = `article-${id}`;
    let base = this.normalizeSlug(rawSlug) || fallback;
    if (/^\d+$/.test(base)) {
      base = fallback;
    }
    let slug = base;
    let index = 2;

    while (usedSlugs.has(slug)) {
      const suffix = `-${index}`;
      slug = `${base.slice(0, 160 - suffix.length)}${suffix}`;
      index += 1;
    }

    usedSlugs.add(slug);
    return slug;
  }

  async ensureArticleSlugColumn() {
    const { app } = this;
    const queryInterface = app.model.getQueryInterface();
    const columns = await queryInterface.describeTable('articles');

    if (!columns.slug) {
      await queryInterface.addColumn('articles', 'slug', {
        type: app.Sequelize.STRING(160),
        allowNull: true,
        comment: '文章访问标识',
      });
    }

    const articles = await app.model.Article.findAll({
      attributes: [ 'id', 'title', 'slug' ],
      order: [[ 'id', 'ASC' ]],
      paranoid: false,
    });
    const usedSlugs = new Set();

    for (const article of articles) {
      const normalizedSlug = this.normalizeSlug(article.slug);
      if (normalizedSlug) {
        article.slug = await this.buildUniqueArticleSlug(normalizedSlug, article.id, usedSlugs);
        await article.save({ silent: true });
        continue;
      }

      article.slug = await this.buildUniqueArticleSlug(article.title, article.id, usedSlugs);
      await article.save({ silent: true });
    }

    const indexes = await queryInterface.showIndex('articles');
    const hasSlugUniqueIndex = indexes.some(index => index.unique && index.fields?.some(field => field.attribute === 'slug'));
    if (!hasSlugUniqueIndex) {
      await queryInterface.addIndex('articles', [ 'slug' ], {
        unique: true,
        name: 'uniq_articles_slug',
      });
    }
  }

  async syncModelComments() {
    const { app } = this;

    const sqlList = [
      "ALTER TABLE `admins` COMMENT = '管理员表'",
      "ALTER TABLE `admins` MODIFY COLUMN `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID'",
      "ALTER TABLE `admins` MODIFY COLUMN `username` VARCHAR(50) NOT NULL COMMENT '管理员用户名'",
      "ALTER TABLE `admins` MODIFY COLUMN `password` VARCHAR(255) NOT NULL COMMENT 'bcrypt 加密后的登录密码'",
      "ALTER TABLE `admins` MODIFY COLUMN `created_at` DATETIME NOT NULL COMMENT '创建时间'",
      "ALTER TABLE `admins` MODIFY COLUMN `updated_at` DATETIME NOT NULL COMMENT '更新时间'",

      "ALTER TABLE `categories` COMMENT = '文章分类表'",
      "ALTER TABLE `categories` MODIFY COLUMN `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID'",
      "ALTER TABLE `categories` MODIFY COLUMN `name` VARCHAR(50) NOT NULL COMMENT '分类名称'",
      "ALTER TABLE `categories` MODIFY COLUMN `created_at` DATETIME NOT NULL COMMENT '创建时间'",
      "ALTER TABLE `categories` MODIFY COLUMN `updated_at` DATETIME NOT NULL COMMENT '更新时间'",

      "ALTER TABLE `tags` COMMENT = '文章标签表'",
      "ALTER TABLE `tags` MODIFY COLUMN `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '标签ID'",
      "ALTER TABLE `tags` MODIFY COLUMN `name` VARCHAR(50) NOT NULL COMMENT '标签名称'",
      "ALTER TABLE `tags` MODIFY COLUMN `created_at` DATETIME NOT NULL COMMENT '创建时间'",
      "ALTER TABLE `tags` MODIFY COLUMN `updated_at` DATETIME NOT NULL COMMENT '更新时间'",

      "ALTER TABLE `articles` COMMENT = '文章表'",
      "ALTER TABLE `articles` MODIFY COLUMN `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文章ID'",
      "ALTER TABLE `articles` MODIFY COLUMN `title` VARCHAR(200) NOT NULL COMMENT '文章标题'",
      "ALTER TABLE `articles` MODIFY COLUMN `slug` VARCHAR(160) NULL COMMENT '文章访问标识'",
      "ALTER TABLE `articles` MODIFY COLUMN `cover` VARCHAR(500) NULL COMMENT '封面图URL'",
      "ALTER TABLE `articles` MODIFY COLUMN `content` LONGTEXT NOT NULL COMMENT 'Markdown 原文内容'",
      "ALTER TABLE `articles` MODIFY COLUMN `category_id` INT UNSIGNED NOT NULL COMMENT '关联分类ID'",
      "ALTER TABLE `articles` MODIFY COLUMN `is_published` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否发布：0未发布，1已发布'",
      "ALTER TABLE `articles` MODIFY COLUMN `deleted_at` DATETIME NULL COMMENT '软删除时间'",
      "ALTER TABLE `articles` MODIFY COLUMN `created_at` DATETIME NOT NULL COMMENT '创建时间'",
      "ALTER TABLE `articles` MODIFY COLUMN `updated_at` DATETIME NOT NULL COMMENT '更新时间'",

      "ALTER TABLE `article_tags` COMMENT = '文章标签关联表'",
      "ALTER TABLE `article_tags` MODIFY COLUMN `article_id` INT UNSIGNED NOT NULL COMMENT '文章ID'",
      "ALTER TABLE `article_tags` MODIFY COLUMN `tag_id` INT UNSIGNED NOT NULL COMMENT '标签ID'",
      "ALTER TABLE `profiles` COMMENT = '个人信息表'",
      "ALTER TABLE `profiles` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
      "ALTER TABLE `profiles` MODIFY COLUMN `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '个人信息ID'",
      "ALTER TABLE `profiles` MODIFY COLUMN `avatar` VARCHAR(500) NULL COMMENT '头像URL'",
      "ALTER TABLE `profiles` MODIFY COLUMN `nickname` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '昵称'",
      "ALTER TABLE `profiles` MODIFY COLUMN `bio` VARCHAR(200) NULL COMMENT '一句话简介'",
      "ALTER TABLE `profiles` MODIFY COLUMN `description` TEXT NULL COMMENT '详细介绍'",
      "ALTER TABLE `profiles` MODIFY COLUMN `email` VARCHAR(100) NULL COMMENT '邮箱'",
      "ALTER TABLE `profiles` MODIFY COLUMN `github` VARCHAR(500) NULL COMMENT 'GitHub链接'",
      "ALTER TABLE `profiles` MODIFY COLUMN `created_at` DATETIME NOT NULL COMMENT '创建时间'",
      "ALTER TABLE `profiles` MODIFY COLUMN `updated_at` DATETIME NOT NULL COMMENT '更新时间'",
    ];

    for (const sql of sqlList) {
      await app.model.query(sql);
    }
  }
}

module.exports = AppBootHook;

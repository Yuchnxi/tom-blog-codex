'use strict';

const Service = require('egg').Service;

class DashboardService extends Service {
  async stats() {
    const { Article, Category, Tag } = this.ctx.model;
    const [ totalArticles, publishedArticles, draftArticles, totalCategories, totalTags, totalViews, totalVisitors, topArticles ] =
      await Promise.all([
        Article.count(),
        Article.count({ where: { is_published: 1 } }),
        Article.count({ where: { is_published: 0 } }),
        Category.count(),
        Tag.count(),
        Article.sum('view_count'),
        Article.sum('visitor_count'),
        Article.findAll({
          attributes: [ 'id', 'title', 'view_count', 'visitor_count' ],
          order: [[ 'view_count', 'DESC' ], [ 'id', 'DESC' ]],
          limit: 10,
        }),
      ]);

    return {
      overview: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalCategories,
        totalTags,
        totalViews: Number(totalViews) || 0,
        totalVisitors: Number(totalVisitors) || 0,
      },
      topArticles: topArticles.map(article => ({
        id: article.id,
        title: article.title,
        view_count: article.view_count || 0,
        visitor_count: article.visitor_count || 0,
      })),
      publishStatus: [
        { name: '已发布', value: publishedArticles },
        { name: '草稿', value: draftArticles },
      ],
    };
  }
}

module.exports = DashboardService;

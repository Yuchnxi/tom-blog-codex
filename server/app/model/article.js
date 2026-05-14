'use strict';

module.exports = app => {
  const { STRING, INTEGER, TEXT, TINYINT, DATE } = app.Sequelize;

  const Article = app.model.define(
    'Article',
    {
      id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '文章ID',
      },
      title: {
        type: STRING(200),
        allowNull: false,
        comment: '文章标题',
      },
      cover: {
        type: STRING(500),
        allowNull: true,
        comment: '封面图URL',
      },
      content: {
        type: TEXT('long'),
        allowNull: false,
        comment: 'Markdown 原文内容',
      },
      category_id: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        comment: '关联分类ID',
      },
      is_published: {
        type: TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: '是否发布，0未发布，1已发布',
      },
      view_count: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '文章阅读量',
      },
      visitor_count: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        comment: '文章访客数',
      },
      deleted_at: {
        type: DATE,
        allowNull: true,
        comment: '软删除时间',
      },
    },
    {
      tableName: 'articles',
      comment: '文章表',
      timestamps: true,
      underscored: true,
      paranoid: true,
      deletedAt: 'deleted_at',
    }
  );

  Article.associate = () => {
    Article.belongsTo(app.model.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });
    Article.belongsToMany(app.model.Tag, {
      through: app.model.ArticleTag,
      foreignKey: 'article_id',
      otherKey: 'tag_id',
      as: 'tags',
    });
    Article.hasMany(app.model.ArticleView, {
      foreignKey: 'article_id',
      as: 'views',
    });
  };

  return Article;
};

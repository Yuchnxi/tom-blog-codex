'use strict';

module.exports = app => {
  const { INTEGER } = app.Sequelize;

  const ArticleTag = app.model.define(
    'ArticleTag',
    {
      article_id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        comment: '文章ID',
      },
      tag_id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        comment: '标签ID',
      },
    },
    {
      tableName: 'article_tags',
      comment: '文章标签关联表',
      timestamps: false,
      underscored: true,
    }
  );

  return ArticleTag;
};

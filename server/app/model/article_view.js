'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATEONLY } = app.Sequelize;

  const ArticleView = app.model.define(
    'ArticleView',
    {
      id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '访问记录ID',
      },
      article_id: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        comment: '文章ID',
      },
      ip_hash: {
        type: STRING(64),
        allowNull: false,
        comment: 'IP哈希',
      },
      view_date: {
        type: DATEONLY,
        allowNull: false,
        comment: '访问日期',
      },
      user_agent: {
        type: STRING(500),
        allowNull: true,
        comment: 'User-Agent',
      },
    },
    {
      tableName: 'article_views',
      comment: '文章访问记录表',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: [ 'article_id', 'ip_hash', 'view_date' ],
        },
      ],
    }
  );

  ArticleView.associate = () => {
    ArticleView.belongsTo(app.model.Article, {
      foreignKey: 'article_id',
      as: 'article',
    });
  };

  return ArticleView;
};

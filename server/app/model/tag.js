'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Tag = app.model.define(
    'Tag',
    {
      id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '标签ID',
      },
      name: {
        type: STRING(50),
        allowNull: false,
        unique: true,
        comment: '标签名称',
      },
    },
    {
      tableName: 'tags',
      comment: '文章标签表',
      timestamps: true,
      underscored: true,
    }
  );

  Tag.associate = () => {
    Tag.belongsToMany(app.model.Article, {
      through: app.model.ArticleTag,
      foreignKey: 'tag_id',
      otherKey: 'article_id',
      as: 'articles',
    });
  };

  return Tag;
};

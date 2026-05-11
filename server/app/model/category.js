'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Category = app.model.define(
    'Category',
    {
      id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '分类ID',
      },
      name: {
        type: STRING(50),
        allowNull: false,
        unique: true,
        comment: '分类名称',
      },
    },
    {
      tableName: 'categories',
      comment: '文章分类表',
      timestamps: true,
      underscored: true,
    }
  );

  Category.associate = () => {
    Category.hasMany(app.model.Article, {
      foreignKey: 'category_id',
      as: 'articles',
    });
  };

  return Category;
};

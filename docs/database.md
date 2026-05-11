# 数据库设计文档

数据库：MySQL 8，ORM：egg-sequelize

---

## 表结构

### admins（管理员）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) UNIQUE | 用户名 |
| password | VARCHAR(255) | bcrypt 加密后的密码 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

---

### categories（分类）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) UNIQUE | 分类名称 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

---

### tags（标签）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) UNIQUE | 标签名称 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

---

### articles（文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| title | VARCHAR(200) | 文章标题 |
| cover | VARCHAR(500) | 封面图 URL（COS） |
| content | LONGTEXT | Markdown 原文 |
| category_id | INT FK | 关联 categories.id |
| is_published | TINYINT(1) | 是否发布，默认 0 |
| deleted_at | DATETIME NULL | 软删除时间，NULL 表示未删除 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

---

### article_tags（文章标签关联，多对多）

| 字段 | 类型 | 说明 |
|------|------|------|
| article_id | INT FK | 关联 articles.id |
| tag_id | INT FK | 关联 tags.id |

> 联合主键：(article_id, tag_id)

---

## 关系说明

```
articles  →  categories   多对一
articles  →  tags          多对多（通过 article_tags）
```

---

## 初始化 SQL

```sql
CREATE DATABASE tom_blog_codex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

表由 egg-sequelize 的 `sync` 或迁移脚本自动创建，开发环境使用 `sync({ force: false })`。

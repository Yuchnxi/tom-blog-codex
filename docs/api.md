# API 接口文档

- Base URL：`http://localhost:7001`
- 管理接口需在 Header 携带：`Authorization: Bearer <token>`
- 统一响应格式：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

> `code` 为 0 表示成功，`code` 为 1 表示业务失败（如参数错误、资源不存在），`code` 为 500 表示服务器内部错误。

---

## 认证

### 登录
`POST /api/admin/login`

**Request Body**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**Response**
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

### 获取管理员信息 🔒
`GET /api/admin/info`

**Response**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 修改密码 🔒
`PUT /api/admin/password`

**Request Body**
```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码（不少于6位）"
}
```

---

## 文章

### 获取文章列表（展示页）
`GET /api/articles`

**Query Params**

| 参数 | 类型 | 说明 |
|------|------|------|
| page | Number | 页码，默认 1 |
| pageSize | Number | 每页数量，默认 10 |
| categoryId | Number | 按分类筛选（可选） |
| tagId | Number | 按标签筛选（可选） |

### 获取文章详情（展示页）
`GET /api/articles/:id`

### 获取文章列表（管理后台）🔒
`GET /api/admin/articles`

**Query Params**：同上，额外支持 `keyword`（标题模糊搜索）

### 获取文章详情（管理后台）🔒
`GET /api/admin/articles/:id`

返回文章完整信息，包含未发布状态的文章。

### 新建文章 🔒
`POST /api/admin/articles`

```json
{
  "title": "文章标题",
  "cover": "https://cos.example.com/cover.jpg",
  "content": "# Markdown 内容",
  "categoryId": 1,
  "tagIds": [1, 2],
  "isPublished": 1
}
```

### 编辑文章 🔒
`PUT /api/admin/articles/:id`

Body 同新建文章。

### 删除文章 🔒
`DELETE /api/admin/articles/:id`

软删除，设置 `deleted_at`。

### 切换发布状态 🔒
`PATCH /api/admin/articles/:id/publish`

```json
{ "isPublished": 1 }
```

---

## 分类

### 获取分类列表
`GET /api/categories`

### 新建分类 🔒
`POST /api/admin/categories`
```json
{ "name": "前端" }
```

### 编辑分类 🔒
`PUT /api/admin/categories/:id`

### 删除分类 🔒
`DELETE /api/admin/categories/:id`

---

## 标签

### 获取标签列表
`GET /api/tags`

### 新建标签 🔒
`POST /api/admin/tags`
```json
{ "name": "Vue" }
```

### 编辑标签 🔒
`PUT /api/admin/tags/:id`

### 删除标签 🔒
`DELETE /api/admin/tags/:id`

---

## 文件上传

### 上传图片 🔒
`POST /api/admin/upload`

**Content-Type**: `multipart/form-data`，字段名 `file`

**Response**
```json
{
  "code": 0,
  "data": {
    "url": "https://cos.example.com/images/xxx.jpg"
  }
}
```

---

> 🔒 标记的接口需要携带 JWT token

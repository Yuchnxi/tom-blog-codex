# 开发指南

## 环境要求

| 工具 | 版本要求 |
|------|---------|
| Node.js | >= 18 |
| MySQL | 8.x |
| npm | >= 9 |

---

## 本地启动步骤

### 1. 克隆项目

```bash
git clone https://github.com/Yuchnxi/tom-blog-codex.git
cd tom-blog-codex
```

### 2. 初始化数据库

登录 MySQL，创建数据库：

```sql
CREATE DATABASE tom_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置后端环境变量

在 `server/config/` 下新建 `config.local.js`（此文件不提交 git）：

```js
'use strict';

module.exports = () => {
  return {
    sequelize: {
      database: 'tom_blog',
      username: 'root',
      password: '你的数据库密码',
      host: '127.0.0.1',
      port: 3306,
    },
    jwt: {
      secret: '你的JWT密钥',
    },
    cos: {
      secretId: '腾讯云 SecretId',
      secretKey: '腾讯云 SecretKey',
      bucket: 'your-bucket-name',
      region: 'ap-guangzhou',
    },
  };
};
```

### 4. 安装依赖并启动

```bash
# 后端
cd server && npm install && npm run dev

# 展示页前端（新终端）
cd blog-web && npm install && npm run dev

# 后台管理前端（新终端）
cd admin-web && npm install && npm run dev
```

### 5. 默认访问地址

| 服务 | 地址 |
|------|------|
| 后端 API | http://localhost:7001 |
| 展示页 | http://localhost:5173 |
| 后台管理 | http://localhost:5174 |

---

## 目录结构

```
tom-blog/
├── server/              # Egg.js 后端
│   ├── app/
│   │   ├── controller/  # 路由处理层
│   │   ├── service/     # 业务逻辑层
│   │   ├── model/       # Sequelize 模型
│   │   ├── middleware/  # 自定义中间件
│   │   └── router.js    # 路由注册
│   └── config/
│       ├── config.default.js  # 基础配置（提交 git）
│       ├── config.local.js    # 本地私有配置（不提交 git）
│       └── plugin.js          # 插件启用
├── blog-web/            # 展示页前端
│   └── src/
│       ├── views/       # 页面组件
│       ├── components/  # 公共组件
│       ├── utils/       # axios 封装等工具
│       └── router/      # Vue Router 配置
├── admin-web/           # 后台管理前端
│   └── src/
│       ├── views/       # 页面组件
│       ├── components/  # 公共组件
│       ├── utils/       # axios 封装（含 JWT 注入）
│       └── router/      # Vue Router 配置
└── docs/                # 项目文档
```

---

## 注意事项

- `server/config/config.local.js` 已加入 `.gitignore`，不会提交到 git
- 前端 axios 封装统一放在 `src/utils/request.js`
- 后台管理的 axios 实例需在请求拦截器中自动注入 `Authorization` header

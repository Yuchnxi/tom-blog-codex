# CODEX.md

## 项目概览

Tom Blog 是一个 Monorepo 个人博客项目，包含三个子项目：

- `server/` — Egg.js 后端 REST API
- `blog-web/` — Vue 3 + Vite 博客展示页
- `admin-web/` — Vue 3 + Vite + Element Plus 后台管理系统

## 技术栈

| 子项目    | 核心依赖                                                     |
| --------- | ------------------------------------------------------------ |
| server    | Egg.js、egg-sequelize、MySQL2、egg-jwt、egg-cors、bcryptjs、cos-nodejs-sdk-v5 |
| blog-web  | Vue 3、Vite、UnoCSS、axios、markdown-it                      |
| admin-web | Vue 3、Vite、Element Plus、axios、Vditor                     |

**语言：当前阶段使用 JavaScript。**

## 常用命令

```bash
# 后端开发
cd server && npm run dev

# 展示页开发
cd blog-web && npm run dev

# 后台管理开发
cd admin-web && npm run dev

# 生产构建（前端）
cd blog-web && npm run build
cd admin-web && npm run build

# 后端生产启动 / 停止
cd server && npm start
cd server && npm stop
```

## 架构说明

### server（Egg.js）

遵循 Egg.js 约定：

- `app/router.js` — 所有路由统一注册，管理接口挂载 JWT 鉴权中间件
- `app/controller/` — 处理请求/响应，不含业务逻辑
- `app/service/` — 业务逻辑层，所有数据库操作在此进行
- `app/model/` — Sequelize 模型定义
- `app/middleware/` — 自定义中间件（如 JWT 校验）
- `config/config.default.js` — 数据库连接、JWT secret、CORS、COS 配置
- `config/plugin.js` — 插件启用声明

鉴权方案：管理员登录后返回 JWT token，后续管理接口在 Header 中携带 `Authorization: Bearer <token>`。

### blog-web（展示页）

- 优先使用 UnoCSS（原子化 CSS），复杂样式可使用 scoped CSS
- Markdown 文章内容通过 markdown-it 渲染，代码高亮使用 highlight.js
- 明暗主题通过切换 `html` 标签的 class 实现，配合 UnoCSS dark mode

### admin-web（后台管理）

- axios 实例统一封装在 `src/utils/request.js`，自动注入 JWT token 并处理 401 跳转登录
- 文章编辑器使用 Vditor（Markdown 编辑器）
- Element Plus 按需引入

## 数据模型

主要表：`admins`、`articles`、`categories`、`tags`、`article_tags`（多对多关联）

## Git 提交规范

提交信息统一使用**中文**，格式为 `类型: 说明`。

常用类型：`feat`（新功能）、`fix`（修复）、`docs`（文档）、`refactor`（重构）、`style`（样式）、`chore`（杂项）

```bash
git commit -m "feat: 新增文章列表接口"
git commit -m "fix: 修复登录 token 过期未跳转的问题"
git commit -m "docs: 更新 CODEX.md 注释规范"
```

## 代码注释规范

所有注释统一使用**中文**，包括行内注释、函数说明、逻辑说明等。

复杂业务函数、接口处理函数、非显而易见逻辑需要添加中文注释，说明职责或关键判断；简单函数不强制注释。

```js
// 获取文章列表
async function fetchList() { ... }

// 切换文章发布状态
async function togglePublish(row) { ... }

// 格式化日期显示
function formatDate(val) { ... }
```

行内注释用于解释非显而易见的逻辑：

```js
// 校验 token 是否过期
const isExpired = Date.now() > exp * 1000;
```

## 环境变量

敏感配置（数据库密码、JWT secret、COS 密钥）通过 `server/config/config.local.js` 或环境变量注入，不提交到 git。参考 `server/config/config.default.js` 中的占位配置。

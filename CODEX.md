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
| admin-web | Vue 3、Vite、Element Plus、axios、md-editor-v3               |

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
- 文章编辑器使用 `md-editor-v3`（Markdown 编辑器）
- Element Plus 按需引入

#### 后台管理前端开发规范

后台管理系统以 Element Plus 为主，遵循 KISS 原则，优先保持页面结构清晰、交互统一，不为暂未实现的功能预留复杂设计。

**目录与组件组织**

- 主要功能页面或内容模块，如文章管理、分类管理、标签管理等，必须在 `admin-web/src/views/` 下创建对应业务目录。
- 业务目录名称使用清晰的模块名，例如 `article/`、`category/`、`tag/`。
- 每个业务页面的入口文件统一命名为 `index.vue`。
- 业务页面下的子功能，如新增、编辑、详情、选择器等，优先以对话框、抽屉或局部组件形式出现。
- 子功能组件统一放在当前业务目录下的 `childComps/` 文件夹中，不放到全局 `components/`，除非该组件确实会跨多个业务模块复用。
- 新增/编辑类功能默认不单独创建路由；优先作为所属管理页面内的子组件弹出。

推荐结构：

```text
admin-web/src/views/
├── article/
│   ├── index.vue
│   └── childComps/
│       └── ArticleEditorDialog.vue
├── category/
│   ├── index.vue
│   └── childComps/
│       └── CategoryFormDialog.vue
└── tag/
    ├── index.vue
    └── childComps/
        └── TagFormDialog.vue
```

**页面布局**

- 页面标题下方不展示当前日期或时间。
- 页面结构推荐按顺序组织为：标题区、搜索区、操作区、表格区、分页区。
- 搜索区只放查询条件，不放新增、删除、导入、导出等操作按钮。
- 操作区位于搜索区下方，用于放置 `新增xx`、批量删除等业务操作。

**搜索表单**

- 搜索区域统一使用 Element Plus 的行内表单：`el-form inline`。
- 搜索表单项宽度保持一致，默认建议 `220px`；特殊字段可按实际内容微调，但同一页面内要统一。
- 搜索区按钮固定为 `搜索` 和 `重置` 两个。
- `搜索` 执行查询并回到第一页；`重置` 清空查询条件并重新加载列表。

**表格规范**

- 表格使用 `el-table`。
- 除名称类字段（如 `name`、标题等需要左对齐便于阅读）外，其余 `el-table-column` 默认居中。
- 操作列统一命名为 `操作`，宽度为 `200px`。
- 表格内时间格式统一为：`YYYY-MM-DD HH:mm:ss`。
- 表格状态字段使用 `el-tag` 或项目统一状态样式，不直接显示裸数字。

**分页规范**

- 列表分页统一使用中文文案。
- 分页区域位于表格下方，默认右对齐。
- 分页变更后保持当前搜索条件。

## 数据模型

主要表：`admins`、`articles`、`categories`、`tags`、`article_tags`（多对多关联）

Sequelize 模型需要为表和字段添加中文注释，方便在数据库管理工具中识别用途。

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

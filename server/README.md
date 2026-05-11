# tom-blog-server

Egg.js 服务端项目。

## 命令

```bash
npm run dev
npm start
npm stop
```

## 数据库

当前初始化阶段默认不连接数据库。需要启用 Sequelize 时，先配置 `config/config.local.js`，再设置 `ENABLE_SEQUELIZE=true` 启动服务。

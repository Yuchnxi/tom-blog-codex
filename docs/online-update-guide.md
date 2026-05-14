# 线上更新部署指南

本文记录 `tom-blog-codex` 后续更新到线上服务器的稳定流程。

适用前提：

- 最新代码已经推送到 GitHub `main` 分支
- 线上项目目录：`/var/www/tom-blog`
- 后端端口：`127.0.0.1:7001`
- 域名：`tomchenxi.com`

线上地址：

- 前台：`http://tomchenxi.com/`
- 后台：`http://tomchenxi.com/admin/`
- 接口：`http://tomchenxi.com/api/profile`

## 1. 登录服务器

在本机 PowerShell 执行：

```powershell
ssh ubuntu@159.75.77.20
```

## 2. 下载最新代码到 /tmp

不要直接在 `/var/www` 下载，普通用户可能没有写权限。

```bash
cd /tmp
rm -rf tom-blog-new tom-blog-codex-main tom-blog-new.zip
wget -O tom-blog-new.zip https://github.com/Yuchnxi/tom-blog-codex/archive/refs/heads/main.zip
unzip -o tom-blog-new.zip
mv tom-blog-codex-main tom-blog-new
ls /tmp/tom-blog-new
```

正常应该看到：

```text
admin-web  blog-web  docs  server
```

## 3. 复制线上配置和上传文件

`.env.prod` 不提交到 GitHub，必须从当前线上目录复制。

如果当前项目使用本地上传兜底，图片目录也要复制，否则历史上传图片会丢。

```bash
cp /var/www/tom-blog/server/.env.prod /tmp/tom-blog-new/server/.env.prod
cp -r /var/www/tom-blog/server/app/public /tmp/tom-blog-new/server/app/public 2>/dev/null || true
```

## 4. 构建前台

```bash
cd /tmp/tom-blog-new/blog-web
npm ci
npm run build
```

## 5. 构建后台

```bash
cd /tmp/tom-blog-new/admin-web
npm ci
npm run build
```

Vite 的大 chunk 提示只是 warning，不影响上线。

## 6. 安装后端依赖

```bash
cd /tmp/tom-blog-new/server
npm ci --omit=dev
```

## 7. 停止旧后端

```bash
cd /var/www/tom-blog/server
npm run stop
```

正常会看到：

```text
egg-scripts stopped
```

## 8. 切换线上目录

使用固定备份名，避免复制命令时 `$(date ...)` 断行导致切换失败。

逐条执行：

```bash
cd /var/www
sudo rm -rf tom-blog-bak-latest
sudo mv tom-blog tom-blog-bak-latest
sudo mv /tmp/tom-blog-new tom-blog
sudo chown -R ubuntu:ubuntu /var/www/tom-blog
```

确认新目录：

```bash
ls /var/www/tom-blog
ls /var/www/tom-blog/server
```

应该能看到：

```text
admin-web  blog-web  docs  server
```

以及 `server` 下有：

```text
package.json
```

如果 `sudo mv /tmp/tom-blog-new tom-blog` 报错，不要继续启动，先看“回滚方法”。

## 9. 启动新后端

```bash
cd /var/www/tom-blog/server
set -a
source .env.prod
set +a
npm run start -- --env=prod
sudo systemctl reload nginx
```

启动成功会看到：

```text
egg started on http://127.0.0.1:7001
```

如果出现端口占用：

```text
EADDRINUSE 127.0.0.1:7001
```

执行：

```bash
sudo fuser -k 7001/tcp
npm run start -- --env=prod
```

## 10. 验证

接口验证：

```bash
curl http://127.0.0.1:7001/api/profile
```

正常返回：

```json
{"code":0,"message":"success",...}
```

浏览器验证：

```text
http://tomchenxi.com/
http://tomchenxi.com/admin/
http://tomchenxi.com/api/profile
```

建议后台测试：

- 登录
- 新增或编辑文章
- 上传图片
- 保存文章

## 11. 回滚方法

如果新版本失败，切回旧版本。

```bash
cd /var/www
sudo rm -rf tom-blog-bad
sudo mv tom-blog tom-blog-bad
sudo mv tom-blog-bak-latest tom-blog
sudo chown -R ubuntu:ubuntu /var/www/tom-blog
```

启动旧版本：

```bash
cd /var/www/tom-blog/server
set -a
source .env.prod
set +a
npm run start -- --env=prod
sudo systemctl reload nginx
curl http://127.0.0.1:7001/api/profile
```

如果端口占用：

```bash
sudo fuser -k 7001/tcp
npm run start -- --env=prod
```

## 12. 本地上传图片目录

如果没有配置腾讯云 COS，图片会保存在：

```text
/var/www/tom-blog/server/app/public/uploads
```

更新时必须保留：

```bash
cp -r /var/www/tom-blog/server/app/public /tmp/tom-blog-new/server/app/public 2>/dev/null || true
```

否则旧文章里的本地图片可能丢失。

## 13. 清理备份

新版本稳定后，可以删除旧备份：

```bash
sudo rm -rf /var/www/tom-blog-bak-latest
sudo rm -rf /var/www/tom-blog-bad
```

不要删除当前线上目录：

```text
/var/www/tom-blog
```

## 14. 常见问题

### wqet: command not found

命令敲错了，应该是：

```bash
wget
```

### Permission denied

普通用户对 `/var/www` 没写权限。下载和构建放到 `/tmp`，切换目录时使用 `sudo mv`。

### npm 找不到 package.json

如果看到：

```text
Could not read package.json: /var/www/package.json
```

说明当前目录错了。进入后端目录再执行：

```bash
cd /var/www/tom-blog/server
```

### /var/www/tom-blog/server 不存在

说明目录切换失败。先恢复备份：

```bash
cd /var/www
sudo mv tom-blog-bak-latest tom-blog
```

再检查：

```bash
ls /var/www/tom-blog/server
```

### EADDRINUSE 127.0.0.1:7001

旧后端进程还占着端口：

```bash
sudo fuser -k 7001/tcp
npm run start -- --env=prod
```

### 上传图片 413

Nginx 上传限制太小。

检查：

```bash
sudo nginx -T | grep client_max_body_size
```

建议配置：

```nginx
client_max_body_size 50m;
```

配置后：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 上传图片提示 COS 配置不完整

说明后端可能还在跑旧代码或旧进程。

检查文件：

```bash
grep -n "COS 配置不完整\|app/public/uploads\|api/uploads" /var/www/tom-blog/server/app/controller/upload.js /var/www/tom-blog/server/app/router.js
```

如果文件是新代码但浏览器还是旧提示，重启后端：

```bash
cd /var/www/tom-blog/server
npm run stop
sudo fuser -k 7001/tcp
set -a
source .env.prod
set +a
npm run start -- --env=prod
```

## 15. 完整命令速查

确认最新代码已推送到 GitHub 后，可按以下命令完整更新：

```bash
cd /tmp
rm -rf tom-blog-new tom-blog-codex-main tom-blog-new.zip
wget -O tom-blog-new.zip https://github.com/Yuchnxi/tom-blog-codex/archive/refs/heads/main.zip
unzip -o tom-blog-new.zip
mv tom-blog-codex-main tom-blog-new

cp /var/www/tom-blog/server/.env.prod /tmp/tom-blog-new/server/.env.prod
cp -r /var/www/tom-blog/server/app/public /tmp/tom-blog-new/server/app/public 2>/dev/null || true

cd /tmp/tom-blog-new/blog-web
npm ci
npm run build

cd /tmp/tom-blog-new/admin-web
npm ci
npm run build

cd /tmp/tom-blog-new/server
npm ci --omit=dev

cd /var/www/tom-blog/server
npm run stop

cd /var/www
sudo rm -rf tom-blog-bak-latest
sudo mv tom-blog tom-blog-bak-latest
sudo mv /tmp/tom-blog-new tom-blog
sudo chown -R ubuntu:ubuntu /var/www/tom-blog

cd /var/www/tom-blog/server
set -a
source .env.prod
set +a
npm run start -- --env=prod
sudo systemctl reload nginx

curl http://127.0.0.1:7001/api/profile
```

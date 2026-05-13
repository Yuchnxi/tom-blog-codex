# 腾讯云 CVM 部署说明

本文按最简单的单机方案部署：腾讯云 CVM + Nginx + Node.js 18+ + MySQL 8。

## 1. 服务器准备

建议系统：Ubuntu 22.04 LTS。

安全组放行：

- 22：SSH
- 80：HTTP
- 443：HTTPS，配置域名证书后使用

安装基础软件：

```bash
sudo apt update
sudo apt install -y nginx mysql-server git curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

## 2. 初始化数据库

```bash
sudo mysql
```

```sql
CREATE DATABASE tom_blog_codex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tom_blog'@'127.0.0.1' IDENTIFIED BY '改成强密码';
GRANT ALL PRIVILEGES ON tom_blog_codex.* TO 'tom_blog'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

## 3. 上传或拉取代码

示例目录：

```bash
sudo mkdir -p /var/www/tom-blog
sudo chown -R $USER:$USER /var/www/tom-blog
cd /var/www/tom-blog
git clone <你的仓库地址> .
```

也可以用 `scp`、SFTP 或宝塔面板上传项目。

## 4. 配置后端环境变量

在 `server` 目录创建生产环境变量文件：

```bash
cd /var/www/tom-blog/server
cat > .env.prod <<'EOF'
EGG_SERVER_ENV=prod
PORT=7001
HOST=127.0.0.1
EGG_KEYS=改成一串随机长字符串
JWT_SECRET=改成另一串随机长字符串

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=tom_blog_codex
DB_USER=tom_blog
DB_PASSWORD=改成强密码

ADMIN_INITIAL_USERNAME=admin
ADMIN_INITIAL_PASSWORD=改成初始管理员密码

COS_SECRET_ID=
COS_SECRET_KEY=
COS_BUCKET=
COS_REGION=
COS_DOMAIN=
EOF
```

`ADMIN_INITIAL_USERNAME` 和 `ADMIN_INITIAL_PASSWORD` 只会在首次启动且管理员不存在时创建账号。创建成功后可以删掉或留空。

如果需要上传图片，把腾讯云 COS 参数补齐；不配置 COS 时，后台上传图片接口不可用。

## 5. 构建前端

```bash
cd /var/www/tom-blog/blog-web
npm ci
npm run build

cd /var/www/tom-blog/admin-web
npm ci
npm run build
```

## 6. 启动后端

```bash
cd /var/www/tom-blog/server
npm ci --omit=dev
set -a
source .env.prod
set +a
pm2 start npm --name tom-blog-server -- run start -- --env=prod
pm2 save
pm2 startup
```

如果你修改了 `.env.prod`，重启：

```bash
cd /var/www/tom-blog/server
set -a
source .env.prod
set +a
pm2 restart tom-blog-server --update-env
```

## 7. 配置 Nginx

把下面配置保存为 `/etc/nginx/sites-available/tom-blog`，把 `example.com` 换成你的域名或公网 IP。

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/tom-blog/blog-web/dist;
    index index.html;

    location ^~ /api/ {
        proxy_pass http://127.0.0.1:7001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /admin/ {
        alias /var/www/tom-blog/admin-web/dist/;
        try_files $uri $uri/ /admin/index.html;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/tom-blog /etc/nginx/sites-enabled/tom-blog
sudo nginx -t
sudo systemctl reload nginx
```

访问：

- 博客首页：`http://你的域名或公网IP/`
- 管理后台：`http://你的域名或公网IP/admin/`

## 8. 后续更新

每次更新代码后：

```bash
cd /var/www/tom-blog
git pull

cd blog-web
npm ci
npm run build

cd ../admin-web
npm ci
npm run build

cd ../server
npm ci --omit=dev
set -a
source .env.prod
set +a
pm2 restart tom-blog-server --update-env
```

## 9. 常见检查

```bash
pm2 logs tom-blog-server
curl http://127.0.0.1:7001/api/profile
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

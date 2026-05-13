# 腾讯云轻量应用服务器从零部署 Tom Blog

本文记录从一台刚购买的腾讯云轻量应用服务器开始，到项目部署上线的完整流程。

当前项目结构：

- 博客前台：`blog-web`
- 后台管理：`admin-web`
- 后端服务：`server`
- 数据库：MySQL
- Web 服务器：Nginx
- Node 进程管理：PM2

最终访问地址示例：

- 博客首页：`http://tomchenxi.com/`
- 后台管理：`http://tomchenxi.com/admin/`
- 接口地址：`http://tomchenxi.com/api/profile`

如果暂时没有域名，也可以先用服务器公网 IP：

- `http://159.75.77.20/`
- `http://159.75.77.20/admin/`

## 1. 重装服务器系统

进入腾讯云控制台：

```text
轻量应用服务器 -> 服务器详情 -> 更多 -> 重装系统
```

推荐选择：

```text
系统镜像：Ubuntu
版本：Ubuntu 22.04 LTS
登录方式：自定义密码
用户名：ubuntu
```

注意：重装系统会清空服务器数据。如果服务器里已有重要数据，先备份。

## 2. 配置防火墙

进入轻量应用服务器的防火墙页面，放行：

| 用途 | 协议 | 端口 | 来源 |
| --- | --- | --- | --- |
| SSH 登录 | TCP | 22 | 全部 IPv4 |
| HTTP 网站 | TCP | 80 | 全部 IPv4 |
| HTTPS 网站 | TCP | 443 | 全部 IPv4 |

如果只是当前阶段先部署 HTTP，至少需要放行：

```text
22
80
```

## 3. SSH 登录服务器

在本机 Windows PowerShell 执行：

```powershell
ssh ubuntu@服务器公网IP
```

示例：

```powershell
ssh ubuntu@159.75.77.20
```

第一次连接可能会提示：

```text
Are you sure you want to continue connecting?
```

输入：

```text
yes
```

然后输入重装系统时设置的密码。

登录成功后检查系统：

```bash
cat /etc/os-release
```

看到 `Ubuntu 22.04` 即可。

## 4. 安装基础软件

```bash
sudo apt update
sudo apt install -y nginx mysql-server git curl unzip
```

检查 Nginx：

```bash
systemctl status nginx
```

如果看到：

```text
active (running)
```

说明 Nginx 正常。

状态页里按 `q` 退出。

## 5. 安装 Node.js 和 PM2

安装 Node.js 20：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

检查版本：

```bash
node -v
npm -v
```

安装 PM2：

```bash
sudo npm i -g pm2
pm2 -v
```

## 6. 初始化 MySQL 数据库

进入 MySQL：

```bash
sudo mysql
```

执行 SQL。把 `你的数据库强密码` 换成自己的密码：

```sql
CREATE DATABASE tom_blog_codex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tom_blog'@'127.0.0.1' IDENTIFIED BY '你的数据库强密码';
GRANT ALL PRIVILEGES ON tom_blog_codex.* TO 'tom_blog'@'127.0.0.1';
FLUSH PRIVILEGES;
EXIT;
```

测试数据库账号：

```bash
mysql -h127.0.0.1 -utom_blog -p tom_blog_codex
```

输入刚才设置的数据库密码。

进入后执行：

```sql
SHOW TABLES;
EXIT;
```

如果看到 `Empty set`，说明数据库连接正常。

## 7. 上传或下载项目代码

创建项目目录：

```bash
sudo mkdir -p /var/www/tom-blog
sudo chown -R ubuntu:ubuntu /var/www/tom-blog
cd /var/www/tom-blog
```

### 方式 A：GitHub clone

如果服务器访问 GitHub 稳定，可以使用：

```bash
git clone https://github.com/Yuchnxi/tom-blog-codex.git .
```

### 方式 B：GitHub zip 包

如果 `git clone` 出现 TLS、连接重置、超时等问题，使用 zip 包方式：

```bash
cd /var/www/tom-blog
wget -O tom-blog.zip https://github.com/Yuchnxi/tom-blog-codex/archive/refs/heads/main.zip
unzip tom-blog.zip
mv tom-blog-codex-main/* .
mv tom-blog-codex-main/.* . 2>/dev/null || true
rmdir tom-blog-codex-main
rm tom-blog.zip
```

检查目录：

```bash
ls
```

正常应该看到：

```text
admin-web  blog-web  docs  server
```

## 8. 构建前端

构建博客前台：

```bash
cd /var/www/tom-blog/blog-web
npm ci
npm run build
```

构建后台管理：

```bash
cd /var/www/tom-blog/admin-web
npm ci
npm run build
```

看到 `built in ...` 或 `✓ built` 即为成功。

Vite 提示 chunk 过大只是 warning，不影响部署。

## 9. 配置后端生产环境变量

进入后端目录：

```bash
cd /var/www/tom-blog/server
nano .env.prod
```

写入以下内容。把数据库密码、管理员密码改成自己的：

```env
EGG_SERVER_ENV=prod
PORT=7001
HOST=127.0.0.1
EGG_KEYS=tom_blog_2026_prod_keys_change_me
JWT_SECRET=tom_blog_2026_jwt_secret_change_me

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=tom_blog_codex
DB_USER=tom_blog
DB_PASSWORD=你的数据库密码

ADMIN_INITIAL_USERNAME=admin
ADMIN_INITIAL_PASSWORD=你的后台管理员初始密码

COS_SECRET_ID=
COS_SECRET_KEY=
COS_BUCKET=
COS_REGION=
COS_DOMAIN=
```

如果暂时不配置腾讯云 COS，图片会保存到服务器本地：

```text
/var/www/tom-blog/server/app/public/uploads
```

访问地址会是：

```text
/api/uploads/文件名
```

单台轻量服务器部署时可以先用本地上传。后续如果需要对象存储，再补充 COS 配置。

保存方式：

```text
Ctrl + O
回车
Ctrl + X
```

安装后端依赖：

```bash
npm ci --omit=dev
```

## 10. 启动后端服务

```bash
cd /var/www/tom-blog/server
set -a
source .env.prod
set +a
pm2 start npm --name tom-blog-server -- run start -- --env=prod
```

检查状态：

```bash
pm2 status
```

看到 `tom-blog-server` 为 `online` 即可。

测试接口：

```bash
curl http://127.0.0.1:7001/api/profile
```

如果返回 JSON，说明后端正常。

设置 PM2 开机自启：

```bash
pm2 save
pm2 startup
```

`pm2 startup` 可能会输出一条 `sudo env PATH=...` 的命令。按提示复制并执行一次。

## 11. 配置 Nginx

创建 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/tom-blog
```

如果只有 IP，先使用：

```nginx
server {
    listen 80;
    server_name 159.75.77.20;

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

如果已经有域名，例如 `tomchenxi.com`，使用：

```nginx
server {
    listen 80;
    server_name tomchenxi.com www.tomchenxi.com 159.75.77.20;

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
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/tom-blog /etc/nginx/sites-enabled/tom-blog
sudo nginx -t
sudo systemctl reload nginx
```

看到：

```text
syntax is ok
test is successful
```

说明 Nginx 配置正确。

## 12. 访问测试

如果使用公网 IP：

```text
http://159.75.77.20/
http://159.75.77.20/admin/
http://159.75.77.20/api/profile
```

如果使用域名：

```text
http://tomchenxi.com/
http://tomchenxi.com/admin/
http://tomchenxi.com/api/profile
```

后台管理员账号来自 `.env.prod`：

```text
ADMIN_INITIAL_USERNAME
ADMIN_INITIAL_PASSWORD
```

首次启动服务时，如果数据库里没有该管理员，系统会自动创建。

## 13. 域名解析

进入腾讯云 DNSPod 解析页面，为域名添加 A 记录：

| 主机记录 | 记录类型 | 记录值 |
| --- | --- | --- |
| @ | A | 服务器公网 IP |
| www | A | 服务器公网 IP |

示例：

```text
@    A    159.75.77.20
www  A    159.75.77.20
```

解析生效后，修改 Nginx：

```bash
sudo sed -i 's/server_name 159.75.77.20;/server_name tomchenxi.com www.tomchenxi.com 159.75.77.20;/' /etc/nginx/sites-available/tom-blog
sudo nginx -t
sudo systemctl reload nginx
```

检查：

```bash
sudo grep -n "server_name" /etc/nginx/sites-available/tom-blog
```

应看到：

```text
server_name tomchenxi.com www.tomchenxi.com 159.75.77.20;
```

## 14. 备案和 HTTPS

如果服务器在中国大陆，域名正式绑定访问通常需要 ICP 备案。

建议顺序：

```text
购买域名
域名实名认证
DNS 解析到服务器
提交 ICP 备案
备案通过
配置 HTTPS 证书
```

HTTPS 可以后续使用免费证书配置，不需要购买域名下单页里的付费 SSL 证书。

## 15. 常见问题

### SSH 连接超时

检查：

- 服务器是否运行中
- 防火墙是否放行 22
- 公网 IP 是否正确

本机测试：

```powershell
Test-NetConnection 服务器公网IP -Port 22
```

### Nginx 显示 Welcome to nginx

说明默认站点还在生效或配置未重载。

执行：

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/tom-blog /etc/nginx/sites-enabled/tom-blog
sudo nginx -t
sudo systemctl reload nginx
```

浏览器按 `Ctrl + F5` 强制刷新。

### git clone 失败

如果出现 TLS、超时、连接重置，可以使用 zip 包方式下载项目代码。

### sudo 在 Windows PowerShell 报错

说明当前不在服务器 SSH 里。

需要先登录：

```powershell
ssh ubuntu@服务器公网IP
```

看到类似下面提示符才是服务器：

```bash
ubuntu@VM-0-12-ubuntu:~$
```

### 只看到命令没有输出

部分 Linux 命令执行成功时没有输出，例如：

```bash
sudo systemctl reload nginx
```

可以用下面命令确认：

```bash
sudo nginx -t
systemctl status nginx
```

## 16. 后续更新代码

完整更新流程见：

```text
docs/online-update-guide.md
```

核心思路：

```text
本地提交并推送 GitHub
服务器下载最新代码到 tom-blog-new
构建前端
安装后端依赖
备份旧目录
切换新目录
重启 PM2 和 Nginx
```

'use strict';

const fs = require('fs');
const { pipeline } = require('stream/promises');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');
const Controller = require('egg').Controller;

class UploadController extends Controller {
  async image() {
    const { ctx, app } = this;
    const stream = await ctx.getFileStream();
    const { secretId, secretKey, bucket, region, domain } = app.config.cos;
    const extname = path.extname(stream.filename || '').toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${extname}`;

    if (!secretId || !secretKey || !bucket || !region) {
      const uploadDir = path.join(app.baseDir, 'app/public/uploads');
      await fs.promises.mkdir(uploadDir, { recursive: true });
      await pipeline(stream, fs.createWriteStream(path.join(uploadDir, filename)));
      ctx.success({
        url: `/api/uploads/${filename}`,
      });
      return;
    }

    const key = `images/${filename}`;
    const cos = new COS({
      SecretId: secretId,
      SecretKey: secretKey,
    });

    await cos.putObject({
      Bucket: bucket,
      Region: region,
      Key: key,
      Body: stream,
      ContentType: stream.mime,
    });

    ctx.success({
      url: domain ? `${domain.replace(/\/$/, '')}/${key}` : `https://${bucket}.cos.${region}.myqcloud.com/${key}`,
    });
  }

  async file() {
    const { ctx, app } = this;
    const filename = path.basename(ctx.params.filename || '');
    const filepath = path.join(app.baseDir, 'app/public/uploads', filename);

    if (!filename || !fs.existsSync(filepath)) {
      ctx.status = 404;
      return;
    }

    ctx.type = path.extname(filename);
    ctx.body = fs.createReadStream(filepath);
  }
}

module.exports = UploadController;

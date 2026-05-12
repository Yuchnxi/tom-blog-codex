'use strict';

const path = require('path');
const COS = require('cos-nodejs-sdk-v5');
const Controller = require('egg').Controller;

class UploadController extends Controller {
  async image() {
    const { ctx, app } = this;
    const stream = await ctx.getFileStream();
    const { secretId, secretKey, bucket, region, domain } = app.config.cos;

    if (!secretId || !secretKey || !bucket || !region) {
      ctx.fail('COS 配置不完整', 500);
      stream.resume();
      return;
    }

    const extname = path.extname(stream.filename || '').toLowerCase();
    const key = `images/${Date.now()}-${Math.random().toString(16).slice(2)}${extname}`;
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
}

module.exports = UploadController;

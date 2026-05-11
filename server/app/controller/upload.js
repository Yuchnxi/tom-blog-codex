'use strict';

const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const Controller = require('egg').Controller;

class UploadController extends Controller {
  async image() {
    const { ctx } = this;
    const stream = await ctx.getFileStream();
    const extname = path.extname(stream.filename || '').toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${extname}`;
    const uploadDir = path.join(this.app.baseDir, 'app/public/uploads');
    const target = path.join(uploadDir, filename);

    await fs.promises.mkdir(uploadDir, { recursive: true });
    await pipeline(stream, fs.createWriteStream(target));

    ctx.success({
      url: `/public/uploads/${filename}`,
    });
  }
}

module.exports = UploadController;

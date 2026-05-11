'use strict';

module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      ctx.app.emit('error', err, ctx);

      if (err.name === 'SequelizeUniqueConstraintError') {
        ctx.status = 400;
        ctx.body = {
          code: 1,
          message: '数据已存在',
          data: null,
        };
        return;
      }

      ctx.status = err.status || 500;
      ctx.body = {
        code: 500,
        message: ctx.status === 500 ? '服务器内部错误' : err.message,
        data: null,
      };
    }
  };
};

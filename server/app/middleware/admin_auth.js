'use strict';

module.exports = () => {
  return async function adminAuth(ctx, next) {
    const authorization = ctx.get('Authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = {
        code: 1,
        message: '请先登录',
        data: null,
      };
      return;
    }

    const token = authorization.replace('Bearer ', '');

    try {
      ctx.state.admin = ctx.app.jwt.verify(token, ctx.app.config.jwt.secret);
      await next();
    } catch (err) {
      ctx.status = 401;
      ctx.body = {
        code: 1,
        message: '登录已过期，请重新登录',
        data: null,
      };
    }
  };
};

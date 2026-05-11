'use strict';

module.exports = () => {
  return async function adminAuth(ctx, next) {
    const authorization = ctx.get('Authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      ctx.fail('请先登录', 401);
      return;
    }

    const token = authorization.replace('Bearer ', '');

    try {
      ctx.state.admin = ctx.app.jwt.verify(token, ctx.app.config.jwt.secret);
      await next();
    } catch (err) {
      ctx.fail('登录已过期，请重新登录', 401);
    }
  };
};

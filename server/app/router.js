'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const adminAuth = middleware.adminAuth();

  router.get('/', controller.home.index);
  router.post('/api/admin/login', controller.admin.login);
  router.get('/api/admin/info', adminAuth, controller.admin.info);
};

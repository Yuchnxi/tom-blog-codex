'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const adminAuth = middleware.adminAuth();

  router.get('/', controller.home.index);

  router.get('/api/profile', controller.profile.detail);

  router.post('/api/admin/login', controller.admin.login);
  router.get('/api/admin/info', adminAuth, controller.admin.info);
  router.put('/api/admin/password', adminAuth, controller.admin.changePassword);
  router.get('/api/admin/profile', adminAuth, controller.profile.detail);
  router.put('/api/admin/profile', adminAuth, controller.profile.update);

  router.get('/api/categories', controller.category.list);
  router.post('/api/admin/categories', adminAuth, controller.category.create);
  router.put('/api/admin/categories/:id', adminAuth, controller.category.update);
  router.delete('/api/admin/categories/:id', adminAuth, controller.category.remove);

  router.get('/api/tags', controller.tag.list);
  router.post('/api/admin/tags', adminAuth, controller.tag.create);
  router.put('/api/admin/tags/:id', adminAuth, controller.tag.update);
  router.delete('/api/admin/tags/:id', adminAuth, controller.tag.remove);

  router.get('/api/articles', controller.article.publicList);
  router.get('/api/articles/:id', controller.article.publicDetail);
  router.get('/api/admin/articles', adminAuth, controller.article.adminList);
  router.get('/api/admin/articles/:id', adminAuth, controller.article.adminDetail);
  router.post('/api/admin/articles', adminAuth, controller.article.create);
  router.put('/api/admin/articles/:id', adminAuth, controller.article.update);
  router.delete('/api/admin/articles/:id', adminAuth, controller.article.remove);
  router.patch('/api/admin/articles/:id/publish', adminAuth, controller.article.togglePublish);

  router.post('/api/admin/upload', adminAuth, controller.upload.image);
  router.get('/api/uploads/:filename', controller.upload.file);
};

import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '../utils/auth';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/index.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('../views/dashboard/index.vue'), meta: { title: '控制台概览' } },
      { path: 'articles', name: 'articles', component: () => import('../views/article/index.vue'), meta: { title: '文章管理' } },
      { path: 'categories', name: 'categories', component: () => import('../views/category/index.vue'), meta: { title: '分类管理' } },
      { path: 'tags', name: 'tags', component: () => import('../views/tag/index.vue'), meta: { title: '标签管理' } },
      { path: 'profile', name: 'profile', component: () => import('../views/profile/index.vue'), meta: { title: '个人信息' } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  if (!to.meta.public && !getToken()) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if (to.path === '/login' && getToken()) {
    return '/dashboard';
  }
  return true;
});

export default router;

import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ArticleListView from '../views/ArticleListView.vue';
import ArticleDetailView from '../views/ArticleDetailView.vue';
import AboutView from '../views/AboutView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/articles',
      name: 'articles',
      component: ArticleListView,
    },
    {
      path: '/articles/:id',
      name: 'article-detail',
      component: ArticleDetailView,
      props: true,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 84,
      };
    }

    return { top: 0 };
  },
});

export default router;

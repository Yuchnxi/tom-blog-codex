<template>
  <div class="site-shell">
    <header class="navbar">
      <div class="container nav-content">
        <RouterLink class="brand-logo" to="/">TOM <span>BLOG</span></RouterLink>
        <nav class="nav-links" aria-label="主导航">
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/articles">文章</RouterLink>
          <RouterLink to="/about">关于</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />

    <footer id="footer" class="footer">
      <div class="container">
        <div class="footer-brand">TOM <span>BLOG</span></div>
        <p class="footer-copy">记录技术、学习与思考，把零散经验沉淀成可回看的路标。</p>
        <a v-if="profile?.github" class="footer-link" :href="profile.github" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <div class="footer-copyright">© 2026 TOM BLOG. All rights reserved.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { getProfile } from './api/blog';

const profile = ref(null);

onMounted(async () => {
  try {
    profile.value = await getProfile();
  } catch {
    profile.value = null;
  }
});
</script>

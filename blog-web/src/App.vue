<template>
  <div class="site-shell">
    <header class="navbar">
      <div class="container nav-content">
        <RouterLink class="brand-logo" to="/">TOM <span>NOTES</span></RouterLink>
        <nav class="nav-links" aria-label="主导航">
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/articles">记录</RouterLink>
          <RouterLink to="/about">关于</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />

    <footer id="footer" class="footer">
      <div class="container">
        <div class="footer-brand">TOM <span>NOTES</span></div>
        <div class="footer-copyright">© 2026 TOM NOTES. All rights reserved.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

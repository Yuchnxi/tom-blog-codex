<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <RouterLink class="brand brand-serif" to="/dashboard">TOM <span>BLOG</span></RouterLink>

      <nav class="nav-menu">
        <RouterLink v-for="item in navItems" :key="item.path" class="nav-item" :to="item.path">
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="user-profile">
        <div class="avatar">{{ adminInitial }}</div>
        <div>
          <div style="font-weight: 650; color: #fff">{{ adminInfo?.username || 'admin' }}</div>
          <button class="logout-link" type="button" @click="logout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </button>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="page-header">
        <h1>{{ route.meta.title || '后台管理' }}</h1>
      </header>

      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { Collection, DataBoard, Folder, PriceTag, SwitchButton } from '@element-plus/icons-vue';
import { getAdminInfo } from '../api/admin';
import { removeToken } from '../utils/auth';

const route = useRoute();
const router = useRouter();
const adminInfo = ref(null);

const navItems = [
  { path: '/dashboard', label: '控制台概览', icon: DataBoard },
  { path: '/articles', label: '文章管理', icon: Collection },
  { path: '/categories', label: '分类管理', icon: Folder },
  { path: '/tags', label: '标签管理', icon: PriceTag },
];

const adminInitial = computed(() => (adminInfo.value?.username || 'A').slice(0, 1).toUpperCase());

function logout() {
  removeToken();
  router.push('/login');
}

onMounted(async () => {
  try {
    adminInfo.value = await getAdminInfo();
  } catch {
    adminInfo.value = null;
    removeToken();
    router.replace('/login');
  }
});
</script>

<template>
  <main class="articles-page">
    <section class="container page-hero">
      <p class="hero-kicker">Archive</p>
      <h1>文章归档</h1>
      <p>按分类和标签翻找所有公开文章，找到某段思考最初落笔的地方。</p>
    </section>

    <section class="container content-section">
      <div class="filter-panel">
        <div>
          <h2>全部文章</h2>
          <p>{{ filterSummary }}</p>
        </div>
        <button v-if="activeCategoryId || activeTagId" class="text-button" type="button" @click="resetFilters">
          清除筛选
        </button>
      </div>

      <div class="filter-row" aria-label="文章分类筛选">
        <button
          :class="['filter-chip', { active: !activeCategoryId }]"
          type="button"
          @click="selectCategory(null)"
        >
          全部分类
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          :class="['filter-chip', { active: activeCategoryId === category.id }]"
          type="button"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>

      <div v-if="tags.length" class="tag-row" aria-label="文章标签筛选">
        <button
          v-for="tag in tags"
          :key="tag.id"
          :class="['tag-chip', { active: activeTagId === tag.id }]"
          type="button"
          @click="selectTag(tag.id)"
        >
          #{{ tag.name }}
        </button>
      </div>

      <div v-if="loading" class="state-card">文章加载中...</div>
      <div v-else-if="errorMessage" class="state-card error-state">{{ errorMessage }}</div>
      <div v-else-if="!articles.length" class="state-card">这个筛选条件下暂时没有文章。</div>

      <div v-else class="post-grid">
        <RouterLink v-for="article in articles" :key="article.id" class="post-card" :to="`/articles/${article.id}`">
          <div v-if="article.cover" class="post-image" :style="{ backgroundImage: `url(${article.cover})` }"></div>
          <div v-else class="post-image post-image-placeholder">
            <span>TOM NOTES</span>
          </div>
          <div class="post-content">
            <div class="post-meta">
              <span class="post-category">{{ article.category?.name || '未分类' }}</span>
              <span>{{ formatDate(article.created_at || article.createdAt) }}</span>
            </div>
            <h3 class="post-title">{{ article.title }}</h3>
            <p class="post-excerpt">{{ createExcerpt(article) }}</p>
            <div v-if="article.tags?.length" class="card-tags">
              <span v-for="tag in article.tags.slice(0, 3)" :key="tag.id">#{{ tag.name }}</span>
            </div>
            <span class="read-more">阅读全文 <span aria-hidden="true">→</span></span>
          </div>
        </RouterLink>
      </div>

      <div v-if="pagination.total > pagination.pageSize" class="pagination-row">
        <button class="pager-button" type="button" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">
          上一页
        </button>
        <span>第 {{ pagination.page }} / {{ totalPages }} 页</span>
        <button
          class="pager-button"
          type="button"
          :disabled="pagination.page >= totalPages"
          @click="changePage(pagination.page + 1)"
        >
          下一页
        </button>
      </div>
    </section>

    <BackToTop />
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getArticles, getCategories, getTags } from '../api/blog';
import BackToTop from '../components/BackToTop.vue';
import { createExcerpt, formatDate } from '../utils/format';

const pageSize = 9;
const loading = ref(false);
const errorMessage = ref('');
const articles = ref([]);
const categories = ref([]);
const tags = ref([]);
const activeCategoryId = ref(null);
const activeTagId = ref(null);
const pagination = ref({
  page: 1,
  pageSize,
  total: 0,
});

const totalPages = computed(() => Math.max(Math.ceil(pagination.value.total / pagination.value.pageSize), 1));
const activeCategory = computed(() => categories.value.find((item) => item.id === activeCategoryId.value));
const activeTag = computed(() => tags.value.find((item) => item.id === activeTagId.value));
const filterSummary = computed(() => {
  const parts = [];
  if (activeCategory.value) {
    parts.push(`分类：${activeCategory.value.name}`);
  }
  if (activeTag.value) {
    parts.push(`标签：#${activeTag.value.name}`);
  }

  const prefix = parts.length ? parts.join(' / ') : '当前展示全部公开文章';
  return `${prefix}，共 ${pagination.value.total} 篇。`;
});

async function loadFilters() {
  try {
    const [categoryData, tagData] = await Promise.all([getCategories(), getTags()]);
    categories.value = categoryData || [];
    tags.value = tagData || [];
  } catch {
    categories.value = [];
    tags.value = [];
  }
}

async function loadArticles(page = 1) {
  loading.value = true;
  errorMessage.value = '';

  try {
    const data = await getArticles({
      page,
      pageSize,
      categoryId: activeCategoryId.value || undefined,
      tagId: activeTagId.value || undefined,
    });
    articles.value = data?.list || [];
    pagination.value = {
      page: data?.pagination?.page || page,
      pageSize: data?.pagination?.pageSize || pageSize,
      total: data?.pagination?.total || 0,
    };
  } catch {
    articles.value = [];
    pagination.value = { page: 1, pageSize, total: 0 };
    errorMessage.value = '文章加载失败，请稍后再试。';
  } finally {
    loading.value = false;
  }
}

function selectCategory(id) {
  activeCategoryId.value = id;
  loadArticles(1);
}

function selectTag(id) {
  activeTagId.value = activeTagId.value === id ? null : id;
  loadArticles(1);
}

function resetFilters() {
  activeCategoryId.value = null;
  activeTagId.value = null;
  loadArticles(1);
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) {
    return;
  }
  loadArticles(page);
}

onMounted(async () => {
  await loadFilters();
  await loadArticles();
});
</script>

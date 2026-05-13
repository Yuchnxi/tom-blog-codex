<template>
  <main class="home-main">
    <section class="hero container">
      <p class="hero-kicker">Personal Notes / Engineering Journal</p>
      <h1>所见所学，皆成一记。</h1>
      <p>
        写技术，也写生活；记所得，也记所感。
      </p>
    </section>

    <section id="articles" class="container content-section">
      <div class="filter-panel preview-panel">
        <div>
          <h2>最新记录</h2>
          <p>从近处翻起，回看一路写下的技术、生活与思考。</p>
        </div>
        <RouterLink class="solid-button" to="/articles">查看全部记录</RouterLink>
      </div>

      <div v-if="loading" class="state-card">文章加载中...</div>
      <div v-else-if="errorMessage" class="state-card error-state">{{ errorMessage }}</div>
      <div v-else-if="!articles.length" class="state-card">暂时还没有文章。</div>

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
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getArticles } from '../api/blog';
import { createExcerpt, formatDate } from '../utils/format';

const loading = ref(false);
const errorMessage = ref('');
const articles = ref([]);

async function loadLatestArticles() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const data = await getArticles({ page: 1, pageSize: 6 });
    articles.value = data?.list || [];
  } catch {
    articles.value = [];
    errorMessage.value = '文章加载失败，请稍后再试。';
  } finally {
    loading.value = false;
  }
}

onMounted(loadLatestArticles);
</script>

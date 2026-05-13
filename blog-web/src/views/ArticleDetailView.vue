<template>
  <main class="article-page">
    <section class="container">
      <RouterLink class="back-link" to="/">← 返回首页</RouterLink>

      <div v-if="loading" class="state-card">文章加载中...</div>
      <div v-else-if="errorMessage" class="state-card error-state">{{ errorMessage }}</div>
      <article v-else-if="article" class="article-shell">
        <header class="article-header">
          <div class="post-meta article-meta">
            <span class="post-category">{{ article.category?.name || '未分类' }}</span>
            <span>{{ formatDate(article.created_at || article.createdAt) }}</span>
          </div>
          <h1>{{ article.title }}</h1>
          <div v-if="article.tags?.length" class="card-tags article-tags">
            <span v-for="tag in article.tags" :key="tag.id">#{{ tag.name }}</span>
          </div>
        </header>

        <img v-if="article.cover" class="article-cover" :src="article.cover" :alt="article.title" />
        <div v-else class="article-cover placeholder-cover">TOM NOTES</div>

        <div class="markdown-body" v-html="renderedContent"></div>
      </article>
    </section>
  </main>
</template>

<script setup>
import MarkdownIt from 'markdown-it';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { getArticle } from '../api/blog';
import { formatDate } from '../utils/format';

const route = useRoute();
const loading = ref(false);
const errorMessage = ref('');
const article = ref(null);

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

const renderedContent = computed(() => md.render(article.value?.content || ''));

async function loadArticle() {
  loading.value = true;
  errorMessage.value = '';

  try {
    article.value = await getArticle(route.params.id);
  } catch {
    article.value = null;
    errorMessage.value = '文章不存在或暂时无法访问。';
  } finally {
    loading.value = false;
  }
}

onMounted(loadArticle);
</script>

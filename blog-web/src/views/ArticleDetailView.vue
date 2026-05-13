<template>
  <main class="reader-detail-page">
    <RouterLink class="reader-back" to="/">← 返回首页</RouterLink>

    <section v-if="loading" class="reader-state">文章加载中...</section>
    <section v-else-if="errorMessage" class="reader-state reader-error">{{ errorMessage }}</section>

    <article v-else-if="article" class="reader-card">
      <header class="reader-header">
        <div class="reader-heading">
          <h1>{{ article.title }}</h1>
          <p class="reader-meta">{{ categoryName }} · {{ articleDate }}</p>

          <div v-if="article.tags?.length" class="reader-tags" aria-label="文章标签">
            <span v-for="tag in article.tags" :key="tag.id">#{{ tag.name }}</span>
          </div>
        </div>

        <figure class="cover-frame">
          <img v-if="article.cover" :src="article.cover" :alt="article.title" />
          <div v-else class="cover-placeholder">TOM NOTES</div>
        </figure>
      </header>

      <div class="classic-divider" aria-hidden="true"></div>

      <section class="reader-body" v-html="renderedContent"></section>
    </article>
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
const categoryName = computed(() => article.value?.category?.name || '文章');
const articleDate = computed(() => formatDate(article.value?.created_at || article.value?.createdAt));

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

<style scoped>
.reader-detail-page {
  min-height: 100vh;
  padding: 52px 24px 88px;
  background-image:
    linear-gradient(rgba(247, 241, 229, 0.72), rgba(247, 241, 229, 0.82)),
    url("https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=80");
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
  color: #2f2a25;
}

.reader-back {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  margin: 0 0 18px clamp(0px, calc((100vw - 850px) / 2), 999px);
  color: #8a6b24;
  font-size: 15px;
  font-weight: 650;
  transition: color 0.22s ease, transform 0.22s ease;
}

.reader-back:hover {
  color: #5f4815;
  transform: translateX(-3px);
}

.reader-card,
.reader-state {
  max-width: 850px;
  margin: 0 auto;
  border: 1px solid rgba(160, 132, 78, 0.22);
  border-radius: 12px;
  background: #fdfbf7;
  box-shadow:
    0 28px 70px rgba(66, 48, 28, 0.18),
    0 3px 12px rgba(66, 48, 28, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.68);
}

.reader-card {
  padding: 40px 50px;
}

.reader-state {
  display: grid;
  min-height: 180px;
  place-items: center;
  color: #8a7556;
  font-size: 16px;
}

.reader-error {
  color: #b13a2e;
}

.reader-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 36px;
}

.reader-heading {
  min-width: 0;
}

.reader-heading h1 {
  margin: 0 0 14px;
  color: #201d1a;
  font-family: "Noto Serif SC", "Songti SC", SimSun, serif;
  font-size: clamp(34px, 4.8vw, 48px);
  font-weight: 700;
  line-height: 1.22;
  letter-spacing: 0.02em;
}

.reader-meta {
  margin: 0;
  color: #8a7556;
  font-family: "Noto Serif SC", "Songti SC", SimSun, serif;
  font-size: 14px;
  line-height: 1.7;
}

.reader-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.reader-tags span {
  border: 1px solid rgba(154, 118, 40, 0.24);
  border-radius: 999px;
  padding: 5px 11px;
  background: rgba(154, 118, 40, 0.08);
  color: #7a642d;
  font-size: 13px;
}

.cover-frame {
  width: clamp(220px, 30vw, 300px);
  aspect-ratio: 16 / 10;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 8px;
  margin: 0;
  background: #eee5d3;
  box-shadow: 0 16px 34px rgba(42, 31, 18, 0.24);
}

.cover-frame img,
.cover-placeholder {
  display: block;
  width: 100%;
  height: 100%;
}

.cover-frame img {
  object-fit: cover;
}

.cover-placeholder {
  display: grid;
  place-items: center;
  color: rgba(47, 42, 37, 0.36);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
}

.classic-divider {
  position: relative;
  height: 1px;
  margin: 38px 0 34px;
  background: linear-gradient(90deg, transparent, rgba(141, 108, 39, 0.32), transparent);
}

.classic-divider::before {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 74px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(154, 118, 40, 0.72), transparent);
  content: "";
  transform: translate(-50%, -50%);
}

.reader-body {
  color: #333;
  font-family: "Noto Serif SC", "Songti SC", SimSun, serif;
  font-size: 18px;
  line-height: 1.92;
}

.reader-body :deep(p) {
  margin: 0 0 1.5em;
  text-indent: 2em;
}

.reader-body :deep(p:last-child) {
  margin-bottom: 0;
}

.reader-body :deep(h1),
.reader-body :deep(h2),
.reader-body :deep(h3) {
  margin: 1.65em 0 0.75em;
  color: #211d18;
  font-family: "Noto Serif SC", "Songti SC", SimSun, serif;
  line-height: 1.35;
}

.reader-body :deep(blockquote) {
  margin: 1.5em 0;
  border-left: 3px solid #9a7628;
  padding: 8px 0 8px 18px;
  color: #715f48;
  background: rgba(154, 118, 40, 0.08);
}

.reader-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .reader-detail-page {
    padding: 24px 16px 56px;
  }

  .reader-back {
    margin-left: 0;
  }

  .reader-card {
    padding: 28px 22px 34px;
  }

  .reader-header {
    flex-direction: column;
    align-items: stretch;
    gap: 22px;
    text-align: center;
  }

  .cover-frame {
    order: -1;
    align-self: center;
    width: min(100%, 420px);
  }

  .reader-tags {
    justify-content: center;
  }

  .classic-divider {
    margin: 30px 0 26px;
  }

  .reader-body {
    font-size: 17px;
    line-height: 1.86;
  }

  .reader-body :deep(p) {
    text-indent: 0;
  }
}
</style>

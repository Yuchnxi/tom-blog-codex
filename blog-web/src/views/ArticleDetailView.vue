<template>
  <main class="reader-detail-page">
    <RouterLink class="reader-back" to="/">← 返回首页</RouterLink>

    <section v-if="loading" class="reader-state">文章加载中...</section>
    <section v-else-if="errorMessage" class="reader-state reader-error">{{ errorMessage }}</section>

    <div v-else-if="article" class="reader-layout">
      <aside v-if="articleHeadings.length" class="reader-toc" aria-label="文章目录">
        <div class="reader-toc-title">目录</div>
        <a
          v-for="heading in articleHeadings"
          :key="heading.id"
          :class="`level-${heading.level}`"
          :href="`#${heading.id}`"
        >
          {{ heading.text }}
        </a>
      </aside>

      <article class="reader-card">
      <header class="reader-header">
        <div class="reader-heading">
          <h1>{{ article.title }}</h1>
          <p class="reader-meta">{{ categoryName }} · {{ articleDate }}</p>

          <div v-if="article.tags?.length" class="reader-tags" aria-label="文章标签">
            <span v-for="tag in article.tags" :key="tag.id">#{{ tag.name }}</span>
          </div>
        </div>

        <figure class="cover-frame">
          <img
            v-if="article.cover"
            :src="article.cover"
            :alt="article.title"
            @click="openImagePreview($event.target)"
          />
          <div v-else class="cover-placeholder">TOM NOTES</div>
        </figure>
      </header>

      <div class="classic-divider" aria-hidden="true"></div>

      <section class="reader-body" v-html="renderedContent" @click="handleReaderBodyClick"></section>
      </article>
    </div>

    <ImagePreviewDialog
      :visible="previewVisible"
      :src="previewImage.src"
      :alt="previewImage.alt"
      @close="closeImagePreview"
    />

    <BackToTop right="max(28px, calc((100vw - 850px) / 2 - 84px))" />
  </main>
</template>

<script setup>
import MarkdownIt from 'markdown-it';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { getArticle } from '../api/blog';
import BackToTop from '../components/BackToTop.vue';
import ImagePreviewDialog from '../components/ImagePreviewDialog.vue';
import { formatDate } from '../utils/format';

const route = useRoute();
const loading = ref(false);
const errorMessage = ref('');
const article = ref(null);
const previewVisible = ref(false);
const previewImage = ref({
  src: '',
  alt: '',
});

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

function getHeadingText(token) {
  return token?.content?.trim() || '';
}

function createHeadingId(text, index, usedIds) {
  const raw = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}_-]/gu, '');
  const base = raw || `section-${index + 1}`;
  const count = usedIds.get(base) || 0;
  usedIds.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

function renderArticleMarkdown(content) {
  const tokens = md.parse(content || '', {});
  const usedIds = new Map();
  const headings = [];

  tokens.forEach((token, index) => {
    if (token.type !== 'heading_open') {
      return;
    }

    const level = Number(token.tag.slice(1));
    if (level < 2 || level > 6) {
      return;
    }

    const text = getHeadingText(tokens[index + 1]);
    if (!text) {
      return;
    }

    const id = createHeadingId(text, headings.length, usedIds);
    token.attrSet('id', id);
    token.attrJoin('class', 'reader-heading-anchor');
    headings.push({ id, level, text });
  });

  const html = md.renderer.render(tokens, md.options, {});
  const htmlWithCodeTools = html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (_match, attrs, code) => {
    return `<div class="code-block"><button class="code-copy" type="button" aria-label="复制代码">复制</button><pre><code${attrs}>${code}</code></pre></div>`;
  });

  return {
    html: htmlWithCodeTools,
    headings,
  };
}

const articleRenderResult = computed(() => renderArticleMarkdown(article.value?.content || ''));
const renderedContent = computed(() => articleRenderResult.value.html);
const articleHeadings = computed(() => articleRenderResult.value.headings);
const categoryName = computed(() => article.value?.category?.name || '文章');
const articleDate = computed(() => formatDate(article.value?.created_at || article.value?.createdAt));

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

async function handleCodeCopy(event) {
  const button = event.target.closest?.('.code-copy');
  if (!button) {
    return;
  }

  const code = button.closest('.code-block')?.querySelector('code');
  if (!code) {
    return;
  }

  try {
    await copyText(code.textContent || '');
    button.textContent = '已复制';
    button.classList.add('is-copied');
    window.setTimeout(() => {
      button.textContent = '复制';
      button.classList.remove('is-copied');
    }, 1200);
  } catch {
    button.textContent = '复制失败';
    window.setTimeout(() => {
      button.textContent = '复制';
    }, 1200);
  }
}

function openImagePreview(img) {
  previewImage.value = {
    src: img.currentSrc || img.src,
    alt: img.alt || article.value?.title || '图片预览',
  };
  previewVisible.value = true;
}

function closeImagePreview() {
  previewVisible.value = false;
}

function handleReaderBodyClick(event) {
  if (event.target.closest?.('.code-copy')) {
    handleCodeCopy(event);
    return;
  }

  if (event.target instanceof HTMLImageElement) {
    openImagePreview(event.target);
  }
}

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

onMounted(() => {
  loadArticle();
});
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

.reader-layout {
  position: relative;
  max-width: 850px;
  margin: 0 auto;
}

.reader-toc {
  position: fixed;
  top: 112px;
  right: calc(50vw + 455px);
  width: 210px;
  max-height: calc(100vh - 148px);
  overflow-x: hidden;
  overflow-y: auto;
  border-left: 2px solid rgba(154, 118, 40, 0.22);
  padding: 8px 0 8px 16px;
  color: #6f6252;
}

.reader-toc-title {
  margin-bottom: 10px;
  color: #6b5016;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
}

.reader-toc a {
  display: block;
  margin: 8px 0;
  overflow: hidden;
  color: inherit;
  font-size: 13px;
  line-height: 1.45;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  transition: color 0.18s ease, transform 0.18s ease;
}

.reader-toc a:hover {
  color: #8a6b24;
  transform: translateX(3px);
}

.reader-toc .level-3 {
  padding-left: 12px;
}

.reader-toc .level-4,
.reader-toc .level-5,
.reader-toc .level-6 {
  padding-left: 24px;
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
  cursor: zoom-in;
  object-fit: cover;
  transition: transform 0.18s ease, filter 0.18s ease;
}

.cover-frame img:hover {
  filter: brightness(1.03);
  transform: scale(1.015);
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

.reader-body :deep(.reader-heading-anchor) {
  scroll-margin-top: 96px;
}

.reader-body :deep(blockquote) {
  margin: 1.5em 0;
  border-left: 3px solid #9a7628;
  padding: 8px 0 8px 18px;
  color: #715f48;
  background: rgba(154, 118, 40, 0.08);
}

.reader-body :deep(blockquote p) {
  text-indent: 0;
}

.reader-body :deep(ul),
.reader-body :deep(ol) {
  margin: 0 0 1.5em;
  padding-left: 1.6em;
}

.reader-body :deep(li) {
  margin: 0.35em 0;
}

.reader-body :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 1.5em 0;
  overflow-x: auto;
  border-collapse: collapse;
  font-family: "Noto Serif SC", "Songti SC", SimSun, serif;
  font-size: 0.95em;
  line-height: 1.7;
}

.reader-body :deep(th),
.reader-body :deep(td) {
  border: 1px solid rgba(154, 118, 40, 0.22);
  padding: 10px 14px;
  text-align: left;
  vertical-align: top;
}

.reader-body :deep(th) {
  background: rgba(154, 118, 40, 0.1);
  color: #5d471a;
  font-weight: 700;
}

.reader-body :deep(tr:nth-child(even) td) {
  background: rgba(154, 118, 40, 0.045);
}

.reader-body :deep(code) {
  border: 1px solid rgba(154, 118, 40, 0.14);
  border-radius: 5px;
  padding: 2px 6px;
  background: rgba(79, 68, 52, 0.08);
  color: #7b3f22;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 0.9em;
}

.reader-body :deep(.code-block) {
  position: relative;
  margin: 1.5em 0;
}

.reader-body :deep(.code-copy) {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  border: 1px solid rgba(248, 242, 232, 0.2);
  border-radius: 999px;
  padding: 5px 10px;
  background: rgba(253, 251, 247, 0.12);
  color: rgba(248, 242, 232, 0.86);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}

.reader-body :deep(.code-copy:hover),
.reader-body :deep(.code-copy.is-copied) {
  border-color: rgba(214, 181, 91, 0.72);
  background: rgba(214, 181, 91, 0.22);
  color: #fff7df;
}

.reader-body :deep(pre) {
  overflow-x: auto;
  margin: 0;
  border: 1px solid rgba(52, 44, 33, 0.12);
  border-radius: 10px;
  padding: 42px 20px 18px;
  background: #2b2721;
  color: #f8f2e8;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.reader-body :deep(pre code) {
  display: block;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  font-size: 0.86em;
  line-height: 1.75;
  white-space: pre;
}

.reader-body :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1.5em auto;
  border-radius: 8px;
  cursor: zoom-in;
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}

.reader-body :deep(img:hover) {
  box-shadow: 0 14px 34px rgba(42, 31, 18, 0.18);
  transform: translateY(-1px);
}

.reader-body :deep(hr) {
  height: 1px;
  margin: 2em 0;
  border: 0;
  background: linear-gradient(90deg, transparent, rgba(141, 108, 39, 0.32), transparent);
}

@media (max-width: 1320px) {
  .reader-toc {
    position: static;
    width: auto;
    max-height: none;
    margin: 0 auto 16px;
    border: 1px solid rgba(160, 132, 78, 0.18);
    border-radius: 10px;
    padding: 14px 18px;
    background: rgba(253, 251, 247, 0.82);
    box-shadow: 0 12px 30px rgba(66, 48, 28, 0.08);
  }
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

  .reader-toc {
    padding: 12px 14px;
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

<template>
  <main class="articles-page">
    <section class="container content-section">
      <div class="article-page-layout">
        <aside class="article-sidebar" aria-label="文章筛选">
          <div class="article-sidebar-panel">
            <form class="site-search sidebar-search" role="search" @submit.prevent="handleSearch">
              <input
                v-model="searchKeyword"
                type="search"
                placeholder="搜索标题、正文、标签..."
                aria-label="站内搜索"
              />
            </form>

            <section class="sidebar-section" aria-label="分类列表">
              <h2 class="sidebar-title">
                <span class="sidebar-icon folder-icon" aria-hidden="true"></span>
                分类列表
              </h2>
              <button
                v-for="category in categories"
                :key="category.id"
                :class="['sidebar-category', { active: activeCategoryId === category.id }]"
                type="button"
                @click="selectCategory(category.id)"
              >
                <span>{{ category.name }}</span>
                <span>{{ category.article_count || 0 }}</span>
              </button>
            </section>

            <section v-if="tags.length" class="sidebar-section" aria-label="标签聚合">
              <h2 class="sidebar-title">
                <span class="sidebar-icon tag-icon" aria-hidden="true"></span>
                标签聚合
              </h2>
              <div class="sidebar-tags">
                <button
                  v-for="tag in tags"
                  :key="tag.id"
                  :class="['sidebar-tag', { active: activeTagId === tag.id }]"
                  type="button"
                  @click="selectTag(tag.id)"
                >
                  # {{ tag.name }}
                </button>
              </div>
            </section>

            <button v-if="searchKeyword || activeCategoryId || activeTagId" class="text-button sidebar-reset" type="button" @click="resetFilters">
              清除筛选
            </button>
          </div>
        </aside>

        <div class="article-main-column">
          <div v-if="loading" class="state-card">文章加载中...</div>
          <div v-else-if="errorMessage" class="state-card error-state">{{ errorMessage }}</div>
          <div v-else-if="!articles.length" class="state-card">没有找到匹配的文章。</div>

          <div v-else class="post-grid article-list">
            <RouterLink v-for="article in articles" :key="article.id" class="post-card" :to="getArticlePath(article)">
              <div v-if="article.cover" class="post-image" :style="{ backgroundImage: `url(${cosThumb(article.cover, { width: 400 })})` }"></div>
              <div v-else class="post-image post-image-placeholder">
                <span>TOM NOTES</span>
              </div>
              <div class="post-content">
                <div class="post-meta">
                  <span class="post-category">{{ article.category?.name || '未分类' }}</span>
                  <span>{{ formatDate(article.created_at || article.createdAt) }}</span>
                  <span class="post-views" aria-label="阅读量">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {{ article.view_count || 0 }}
                  </span>
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
        </div>

      </div>
    </section>

    <BackToTop />
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { getArticles, getCategories, getTags } from '../api/blog';
import BackToTop from '../components/BackToTop.vue';
import { cosThumb } from '../utils/cos';
import { createExcerpt, formatDate } from '../utils/format';

const pageSize = 9;
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const errorMessage = ref('');
const articles = ref([]);
const categories = ref([]);
const tags = ref([]);
const searchKeyword = ref('');
const activeCategoryId = ref(null);
const activeTagId = ref(null);
const pagination = ref({
  page: 1,
  pageSize,
  total: 0,
});

const totalPages = computed(() => Math.max(Math.ceil(pagination.value.total / pagination.value.pageSize), 1));

function getArticlePath(article) {
  return `/articles/${article.slug || article.id}`;
}

function getSingleQueryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function applyRouteQuery() {
  searchKeyword.value = String(getSingleQueryValue(route.query.q) || '').trim();
  activeCategoryId.value = parsePositiveNumber(getSingleQueryValue(route.query.categoryId));
  activeTagId.value = parsePositiveNumber(getSingleQueryValue(route.query.tagId));
  pagination.value.page = parsePositiveNumber(getSingleQueryValue(route.query.page)) || 1;
}

function buildRouteQuery(page = pagination.value.page) {
  const query = {};
  if (searchKeyword.value) {
    query.q = searchKeyword.value;
  }
  if (activeCategoryId.value) {
    query.categoryId = activeCategoryId.value;
  }
  if (activeTagId.value) {
    query.tagId = activeTagId.value;
  }
  if (page > 1) {
    query.page = page;
  }
  return query;
}

function syncRouteQuery(page = pagination.value.page) {
  router.replace({
    path: '/articles',
    query: buildRouteQuery(page),
  });
}

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
  syncRouteQuery(page);

  try {
    const data = await getArticles({
      page,
      pageSize,
      keyword: searchKeyword.value || undefined,
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

function handleSearch() {
  searchKeyword.value = searchKeyword.value.trim();
  loadArticles(1);
}

function clearKeyword() {
  searchKeyword.value = '';
  loadArticles(1);
}

function selectCategory(id) {
  activeCategoryId.value = activeCategoryId.value === id ? null : id;
  loadArticles(1);
}

function selectTag(id) {
  activeTagId.value = activeTagId.value === id ? null : id;
  loadArticles(1);
}

function resetFilters() {
  searchKeyword.value = '';
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
  applyRouteQuery();
  await loadFilters();
  await loadArticles(pagination.value.page);
});

watch(
  () => route.query,
  () => {
    applyRouteQuery();
  }
);
</script>

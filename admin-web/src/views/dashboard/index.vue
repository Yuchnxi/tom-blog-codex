<template>
  <section>
    <div class="stats-grid">
      <article v-for="item in stats" :key="item.label" class="stat-card">
        <span class="stat-label">{{ item.label }}</span>
        <strong class="stat-value">{{ item.value }}</strong>
        <span class="stat-icon">
          <component :is="item.icon" />
        </span>
      </article>
    </div>

    <div class="panel">
      <div class="table-toolbar">
        <div>
          <h3 style="margin: 0">最近文章</h3>
          <p style="margin: 6px 0 0; color: var(--text-muted)">按更新时间展示最新内容。</p>
        </div>
        <el-button text type="primary" @click="router.push('/articles')">查看全部</el-button>
      </div>

      <el-table v-loading="loading" :data="latestArticles">
        <el-table-column prop="title" label="文章标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="分类" width="300" align="center">
          <template #default="{ row }">{{ row.category?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="300" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', row.is_published ? 'status-published' : 'status-draft']">
              {{ row.is_published ? '已发布' : '草稿' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="300" align="center">
          <template #default="{ row }">{{ formatDate(row.updated_at || row.updatedAt) }}</template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Collection, DocumentChecked, EditPen, Folder, PriceTag } from '@element-plus/icons-vue';
import { getArticles } from '../../api/article';
import { getCategories } from '../../api/category';
import { getTags } from '../../api/tag';
import { formatDate } from '../../utils/format';

const router = useRouter();
const loading = ref(false);
const articles = ref([]);
const totalArticles = ref(0);
const categories = ref([]);
const tags = ref([]);

const latestArticles = computed(() => articles.value.slice(0, 6));
const publishedCount = computed(() => articles.value.filter((item) => item.is_published).length);
const draftCount = computed(() => articles.value.filter((item) => !item.is_published).length);
const stats = computed(() => [
  { label: '文章总数', value: totalArticles.value, icon: Collection },
  { label: '已发布', value: publishedCount.value, icon: DocumentChecked },
  { label: '草稿', value: draftCount.value, icon: EditPen },
  { label: '分类', value: categories.value.length, icon: Folder },
  { label: '标签', value: tags.value.length, icon: PriceTag },
]);

async function loadData() {
  loading.value = true;
  try {
    const [articleData, categoryData, tagData] = await Promise.all([
      getArticles({ page: 1, pageSize: 1000 }),
      getCategories(),
      getTags(),
    ]);
    articles.value = articleData.list || [];
    totalArticles.value = articleData.pagination?.total || 0;
    categories.value = categoryData || [];
    tags.value = tagData || [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

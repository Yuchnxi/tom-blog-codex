<template>
  <section>
    <div class="panel search-panel">
      <el-form :model="query" inline class="search-form">
        <el-form-item label="文章标题">
          <el-input v-model="query.keyword" placeholder="请输入文章标题" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="query.categoryId" placeholder="请选择分类" clearable>
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="query.tagId" placeholder="请选择标签" clearable>
            <el-option v-for="item in tags" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="action-row">
      <el-button type="primary" :icon="Plus" @click="openCreate">新增文章</el-button>
    </div>

    <div class="panel">
      <el-table v-loading="loading" :data="articles">
        <el-table-column prop="title" label="文章标题" min-width="260" show-overflow-tooltip />
        <el-table-column label="分类" width="200" align="center">
          <template #default="{ row }">{{ row.category?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="标签" min-width="200" align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag v-for="tag in row.tags" :key="tag.id" size="small" effect="plain">{{ tag.name }}</el-tag>
              <span v-if="!row.tags?.length">-</span>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="Boolean(row.is_published)"
              inline-prompt
              active-text="发布"
              inactive-text="草稿"
              @change="changePublish(row, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180" align="center">
          <template #default="{ row }">{{ formatDate(row.updated_at || row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button text type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="query.page"
          background
          layout="total, prev, pager, next"
          :page-size="query.pageSize"
          :total="pagination.total"
          @current-change="loadArticles"
        />
      </div>
    </div>

    <ArticleEditorDialog v-model="editorVisible" :article-id="editingArticleId" @saved="loadArticles" />
  </section>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Search } from '@element-plus/icons-vue';
import ArticleEditorDialog from './childComps/ArticleEditorDialog.vue';
import { deleteArticle, getArticles, toggleArticlePublish } from '../../api/article';
import { getCategories } from '../../api/category';
import { getTags } from '../../api/tag';
import { formatDate } from '../../utils/format';

const loading = ref(false);
const articles = ref([]);
const categories = ref([]);
const tags = ref([]);
const editorVisible = ref(false);
const editingArticleId = ref(null);
const pagination = reactive({ total: 0 });
const query = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  categoryId: '',
  tagId: '',
});

async function loadOptions() {
  const [categoryData, tagData] = await Promise.all([getCategories(), getTags()]);
  categories.value = categoryData || [];
  tags.value = tagData || [];
}

async function loadArticles() {
  loading.value = true;
  try {
    const data = await getArticles({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword || undefined,
      categoryId: query.categoryId || undefined,
      tagId: query.tagId || undefined,
    });
    articles.value = data.list || [];
    pagination.total = data.pagination?.total || 0;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  query.page = 1;
  loadArticles();
}

function handleReset() {
  query.keyword = '';
  query.categoryId = '';
  query.tagId = '';
  query.page = 1;
  loadArticles();
}

async function changePublish(row, value) {
  await toggleArticlePublish(row.id, value ? 1 : 0);
  row.is_published = value ? 1 : 0;
  ElMessage.success(value ? '已发布' : '已设为草稿');
}

function openCreate() {
  editingArticleId.value = null;
  editorVisible.value = true;
}

function openEdit(row) {
  editingArticleId.value = row.id;
  editorVisible.value = true;
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除「${row.title}」吗？`, '删除文章', { type: 'warning' });
  await deleteArticle(row.id);
  ElMessage.success('已删除');
  loadArticles();
}

watch(
  () => [query.categoryId, query.tagId],
  () => {
    handleSearch();
  }
);

onMounted(async () => {
  await loadOptions();
  await loadArticles();
});
</script>

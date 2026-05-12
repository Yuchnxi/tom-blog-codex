<template>
  <section>
    <div class="panel search-panel">
      <el-form :model="query" inline class="search-form">
        <el-form-item label="分类名称">
          <el-input v-model="query.name" placeholder="请输入分类名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="action-row">
      <el-button type="primary" :icon="Plus" @click="openDialog()">新增分类</el-button>
    </div>

    <div class="panel">
      <el-table v-loading="loading" :data="pagedItems">
        <el-table-column prop="name" label="分类名称" min-width="240" />
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="{ row }">{{ formatDate(row.created_at || row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="更新时间" width="180" align="center">
          <template #default="{ row }">{{ formatDate(row.updated_at || row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button text type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          background
          layout="total, prev, pager, next"
          :total="filteredItems.length"
        />
      </div>
    </div>

    <CategoryFormDialog v-model="dialogVisible" :row="editingRow" @submit="submitForm" />
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh, Search } from '@element-plus/icons-vue';
import CategoryFormDialog from './childComps/CategoryFormDialog.vue';
import { createCategory, deleteCategory, getCategories, updateCategory } from '../../api/category';
import { formatDate } from '../../utils/format';

const loading = ref(false);
const items = ref([]);
const dialogVisible = ref(false);
const editingRow = ref(null);
const query = reactive({ name: '' });
const pagination = reactive({ page: 1, pageSize: 10 });

const filteredItems = computed(() => {
  const keyword = query.name.trim();
  if (!keyword) return items.value;
  return items.value.filter((item) => item.name.includes(keyword));
});

const pagedItems = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize;
  return filteredItems.value.slice(start, start + pagination.pageSize);
});

async function loadItems() {
  loading.value = true;
  try {
    items.value = await getCategories();
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.page = 1;
}

function handleReset() {
  query.name = '';
  pagination.page = 1;
}

function openDialog(row = null) {
  editingRow.value = row;
  dialogVisible.value = true;
}

async function submitForm(payload) {
  if (payload.id) {
    await updateCategory(payload.id, { name: payload.name });
    ElMessage.success('分类已更新');
  } else {
    await createCategory({ name: payload.name });
    ElMessage.success('分类已新增');
  }
  loadItems();
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '删除分类', { type: 'warning' });
  await deleteCategory(row.id);
  ElMessage.success('分类已删除');
  loadItems();
}

onMounted(loadItems);
</script>

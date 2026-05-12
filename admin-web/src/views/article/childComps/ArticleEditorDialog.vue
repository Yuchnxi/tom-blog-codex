<template>
  <el-dialog
    v-model="visible"
    class="article-editor-dialog"
    :title="articleId ? '编辑文章' : '新增文章'"
    width="1120px"
    top="5vh"
    destroy-on-close
    :close-on-click-modal="false"
    @open="init"
  >
    <el-form
      ref="formRef"
      v-loading="loading"
      class="article-form"
      :model="form"
      :rules="rules"
      label-width="86px"
    >
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="form.title" maxlength="200" show-word-limit placeholder="请输入文章标题" />
      </el-form-item>

      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="请选择分类">
          <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="封面图">
        <div class="cover-inline">
          <el-input v-model="form.cover" placeholder="图片 URL，可上传后获取" />
          <el-upload :show-file-list="false" :http-request="handleUpload" accept="image/*">
            <el-button :icon="Upload" :loading="uploading">上传</el-button>
          </el-upload>
        </div>
        <img v-if="form.cover" class="cover-preview" :src="form.cover" alt="文章封面" />
      </el-form-item>

      <el-form-item label="标签">
        <el-select v-model="form.tagIds" multiple placeholder="请选择标签">
          <el-option v-for="item in tags" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>

      <el-form-item label="正文" prop="content">
        <MdEditor
          v-model="form.content"
          class="article-md-editor"
          language="zh-CN"
          preview-theme="github"
          code-theme="github"
          :toolbars-exclude="['github']"
          @on-upload-img="handleMarkdownUpload"
        />
      </el-form-item>

      <el-form-item label="发布">
        <el-switch v-model="form.isPublished" active-text="发布" inactive-text="草稿" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button :loading="saving" @click="save(false)">保存为草稿</el-button>
      <el-button type="primary" :loading="saving" @click="save(true)">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
import { MdEditor } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { createArticle, getArticle, updateArticle, uploadImage } from '../../../api/article';
import { getCategories } from '../../../api/category';
import { getTags } from '../../../api/tag';
import { toArticlePayload } from '../../../utils/format';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  articleId: { type: [Number, String], default: null },
});

const emit = defineEmits(['update:modelValue', 'saved']);
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const formRef = ref(null);
const loading = ref(false);
const saving = ref(false);
const uploading = ref(false);
const categories = ref([]);
const tags = ref([]);

const form = reactive({
  title: '',
  cover: '',
  content: '',
  categoryId: '',
  tagIds: [],
  isPublished: false,
});

const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入正文', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
};

function resetForm() {
  form.title = '';
  form.cover = '';
  form.content = '';
  form.categoryId = '';
  form.tagIds = [];
  form.isPublished = false;
  formRef.value?.clearValidate();
}

async function init() {
  resetForm();
  loading.value = true;
  try {
    const [categoryData, tagData] = await Promise.all([getCategories(), getTags()]);
    categories.value = categoryData || [];
    tags.value = tagData || [];

    if (props.articleId) {
      const article = await getArticle(props.articleId);
      form.title = article.title || '';
      form.cover = article.cover || '';
      form.content = article.content || '';
      form.categoryId = article.category_id || article.categoryId || article.category?.id || '';
      form.tagIds = (article.tags || []).map((item) => item.id);
      form.isPublished = Boolean(article.is_published);
    }
  } finally {
    loading.value = false;
  }
}

async function handleMarkdownUpload(files, callback) {
  try {
    const urls = [];
    for (const file of files) {
      const data = await uploadImage(file);
      urls.push(data.url);
    }
    callback(urls);
    ElMessage.success('图片上传成功');
  } catch {
    ElMessage.error('图片上传失败');
  }
}

async function handleUpload(option) {
  uploading.value = true;
  try {
    const data = await uploadImage(option.file);
    form.cover = data.url;
    ElMessage.success('封面上传成功');
    option.onSuccess(data);
  } catch (error) {
    option.onError(error);
  } finally {
    uploading.value = false;
  }
}

async function save(keepStatus) {
  await formRef.value?.validate();
  saving.value = true;
  const oldStatus = form.isPublished;
  if (!keepStatus) form.isPublished = false;
  try {
    const payload = toArticlePayload(form);
    if (props.articleId) {
      await updateArticle(props.articleId, payload);
    } else {
      await createArticle(payload);
    }
    ElMessage.success('保存成功');
    visible.value = false;
    emit('saved');
  } finally {
    form.isPublished = oldStatus;
    saving.value = false;
  }
}
</script>

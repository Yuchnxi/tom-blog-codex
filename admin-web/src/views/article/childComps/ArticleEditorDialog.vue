<template>
  <el-dialog
    v-model="visible"
    class="article-editor-dialog"
    :title="articleId ? '编辑文章' : '新增文章'"
    width="min(1440px, 96vw)"
    top="4vh"
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
      label-width="76px"
    >
      <div class="article-editor-layout">
        <aside class="article-config-panel" aria-label="文章配置">
          <section class="cover-panel" aria-label="封面图">
            <div class="panel-title">封面图</div>
            <el-upload
              class="cover-uploader"
              :show-file-list="false"
              :http-request="handleUpload"
              :before-upload="beforeCoverUpload"
              accept="image/*"
            >
              <div v-if="form.cover" class="cover-preview-card">
                <img :src="cosThumb(form.cover, { width: 400 })" alt="文章封面" />
                <span class="cover-preview-mask">{{ uploading ? '上传中...' : '重新上传' }}</span>
              </div>
              <div v-else class="cover-upload-card">
                <el-icon class="cover-upload-icon"><Upload /></el-icon>
                <span>{{ uploading ? '上传中...' : '上传封面' }}</span>
              </div>
            </el-upload>
            <el-input v-model="form.cover" clearable placeholder="图片 URL，可手动粘贴" />
          </section>

          <section class="article-meta-panel" aria-label="文章信息">
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="form.title"
                maxlength="200"
                show-word-limit
                placeholder="请输入文章标题"
                @blur="fillSlugFromTitle"
                @input="fillSlugFromTitle"
              />
            </el-form-item>

            <el-form-item label="Slug" prop="slug">
              <el-input
                v-model="form.slug"
                maxlength="160"
                show-word-limit
                placeholder="仅支持小写英文、数字和短横线"
                @input="handleSlugInput"
              />
            </el-form-item>

            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="form.categoryId" placeholder="请选择分类">
                <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="标签">
              <el-select v-model="form.tagIds" multiple placeholder="请选择标签">
                <el-option v-for="item in tags" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>

            <el-form-item label="发布">
              <el-switch v-model="form.isPublished" active-text="发布" inactive-text="草稿" />
            </el-form-item>
          </section>
        </aside>

        <section class="article-content-panel" aria-label="正文编辑">
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
        </section>
      </div>
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
import { cosThumb } from '../../../utils/cos';
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
  slug: '',
  cover: '',
  content: '',
  categoryId: '',
  tagIds: [],
  isPublished: false,
});

const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  slug: [
    {
      pattern: /^(?!\d+$)[a-z0-9]+(?:-[a-z0-9]+)*$/,
      message: '仅支持小写英文、数字和短横线',
      trigger: 'blur',
    },
  ],
  content: [{ required: true, message: '请输入正文', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
};
const slugTouched = ref(false);

function normalizeSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 160);
}

function resetForm() {
  form.title = '';
  form.slug = '';
  form.cover = '';
  form.content = '';
  form.categoryId = '';
  form.tagIds = [];
  form.isPublished = false;
  slugTouched.value = false;
  formRef.value?.clearValidate();
}

function fillSlugFromTitle() {
  if (slugTouched.value || props.articleId) {
    return;
  }

  form.slug = normalizeSlug(form.title);
}

function handleSlugInput(value) {
  slugTouched.value = true;
  form.slug = normalizeSlug(value);
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
      form.slug = article.slug || '';
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

function beforeCoverUpload(file) {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件');
    return false;
  }

  return true;
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

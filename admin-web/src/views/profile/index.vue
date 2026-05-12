<template>
  <section>
    <el-form
      ref="formRef"
      v-loading="loading"
      class="panel profile-panel"
      :model="form"
      :rules="rules"
      label-width="96px"
    >
      <div class="profile-preview">
        <el-upload
          class="profile-avatar-upload"
          :show-file-list="false"
          :http-request="handleAvatarUpload"
          accept="image/*"
        >
          <div class="profile-avatar">
            <img v-if="form.avatar" :src="form.avatar" alt="个人头像" />
            <span v-else>{{ avatarText }}</span>
            <div class="profile-avatar-mask">
              <el-icon><Upload /></el-icon>
              <span>{{ uploading ? '上传中' : '上传头像' }}</span>
            </div>
          </div>
        </el-upload>

        <div class="profile-preview-info">
          <el-form-item prop="nickname" class="profile-name-item" label-width="0">
            <el-input
              v-model="form.nickname"
              class="profile-name-input"
              maxlength="50"
              placeholder="未设置昵称"
            />
          </el-form-item>
          <p>{{ form.bio || '写一句简短介绍，让访客更快认识你。' }}</p>
        </div>
      </div>

      <div class="profile-form">
        <el-form-item label="一句话简介">
          <el-input v-model="form.bio" maxlength="200" show-word-limit placeholder="例如：记录技术、生活和长期主义" />
        </el-form-item>

        <el-form-item label="详细介绍">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="8"
            maxlength="2000"
            show-word-limit
            placeholder="写一段更完整的个人介绍，后续展示页会使用这里的内容。"
          />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="form.email" maxlength="100" placeholder="name@example.com" clearable />
        </el-form-item>

        <el-form-item label="GitHub">
          <el-input v-model="form.github" maxlength="500" placeholder="https://github.com/yourname" clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Check" :loading="saving" @click="saveProfile">保存个人信息</el-button>
          <el-button :icon="Refresh" @click="loadProfile">重置</el-button>
        </el-form-item>
      </div>
    </el-form>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Check, Refresh, Upload } from '@element-plus/icons-vue';
import { uploadImage } from '../../api/article';
import { getProfile, updateProfile } from '../../api/profile';

const formRef = ref(null);
const loading = ref(false);
const saving = ref(false);
const uploading = ref(false);

const form = reactive({
  avatar: '',
  nickname: '',
  bio: '',
  description: '',
  email: '',
  github: '',
});

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
};

const avatarText = computed(() => (form.nickname || 'T').slice(0, 1).toUpperCase());

function fillForm(data = {}) {
  form.avatar = data.avatar || '';
  form.nickname = data.nickname || '';
  form.bio = data.bio || '';
  form.description = data.description || '';
  form.email = data.email || '';
  form.github = data.github || '';
}

async function loadProfile() {
  loading.value = true;
  try {
    fillForm(await getProfile());
    formRef.value?.clearValidate();
  } finally {
    loading.value = false;
  }
}

async function handleAvatarUpload(option) {
  uploading.value = true;
  try {
    const data = await uploadImage(option.file);
    form.avatar = data.url;
    ElMessage.success('头像上传成功');
    option.onSuccess(data);
  } catch (error) {
    option.onError(error);
  } finally {
    uploading.value = false;
  }
}

async function saveProfile() {
  await formRef.value?.validate();
  saving.value = true;
  try {
    const data = await updateProfile({
      avatar: form.avatar,
      nickname: form.nickname.trim(),
      bio: form.bio,
      description: form.description,
      email: form.email,
      github: form.github,
    });
    fillForm(data);
    window.dispatchEvent(new CustomEvent('profile-updated'));
    ElMessage.success('个人信息已保存');
  } finally {
    saving.value = false;
  }
}

onMounted(loadProfile);
</script>

<template>
  <main class="login-page">
    <section class="login-visual">
      <h1 class="brand-serif">TOM <span>BLOG</span></h1>
      <p class="login-quote">“记录思考的痕迹，在数字荒野里建立自己的精神锚点。”</p>
    </section>

    <section class="login-panel">
      <div class="login-form-wrap">
        <div class="mobile-brand brand-serif">TOM <span>BLOG</span></div>
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p>登录后继续管理你的文章、分类和标签。</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @submit.prevent="submit">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" placeholder="admin" :prefix-icon="User" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="submit"
            />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="remember">保持登录状态</el-checkbox>
          </el-form-item>
          <el-button class="login-button" type="primary" :loading="loading" @click="submit">
            登录
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </el-form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowRight, Lock, User } from '@element-plus/icons-vue';
import { login } from '../../api/admin';
import { setToken } from '../../utils/auth';

const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const loading = ref(false);
const remember = ref(true);
const form = reactive({
  username: 'admin',
  password: '',
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

async function submit() {
  await formRef.value?.validate();
  loading.value = true;
  try {
    const data = await login(form);
    setToken(data.token);
    router.push(route.query.redirect || '/dashboard');
  } finally {
    loading.value = false;
  }
}
</script>

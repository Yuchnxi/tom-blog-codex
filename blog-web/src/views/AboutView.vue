<template>
  <main class="about-page">
    <section class="container about-shell">
      <div v-if="loading" class="state-card">个人信息加载中...</div>
      <div v-else-if="errorMessage" class="state-card error-state">{{ errorMessage }}</div>

      <template v-else>
        <section class="about-hero">
          <div class="about-intro">
            <p class="hero-kicker">About the Author</p>
            <h1>{{ displayProfile.nickname }}</h1>
            <p class="about-bio">{{ displayProfile.bio }}</p>
            <p class="about-description">{{ displayProfile.description }}</p>

            <div class="about-actions">
              <a v-if="displayProfile.email" class="text-button about-link" :href="`mailto:${displayProfile.email}`">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                发送邮件
              </a>
              <a
                v-if="displayProfile.github"
                class="text-button about-link"
                :href="displayProfile.github"
                target="_blank"
                rel="noreferrer"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7.3a5.7 5.7 0 0 0-1.6-4 5.3 5.3 0 0 0-.1-4s-1.3-.4-4.1 1.5a14.2 14.2 0 0 0-7.4 0C4.8-1.2 3.5-.8 3.5-.8a5.3 5.3 0 0 0-.1 4 5.7 5.7 0 0 0-1.6 4c0 5.7 3.5 6.9 6.8 7.3a4.8 4.8 0 0 0-1 3.5v4" />
                  <path d="M9 18c-4.5 2-5-2-7-2" />
                </svg>
                GitHub
              </a>
              <RouterLink class="text-button about-link" to="/articles">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
                </svg>
                阅读文章
              </RouterLink>
            </div>
          </div>

          <aside class="about-portrait" aria-label="作者头像">
            <div class="about-avatar">
              <img v-if="displayProfile.avatar" :src="displayProfile.avatar" :alt="displayProfile.nickname" />
              <span v-else>{{ profileInitial }}</span>
            </div>
            <div class="about-signature">
              <span>Writing as practice</span>
              <strong>TOM BLOG</strong>
            </div>
          </aside>
        </section>

        <section class="about-manifesto" aria-label="写作理念">
          <span>当前状态</span>
          <p>保持记录，持续复盘，把看似零散的工程经验整理成下一次可以复用的判断。</p>
        </section>

        <section class="about-topics" aria-label="写作方向">
          <article v-for="topic in writingTopics" :key="topic.title" class="topic-card">
            <span>{{ topic.index }}</span>
            <h2>{{ topic.title }}</h2>
            <p>{{ topic.description }}</p>
          </article>
        </section>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getProfile } from '../api/blog';

const fallbackProfile = {
  avatar: '',
  nickname: 'TOM BLOG',
  bio: '记录技术、学习与思考。',
  description: '这里是个人博客的展示页。文章会沉淀日常开发里的问题、复盘和灵感，也会留下一些关于学习路径和项目实践的笔记。',
  email: '',
  github: '',
};

const writingTopics = [
  {
    index: '01',
    title: '技术实践',
    description: '记录真实项目里的架构选择、前后端实现细节，以及那些踩过之后才真正理解的问题。',
  },
  {
    index: '02',
    title: '学习笔记',
    description: '把新知识拆成能复用的小块，保留关键概念、代码片段和后续继续深入的线索。',
  },
  {
    index: '03',
    title: '项目复盘',
    description: '复盘需求、交互、工程取舍和上线后的反馈，让每次交付都为下一次判断增加一点依据。',
  },
];

const loading = ref(false);
const errorMessage = ref('');
const profile = ref(null);

const displayProfile = computed(() => ({
  avatar: profile.value?.avatar || fallbackProfile.avatar,
  nickname: profile.value?.nickname || fallbackProfile.nickname,
  bio: profile.value?.bio || fallbackProfile.bio,
  description: profile.value?.description || fallbackProfile.description,
  email: profile.value?.email || fallbackProfile.email,
  github: profile.value?.github || fallbackProfile.github,
}));

const profileInitial = computed(() => displayProfile.value.nickname.slice(0, 1).toUpperCase());

async function loadProfile() {
  loading.value = true;
  errorMessage.value = '';

  try {
    profile.value = await getProfile();
  } catch {
    profile.value = null;
    errorMessage.value = '个人信息加载失败，请稍后再试。';
  } finally {
    loading.value = false;
  }
}

onMounted(loadProfile);
</script>

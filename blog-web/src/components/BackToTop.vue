<template>
  <button
    class="back-to-top"
    :class="{ 'is-visible': isVisible }"
    :style="{ '--back-to-top-right': right }"
    type="button"
    aria-label="返回顶部"
    :aria-hidden="!isVisible"
    :tabindex="isVisible ? 0 : -1"
    @click="scrollToTop"
  >
    ↑
  </button>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  threshold: {
    type: Number,
    default: 420,
  },
  right: {
    type: String,
    default: '34px',
  },
});

const isVisible = ref(false);

function updateVisible() {
  isVisible.value = window.scrollY > props.threshold;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

onMounted(() => {
  updateVisible();
  window.addEventListener('scroll', updateVisible, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateVisible);
});
</script>

<style scoped>
.back-to-top {
  position: fixed;
  right: var(--back-to-top-right);
  bottom: 34px;
  z-index: 12;
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid rgba(154, 118, 40, 0.32);
  border-radius: 50%;
  background: rgba(253, 251, 247, 0.86);
  box-shadow: 0 12px 30px rgba(66, 48, 28, 0.16);
  color: #7a5a18;
  cursor: pointer;
  font-size: 24px;
  font-weight: 700;
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px);
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}

.back-to-top.is-visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.back-to-top:hover {
  border-color: rgba(154, 118, 40, 0.58);
  background: #fdfbf7;
  color: #4f3a0d;
}

@media (max-width: 768px) {
  .back-to-top {
    right: 18px;
    bottom: 22px;
    width: 44px;
    height: 44px;
    font-size: 22px;
  }
}
</style>

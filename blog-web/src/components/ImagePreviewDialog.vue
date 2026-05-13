<template>
  <Teleport to="body">
    <Transition name="image-preview">
      <div
        v-if="visible"
        class="image-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="图片预览"
        @click="emit('close')"
      >
        <button class="image-preview-close" type="button" aria-label="关闭图片预览" @click.stop="emit('close')">
          ×
        </button>

        <figure class="image-preview-frame" @click.stop>
          <img :src="src" :alt="alt || '图片预览'" />
        </figure>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close']);

function handleKeydown(event) {
  if (event.key === 'Escape') {
    emit('close');
  }
}

watch(
  () => props.visible,
  (visible) => {
    document.body.style.overflow = visible ? 'hidden' : '';

    if (visible) {
      window.addEventListener('keydown', handleKeydown);
    } else {
      window.removeEventListener('keydown', handleKeydown);
    }
  }
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.image-preview-dialog {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 32px;
  background:
    radial-gradient(circle at center, rgba(253, 251, 247, 0.12), transparent 38%),
    rgba(20, 18, 15, 0.82);
  backdrop-filter: blur(8px);
}

.image-preview-frame {
  max-width: min(1120px, 92vw);
  max-height: 86vh;
  margin: 0;
  border: 1px solid rgba(230, 204, 143, 0.28);
  border-radius: 12px;
  padding: 10px;
  background: rgba(253, 251, 247, 0.12);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
}

.image-preview-frame img {
  display: block;
  max-width: 100%;
  max-height: calc(86vh - 22px);
  border-radius: 8px;
  object-fit: contain;
}

.image-preview-close {
  position: fixed;
  top: 22px;
  right: 26px;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(230, 204, 143, 0.34);
  border-radius: 999px;
  background: rgba(253, 251, 247, 0.12);
  color: #fff7df;
  font-size: 28px;
  line-height: 38px;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;
}

.image-preview-close:hover {
  background: rgba(214, 181, 91, 0.24);
  transform: scale(1.04);
}

.image-preview-enter-active,
.image-preview-leave-active {
  transition: opacity 0.18s ease;
}

.image-preview-enter-active .image-preview-frame,
.image-preview-leave-active .image-preview-frame {
  transition: transform 0.18s ease;
}

.image-preview-enter-from,
.image-preview-leave-to {
  opacity: 0;
}

.image-preview-enter-from .image-preview-frame,
.image-preview-leave-to .image-preview-frame {
  transform: scale(0.96);
}

@media (max-width: 768px) {
  .image-preview-dialog {
    padding: 18px;
  }

  .image-preview-close {
    top: 14px;
    right: 14px;
  }
}
</style>

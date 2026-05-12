<template>
  <el-dialog v-model="visible" :title="form.id ? '编辑分类' : '新增分类'" width="420px" destroy-on-close @open="init">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="86px">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" maxlength="50" show-word-limit placeholder="请输入分类名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  row: { type: Object, default: null },
});

const emit = defineEmits(['update:modelValue', 'submit']);
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
const formRef = ref(null);
const form = reactive({ id: null, name: '' });
const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
};

function init() {
  form.id = props.row?.id || null;
  form.name = props.row?.name || '';
  formRef.value?.clearValidate();
}

async function submit() {
  await formRef.value?.validate();
  emit('submit', { id: form.id, name: form.name.trim() });
  visible.value = false;
}
</script>

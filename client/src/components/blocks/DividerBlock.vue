<template>
  <hr class="divider-block" @click="onClick" />
</template>

<script setup>
const emit = defineEmits(['delete'])

function onClick() {
  // Click to select/delete
}
</script>

<style scoped>
.divider-block {
  margin: var(--space-4) 0;
  border: none;
  border-top: 1px solid var(--border-divider);
  cursor: default;
}
</style>

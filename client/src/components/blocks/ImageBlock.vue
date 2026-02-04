<template>
  <div class="image-block">
    <img v-if="block.url" :src="block.url" :alt="block.caption || ''" />
    <div v-else class="image-placeholder">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <input 
        type="text" 
        placeholder="Paste image URL..." 
        @keyup.enter="onUrlEnter"
      />
    </div>
    <div
      v-if="block.url"
      class="image-caption"
      contenteditable="true"
      @input="onCaptionInput"
      v-text="block.caption"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  block: Object,
  isSelected: Boolean
})

const emit = defineEmits(['update', 'delete'])

function onUrlEnter(e) {
  emit('update', { url: e.target.value })
}

function onCaptionInput(e) {
  emit('update', { caption: e.target.innerText })
}
</script>

<style scoped>
.image-block {
  margin: var(--space-2) 0;
}

.image-block img {
  max-width: 100%;
  border-radius: var(--radius-md);
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8);
  background: var(--bg-secondary);
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-md);
}

.image-placeholder svg {
  width: 48px;
  height: 48px;
  color: var(--text-muted);
}

.image-placeholder input {
  width: 100%;
  max-width: 300px;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: 14px;
  text-align: center;
}

.image-caption {
  margin-top: var(--space-2);
  padding: var(--space-1);
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  outline: none;
}

.image-caption:empty::before {
  content: "Add a caption...";
  color: var(--text-muted);
}
</style>

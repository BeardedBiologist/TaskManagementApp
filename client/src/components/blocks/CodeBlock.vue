<template>
  <div class="code-block-wrapper">
    <div class="code-language" v-if="block.language">{{ block.language }}</div>
    <pre
      ref="editor"
      class="code-block"
      contenteditable="true"
      @input="onInput"
      @keydown="onKeydown"
    ><code>{{ block.content }}</code></pre>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const props = defineProps({
  block: Object,
  isSelected: Boolean
})

const emit = defineEmits(['update', 'delete', 'enter', 'up', 'down'])

const editor = ref(null)

onMounted(() => {
  if (props.isSelected) {
    nextTick(() => {
      editor.value?.focus()
    })
  }
})

function onInput() {
  emit('update', { content: editor.value.innerText })
}

function onKeydown(e) {
  const content = editor.value.innerText
  const sel = window.getSelection()
  const range = sel.getRangeAt(0)
  const offset = range.startOffset

  switch (e.key) {
    case 'Enter':
      if (!e.shiftKey) {
        e.preventDefault()
        document.execCommand('insertHTML', false, '\n')
      }
      break

    case 'Backspace':
      if (content === '') {
        e.preventDefault()
        emit('delete')
      }
      break

    case 'ArrowUp':
      if (offset === 0) {
        e.preventDefault()
        emit('up')
      }
      break

    case 'ArrowDown':
      if (offset === content.length) {
        e.preventDefault()
        emit('down')
      }
      break
  }
}
</script>

<style scoped>
.code-block-wrapper {
  margin: var(--space-2) 0;
  background: var(--code-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.code-language {
  padding: var(--space-1) var(--space-3);
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-subtle);
}

.code-block {
  padding: var(--space-3);
  margin: 0;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: transparent;
  color: var(--text-primary);
  outline: none;
  overflow-x: auto;
  white-space: pre;
  word-wrap: normal;
}

.code-block code {
  font-family: inherit;
}
</style>

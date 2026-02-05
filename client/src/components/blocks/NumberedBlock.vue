<template>
  <div class="numbered-block">
    <span class="number">{{ number }}.</span>
    <div
      ref="editor"
      class="numbered-content"
      contenteditable="true"
      @input="onInput"
      @keydown="onKeydown"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
      v-html="sanitizedContent"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'

const props = defineProps({
  block: Object,
  isSelected: Boolean
})

const emit = defineEmits(['update', 'delete', 'enter', 'up', 'down'])

const editor = ref(null)
const isComposing = ref(false)

const number = computed(() => props.block.number || 1)

const sanitizedContent = computed(() => {
  return props.block.content || ''
})

onMounted(() => {
  if (props.isSelected) {
    nextTick(() => {
      editor.value?.focus()
    })
  }
})

watch(() => props.isSelected, (selected) => {
  if (selected) {
    nextTick(() => {
      editor.value?.focus()
    })
  }
})

watch(() => props.block.content, (nextContent) => {
  if (!editor.value) return
  if (document.activeElement === editor.value) return
  const current = editor.value.innerText
  if ((nextContent || '') !== current) {
    editor.value.innerText = nextContent || ''
  }
})

function onInput() {
  emit('update', { content: editor.value.innerText })
}

function onKeydown(e) {
  if (isComposing.value) return
  const content = editor.value.innerText
  const sel = window.getSelection()
  const range = sel.getRangeAt(0)
  const offset = range.startOffset

  switch (e.key) {
    case 'Enter':
      e.preventDefault()
      if (content === '') {
        emit('update', { type: 'text' })
      } else {
        emit('enter', { before: content.substring(0, offset), after: content.substring(offset), type: 'numbered' })
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

function onCompositionStart() {
  isComposing.value = true
}

function onCompositionEnd() {
  isComposing.value = false
  onInput()
}
</script>

<style scoped>
.numbered-block {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: 2px 2px;
}

.number {
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 14px;
  color: var(--text-secondary);
  flex-shrink: 0;
  user-select: none;
  font-variant-numeric: tabular-nums;
}

.numbered-content {
  flex: 1;
  min-height: 24px;
  font-size: 16px;
  line-height: 1.65;
  outline: none;
  cursor: text;
}

.numbered-content:empty::before {
  content: "List";
  color: var(--text-muted);
}
</style>

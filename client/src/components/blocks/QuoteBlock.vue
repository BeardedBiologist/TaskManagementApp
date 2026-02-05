<template>
  <blockquote
    ref="editor"
    class="quote-block"
    contenteditable="true"
    @input="onInput"
    @keydown="onKeydown"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
    v-html="sanitizedContent"
  />
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
      emit('enter', { before: content.substring(0, offset), after: content.substring(offset) })
      break

    case 'Backspace':
      if (content === '') {
        e.preventDefault()
        emit('update', { type: 'text' })
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
.quote-block {
  margin: var(--space-1) 0;
  padding: var(--space-2) var(--space-3);
  padding-left: var(--space-4);
  border-left: 3px solid var(--border-strong);
  font-size: 16px;
  line-height: 1.65;
  color: var(--text-secondary);
  outline: none;
  cursor: text;
}

.quote-block:empty::before {
  content: "Quote";
  color: var(--text-muted);
}
</style>

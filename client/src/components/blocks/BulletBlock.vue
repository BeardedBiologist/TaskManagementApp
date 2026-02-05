<template>
  <div class="bullet-block">
    <span class="bullet-icon">•</span>
    <div
      ref="editor"
      class="bullet-content"
      contenteditable="true"
      dir="auto"
      @input="onInput"
    @keydown="onKeydown"
      @compositionstart="onCompositionStart"
      @compositionend="onCompositionEnd"
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

const sanitizedContent = computed(() => {
  return props.block.content || ''
})

onMounted(() => {
  if (editor.value) {
    editor.value.innerText = sanitizedContent.value
  }
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
      if (e.shiftKey) {
        return
      }
      e.preventDefault()
      if (content === '') {
        emit('update', { type: 'text' })
      } else {
        emit('enter', { before: content.substring(0, offset), after: content.substring(offset), type: 'bullet' })
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
.bullet-block {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: 2px 2px;
}

.bullet-icon {
  width: 16px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--text-secondary);
  flex-shrink: 0;
  user-select: none;
}

.bullet-content {
  flex: 1;
  min-height: 24px;
  font-size: 16px;
  line-height: 1.65;
  outline: none;
  cursor: text;
}

.bullet-content:empty::before {
  content: "List";
  color: var(--text-muted);
  pointer-events: none;
}
</style>

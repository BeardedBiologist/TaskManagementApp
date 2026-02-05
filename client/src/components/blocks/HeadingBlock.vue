<template>
  <component
    :is="headingTag"
    ref="editor"
    class="heading-block"
    :class="`heading-${level}`"
    contenteditable="true"
    @input="onInput"
    @keydown="onKeydown"
    @compositionstart="onCompositionStart"
    @compositionend="onCompositionEnd"
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

const level = computed(() => {
  if (props.block.type === 'heading1') return 1
  if (props.block.type === 'heading2') return 2
  if (props.block.type === 'heading3') return 3
  return 1
})

const headingTag = computed(() => `h${level.value}`)

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
.heading-block {
  padding: 3px 2px;
  font-weight: 600;
  line-height: 1.35;
  outline: none;
  cursor: text;
  white-space: pre-wrap;
  word-break: break-word;
  direction: ltr; /* Ensure text direction is always LTR */
  unicode-bidi: normal;
}

.heading-1 {
  font-size: 2rem;
  margin-top: var(--space-5);
  margin-bottom: var(--space-2);
}

.heading-2 {
  font-size: 1.5rem;
  margin-top: var(--space-4);
  margin-bottom: var(--space-2);
}

.heading-3 {
  font-size: 1.25rem;
  margin-top: var(--space-3);
  margin-bottom: var(--space-1);
}

.heading-block:empty::before {
  color: var(--text-muted);
  pointer-events: none; /* Prevent interaction with placeholder */
}

.heading-1:empty::before {
  content: "Heading 1";
}

.heading-2:empty::before {
  content: "Heading 2";
}

.heading-3:empty::before {
  content: "Heading 3";
}
</style>

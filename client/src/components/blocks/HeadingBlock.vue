<template>
  <component
    :is="headingTag"
    ref="editor"
    class="heading-block"
    :class="`heading-${level}`"
    contenteditable="true"
    @input="onInput"
    @keydown="onKeydown"
    v-html="sanitizedContent"
  />
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'

const props = defineProps({
  block: Object,
  isSelected: Boolean
})

const emit = defineEmits(['update', 'delete', 'enter', 'up', 'down'])

const editor = ref(null)

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
</script>

<style scoped>
.heading-block {
  padding: 3px 2px;
  font-weight: 600;
  line-height: 1.3;
  outline: none;
  cursor: text;
}

.heading-1 {
  font-size: 1.875rem;
  margin-top: var(--space-4);
  margin-bottom: var(--space-2);
}

.heading-2 {
  font-size: 1.5rem;
  margin-top: var(--space-3);
  margin-bottom: var(--space-2);
}

.heading-3 {
  font-size: 1.25rem;
  margin-top: var(--space-3);
  margin-bottom: var(--space-1);
}

.heading-block:empty::before {
  content: "Heading " attr(data-level);
  color: var(--text-muted);
}
</style>

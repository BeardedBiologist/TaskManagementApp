<template>
  <div
    ref="editor"
    class="text-block"
    contenteditable="true"
    :class="{ 'is-empty': !block.content }"
    @input="onInput"
    @keydown="onKeydown"
    @focus="onFocus"
    v-html="sanitizedContent"
  />
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'

const props = defineProps({
  block: Object,
  isSelected: Boolean,
  blockIndex: Number
})

const emit = defineEmits(['update', 'delete', 'enter', 'up', 'down', 'slash'])

const editor = ref(null)
const isComposing = ref(false)

const sanitizedContent = computed(() => {
  return props.block.content || ''
})

// Watch for external selection changes
watch(() => props.isSelected, (selected) => {
  if (selected) {
    nextTick(() => {
      editor.value?.focus()
    })
  }
})

onMounted(() => {
  if (props.isSelected) {
    nextTick(() => {
      editor.value?.focus()
      placeCursorAtEnd()
    })
  }
})

function placeCursorAtEnd() {
  const range = document.createRange()
  const sel = window.getSelection()
  range.selectNodeContents(editor.value)
  range.collapse(false)
  sel.removeAllRanges()
  sel.addRange(range)
}

function placeCursorAtStart() {
  const range = document.createRange()
  const sel = window.getSelection()
  range.selectNodeContents(editor.value)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

function getCaretPosition() {
  const sel = window.getSelection()
  if (sel.rangeCount === 0) return { offset: 0, isAtStart: true, isAtEnd: true }
  
  const range = sel.getRangeAt(0)
  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(editor.value)
  preCaretRange.setEnd(range.endContainer, range.endOffset)
  const offset = preCaretRange.toString().length
  const textLength = editor.value.innerText.length
  
  return {
    offset,
    isAtStart: offset === 0,
    isAtEnd: offset >= textLength
  }
}

function onInput() {
  const content = editor.value.innerText
  emit('update', { content })
}

function onKeydown(e) {
  if (isComposing.value) return

  const content = editor.value.innerText
  const { offset, isAtStart, isAtEnd } = getCaretPosition()

  switch (e.key) {
    case 'Enter':
      e.preventDefault()
      if (e.shiftKey) {
        document.execCommand('insertHTML', false, '\n')
      } else {
        const before = content.substring(0, offset)
        const after = content.substring(offset)
        emit('enter', { before, after })
      }
      break

    case 'Backspace':
      // Delete block if empty
      if (content === '' || (isAtStart && content.length === 0)) {
        e.preventDefault()
        emit('delete')
      }
      // Merge with previous block if at start and has content
      else if (isAtStart && props.blockIndex > 0) {
        e.preventDefault()
        emit('merge-up')
      }
      break

    case 'Delete':
      // Delete block if empty
      if (content === '') {
        e.preventDefault()
        emit('delete')
      }
      break

    case 'ArrowUp':
      if (isAtStart) {
        e.preventDefault()
        emit('up')
      }
      break

    case 'ArrowDown':
      if (isAtEnd) {
        e.preventDefault()
        emit('down')
      }
      break

    case '/':
      e.preventDefault()
      // Insert the slash first
      document.execCommand('insertText', false, '/')
      // Get cursor position after inserting slash
      const slashRange = window.getSelection().getRangeAt(0)
      let slashRect = slashRange.getBoundingClientRect()
      // Fallback: if rect is empty (0,0), use the editor element
      if (slashRect.left === 0 && slashRect.top === 0) {
        const editorRect = editor.value.getBoundingClientRect()
        slashRect = { left: editorRect.left, bottom: editorRect.top + 24 }
      }
      emit('slash', {
        x: slashRect.left,
        y: slashRect.bottom,
        filter: ''
      })
      break
  }
}

function onFocus() {
  // Block is focused
}

// Expose focus method for parent
defineExpose({
  focus: () => {
    editor.value?.focus()
  },
  focusStart: () => {
    editor.value?.focus()
    placeCursorAtStart()
  },
  focusEnd: () => {
    editor.value?.focus()
    placeCursorAtEnd()
  }
})
</script>

<style scoped>
.text-block {
  min-height: 28px;
  padding: 3px 2px;
  font-size: 16px;
  line-height: 1.5;
  outline: none;
  cursor: text;
  white-space: pre-wrap;
  word-break: break-word;
  flex: 1;
}

.text-block:empty::before {
  content: "Type '/' for commands...";
  color: var(--text-muted);
  pointer-events: none;
}

.text-block.is-empty::before {
  content: "Type '/' for commands...";
  color: var(--text-muted);
  pointer-events: none;
}
</style>

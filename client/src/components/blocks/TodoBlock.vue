<template>
  <div class="todo-block">
    <label class="todo-checkbox">
      <input
        type="checkbox"
        :checked="block.checked"
        @change="onToggle"
      />
      <span class="checkmark"></span>
    </label>
    <div
      ref="editor"
      class="todo-content"
      :class="{ 'is-checked': block.checked }"
      contenteditable="true"
      dir="auto"
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

function onToggle() {
  emit('update', { checked: !props.block.checked })
}

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
      emit('enter', { before: content.substring(0, offset), after: content.substring(offset), type: 'todo' })
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
.todo-block {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: 2px 2px;
}

.todo-checkbox {
  position: relative;
  width: 16px;
  height: 16px;
  margin-top: 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.todo-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
}

.todo-checkbox:hover .checkmark {
  border-color: var(--border-strong);
}

.todo-checkbox input:checked ~ .checkmark {
  background-color: var(--accent-blue);
  border-color: var(--accent-blue);
}

.checkmark::after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.todo-checkbox input:checked ~ .checkmark::after {
  display: block;
}

.todo-content {
  flex: 1;
  min-height: 24px;
  font-size: 16px;
  line-height: 1.65;
  outline: none;
  cursor: text;
}

.todo-content.is-checked {
  text-decoration: line-through;
  color: var(--text-muted);
}

.todo-content:empty::before {
  content: "To-do";
  color: var(--text-muted);
}
</style>

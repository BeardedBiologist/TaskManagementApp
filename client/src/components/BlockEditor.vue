<template>
  <div class="block-editor" @keydown.capture="handleEditorKeydown">
    <div class="editor-content">
      <div
        v-for="(block, index) in blocks"
        :key="block.id"
        class="block-wrapper"
        :class="{ 
          'is-selected': selectedBlock === index,
          'is-dragging': draggingIndex === index,
          'is-drop-target': dropTargetIndex === index,
          'is-range': isInRange(index),
          'is-list-item': ['todo', 'bullet', 'numbered'].includes(block.type)
        }"
        @click="selectBlock(index, $event)"
        @dragstart="handleDragStart($event, index)"
        @dragover="handleDragOver($event, index)"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, index)"
        @dragend="handleDragEnd"
      >
        <!-- Block handle for drag -->
        <div
          class="block-handle"
          title="Drag to move"
          draggable="true"
          @dragstart.stop="handleDragStart($event, index)"
        >
          <svg viewBox="0 0 10 10" fill="currentColor">
            <circle cx="2" cy="2" r="1.5"/>
            <circle cx="7" cy="2" r="1.5"/>
            <circle cx="2" cy="7" r="1.5"/>
            <circle cx="7" cy="7" r="1.5"/>
          </svg>
        </div>
        
        <!-- Block content -->
        <div class="block-body">
          <component
            :is="getBlockComponent(block.type)"
            :block="block"
            :is-selected="selectedBlock === index"
            :block-index="index"
            :number="getBlockNumber(index)"
            @update="updateBlock(index, $event)"
            @delete="deleteBlock(index)"
            @enter="splitBlock(index, $event)"
            @merge-up="mergeBlockUp(index)"
            @up="moveFocus(index - 1)"
            @down="moveFocus(index + 1)"
            @slash="showSlashMenu(index, $event)"
            @shortcut="applyShortcut(index, $event)"
            @link="showLinkMenu(index, $event)"
            @link-close="clearLinkMenu"
            :ref="(el) => setBlockRef(el, index)"
          />
        </div>
        
        <!-- Add block button on hover -->
        <div class="add-block-btn" @click.stop="showAddMenu(index, $event)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>

        <div class="block-actions" v-if="selectedBlock === index">
          <button 
            v-if="blocks[index].type === 'numbered'"
            class="block-action-btn" 
            @click.stop="toggleNumberRestart(index)" 
            :title="blocks[index].start ? 'Continue numbering' : 'Restart numbering'"
            :class="{ active: blocks[index].start }"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/>
              <path d="M12 8v8"/>
              <path d="M12 3v1"/>
            </svg>
          </button>
          <button class="block-action-btn" @click.stop="showTypeMenu(index, $event)" title="Change block type">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 12h10M4 18h7"/>
              <polyline points="18 8 22 12 18 16"/>
            </svg>
          </button>
          <button class="block-action-btn" @click.stop="deleteSelectedBlocks(index)" title="Delete block">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Empty state / Add first block -->
      <div v-if="blocks.length === 0" class="empty-blocks" @click="addBlock(0, 'text')">
        <span class="placeholder">Type '/' for commands or click to add text...</span>
      </div>
    </div>
    
    <!-- Slash Command Menu -->
    <SlashCommandMenu
      v-if="slashMenuVisible"
      :position="slashMenuPosition"
      :filter="slashFilter"
      @select="onSlashSelect"
      @close="closeSlashMenu"
    />
    
    <!-- Block Type Menu -->
    <BlockTypeMenu
      v-if="addMenuVisible"
      :position="addMenuPosition"
      @select="onAddSelect"
      @close="closeAddMenu"
    />

    <PageLinkMenu
      v-if="linkMenuVisible"
      :position="linkMenuPosition"
      :filter="linkFilter"
      :pages="props.availablePages"
      @select="onLinkSelect"
      @close="closeLinkMenu"
    />
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onBeforeUpdate } from 'vue'
import TextBlock from './blocks/TextBlock.vue'
import HeadingBlock from './blocks/HeadingBlock.vue'
import TodoBlock from './blocks/TodoBlock.vue'
import BulletBlock from './blocks/BulletBlock.vue'
import NumberedBlock from './blocks/NumberedBlock.vue'
import QuoteBlock from './blocks/QuoteBlock.vue'
import CodeBlock from './blocks/CodeBlock.vue'
import DividerBlock from './blocks/DividerBlock.vue'
import ImageBlock from './blocks/ImageBlock.vue'
import SlashCommandMenu from './SlashCommandMenu.vue'
import BlockTypeMenu from './BlockTypeMenu.vue'
import PageLinkMenu from './PageLinkMenu.vue'

const props = defineProps({
  initialBlocks: {
    type: Array,
    default: () => []
  },
  availablePages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update'])

const blocks = ref(props.initialBlocks.length > 0 ? props.initialBlocks : [
  { id: generateId(), type: 'text', content: '' }
])

const selectedBlock = ref(-1)
const slashMenuVisible = ref(false)
const slashMenuPosition = ref({ x: 0, y: 0 })
const slashFilter = ref('')
const slashBlockIndex = ref(0)
const addMenuVisible = ref(false)
const addMenuPosition = ref({ x: 0, y: 0 })
const addBlockIndex = ref(0)
const addMenuMode = ref('add')
const linkMenuVisible = ref(false)
const linkMenuPosition = ref({ x: 0, y: 0 })
const linkFilter = ref('')
const linkBlockIndex = ref(0)
const linkRange = ref({ start: 0, end: 0 })
const selectedRange = ref(null)
const blockRefs = ref([])

// Drag and drop state
const draggingIndex = ref(-1)
const dropTargetIndex = ref(-1)

onBeforeUpdate(() => {
  blockRefs.value = []
})

watch(
  () => props.initialBlocks,
  (nextBlocks) => {
    if (!Array.isArray(nextBlocks)) return
    const isSame = nextBlocks.length === blocks.value.length && nextBlocks.every((block, index) => {
      const current = blocks.value[index]
      if (!current) return false
      return block.id === current.id &&
        block.type === current.type &&
        (block.content || '') === (current.content || '') &&
        (block.checked || false) === (current.checked || false) &&
        (block.url || '') === (current.url || '') &&
        (block.caption || '') === (current.caption || '') &&
        (block.language || '') === (current.language || '')
    })
    if (isSame) return
    if (nextBlocks.length === 0) {
      blocks.value = [{ id: generateId(), type: 'text', content: '' }]
    } else {
      blocks.value = nextBlocks.map(block => ({ ...block }))
    }
    if (selectedBlock.value >= blocks.value.length) {
      selectedBlock.value = blocks.value.length - 1
    }
    if (selectedRange.value && selectedRange.value.end >= blocks.value.length) {
      selectedRange.value = null
    }
  },
  { deep: true }
)

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function setBlockRef(el, index) {
  if (el) {
    blockRefs.value[index] = el
  }
}

function getBlockComponent(type) {
  const components = {
    text: TextBlock,
    heading1: HeadingBlock,
    heading2: HeadingBlock,
    heading3: HeadingBlock,
    todo: TodoBlock,
    bullet: BulletBlock,
    numbered: NumberedBlock,
    quote: QuoteBlock,
    code: CodeBlock,
    divider: DividerBlock,
    image: ImageBlock
  }
  return components[type] || TextBlock
}

function getBlockNumber(index) {
  const block = blocks.value[index]
  if (block.type !== 'numbered') return 1

  // Find the start of the current contiguous numbered list segment
  let startIdx = index
  while (startIdx > 0 && blocks.value[startIdx - 1].type === 'numbered') {
    startIdx--
  }

  // If there is an explicit restart within this segment, use it
  for (let i = index; i >= startIdx; i--) {
    const b = blocks.value[i]
    if (b.start !== undefined) {
      return b.start + (index - i)
    }
  }

  // Default: 1..n within the contiguous segment
  return index - startIdx + 1
}

function selectBlock(index, event) {
  if (event?.shiftKey && selectedBlock.value !== -1) {
    const start = Math.min(selectedBlock.value, index)
    const end = Math.max(selectedBlock.value, index)
    selectedRange.value = { start, end }
    selectedBlock.value = index
  } else {
    selectedRange.value = null
    selectedBlock.value = index
  }
}

function updateBlock(index, updates) {
  Object.assign(blocks.value[index], updates)
  emit('update', blocks.value)

  if (slashMenuVisible.value && slashBlockIndex.value === index) {
    const content = blocks.value[index].content || ''
    if (content.startsWith('/')) {
      slashFilter.value = content.slice(1)
    } else {
      closeSlashMenu()
    }
  }
}

function deleteBlock(index) {
  if (blocks.value.length > 1) {
    blocks.value.splice(index, 1)
    if (selectedBlock.value >= index) {
      selectedBlock.value = Math.max(0, selectedBlock.value - 1)
    }
    emit('update', blocks.value)
    // Focus the previous block after deletion
    nextTick(() => {
      moveFocus(Math.max(0, index - 1))
    })
  } else {
    // If it's the last block, just clear it
    blocks.value[index] = { id: generateId(), type: 'text', content: '' }
    emit('update', blocks.value)
  }
}

function deleteSelectedBlocks(index) {
  if (!selectedRange.value) {
    deleteBlock(index)
    return
  }
  const { start, end } = selectedRange.value
  if (index < start || index > end) {
    deleteBlock(index)
    return
  }
  const count = end - start + 1
  if (blocks.value.length <= count) {
    blocks.value = [{ id: generateId(), type: 'text', content: '' }]
    selectedBlock.value = 0
    selectedRange.value = null
    emit('update', blocks.value)
    return
  }
  blocks.value.splice(start, count)
  emit('update', blocks.value)
  selectedBlock.value = Math.min(start, blocks.value.length - 1)
  selectedRange.value = null
  nextTick(() => {
    moveFocus(selectedBlock.value)
  })
}

function addBlock(index, type, content = '') {
  const newBlock = {
    id: generateId(),
    type,
    content,
    checked: type === 'todo' ? false : undefined
  }
  blocks.value.splice(index + 1, 0, newBlock)
  emit('update', blocks.value)
  nextTick(() => {
    selectedBlock.value = index + 1
  })
}

function splitBlock(index, { before, after, type }) {
  const currentType = blocks.value[index]?.type
  updateBlock(index, { content: before })
  const listTypes = ['bullet', 'numbered', 'todo']
  const nextType = type || (listTypes.includes(currentType) ? currentType : 'text')
  addBlock(index, nextType, after)
}

function moveFocus(index) {
  if (index >= 0 && index < blocks.value.length) {
    selectedRange.value = null
    selectedBlock.value = index
  }
}

function mergeBlockUp(index) {
  if (index <= 0) return
  const current = blocks.value[index]
  const previous = blocks.value[index - 1]
  if (!previous) return
  const prevContent = previous.content || ''
  const currentContent = current.content || ''
  previous.content = `${prevContent}${currentContent}`
  blocks.value.splice(index, 1)
  emit('update', blocks.value)
  nextTick(() => {
    selectedBlock.value = index - 1
  })
}

function applyShortcut(index, type) {
  const block = blocks.value[index]
  if (!block) return
  updateBlock(index, { type, content: '' })
  nextTick(() => {
    selectedBlock.value = index
  })
}

function showSlashMenu(index, event) {
  slashBlockIndex.value = index
  slashFilter.value = event.filter || ''
  slashMenuPosition.value = { x: event.x, y: event.y }
  slashMenuVisible.value = true
  closeLinkMenu()
}

function closeSlashMenu() {
  slashMenuVisible.value = false
}

function onSlashSelect(type) {
  const currentBlock = blocks.value[slashBlockIndex.value]
  const content = currentBlock.content || ''
  const isCommand = content.startsWith('/') && !content.includes(' ')
  const isEmpty = content.trim() === '' || content.trim() === '/'
  if (currentBlock.type === 'text' && (isEmpty || isCommand)) {
    updateBlock(slashBlockIndex.value, { type, content: '' })
  } else {
    addBlock(slashBlockIndex.value, type)
  }
  closeSlashMenu()
}

function showAddMenu(index, event) {
  addBlockIndex.value = index
  addMenuMode.value = 'add'
  const rect = event.target.getBoundingClientRect()
  addMenuPosition.value = { x: rect.left, y: rect.bottom }
  addMenuVisible.value = true
}

function showTypeMenu(index, event) {
  addBlockIndex.value = index
  addMenuMode.value = 'change'
  const rect = event.target.getBoundingClientRect()
  addMenuPosition.value = { x: rect.left, y: rect.bottom }
  addMenuVisible.value = true
}

function closeAddMenu() {
  addMenuVisible.value = false
}

function onAddSelect(type) {
  if (addMenuMode.value === 'change') {
    updateBlock(addBlockIndex.value, { type })
  } else {
    addBlock(addBlockIndex.value, type)
  }
  closeAddMenu()
}

function showLinkMenu(index, event) {
  linkBlockIndex.value = index
  linkFilter.value = event.filter || ''
  linkRange.value = { start: event.start, end: event.end }
  linkMenuPosition.value = { x: event.x, y: event.y }
  linkMenuVisible.value = true
  closeSlashMenu()
}

function closeLinkMenu() {
  linkMenuVisible.value = false
}

function onLinkSelect(page) {
  const text = `[[${page.title || 'Untitled'}]]`
  const ref = blockRefs.value[linkBlockIndex.value]
  if (ref?.replaceRange) {
    ref.replaceRange(linkRange.value.start, linkRange.value.end, text)
  } else {
    const block = blocks.value[linkBlockIndex.value]
    const content = block?.content || ''
    const next = `${content.slice(0, linkRange.value.start)}${text}${content.slice(linkRange.value.end)}`
    updateBlock(linkBlockIndex.value, { content: next })
  }
  closeLinkMenu()
}

function clearLinkMenu() {
  if (linkMenuVisible.value) {
    closeLinkMenu()
  }
}

// Drag and Drop handlers
function handleDragStart(e, index) {
  draggingIndex.value = index
  selectedRange.value = null
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', index)
  // Add a drag image if desired
}

function handleDragOver(e, index) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  if (draggingIndex.value !== index) {
    dropTargetIndex.value = index
  }
}

function handleDragLeave() {
  dropTargetIndex.value = -1
}

function handleDrop(e, index) {
  e.preventDefault()
  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
  
  if (fromIndex !== index && fromIndex >= 0 && fromIndex < blocks.value.length) {
    // Move block
    const blockToMove = blocks.value[fromIndex]
    blocks.value.splice(fromIndex, 1)
    blocks.value.splice(index, 0, blockToMove)
    emit('update', blocks.value)
    
    // Update selected index if needed
    if (selectedBlock.value === fromIndex) {
      selectedBlock.value = index
    } else if (fromIndex < selectedBlock.value && index >= selectedBlock.value) {
      selectedBlock.value--
    } else if (fromIndex > selectedBlock.value && index <= selectedBlock.value) {
      selectedBlock.value++
    }
  }
  
  draggingIndex.value = -1
  dropTargetIndex.value = -1
}

function handleDragEnd() {
  draggingIndex.value = -1
  dropTargetIndex.value = -1
}

function handleEditorKeydown(e) {
  const isMeta = e.metaKey || e.ctrlKey
  if (!isMeta) return
  if (e.shiftKey && (e.key === 'd' || e.key === 'D')) {
    e.preventDefault()
    duplicateBlock()
    return
  }
  if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    e.preventDefault()
    const delta = e.key === 'ArrowUp' ? -1 : 1
    moveBlockBy(delta)
  }
}

function duplicateBlock() {
  if (selectedBlock.value < 0) return
  const block = blocks.value[selectedBlock.value]
  if (!block) return
  const copy = { ...block, id: generateId() }
  blocks.value.splice(selectedBlock.value + 1, 0, copy)
  emit('update', blocks.value)
  nextTick(() => {
    selectedBlock.value = selectedBlock.value + 1
  })
}

function moveBlockBy(delta) {
  const index = selectedBlock.value
  if (index < 0) return
  const target = index + delta
  if (target < 0 || target >= blocks.value.length) return
  const block = blocks.value[index]
  blocks.value.splice(index, 1)
  blocks.value.splice(target, 0, block)
  selectedBlock.value = target
  emit('update', blocks.value)
}

function toggleNumberRestart(index) {
  const block = blocks.value[index]
  if (block.type !== 'numbered') return
  
  if (block.start) {
    delete block.start
  } else {
    block.start = 1
  }
  emit('update', blocks.value)
}

function isInRange(index) {
  if (!selectedRange.value) return false
  return index >= selectedRange.value.start && index <= selectedRange.value.end
}
</script>

<style scoped>
.block-editor {
  width: 100%;
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.block-wrapper {
  position: relative;
  display: block;
  padding: 4px 40px 4px 0;
  border-radius: var(--radius-sm);
  transition: background-color 0.1s ease, opacity 0.2s ease;
  width: 100%;
}

.block-wrapper::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -80px;
  width: 80px;
}

.block-wrapper.is-list-item {
  padding-top: 0;
  padding-bottom: 0;
}

.block-wrapper:hover {
  background-color: var(--bg-hover);
}

.block-wrapper.is-selected {
  background-color: var(--bg-selected);
}

.block-wrapper.is-range {
  background-color: var(--bg-hover);
}

.block-wrapper.is-dragging {
  opacity: 0.5;
}

.block-wrapper.is-drop-target {
  border-top: 2px solid var(--primary-500);
}

.block-handle {
  width: 20px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: grab;
  color: var(--text-muted);
  transition: opacity 0.1s ease;
  user-select: none;
  align-self: flex-start;
  position: absolute;
  left: -24px;
  top: 6px;
}

.block-wrapper .block-handle,
.block-wrapper .block-actions {
  pointer-events: none;
}

.block-wrapper:hover .block-handle,
.block-wrapper:hover .block-actions,
.block-wrapper.is-selected .block-handle,
.block-wrapper.is-selected .block-actions {
  pointer-events: auto;
}

.block-wrapper:hover .block-handle,
.block-wrapper.is-selected .block-handle {
  opacity: 1;
}

.block-handle:active {
  cursor: grabbing;
}

.block-handle svg {
  width: 10px;
  height: 10px;
}

.block-body {
  min-height: 28px;
  align-self: stretch;
  min-width: 0;
}

.add-block-btn {
  position: absolute;
  left: -48px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  transition: all 0.1s ease;
}

.block-wrapper:hover .add-block-btn {
  opacity: 1;
}

.add-block-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.add-block-btn svg {
  width: 14px;
  height: 14px;
}

.block-actions {
  position: absolute;
  right: 0;
  top: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.1s ease;
}

.block-wrapper:hover .block-actions,
.block-wrapper.is-selected .block-actions {
  opacity: 1;
}

.block-action-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.1s ease;
}

.block-action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.block-action-btn svg {
  width: 14px;
  height: 14px;
}

.empty-blocks {
  padding: 0 var(--space-4);
  color: var(--text-muted);
  cursor: text;
  border-radius: var(--radius-md);
  transition: background-color 0.1s ease;
}

.empty-blocks:hover {
  background-color: var(--bg-hover);
}

.placeholder {
  font-size: 16px;
}
</style>

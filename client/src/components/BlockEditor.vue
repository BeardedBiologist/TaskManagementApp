<template>
  <div class="block-editor">
    <div class="editor-content">
      <div
        v-for="(block, index) in blocks"
        :key="block.id"
        class="block-wrapper"
        :class="{ 
          'is-selected': selectedBlock === index,
          'is-dragging': draggingIndex === index,
          'is-drop-target': dropTargetIndex === index
        }"
        :draggable="true"
        @click="selectBlock(index)"
        @dragstart="handleDragStart($event, index)"
        @dragover="handleDragOver($event, index)"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, index)"
        @dragend="handleDragEnd"
      >
        <!-- Block handle for drag -->
        <div class="block-handle" title="Drag to move">
          <svg viewBox="0 0 10 10" fill="currentColor">
            <circle cx="2" cy="2" r="1.5"/>
            <circle cx="7" cy="2" r="1.5"/>
            <circle cx="2" cy="7" r="1.5"/>
            <circle cx="7" cy="7" r="1.5"/>
          </svg>
        </div>
        
        <!-- Block content -->
        <component
          :is="getBlockComponent(block.type)"
          :block="block"
          :is-selected="selectedBlock === index"
          :block-index="index"
          @update="updateBlock(index, $event)"
          @delete="deleteBlock(index)"
          @enter="splitBlock(index, $event)"
          @up="moveFocus(index - 1)"
          @down="moveFocus(index + 1)"
          @slash="showSlashMenu(index, $event)"
        />
        
        <!-- Add block button on hover -->
        <div class="add-block-btn" @click.stop="showAddMenu(index)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
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
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
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

const props = defineProps({
  initialBlocks: {
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

// Drag and drop state
const draggingIndex = ref(-1)
const dropTargetIndex = ref(-1)

function generateId() {
  return Math.random().toString(36).substr(2, 9)
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

function selectBlock(index) {
  selectedBlock.value = index
}

function updateBlock(index, updates) {
  blocks.value[index] = { ...blocks.value[index], ...updates }
  emit('update', blocks.value)
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

function splitBlock(index, { before, after }) {
  updateBlock(index, { content: before })
  addBlock(index, 'text', after)
}

function moveFocus(index) {
  if (index >= 0 && index < blocks.value.length) {
    selectedBlock.value = index
  }
}

function showSlashMenu(index, event) {
  slashBlockIndex.value = index
  slashFilter.value = event.filter || ''
  slashMenuPosition.value = { x: event.x, y: event.y }
  slashMenuVisible.value = true
}

function closeSlashMenu() {
  slashMenuVisible.value = false
}

function onSlashSelect(type) {
  const currentBlock = blocks.value[slashBlockIndex.value]
  if (currentBlock.type === 'text' && !currentBlock.content) {
    updateBlock(slashBlockIndex.value, { type })
  } else {
    addBlock(slashBlockIndex.value, type)
  }
  closeSlashMenu()
}

function showAddMenu(index) {
  addBlockIndex.value = index
  const rect = event.target.getBoundingClientRect()
  addMenuPosition.value = { x: rect.left, y: rect.bottom }
  addMenuVisible.value = true
}

function closeAddMenu() {
  addMenuVisible.value = false
}

function onAddSelect(type) {
  addBlock(addBlockIndex.value, type)
  closeAddMenu()
}

// Drag and Drop handlers
function handleDragStart(e, index) {
  draggingIndex.value = index
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
</script>

<style scoped>
.block-editor {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.block-wrapper {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--space-1);
  padding: 2px 0;
  border-radius: var(--radius-sm);
  transition: background-color 0.1s ease, opacity 0.2s ease;
}

.block-wrapper:hover {
  background-color: var(--bg-hover);
}

.block-wrapper.is-selected {
  background-color: var(--bg-selected);
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

.block-content {
  flex: 1;
  min-height: 28px;
}

.add-block-btn {
  position: absolute;
  left: -24px;
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

.empty-blocks {
  padding: var(--space-4);
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

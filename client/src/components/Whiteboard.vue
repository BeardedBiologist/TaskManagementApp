<template>
  <div class="whiteboard-container" @keydown.delete="deleteSelected">
    <!-- Toolbar -->
    <div class="whiteboard-toolbar">
      <div class="tool-section">
        <button
          v-for="tool in mainTools"
          :key="tool.id"
          class="tool-btn"
          :class="{ active: activeTool === tool.id }"
          :title="tool.name"
          @click="setTool(tool.id)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="tool.icon"/>
        </button>
      </div>
      
      <div class="tool-divider"></div>
      
      <!-- Shape selector (when shape tool active) -->
      <div v-if="activeTool === 'shape'" class="tool-section shapes">
        <button
          v-for="shape in shapes"
          :key="shape.id"
          class="tool-btn shape-btn"
          :class="{ active: selectedShape === shape.id }"
          :title="shape.name"
          @click="selectedShape = shape.id"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="shape.icon"/>
        </button>
      </div>
      
      <div class="tool-divider" v-if="activeTool === 'shape'"></div>
      
      <!-- Color picker -->
      <div class="tool-section colors">
        <button
          v-for="color in colors"
          :key="color"
          class="color-btn"
          :class="{ active: selectedColor === color }"
          :style="{ backgroundColor: color }"
          @click="selectedColor = color"
        />
        <input
          v-model="selectedColor"
          type="color"
          class="color-picker"
          title="Custom color"
        />
      </div>
      
      <div class="tool-divider"></div>
      
      <!-- Stroke width (for drawing) -->
      <div v-if="activeTool === 'freehand'" class="tool-section stroke-width">
        <select v-model="strokeWidth" title="Stroke width">
          <option :value="2">Thin</option>
          <option :value="4">Medium</option>
          <option :value="8">Thick</option>
        </select>
      </div>
      
      <div class="tool-divider" v-if="activeTool === 'freehand'"></div>
      
      <!-- Actions -->
      <div class="tool-section actions">
        <button class="tool-btn" title="Undo" @click="undo" :disabled="historyIndex <= 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v6h6"/>
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
          </svg>
        </button>
        <button class="tool-btn" title="Redo" @click="redo" :disabled="historyIndex >= history.length - 1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 7v6h-6"/>
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
          </svg>
        </button>
        <button class="tool-btn danger" title="Clear all" @click="confirmClear">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Canvas -->
    <div 
      ref="canvasContainer"
      class="whiteboard-canvas-container"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel.ctrl.prevent="handleWheel"
    >
      <div 
        class="whiteboard-canvas"
        :style="canvasStyle"
        @dragover.prevent
        @drop="handleDrop"
      >
        <!-- Grid -->
        <div class="canvas-grid" :style="gridStyle"></div>
        
        <!-- Elements -->
        <div
          v-for="element in elements"
          :key="element.id"
          class="canvas-element"
          :class="[
            element.type,
            { 
              selected: selectedElement?.id === element.id,
              'is-connecting': isConnecting && connectionSource?.id === element.id
            }
          ]"
          :style="getElementStyle(element)"
          @mousedown.stop="handleElementMouseDown($event, element)"
          @dblclick="handleElementDoubleClick($event, element)"
        >
          <!-- Content based on type -->
          <template v-if="element.type === 'shape'">
            <div 
              class="shape-body"
              :class="element.shapeType"
              :style="{ 
                backgroundColor: element.backgroundColor,
                borderColor: element.borderColor,
                borderWidth: element.borderWidth + 'px'
              }"
            >
              <div 
                v-if="!editingText || selectedElement?.id !== element.id"
                class="element-text"
                :style="{ color: element.fontColor, fontSize: element.fontSize + 'px' }"
              >
                {{ element.text }}
              </div>
              <textarea
                v-else
                v-model="editingTextValue"
                class="element-textarea"
                :style="{ color: element.fontColor, fontSize: element.fontSize + 'px' }"
                @blur="finishTextEdit"
                @keydown.enter.prevent="finishTextEdit"
              />
            </div>
          </template>
          
          <template v-else-if="element.type === 'sticky'">
            <div 
              class="sticky-body"
              :style="{ backgroundColor: element.backgroundColor }"
            >
              <div 
                v-if="!editingText || selectedElement?.id !== element.id"
                class="element-text"
              >
                {{ element.text }}
              </div>
              <textarea
                v-else
                v-model="editingTextValue"
                class="element-textarea"
                @blur="finishTextEdit"
                @keydown.enter.prevent="finishTextEdit"
              />
            </div>
          </template>
          
          <template v-else-if="element.type === 'text'">
            <div 
              v-if="!editingText || selectedElement?.id !== element.id"
              class="text-body"
              :style="{ color: element.fontColor, fontSize: element.fontSize + 'px' }"
            >
              {{ element.text }}
            </div>
            <textarea
              v-else
              v-model="editingTextValue"
              class="element-textarea text-edit"
              :style="{ color: element.fontColor, fontSize: element.fontSize + 'px' }"
              @blur="finishTextEdit"
              @keydown.enter.prevent="finishTextEdit"
            />
          </template>
          
          <template v-else-if="element.type === 'image'">
            <img 
              :src="element.imageUrl" 
              class="image-body"
              draggable="false"
            />
          </template>
          
          <template v-else-if="element.type === 'freehand'">
            <svg class="freehand-svg" :viewBox="getFreehandViewBox(element)">
              <path
                :d="getFreehandPath(element)"
                :stroke="element.borderColor"
                :stroke-width="element.strokeWidth"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
          
          <!-- Connection points -->
          <template v-if="selectedElement?.id === element.id && activeTool === 'connector'">
            <div 
              v-for="point in getConnectionPoints(element)"
              :key="point.position"
              class="connection-point"
              :class="point.position"
              @mousedown.stop="startConnection($event, element, point)"
            />
          </template>
          
          <!-- Selection handles -->
          <template v-if="selectedElement?.id === element.id && element.type !== 'freehand' && element.type !== 'connector'">
            <div class="resize-handle nw" @mousedown.stop="startResize('nw', $event, element)"></div>
            <div class="resize-handle ne" @mousedown.stop="startResize('ne', $event, element)"></div>
            <div class="resize-handle sw" @mousedown.stop="startResize('sw', $event, element)"></div>
            <div class="resize-handle se" @mousedown.stop="startResize('se', $event, element)"></div>
            <div class="rotate-handle" @mousedown.stop="startRotate($event, element)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </div>
            <button class="delete-handle" @click.stop="deleteSelected" title="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </template>
        </div>
        
        <!-- Connectors (lines between elements) -->
        <svg class="connectors-layer">
          <g v-for="conn in connectors" :key="conn.id">
            <path
              :d="getConnectorPath(conn)"
              stroke="#8b5cf6"
              stroke-width="2"
              fill="none"
              marker-end="url(#arrowhead)"
            />
          </g>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6"/>
            </marker>
          </defs>
        </svg>
        
        <!-- Drawing preview -->
        <svg v-if="isDrawing && currentPath.length > 1" class="drawing-preview">
          <path
            :d="getCurrentPathD()"
            :stroke="selectedColor"
            :stroke-width="strokeWidth"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        
        <!-- Selection box -->
        <div
          v-if="selectionBox"
          class="selection-box"
          :style="selectionBoxStyle"
        ></div>
      </div>
    </div>
    
    <!-- Zoom controls -->
    <div class="zoom-controls">
      <button @click="resetZoom" title="Reset zoom">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      </button>
      <button @click="zoomOut">-</button>
      <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
      <button @click="zoomIn">+</button>
    </div>
    
    <!-- Help text -->
    <div class="help-text">
      <span v-if="activeTool === 'select'">Drag to move • Double-click to edit • Delete to remove</span>
      <span v-else-if="activeTool === 'connector'">Click and drag from one element to another</span>
      <span v-else>Click to place • Drag to resize</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCollaborationStore } from '../stores/collaboration'

const props = defineProps({
  initialElements: {
    type: Array,
    default: () => []
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'element-add', 'element-update', 'element-delete'])
const collaborationStore = useCollaborationStore()

// Tools
const mainTools = [
  { id: 'select', name: 'Select (V)', icon: '<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>' },
  { id: 'sticky', name: 'Sticky Note (N)', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/>' },
  { id: 'shape', name: 'Shape (S)', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/>' },
  { id: 'text', name: 'Text (T)', icon: '<path d="M4 7V5h16v2M12 5v14m-4-4h8"/>' },
  { id: 'freehand', name: 'Draw (D)', icon: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>' },
  { id: 'connector', name: 'Connect (C)', icon: '<path d="M5 12h14M12 5l7 7-7 7"/>' },
  { id: 'image', name: 'Image (I)', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>' }
]

const shapes = [
  { id: 'rectangle', name: 'Rectangle', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/>' },
  { id: 'circle', name: 'Circle', icon: '<circle cx="12" cy="12" r="9"/>' },
  { id: 'triangle', name: 'Triangle', icon: '<path d="M12 3l9 18H3L12 3z"/>' },
  { id: 'diamond', name: 'Diamond', icon: '<path d="M12 2l10 10-10 10L2 12 12 2z"/>' }
]

const colors = ['#fef3c7', '#fce7f3', '#e0e7ff', '#d1fae5', '#fee2e2', '#ffedd5', '#f3f4f6', '#000000']

// State
const activeTool = ref('select')
const selectedShape = ref('rectangle')
const selectedColor = ref('#fef3c7')
const strokeWidth = ref(4)
const elements = ref([...props.initialElements])
const connectors = ref([])
const selectedElement = ref(null)
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })

// Interaction state
const isDragging = ref(false)
const isResizing = ref(false)
const isRotating = ref(false)
const isDrawing = ref(false)
const isCreating = ref(false)
const createStart = ref({ x: 0, y: 0 })
const isConnecting = ref(false)
const connectionSource = ref(null)
const currentPath = ref([])
const selectionBox = ref(null)
const editingText = ref(false)
const editingTextValue = ref('')
const cursorRaf = ref(null)
const lastCursorPos = ref({ x: 0, y: 0 })
const lastEmitAt = ref(0)
const emitThrottleMs = 60

// Resize/rotate state
const dragStart = ref({ x: 0, y: 0 })
const elementStart = ref(null)
const resizeHandle = ref(null)

// History for undo/redo
const history = ref([[]])
const historyIndex = ref(0)

// Refs
const canvasContainer = ref(null)

// Canvas style
const canvasStyle = computed(() => ({
  transform: `translate(${pan.value.x}px, ${pan.value.y}px) scale(${zoom.value})`,
  transformOrigin: '0 0'
}))

const gridStyle = computed(() => ({
  backgroundImage: `
    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
  `,
  backgroundSize: '20px 20px'
}))

const selectionBoxStyle = computed(() => {
  if (!selectionBox.value) return {}
  const left = Math.min(selectionBox.value.startX, selectionBox.value.endX)
  const top = Math.min(selectionBox.value.startY, selectionBox.value.endY)
  const width = Math.abs(selectionBox.value.endX - selectionBox.value.startX)
  const height = Math.abs(selectionBox.value.endY - selectionBox.value.startY)
  return { left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px' }
})

// Methods
function setTool(toolId) {
  activeTool.value = toolId
  selectedElement.value = null
  editingText.value = false
}

function getElementStyle(element) {
  return {
    left: element.x + 'px',
    top: element.y + 'px',
    width: (element.width || 100) + 'px',
    height: (element.height || 100) + 'px',
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    zIndex: element.zIndex || 1
  }
}

function getConnectionPoints(element) {
  return [
    { position: 'top', x: element.width / 2, y: 0 },
    { position: 'right', x: element.width, y: element.height / 2 },
    { position: 'bottom', x: element.width / 2, y: element.height },
    { position: 'left', x: 0, y: element.height / 2 }
  ]
}

function getMousePos(e) {
  const rect = canvasContainer.value.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left - pan.value.x) / zoom.value,
    y: (e.clientY - rect.top - pan.value.y) / zoom.value
  }
}

// Mouse handlers
function handleMouseDown(e) {
  if (props.readOnly || e.button !== 0) return
  
  const pos = getMousePos(e)
  
  const isCanvasBackground = e.target === canvasContainer.value ||
    e.target.classList.contains('canvas-grid') ||
    e.target.closest('.whiteboard-canvas')

  if (isCanvasBackground) {
    selectedElement.value = null
    editingText.value = false
    
    if (activeTool.value === 'select') {
      selectionBox.value = { startX: pos.x, startY: pos.y, endX: pos.x, endY: pos.y }
    } else if (activeTool.value === 'freehand') {
      isDrawing.value = true
      currentPath.value = [{ x: pos.x, y: pos.y }]
    } else if (['sticky', 'shape', 'text'].includes(activeTool.value)) {
      createStart.value = { x: pos.x, y: pos.y }
      createElement(pos.x, pos.y, true)
      isCreating.value = true
    }
  }
}

function handleMouseMove(e) {
  lastCursorPos.value = { x: e.clientX, y: e.clientY }
  if (!cursorRaf.value) {
    cursorRaf.value = requestAnimationFrame(() => {
      collaborationStore.updateCursor(lastCursorPos.value.x, lastCursorPos.value.y)
      cursorRaf.value = null
    })
  }

  if (props.readOnly) return
  
  const pos = getMousePos(e)
  
  if (selectionBox.value) {
    selectionBox.value.endX = pos.x
    selectionBox.value.endY = pos.y
    return
  }
  
  if (isDrawing.value) {
    currentPath.value.push({ x: pos.x, y: pos.y })
    return
  }
  
  if (isCreating.value && selectedElement.value) {
    const dx = pos.x - createStart.value.x
    const dy = pos.y - createStart.value.y
    selectedElement.value.width = Math.max(20, Math.abs(dx))
    selectedElement.value.height = Math.max(20, Math.abs(dy))
    selectedElement.value.x = dx < 0 ? pos.x : createStart.value.x
    selectedElement.value.y = dy < 0 ? pos.y : createStart.value.y
    maybeEmitElementUpdate(selectedElement.value)
    return
  }

  if (isResizing.value && selectedElement.value) {
    const dx = pos.x - dragStart.value.x
    const dy = pos.y - dragStart.value.y
    const el = selectedElement.value
    
    switch (resizeHandle.value) {
      case 'se':
        el.width = Math.max(50, elementStart.value.width + dx)
        el.height = Math.max(50, elementStart.value.height + dy)
        break
      case 'sw':
        el.width = Math.max(50, elementStart.value.width - dx)
        el.height = Math.max(50, elementStart.value.height + dy)
        el.x = elementStart.value.x + dx
        break
      case 'ne':
        el.width = Math.max(50, elementStart.value.width + dx)
        el.height = Math.max(50, elementStart.value.height - dy)
        el.y = elementStart.value.y + dy
        break
      case 'nw':
        el.width = Math.max(50, elementStart.value.width - dx)
        el.height = Math.max(50, elementStart.value.height - dy)
        el.x = elementStart.value.x + dx
        el.y = elementStart.value.y + dy
        break
    }
    maybeEmitElementUpdate(el)
    return
  }
  
  if (isDragging.value && selectedElement.value) {
    selectedElement.value.x = pos.x - dragStart.value.x
    selectedElement.value.y = pos.y - dragStart.value.y
    maybeEmitElementUpdate(selectedElement.value)
  }
}

function handleMouseUp(e) {
  if (isDrawing.value && currentPath.value.length > 1) {
    finishDrawing()
  }
  
  if (selectionBox.value) {
    // Select elements in box
    selectionBox.value = null
  }
  
  if (isCreating.value && selectedElement.value) {
    if (selectedElement.value.width < 10 && selectedElement.value.height < 10) {
      applyDefaultSize(selectedElement.value)
    }
    emitElementUpdate(selectedElement.value)
    saveToHistory()
  }
  
  if ((isResizing.value || isDragging.value) && selectedElement.value) {
    emitElementUpdate(selectedElement.value)
    saveToHistory()
  }
  
  isDragging.value = false
  isResizing.value = false
  isDrawing.value = false
  isCreating.value = false
  currentPath.value = []
}

function handleElementMouseDown(e, element) {
  if (props.readOnly) return
  
  e.stopPropagation()
  
  if (activeTool.value === 'connector') {
    return // Handle in connection point
  }
  
  selectedElement.value = element
  const pos = getMousePos(e)
  
  dragStart.value = { x: pos.x - element.x, y: pos.y - element.y }
  elementStart.value = { ...element }
  isDragging.value = true
}

function handleElementDoubleClick(e, element) {
  if (element.type === 'freehand' || element.type === 'image' || element.type === 'connector') return
  
  editingText.value = true
  editingTextValue.value = element.text || ''
  selectedElement.value = element
}

function finishTextEdit() {
  if (selectedElement.value) {
    selectedElement.value.text = editingTextValue.value
    emitElementUpdate(selectedElement.value)
    saveToHistory()
  }
  editingText.value = false
}

// Element creation
function createElement(x, y, isPreview = false) {
  const id = Date.now().toString()
  let newElement
  
  switch (activeTool.value) {
    case 'sticky':
      newElement = {
        id,
        type: 'sticky',
        x,
        y,
        width: isPreview ? 1 : 150,
        height: isPreview ? 1 : 150,
        backgroundColor: selectedColor.value,
        text: 'Double-click to edit',
        fontSize: 16,
        zIndex: elements.value.length + 1
      }
      break
    case 'shape':
      newElement = {
        id,
        type: 'shape',
        shapeType: selectedShape.value,
        x,
        y,
        width: isPreview ? 1 : 120,
        height: isPreview ? 1 : 80,
        backgroundColor: selectedColor.value,
        borderColor: '#000000',
        borderWidth: 2,
        text: 'Double-click to edit',
        fontSize: 14,
        fontColor: '#000000',
        zIndex: elements.value.length + 1
      }
      break
    case 'text':
      newElement = {
        id,
        type: 'text',
        x,
        y,
        width: isPreview ? 1 : 200,
        height: isPreview ? 1 : 40,
        text: 'Double-click to edit',
        fontSize: 18,
        fontColor: selectedColor.value === '#000000' ? '#000000' : '#374151',
        zIndex: elements.value.length + 1
      }
      // Auto-enter edit mode for text
      setTimeout(() => {
        selectedElement.value = newElement
        editingText.value = true
        editingTextValue.value = newElement.text
      }, 50)
      break
  }
  
  if (newElement) {
    elements.value.push(newElement)
    selectedElement.value = newElement
    emit('element-add', newElement)
    saveToHistory()
  }
}

function applyDefaultSize(element) {
  if (element.type === 'sticky') {
    element.width = 150
    element.height = 150
  } else if (element.type === 'shape') {
    element.width = 120
    element.height = 80
  } else if (element.type === 'text') {
    element.width = 200
    element.height = 40
  }
}

function finishDrawing() {
  if (currentPath.value.length < 2) return
  
  const id = Date.now().toString()
  const newElement = {
    id,
    type: 'freehand',
    x: Math.min(...currentPath.value.map(p => p.x)),
    y: Math.min(...currentPath.value.map(p => p.y)),
    width: Math.max(...currentPath.value.map(p => p.x)) - Math.min(...currentPath.value.map(p => p.x)),
    height: Math.max(...currentPath.value.map(p => p.y)) - Math.min(...currentPath.value.map(p => p.y)),
    path: currentPath.value.map(p => ({
      x: p.x - Math.min(...currentPath.value.map(pt => pt.x)),
      y: p.y - Math.min(...currentPath.value.map(pt => pt.y))
    })),
    borderColor: selectedColor.value,
    strokeWidth: strokeWidth.value,
    zIndex: elements.value.length + 1
  }
  
  elements.value.push(newElement)
  emit('element-add', newElement)
  saveToHistory()
}

// Resize
function startResize(handle, e, element) {
  e.stopPropagation()
  isResizing.value = true
  resizeHandle.value = handle
  dragStart.value = getMousePos(e)
  elementStart.value = { ...element }
  selectedElement.value = element
}

// Freehand helpers
function getFreehandViewBox(element) {
  return `0 0 ${element.width} ${element.height}`
}

function getFreehandPath(element) {
  if (!element.path?.length) return ''
  return 'M ' + element.path.map(p => `${p.x} ${p.y}`).join(' L ')
}

function getCurrentPathD() {
  if (currentPath.value.length < 2) return ''
  return 'M ' + currentPath.value.map(p => `${p.x} ${p.y}`).join(' L ')
}

// Zoom
function zoomIn() {
  zoom.value = Math.min(zoom.value * 1.1, 3)
}

function zoomOut() {
  zoom.value = Math.max(zoom.value / 1.1, 0.3)
}

function resetZoom() {
  zoom.value = 1
  pan.value = { x: 0, y: 0 }
}

function handleWheel(e) {
  if (e.ctrlKey) {
    e.preventDefault()
    if (e.deltaY < 0) zoomIn()
    else zoomOut()
  }
}

// History
function saveToHistory() {
  // Remove future history if we're not at the end
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(JSON.parse(JSON.stringify(elements.value)))
  historyIndex.value++
}

function undo() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    elements.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    emit('update', elements.value)
  }
}

function redo() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    elements.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    emit('update', elements.value)
  }
}

// Actions
function deleteSelected() {
  if (selectedElement.value) {
    const id = selectedElement.value.id
    elements.value = elements.value.filter(e => e.id !== id)
    connectors.value = connectors.value.filter(c => c.from !== id && c.to !== id)
    selectedElement.value = null
    emit('element-delete', id)
    saveToHistory()
  }
}

function emitElementUpdate(element) {
  if (!element) return
  const { id, ...updates } = element
  emit('element-update', { elementId: id, updates: { ...updates } })
}

function maybeEmitElementUpdate(element) {
  if (!element) return
  const now = Date.now()
  if (now - lastEmitAt.value < emitThrottleMs) return
  lastEmitAt.value = now
  emitElementUpdate(element)
}

function confirmClear() {
  if (confirm('Clear all elements? This cannot be undone.')) {
    elements.value = []
    connectors.value = []
    selectedElement.value = null
    emit('update', [])
    saveToHistory()
  }
}

function handleDrop(e) {
  e.preventDefault()
  const files = e.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const pos = getMousePos({ clientX: e.clientX, clientY: e.clientY })
        const img = new Image()
        img.onload = () => {
          const aspectRatio = img.width / img.height
          const maxWidth = 300
          const width = Math.min(maxWidth, img.width)
          const height = width / aspectRatio
          
          const newElement = {
            id: Date.now().toString(),
            type: 'image',
            x: pos.x - width / 2,
            y: pos.y - height / 2,
            width,
            height,
            imageUrl: e.target.result,
            zIndex: elements.value.length + 1
          }
          elements.value.push(newElement)
          emit('element-add', newElement)
          saveToHistory()
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }
}

// Keyboard shortcuts
function handleKeyDown(e) {
  if (editingText.value) return
  
  switch (e.key) {
    case 'Delete':
    case 'Backspace':
      if (selectedElement.value) {
        deleteSelected()
      }
      break
    case 'v':
      setTool('select')
      break
    case 'n':
      setTool('sticky')
      break
    case 's':
      setTool('shape')
      break
    case 't':
      setTool('text')
      break
    case 'd':
      setTool('freehand')
      break
    case 'c':
      setTool('connector')
      break
    case 'z':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

watch(
  () => props.initialElements,
  (next) => {
    elements.value = (next || []).map(el => ({ ...el }))
  },
  { deep: true }
)
</script>

<style scoped>
.whiteboard-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  overflow: hidden;
}

/* Toolbar */
.whiteboard-toolbar {
  position: absolute;
  top: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 100;
}

.tool-section {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.tool-section.shapes {
  padding: var(--space-1);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.tool-divider {
  width: 1px;
  height: 28px;
  background: var(--border-subtle);
}

.tool-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.15s ease;
}

.tool-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tool-btn.active {
  background: var(--primary-500);
  color: white;
}

.tool-btn.danger:hover {
  background: var(--accent-rose-alpha-10, rgba(244, 63, 94, 0.1));
  color: var(--accent-rose);
}

.tool-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-btn svg {
  width: 18px;
  height: 18px;
}

.shape-btn {
  width: 28px;
  height: 28px;
}

.shape-btn svg {
  width: 16px;
  height: 16px;
}

/* Color picker */
.colors {
  display: flex;
  gap: 4px;
}

.color-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn.active {
  border-color: var(--text-primary);
}

.color-picker {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
}

/* Stroke width */
.stroke-width select {
  padding: var(--space-1) var(--space-2);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
}

/* Canvas */
.whiteboard-canvas-container {
  flex: 1;
  overflow: hidden;
  cursor: crosshair;
}

.whiteboard-canvas-container:has(.canvas-element:hover) {
  cursor: grab;
}

.whiteboard-canvas {
  position: relative;
  width: 5000px;
  height: 5000px;
  background: #f8f9fa;
}

.canvas-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Elements */
.canvas-element {
  position: absolute;
  user-select: none;
}

.canvas-element.selected {
  z-index: 1000 !important;
}

.canvas-element.selected .shape-body,
.canvas-element.selected .sticky-body,
.canvas-element.selected .text-body,
.canvas-element.selected img {
  box-shadow: 0 0 0 2px var(--primary-500), 0 4px 12px rgba(0,0,0,0.15);
}

/* Shapes */
.shape-body {
  width: 100%;
  height: 100%;
  border-style: solid;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.shape-body.rectangle {
  border-radius: var(--radius-md);
}

.shape-body.circle {
  border-radius: 50%;
}

.shape-body.triangle {
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.shape-body.diamond {
  border-radius: var(--radius-md);
  transform: rotate(45deg);
}

.shape-body.diamond .element-text {
  transform: rotate(-45deg);
}

/* Sticky notes */
.sticky-body {
  width: 100%;
  height: 100%;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Text */
.text-body {
  padding: var(--space-2);
  min-height: 100%;
  display: flex;
  align-items: center;
}

/* Images */
.image-body {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--radius-md);
}

/* Freehand */
.freehand-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* Text editing */
.element-text,
.element-textarea {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  text-align: center;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
}

.element-textarea {
  background: white;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
}

.element-textarea.text-edit {
  background: var(--bg-secondary);
}

/* Connection points */
.connection-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--primary-500);
  border: 2px solid white;
  border-radius: 50%;
  cursor: crosshair;
  z-index: 10;
}

.connection-point:hover {
  transform: scale(1.3);
}

.connection-point.top { top: -6px; left: 50%; transform: translateX(-50%); }
.connection-point.right { right: -6px; top: 50%; transform: translateY(-50%); }
.connection-point.bottom { bottom: -6px; left: 50%; transform: translateX(-50%); }
.connection-point.left { left: -6px; top: 50%; transform: translateY(-50%); }

/* Resize handles */
.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border: 2px solid var(--primary-500);
  border-radius: 50%;
  z-index: 11;
}

.resize-handle.nw { top: -5px; left: -5px; cursor: nw-resize; }
.resize-handle.ne { top: -5px; right: -5px; cursor: ne-resize; }
.resize-handle.sw { bottom: -5px; left: -5px; cursor: sw-resize; }
.resize-handle.se { bottom: -5px; right: -5px; cursor: se-resize; }

/* Rotate handle */
.rotate-handle {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  cursor: grab;
  z-index: 11;
}

.rotate-handle svg {
  width: 12px;
  height: 12px;
}

/* Delete handle */
.delete-handle {
  position: absolute;
  top: -30px;
  right: -6px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--accent-rose, #ef4444);
  z-index: 12;
}

.delete-handle svg {
  width: 12px;
  height: 12px;
}

.delete-handle:hover {
  background: rgba(239, 68, 68, 0.08);
}

/* Connectors */
.connectors-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

/* Drawing preview */
.drawing-preview {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
}

/* Selection box */
.selection-box {
  position: absolute;
  border: 1px dashed var(--primary-500);
  background: rgba(139, 92, 246, 0.1);
  pointer-events: none;
}

/* Zoom controls */
.zoom-controls {
  position: absolute;
  bottom: var(--space-4);
  right: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.zoom-controls button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 16px;
  transition: all 0.15s ease;
}

.zoom-controls button:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.zoom-controls button svg {
  width: 16px;
  height: 16px;
}

.zoom-level {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* Help text */
.help-text {
  position: absolute;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-2) var(--space-4);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--text-tertiary);
  box-shadow: var(--shadow-md);
}

/* Mobile Responsive Styles */
@media (max-width: 1023px) {
  .whiteboard-toolbar {
    top: var(--space-3);
    padding: var(--space-1);
    gap: var(--space-1);
    flex-wrap: wrap;
    justify-content: center;
    max-width: calc(100% - var(--space-6));
  }
  
  .tool-btn {
    width: 32px;
    height: 32px;
  }
  
  .tool-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .shape-btn {
    width: 24px;
    height: 24px;
  }
  
  .shape-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .color-btn {
    width: 20px;
    height: 20px;
  }
  
  .tool-divider {
    height: 24px;
  }
  
  .zoom-controls {
    bottom: var(--space-3);
    right: var(--space-3);
    padding: var(--space-1);
  }
  
  .zoom-controls button {
    width: 28px;
    height: 28px;
  }
  
  .zoom-level {
    font-size: 12px;
    min-width: 40px;
  }
  
  .help-text {
    display: none;
  }
  
  /* Larger touch targets for mobile */
  .resize-handle {
    width: 16px;
    height: 16px;
  }
  
  .resize-handle.nw { top: -8px; left: -8px; }
  .resize-handle.ne { top: -8px; right: -8px; }
  .resize-handle.sw { bottom: -8px; left: -8px; }
  .resize-handle.se { bottom: -8px; right: -8px; }
}

@media (max-width: 767px) {
  .whiteboard-toolbar {
    top: var(--space-2);
    border-radius: var(--radius-md);
  }
  
  .tool-section.shapes {
    display: none;
  }
  
  .tool-section.colors {
    order: -1;
  }
  
  .colors {
    gap: 2px;
  }
  
  .color-btn {
    width: 18px;
    height: 18px;
  }
  
  .stroke-width {
    display: none;
  }
  
  .zoom-controls {
    bottom: var(--space-2);
    right: var(--space-2);
  }
}

@media (max-width: 479px) {
  .whiteboard-toolbar {
    left: var(--space-2);
    right: var(--space-2);
    transform: none;
    justify-content: space-between;
  }
  
  .tool-btn {
    width: 28px;
    height: 28px;
  }
  
  .tool-btn svg {
    width: 14px;
    height: 14px;
  }
  
  .zoom-controls {
    bottom: 80px; /* Above mobile nav */
  }
}
</style>

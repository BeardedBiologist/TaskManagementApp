<template>
  <Teleport to="body">
      <div
        ref="menuRef"
        class="slash-menu"
        :style="menuStyle"
        @mousedown.prevent
      >
        <div class="menu-header">Basic blocks</div>
        <div class="menu-items">
          <button
            v-for="item in filteredItems"
            :key="item.type"
            class="menu-item"
            :class="{ 'is-selected': selectedIndex === items.indexOf(item) }"
            @click="selectItem(item)"
            @mouseenter="selectedIndex = items.indexOf(item)"
          >
            <div class="item-icon" :style="{ background: item.iconBg }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="item.icon"></svg>
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-description">{{ item.description }}</div>
            </div>
            <div class="item-shortcut" v-if="item.shortcut">{{ item.shortcut }}</div>
          </button>
        </div>
      </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  position: Object,
  filter: String
})

const emit = defineEmits(['select', 'close'])

const menuRef = ref(null)
const selectedIndex = ref(0)

const items = [
  {
    type: 'text',
    name: 'Text',
    description: 'Just start writing with plain text.',
    icon: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/>',
    iconBg: '#e3e2e0',
    shortcut: ''
  },
  {
    type: 'heading1',
    name: 'Heading 1',
    description: 'Big section heading.',
    icon: '<path d="M4 12h16M4 18V6M12 18V6M20 18V6"/>',
    iconBg: '#fdecc8',
    shortcut: '#'
  },
  {
    type: 'heading2',
    name: 'Heading 2',
    description: 'Medium section heading.',
    icon: '<path d="M4 12h16M4 18V6M12 18V6M20 18V6"/>',
    iconBg: '#fdecc8',
    shortcut: '##'
  },
  {
    type: 'heading3',
    name: 'Heading 3',
    description: 'Small section heading.',
    icon: '<path d="M4 12h16M4 18V6M12 18V6M20 18V6"/>',
    iconBg: '#fdecc8',
    shortcut: '###'
  },
  {
    type: 'todo',
    name: 'To-do list',
    description: 'Track tasks with a to-do list.',
    icon: '<path d="M9 11l3 3L22 4"/><rect x="1" y="1" width="22" height="22" rx="5" ry="5"/>',
    iconBg: '#ffe2dd',
    shortcut: '[]'
  },
  {
    type: 'bullet',
    name: 'Bulleted list',
    description: 'Create a simple bulleted list.',
    icon: '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="4" cy="18" r="2"/>',
    iconBg: '#e3e2e0',
    shortcut: '-'
  },
  {
    type: 'numbered',
    name: 'Numbered list',
    description: 'Create a list with numbering.',
    icon: '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4H4zm0 6h1v4H4zm0 6h1v-2H4"/>',
    iconBg: '#e3e2e0',
    shortcut: '1.'
  },
  {
    type: 'quote',
    name: 'Quote',
    description: 'Capture a quote.',
    icon: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1h2z"/>',
    iconBg: '#fdecc8',
    shortcut: '>'
  },
  {
    type: 'divider',
    name: 'Divider',
    description: 'Visually divide blocks.',
    icon: '<line x1="4" y1="12" x2="20" y2="12"/>',
    iconBg: '#e3e2e0',
    shortcut: '---'
  },
  {
    type: 'code',
    name: 'Code',
    description: 'Capture a code snippet.',
    icon: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    iconBg: '#f1f1ef',
    shortcut: '```'
  },
  {
    type: 'image',
    name: 'Image',
    description: 'Upload or embed with a link.',
    icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    iconBg: '#f1f1ef',
    shortcut: ''
  }
]

const filteredItems = computed(() => {
  if (!props.filter) return items
  const filter = props.filter.toLowerCase()
  return items.filter(item => 
    item.name.toLowerCase().includes(filter) ||
    item.type.toLowerCase().includes(filter)
  )
})

const menuStyle = computed(() => ({
  position: 'fixed',
  left: `${props.position.x}px`,
  top: `${props.position.y + 10}px`,
  zIndex: 1000
}))

function selectItem(item) {
  emit('select', item.type)
}

function onKeydown(e) {
  const filtered = filteredItems.value
  const currentFilteredIndex = filtered.indexOf(items[selectedIndex.value])
  
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (currentFilteredIndex < filtered.length - 1) {
        selectedIndex.value = items.indexOf(filtered[currentFilteredIndex + 1])
      }
      break
    case 'ArrowUp':
      e.preventDefault()
      if (currentFilteredIndex > 0) {
        selectedIndex.value = items.indexOf(filtered[currentFilteredIndex - 1])
      }
      break
    case 'Enter':
      e.preventDefault()
      if (filtered[currentFilteredIndex]) {
        emit('select', filtered[currentFilteredIndex].type)
      }
      break
    case 'Escape':
      e.preventDefault()
      emit('close')
      break
  }
}

function onClickOutside(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('mousedown', onClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('mousedown', onClickOutside)
})

watch(() => props.filter, () => {
  const first = filteredItems.value[0]
  selectedIndex.value = first ? items.indexOf(first) : 0
})
</script>

<style scoped>
.slash-menu {
  width: 320px;
  z-index: 1000;
  max-height: 400px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: fadeIn 0.1s ease;
}

.menu-header {
  padding: var(--space-2) var(--space-3);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-subtle);
}

.menu-items {
  max-height: 350px;
  overflow-y: auto;
  padding: var(--space-1);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.1s ease;
}

.menu-item:hover,
.menu-item.is-selected {
  background: var(--bg-hover);
}

.item-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.item-icon svg {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.item-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.item-shortcut {
  font-size: 12px;
  color: var(--text-muted);
  font-family: monospace;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

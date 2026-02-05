<template>
  <Teleport to="body">
    <div class="link-menu-overlay" @click="$emit('close')">
      <div class="link-menu" :style="menuStyle" @click.stop>
        <div class="menu-header">Link to a page</div>
        <div class="menu-items">
          <button
            v-for="page in filteredPages"
            :key="page._id"
            class="menu-item"
            :class="{ 'is-selected': selectedIndex === filteredPages.indexOf(page) }"
            @click="selectPage(page)"
            @mouseenter="selectedIndex = filteredPages.indexOf(page)"
          >
            <span class="page-icon">{{ page.icon || '📄' }}</span>
            <div class="page-info">
              <div class="page-title">{{ page.title || 'Untitled' }}</div>
              <div class="page-subtitle">Page</div>
            </div>
          </button>
          <div v-if="filteredPages.length === 0" class="menu-empty">
            No matching pages
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  position: Object,
  filter: String,
  pages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'close'])

const selectedIndex = ref(0)

const filteredPages = computed(() => {
  if (!props.filter) return props.pages
  const filter = props.filter.toLowerCase()
  return props.pages.filter(page =>
    (page.title || 'Untitled').toLowerCase().includes(filter)
  )
})

const menuStyle = computed(() => ({
  position: 'fixed',
  left: `${props.position.x}px`,
  top: `${props.position.y + 10}px`,
  zIndex: 1000
}))

function selectPage(page) {
  emit('select', page)
}

function onKeydown(e) {
  const list = filteredPages.value
  if (list.length === 0) return
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, list.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)
      break
    case 'Enter':
      e.preventDefault()
      selectPage(list[selectedIndex.value])
      break
    case 'Escape':
      e.preventDefault()
      emit('close')
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})

watch(() => props.filter, () => {
  selectedIndex.value = 0
})
</script>

<style scoped>
.link-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.link-menu {
  width: 300px;
  max-height: 320px;
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
  max-height: 270px;
  overflow-y: auto;
  padding: var(--space-1);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-primary);
  text-align: left;
  transition: background-color 0.1s ease;
}

.menu-item:hover,
.menu-item.is-selected {
  background: var(--bg-hover);
}

.page-icon {
  font-size: 16px;
}

.page-info {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 13px;
  font-weight: 500;
}

.page-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

.menu-empty {
  padding: var(--space-3);
  font-size: 12px;
  color: var(--text-muted);
}
</style>

<template>
  <Teleport to="body">
    <div 
      class="block-menu-overlay" 
      @click="$emit('close')"
    >
      <div 
        class="block-menu"
        :style="menuStyle"
        @click.stop
      >
        <div class="menu-items">
          <button
            v-for="item in items"
            :key="item.type"
            class="menu-item"
            @click="selectItem(item)"
          >
            <div class="item-icon" :style="{ background: item.iconBg }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="item.icon"></svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  position: Object
})

const emit = defineEmits(['select', 'close'])

const items = [
  {
    type: 'text',
    icon: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/>',
    iconBg: '#e3e2e0'
  },
  {
    type: 'heading1',
    icon: '<path d="M4 12h16M4 18V6M12 18V6M20 18V6"/>',
    iconBg: '#fdecc8'
  },
  {
    type: 'todo',
    icon: '<path d="M9 11l3 3L22 4"/><rect x="1" y="1" width="22" height="22" rx="5" ry="5"/>',
    iconBg: '#ffe2dd'
  },
  {
    type: 'bullet',
    icon: '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="4" cy="18" r="2"/>',
    iconBg: '#e3e2e0'
  },
  {
    type: 'image',
    icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    iconBg: '#f1f1ef'
  }
]

const menuStyle = computed(() => ({
  position: 'fixed',
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  zIndex: 1000
}))

function selectItem(item) {
  emit('select', item.type)
}
</script>

<style scoped>
.block-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.block-menu {
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: fadeIn 0.1s ease;
}

.menu-items {
  display: flex;
  padding: var(--space-1);
  gap: var(--space-1);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.menu-item:hover {
  background: var(--bg-hover);
}

.item-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.item-icon svg {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

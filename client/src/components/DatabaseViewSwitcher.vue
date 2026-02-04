<template>
  <div class="database-view">
    <!-- View Tabs -->
    <div class="view-tabs">
      <div class="view-list">
        <button
          v-for="view in views"
          :key="view.id"
          class="view-tab"
          :class="{ active: currentView === view.type }"
          @click="switchView(view.type)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="view.icon"></svg>
          <span>{{ view.name }}</span>
        </button>
      </div>
      
      <div class="view-actions">
        <button class="action-btn" @click="$emit('filter')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span>Filter</span>
        </button>
        <button class="action-btn" @click="$emit('sort')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4"/>
          </svg>
          <span>Sort</span>
        </button>
        <button class="action-btn" @click="$emit('properties')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          <span>Properties</span>
        </button>
        <button class="action-btn new-view-btn" @click="$emit('new-view')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Search within view -->
    <div class="view-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        placeholder="Search or filter..."
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  currentView: {
    type: String,
    default: 'board'
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:currentView', 'update:searchQuery', 'filter', 'sort', 'properties', 'new-view'])

const views = [
  {
    id: 'table',
    type: 'table',
    name: 'Table',
    icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>'
  },
  {
    id: 'board',
    type: 'board',
    name: 'Board',
    icon: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>'
  },
  {
    id: 'list',
    type: 'list',
    name: 'List',
    icon: '<line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="4" cy="18" r="2"/>'
  },
  {
    id: 'calendar',
    type: 'calendar',
    name: 'Calendar',
    icon: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'
  },
  {
    id: 'gallery',
    type: 'gallery',
    name: 'Gallery',
    icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'
  }
]

function switchView(viewType) {
  emit('update:currentView', viewType)
}
</script>

<style scoped>
.database-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--border-divider);
}

.view-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.view-list {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.view-tab {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.1s ease;
  white-space: nowrap;
}

.view-tab:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.view-tab.active {
  background: var(--bg-hover);
  color: var(--text-primary);
  font-weight: 500;
}

.view-tab svg {
  width: 14px;
  height: 14px;
}

.view-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.1s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
  color: var(--text-primary);
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.new-view-btn {
  padding: var(--space-1);
  width: 28px;
  height: 28px;
  justify-content: center;
}

.view-search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  max-width: 300px;
}

.view-search svg {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
}

.view-search input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
}

.view-search input::placeholder {
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .view-tabs {
    flex-wrap: wrap;
  }
  
  .view-actions span {
    display: none;
  }
  
  .view-search {
    max-width: 100%;
  }
}
</style>

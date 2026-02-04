<template>
  <nav class="breadcrumbs">
    <div class="breadcrumb-items">
      <template v-for="(item, index) in items" :key="index">
        <router-link
          v-if="item.to"
          :to="item.to"
          class="breadcrumb-link"
          :class="{ 'is-last': index === items.length - 1 }"
        >
          <svg v-if="item.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="item.icon"></svg>
          <span>{{ item.label }}</span>
        </router-link>
        <span v-else class="breadcrumb-text">{{ item.label }}</span>
        <span v-if="index < items.length - 1" class="breadcrumb-separator">/</span>
      </template>
    </div>
    
    <!-- Share Button -->
    <button class="share-btn" @click="$emit('share')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
      <span>Share</span>
    </button>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

defineEmits(['share'])
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) 0;
}

.breadcrumb-items {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.breadcrumb-link,
.breadcrumb-text {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.1s ease;
}

.breadcrumb-link:hover {
  color: var(--text-primary);
}

.breadcrumb-link.is-last {
  color: var(--text-primary);
  font-weight: 500;
}

.breadcrumb-link svg {
  width: 14px;
  height: 14px;
}

.breadcrumb-separator {
  color: var(--text-muted);
  font-size: 12px;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: var(--accent-blue);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.share-btn:hover {
  background: #1d4ed8;
}

.share-btn svg {
  width: 14px;
  height: 14px;
}
</style>

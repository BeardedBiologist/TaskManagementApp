<template>
  <Layout>
    <div class="activity-view">
      <header class="view-header">
        <h1>Activity</h1>
        <p>Track what's happening across your workspaces</p>
        <button class="btn btn-icon btn-ghost activity-toggle" type="button" @click="showActivity = !showActivity" :title="showActivity ? 'Hide activity' : 'Show activity'">
          <svg v-if="showActivity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </header>

      <div v-if="showActivity" class="activity-content">
        <ActivityFeed
          :activities="activities"
          :loading="loading"
          :has-more="hasMore"
          :show-header="false"
          @load-more="loadMore"
        />
      </div>
      <div v-else class="activity-empty">
        Activity hidden
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '../components/Layout.vue'
import ActivityFeed from '../components/ActivityFeed.vue'
import api from '../utils/api'

const activities = ref([])
const loading = ref(false)
const hasMore = ref(true)
const lastTimestamp = ref(null)
const showActivity = ref(true)

onMounted(async () => {
  await loadActivities()
})

async function loadActivities() {
  loading.value = true
  try {
    const { data } = await api.get('/activities/all?limit=50')
    activities.value = data
    hasMore.value = data.length === 50
    lastTimestamp.value = data[data.length - 1]?.timestamp || null
  } catch (err) {
    console.error('Failed to load activities:', err)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!lastTimestamp.value) return
  loading.value = true
  try {
    const { data } = await api.get(`/activities/all?limit=50&before=${encodeURIComponent(lastTimestamp.value)}`)
    activities.value.push(...data)
    hasMore.value = data.length === 50
    if (data.length > 0) {
      lastTimestamp.value = data[data.length - 1]?.timestamp || lastTimestamp.value
    }
  } catch (err) {
    console.error('Failed to load more activities:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.activity-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.view-header {
  margin-bottom: var(--space-8);
}

.view-header h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.view-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.activity-toggle {
  margin-top: var(--space-3);
}

.activity-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  min-height: calc(100vh - 200px);
}

.activity-empty {
  color: var(--text-secondary);
  padding: var(--space-6);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-lg);
}
</style>

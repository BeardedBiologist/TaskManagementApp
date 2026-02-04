<template>
  <Layout>
    <div class="workspaces-page">
      <header class="page-header">
        <div>
          <h1>Workspaces</h1>
          <p class="subtitle">Manage your team workspaces</p>
        </div>
        <button class="btn btn-primary" @click="showCreateModal = true">
          + New Workspace
        </button>
      </header>

      <div v-if="workspaceStore.loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div
        v-else-if="workspaceStore.workspaces.length === 0"
        class="empty-state card"
      >
        <div class="empty-icon">🏢</div>
        <h3>No workspaces yet</h3>
        <p>
          Create your first workspace to start collaborating with your team.
        </p>
        <button class="btn btn-primary" @click="showCreateModal = true">
          Create Workspace
        </button>
      </div>

      <div v-else class="workspaces-list">
        <div
          v-for="workspace in workspaceStore.workspaces"
          :key="workspace._id"
          class="workspace-card"
          @click="navigateToWorkspace(workspace._id)"
        >
          <div class="workspace-content">
            <div class="workspace-avatar">{{ workspace.name[0] }}</div>
            <div class="workspace-details">
              <h3>{{ workspace.name }}</h3>
              <p>{{ workspace.description || "No description" }}</p>
              <div class="workspace-meta">
                <span>{{ workspace.projects?.length || 0 }} projects</span>
                <span>•</span>
                <span>{{ workspace.members?.length || 1 }} members</span>
              </div>
            </div>
          </div>
          <div class="workspace-actions">
            <router-link
              :to="`/workspaces/${workspace._id}`"
              class="btn btn-secondary"
              @click.stop
            >
              View
            </router-link>
            <button class="btn btn-icon" @click.stop="editWorkspace(workspace)">
              ✏️
            </button>
            <button class="btn btn-icon" @click.stop="confirmDelete(workspace)">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Create Modal -->
      <div
        v-if="showCreateModal"
        class="modal-overlay"
        @click="showCreateModal = false"
      >
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>Create New Workspace</h2>
            <button class="btn-icon" @click="showCreateModal = false">✕</button>
          </div>
          <form @submit.prevent="createWorkspace">
            <div class="form-group">
              <label class="form-label">Workspace Name *</label>
              <input
                v-model="newWorkspace.name"
                type="text"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="newWorkspace.description"
                class="form-input"
                rows="3"
              ></textarea>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="showCreateModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="creating"
              >
                {{ creating ? "Creating..." : "Create" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Modal -->
      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click="showEditModal = false"
      >
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h2>Edit Workspace</h2>
            <button class="btn-icon" @click="showEditModal = false">✕</button>
          </div>
          <form @submit.prevent="updateWorkspace">
            <div class="form-group">
              <label class="form-label">Workspace Name *</label>
              <input
                v-model="editingWorkspace.name"
                type="text"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                v-model="editingWorkspace.description"
                class="form-input"
                rows="3"
              ></textarea>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="showEditModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="updating"
              >
                {{ updating ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Modal -->
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click="showDeleteModal = false"
      >
        <div class="modal modal-sm" @click.stop>
          <div class="modal-header">
            <h2>Delete Workspace</h2>
            <button class="btn-icon" @click="showDeleteModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>
              Are you sure you want to delete "<strong>{{
                deletingWorkspace?.name
              }}</strong
              >"? This action cannot be undone.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDeleteModal = false">
              Cancel
            </button>
            <button
              class="btn btn-danger"
              @click="deleteWorkspace"
              :disabled="deleting"
            >
              {{ deleting ? "Deleting..." : "Delete" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Layout from "../components/Layout.vue";
import { useWorkspaceStore } from "../stores/workspace";

const router = useRouter();
const workspaceStore = useWorkspaceStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const creating = ref(false);
const updating = ref(false);
const deleting = ref(false);

const newWorkspace = ref({ name: "", description: "" });
const editingWorkspace = ref(null);
const deletingWorkspace = ref(null);

onMounted(() => {
  workspaceStore.fetchWorkspaces();
});

async function createWorkspace() {
  creating.value = true;
  try {
    await workspaceStore.createWorkspace(newWorkspace.value);
    showCreateModal.value = false;
    newWorkspace.value = { name: "", description: "" };
  } finally {
    creating.value = false;
  }
}

function editWorkspace(workspace) {
  editingWorkspace.value = { ...workspace };
  showEditModal.value = true;
}

async function updateWorkspace() {
  updating.value = true;
  try {
    await workspaceStore.updateWorkspace(editingWorkspace.value._id, {
      name: editingWorkspace.value.name,
      description: editingWorkspace.value.description,
    });
    showEditModal.value = false;
    editingWorkspace.value = null;
  } finally {
    updating.value = false;
  }
}

function confirmDelete(workspace) {
  deletingWorkspace.value = workspace;
  showDeleteModal.value = true;
}

async function deleteWorkspace() {
  deleting.value = true;
  try {
    await workspaceStore.deleteWorkspace(deletingWorkspace.value._id);
    showDeleteModal.value = false;
    deletingWorkspace.value = null;
  } finally {
    deleting.value = false;
  }
}

function navigateToWorkspace(id) {
  router.push(`/workspaces/${id}`);
}
</script>

<style scoped>
.workspaces-page {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-secondary);
}

.workspaces-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.workspace-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.workspace-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}

.workspace-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.workspace-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
}

.workspace-details h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.workspace-details p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.workspace-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: var(--space-2);
}

.workspace-actions {
  display: flex;
  gap: var(--space-2);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--overlay-bg, rgba(0, 0, 0, 0.5));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 400px;
  margin: 1rem;
  box-shadow: var(--shadow-lg);
}

.modal-sm {
  max-width: 350px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
}

.modal form {
  padding: var(--space-6);
}

.modal-body {
  padding: var(--space-6);
}

.modal-body p {
  color: var(--text-secondary);
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
}
</style>

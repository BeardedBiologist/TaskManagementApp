import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref([])
  const currentWorkspace = ref(null)
  const pendingInvites = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchWorkspaces() {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.get('/workspaces')
      workspaces.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch workspaces'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchWorkspace(id) {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.get(`/workspaces/${id}`)
      currentWorkspace.value = data.workspace || data
      pendingInvites.value = data.invites || []
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch workspace'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createWorkspace(workspaceData) {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.post('/workspaces', workspaceData)
      workspaces.value.push(data)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create workspace'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateWorkspace(id, updates) {
    try {
      const { data } = await api.put(`/workspaces/${id}`, updates)
      const index = workspaces.value.findIndex(w => w._id === id)
      if (index !== -1) {
        workspaces.value[index] = data
      }
      if (currentWorkspace.value?._id === id) {
        currentWorkspace.value = data
      }
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update workspace'
      throw err
    }
  }

  async function deleteWorkspace(id) {
    try {
      await api.delete(`/workspaces/${id}`)
      workspaces.value = workspaces.value.filter(w => w._id !== id)
      if (currentWorkspace.value?._id === id) {
        currentWorkspace.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete workspace'
      throw err
    }
  }

  async function addMember(workspaceId, userIdOrEmail, role = 'member') {
    try {
      const { data } = await api.post(`/workspaces/${workspaceId}/members`, {
        role,
        ...(userIdOrEmail?.includes?.('@')
          ? { email: userIdOrEmail }
          : { userId: userIdOrEmail })
      })
      if (data?.invited) {
        await fetchPendingInvites(workspaceId)
        return data
      }
      if (currentWorkspace.value?._id === workspaceId) {
        currentWorkspace.value = data
      }
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to add member'
      throw err
    }
  }

  async function fetchPendingInvites(workspaceId) {
    try {
      const { data } = await api.get(`/workspaces/${workspaceId}/invites`)
      pendingInvites.value = data
      return data
    } catch (err) {
      if (err.response?.status === 403) {
        pendingInvites.value = []
        return []
      }
      error.value = err.response?.data?.message || 'Failed to fetch invites'
      throw err
    }
  }

  async function deleteInvite(workspaceId, inviteId) {
    try {
      await api.delete(`/workspaces/${workspaceId}/invites/${inviteId}`)
      pendingInvites.value = pendingInvites.value.filter(invite => invite._id !== inviteId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete invite'
      throw err
    }
  }

  function setCurrentWorkspace(workspace) {
    currentWorkspace.value = workspace
  }

  function clearCurrentWorkspace() {
    currentWorkspace.value = null
  }

  return {
    workspaces,
    currentWorkspace,
    pendingInvites,
    loading,
    error,
    fetchWorkspaces,
    fetchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addMember,
    fetchPendingInvites,
    deleteInvite,
    setCurrentWorkspace,
    clearCurrentWorkspace
  }
})

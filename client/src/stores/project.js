import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utils/api'

export const useProjectStore = defineStore('project', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchProjects(workspaceId = null) {
    loading.value = true
    error.value = null
    
    try {
      const params = workspaceId ? { workspaceId } : {}
      const { data } = await api.get('/projects', { params })
      projects.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch projects'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTasks() {
    // Fetch all tasks for the user (for page tasks)
    try {
      const { data } = await api.get('/tasks')
      tasks.value = data
      return data
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      return []
    }
  }

  async function fetchProject(id) {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.get(`/projects/${id}`)
      currentProject.value = data.project
      tasks.value = data.tasks
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch project'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProject(projectData) {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.post('/projects', projectData)
      projects.value.push(data)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create project'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id, updates) {
    try {
      const { data } = await api.put(`/projects/${id}`, updates)
      const index = projects.value.findIndex(p => p._id === id)
      if (index !== -1) {
        projects.value[index] = data
      }
      if (currentProject.value?._id === id) {
        currentProject.value = data
      }
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update project'
      throw err
    }
  }

  async function deleteProject(id) {
    try {
      await api.delete(`/projects/${id}`)
      projects.value = projects.value.filter(p => p._id !== id)
      if (currentProject.value?._id === id) {
        currentProject.value = null
        tasks.value = []
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete project'
      throw err
    }
  }

  // Task actions
  async function createTask(taskData) {
    try {
      const { data } = await api.post('/tasks', taskData)
      tasks.value.push(data)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create task'
      throw err
    }
  }

  async function updateTask(taskId, updates) {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, updates)
      const index = tasks.value.findIndex(t => t._id === taskId)
      if (index !== -1) {
        tasks.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update task'
      throw err
    }
  }

  async function moveTask(taskId, columnId, order) {
    try {
      const { data } = await api.post(`/tasks/${taskId}/move`, { columnId, order })
      const index = tasks.value.findIndex(t => t._id === taskId)
      if (index !== -1) {
        tasks.value[index] = data
      }
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to move task'
      throw err
    }
  }

  async function deleteTask(taskId) {
    try {
      await api.delete(`/tasks/${taskId}`)
      tasks.value = tasks.value.filter(t => t._id !== taskId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete task'
      throw err
    }
  }

  // Local state updates for real-time
  function addTaskToState(task) {
    const exists = tasks.value.find(t => t._id === task._id)
    if (!exists) {
      tasks.value.push(task)
    }
  }

  function updateTaskInState(updatedTask) {
    const index = tasks.value.findIndex(t => t._id === updatedTask._id)
    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
  }

  function removeTaskFromState(taskId) {
    tasks.value = tasks.value.filter(t => t._id !== taskId)
  }

  function setCurrentProject(project) {
    currentProject.value = project
  }

  function clearCurrentProject() {
    currentProject.value = null
    tasks.value = []
  }

  return {
    projects,
    currentProject,
    tasks,
    loading,
    error,
    fetchProjects,
    fetchProject,
    fetchTasks,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    addTaskToState,
    updateTaskInState,
    removeTaskFromState,
    setCurrentProject,
    clearCurrentProject
  }
})

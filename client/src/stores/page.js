import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../utils/api'

export const usePageStore = defineStore('page', () => {
  const pages = ref([])
  const currentPage = ref(null)
  const childPages = ref([])
  const breadcrumb = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Get pages for a specific project
  const projectPages = computed(() => {
    return (projectId) => pages.value.filter(p => p.project === projectId && !p.parent)
  })

  async function fetchPages(projectId) {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.get(`/pages/project/${projectId}`)
      // Replace pages for this project
      const otherPages = pages.value.filter(p => p.project !== projectId)
      pages.value = [...otherPages, ...data]
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch pages'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchChildPages(pageId) {
    try {
      const { data } = await api.get(`/pages/${pageId}/children`)
      childPages.value = data
      return data
    } catch (err) {
      console.error('Failed to fetch child pages:', err)
      return []
    }
  }

  async function fetchPage(id) {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.get(`/pages/${id}`)
      currentPage.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch page'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchBreadcrumb(pageId) {
    try {
      const { data } = await api.get(`/pages/${pageId}/breadcrumb`)
      breadcrumb.value = data
      return data
    } catch (err) {
      console.error('Failed to fetch breadcrumb:', err)
      return []
    }
  }

  async function createPage(pageData) {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await api.post('/pages', pageData)
      pages.value.unshift(data)
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create page'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePage(id, updates) {
    error.value = null
    
    try {
      const { data } = await api.put(`/pages/${id}`, updates)
      
      // Update in pages list
      const index = pages.value.findIndex(p => p._id === id)
      if (index !== -1) {
        pages.value[index] = data
      }
      
      // Update current page if it's the one being edited
      if (currentPage.value?._id === id) {
        currentPage.value = data
      }
      
      return data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update page'
      throw err
    }
  }

  async function deletePage(id) {
    try {
      await api.delete(`/pages/${id}`)
      pages.value = pages.value.filter(p => p._id !== id)
      
      if (currentPage.value?._id === id) {
        currentPage.value = null
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete page'
      throw err
    }
  }

  function setCurrentPage(page) {
    currentPage.value = page
  }

  function clearCurrentPage() {
    currentPage.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    pages,
    currentPage,
    childPages,
    breadcrumb,
    loading,
    error,
    projectPages,
    fetchPages,
    fetchChildPages,
    fetchPage,
    fetchBreadcrumb,
    createPage,
    updatePage,
    deletePage,
    setCurrentPage,
    clearCurrentPage,
    clearError
  }
})

<template>
  <div class="layout" :class="{ minimal }">
    <!-- Mobile Header -->
    <header v-if="!minimal" class="mobile-header">
      <button class="hamburger-btn" @click="showMobileSidebar = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <router-link to="/dashboard" class="mobile-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="brand-text">Orbit</span>
      </router-link>
      <div class="mobile-actions">
        <Notifications />
      </div>
    </header>

    <!-- Desktop Sidebar -->
    <aside v-if="!minimal" class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <router-link to="/dashboard" class="sidebar-brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="brand-text" v-if="!sidebarCollapsed">Orbit</span>
      </router-link>

      <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? 'Expand' : 'Collapse'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'rotate-180': sidebarCollapsed }">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <nav class="sidebar-nav">
        <router-link to="/dashboard" class="nav-item" :class="{ active: $route.path === '/dashboard', collapsed: sidebarCollapsed }" :title="sidebarCollapsed ? 'Dashboard' : ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span v-if="!sidebarCollapsed">Dashboard</span>
        </router-link>

        <router-link to="/workspaces" class="nav-item" :class="{ active: $route.path.startsWith('/workspaces'), collapsed: sidebarCollapsed }" :title="sidebarCollapsed ? 'Workspaces' : ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span v-if="!sidebarCollapsed">Workspaces</span>
        </router-link>

        <router-link to="/calendar" class="nav-item" :class="{ active: $route.path === '/calendar', collapsed: sidebarCollapsed }" :title="sidebarCollapsed ? 'Calendar' : ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span v-if="!sidebarCollapsed">Calendar</span>
        </router-link>
        
        <router-link to="/activity" class="nav-item" :class="{ active: $route.path === '/activity', collapsed: sidebarCollapsed }" :title="sidebarCollapsed ? 'Activity' : ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span v-if="!sidebarCollapsed">Activity</span>
        </router-link>
        
        <router-link to="/chat" class="nav-item" :class="{ active: $route.path === '/chat', collapsed: sidebarCollapsed }" :title="sidebarCollapsed ? 'Messages' : ''">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span v-if="!sidebarCollapsed">Messages</span>
          <span v-if="!sidebarCollapsed && chatUnreadCount > 0" class="nav-badge">
            {{ chatUnreadCount > 9 ? '9+' : chatUnreadCount }}
          </span>
        </router-link>
        
      </nav>

      <div class="sidebar-section workspace-section" v-if="!sidebarCollapsed && workspaceStore.workspaces.length">
        <div class="section-header">
          <span>Workspaces</span>
        </div>
        <div class="workspace-tree">
          <div 
            v-for="workspace in workspaceStore.workspaces" 
            :key="workspace._id"
            class="workspace-item"
          >
            <!-- Workspace Header -->
            <div class="tree-header">
              <button 
                class="tree-toggle"
                :class="{ expanded: expandedWorkspaces.includes(workspace._id) }"
                @click="toggleWorkspace(workspace._id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <router-link 
                :to="`/workspaces/${workspace._id}`"
                class="tree-link"
                :class="{ active: $route.params.id === workspace._id && !$route.params.projectId }"
              >
                <div class="workspace-dot" :style="{ background: generateColor(workspace.name) }"></div>
                <span class="tree-name">{{ workspace.name }}</span>
              </router-link>
            </div>

            <!-- Projects -->
            <div v-if="expandedWorkspaces.includes(workspace._id)" class="tree-children">
              <div
                v-for="project in getWorkspaceProjects(workspace._id)"
                :key="project._id"
                class="project-item"
              >
                <!-- Project Header -->
                <div class="tree-header">
                  <button 
                    class="tree-toggle small"
                    :class="{ expanded: expandedProjects.includes(project._id) }"
                    @click="toggleProject(project._id)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                  <router-link 
                    :to="`/projects/${project._id}`"
                    class="tree-link"
                    :class="{ active: isProjectActive(project._id) }"
                  >
                    <div class="project-dot" :style="{ background: generateColor(project.name) }"></div>
                    <span class="tree-name">{{ project.name }}</span>
                  </router-link>
                </div>

                <!-- Project Contents: Pages & Tasks -->
                <div v-if="expandedProjects.includes(project._id)" class="tree-children">
                  <!-- Notes/Pages -->
                  <div class="content-group">
                    <div class="group-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span class="group-label">Notes</span>
                      <span v-if="showPagesExpand(project._id)" class="count-badge">
                        {{ getVisiblePages(project._id).length }} / {{ getProjectPages(project._id).length }}
                      </span>
                      <span v-else-if="getProjectPages(project._id).length > 0" class="count-badge">
                        {{ getProjectPages(project._id).length }}
                      </span>
                      <button class="add-btn" @click.stop="createPage(project._id)">+</button>
                    </div>
                    <div class="group-items pages-list">
                      <div
                        v-for="page in getVisiblePages(project._id)"
                        :key="page._id"
                        class="page-row"
                        :class="{ active: $route.params.pageId === page._id }"
                      >
                        <router-link
                          v-if="editingPageId !== page._id"
                          :to="`/projects/${project._id}/pages/${page._id}`"
                          class="child-link"
                          :class="{ active: $route.params.pageId === page._id }"
                          @dblclick.prevent="startRename(page)"
                        >
                          <span class="page-icon">{{ page.icon || '📄' }}</span>
                          <span class="child-name">{{ page.title || 'Untitled' }}</span>
                        </router-link>
                        <div v-else class="page-edit">
                          <span class="page-icon">{{ page.icon || '📄' }}</span>
                          <input
                            v-model="editingPageTitle"
                            class="page-edit-input"
                            type="text"
                            @keydown.enter.prevent="commitRename(page)"
                            @keydown.esc.prevent="cancelRename"
                            @blur="commitRename(page)"
                          />
                        </div>
                        <div class="page-actions">
                          <button class="page-action-btn" @click.stop="startRename(page)" title="Rename">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M12 20h9"/>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                            </svg>
                          </button>
                          <button class="page-action-btn danger" @click.stop="deletePage(page, project._id)" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <button
                        v-if="showPagesExpand(project._id)"
                        class="show-more-btn"
                        @click.stop="togglePagesExpand(project._id)"
                      >
                        {{ isPagesExpanded(project._id) ? 'Show less' : `Show ${getProjectPages(project._id).length - 5} more` }}
                      </button>
                      <div v-if="getProjectPages(project._id).length === 0" class="empty-hint">
                        No notes yet
                      </div>
                    </div>
                  </div>

                  <!-- Tasks -->
                  <div class="content-group">
                    <div class="group-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                      <span class="group-label">Tasks</span>
                      <span v-if="getProjectTaskCount(project._id) > 0" class="count-badge">
                        {{ getProjectTaskCount(project._id) }}
                      </span>
                    </div>
                    <div class="group-items">
                      <router-link
                        :to="`/projects/${project._id}?view=board`"
                        class="child-link"
                        :class="{ active: $route.params.id === project._id && $route.query.view === 'board' }"
                      >
                        <span class="view-icon">📋</span>
                        <span class="child-name">Board</span>
                      </router-link>
                      <router-link
                        :to="`/projects/${project._id}?view=list`"
                        class="child-link"
                        :class="{ active: $route.params.id === project._id && $route.query.view === 'list' }"
                      >
                        <span class="view-icon">📑</span>
                        <span class="child-name">List</span>
                      </router-link>
                      <router-link
                        :to="`/projects/${project._id}?view=timeline`"
                        class="child-link"
                        :class="{ active: $route.params.id === project._id && $route.query.view === 'timeline' }"
                      >
                        <span class="view-icon">📅</span>
                        <span class="child-name">Timeline</span>
                      </router-link>
                    </div>
                  </div>

                  <!-- Whiteboards -->
                  <div class="content-group">
                    <div class="group-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <circle cx="15.5" cy="15.5" r="1.5"/>
                      </svg>
                      <span class="group-label">Whiteboards</span>
                      <span v-if="getProjectWhiteboards(project._id).length > 0" class="count-badge">
                        {{ getProjectWhiteboards(project._id).length }}
                      </span>
                      <button class="add-btn" @click.stop="createWhiteboard(project._id)">+</button>
                    </div>
                    <div class="group-items pages-list">
                      <router-link
                        v-for="board in getProjectWhiteboards(project._id)"
                        :key="board._id"
                        :to="`/projects/${project._id}?view=whiteboard&id=${board._id}`"
                        class="child-link"
                        :class="{ active: $route.params.id === project._id && $route.query.view === 'whiteboard' && $route.query.id === board._id }"
                      >
                        <span class="page-icon">🧩</span>
                        <span class="child-name">{{ board.name || 'Untitled' }}</span>
                      </router-link>
                      <div v-if="getProjectWhiteboards(project._id).length === 0" class="empty-hint">
                        No whiteboards yet
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-footer" v-if="!sidebarCollapsed">
        <div class="header-actions">
          <Notifications />
        </div>
        
        <button class="user-menu" @click="showUserMenu = !showUserMenu">
          <div class="avatar">{{ authStore.userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ authStore.userName }}</span>
            <span class="user-role">{{ authStore.user?.role }}</span>
          </div>
          <svg class="chevron" :class="{ open: showUserMenu }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <div v-if="showUserMenu" class="user-dropdown">
          <router-link to="/profile" class="dropdown-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </router-link>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item danger" @click="handleLogout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>

      <!-- Collapsed sidebar footer -->
      <div class="sidebar-footer-collapsed" v-else>
        <button class="avatar-btn" @click="handleLogout" title="Sign out">
          <div class="avatar">{{ authStore.userInitials }}</div>
        </button>
      </div>
    </aside>

    <!-- Mobile Sidebar Drawer -->
    <Teleport v-if="!minimal" to="body">
      <Transition name="fade">
        <div v-if="showMobileSidebar" class="mobile-overlay" @click="showMobileSidebar = false"></div>
      </Transition>
      <Transition name="slide-right">
        <aside v-if="showMobileSidebar" class="mobile-sidebar">
          <div class="mobile-sidebar-header">
            <router-link to="/dashboard" class="mobile-brand" @click="showMobileSidebar = false">
              <div class="brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="brand-text">Orbit</span>
            </router-link>
            <button class="close-btn" @click="showMobileSidebar = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <nav class="mobile-nav">
            <router-link to="/dashboard" class="nav-item" :class="{ active: $route.path === '/dashboard' }" @click="showMobileSidebar = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>Dashboard</span>
            </router-link>

            <router-link to="/workspaces" class="nav-item" :class="{ active: $route.path.startsWith('/workspaces') }" @click="showMobileSidebar = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Workspaces</span>
            </router-link>

            <router-link to="/calendar" class="nav-item" :class="{ active: $route.path === '/calendar' }" @click="showMobileSidebar = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Calendar</span>
            </router-link>
            
            <router-link to="/activity" class="nav-item" :class="{ active: $route.path === '/activity' }" @click="showMobileSidebar = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span>Activity</span>
            </router-link>
          </nav>

          <div class="mobile-sidebar-section" v-if="workspaceStore.workspaces.length">
            <div class="section-header">Workspaces</div>
            <div class="mobile-workspace-list">
              <div 
                v-for="workspace in workspaceStore.workspaces" 
                :key="workspace._id"
                class="mobile-workspace-item"
              >
                <div class="mobile-workspace-header" @click="toggleMobileWorkspace(workspace._id)">
                  <div class="workspace-link">
                    <div class="workspace-dot" :style="{ background: generateColor(workspace.name) }"></div>
                    <span>{{ workspace.name }}</span>
                  </div>
                  <svg class="chevron" :class="{ open: expandedMobileWorkspaces.includes(workspace._id) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                <div v-if="expandedMobileWorkspaces.includes(workspace._id)" class="mobile-project-list">
                  <div
                    v-for="project in getWorkspaceProjects(workspace._id)"
                    :key="project._id"
                    class="mobile-project-row"
                  >
                    <div class="mobile-project-header" @click="toggleMobileProject(project._id)">
                      <div class="project-link">
                        <div class="project-dot" :style="{ background: generateColor(project.name) }"></div>
                        <span>{{ project.name }}</span>
                      </div>
                      <svg class="chevron" :class="{ open: expandedMobileProjects.includes(project._id) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    <div v-if="expandedMobileProjects.includes(project._id)" class="mobile-project-children">
                      <div class="mobile-section-label">Notes</div>
                      <router-link
                        v-for="page in getProjectPages(project._id)"
                        :key="page._id"
                        :to="`/projects/${project._id}/pages/${page._id}`"
                        class="mobile-child-link"
                        @click="showMobileSidebar = false"
                      >
                        <span class="page-icon">{{ page.icon || '📄' }}</span>
                        <span>{{ page.title || 'Untitled' }}</span>
                      </router-link>
                      <div class="mobile-section-label">Tasks</div>
                      <router-link
                        :to="`/projects/${project._id}?view=board`"
                        class="mobile-child-link"
                        @click="showMobileSidebar = false"
                      >
                        <span class="view-icon">📋</span>
                        <span>Board</span>
                      </router-link>
                      <router-link
                        :to="`/projects/${project._id}?view=list`"
                        class="mobile-child-link"
                        @click="showMobileSidebar = false"
                      >
                        <span class="view-icon">📑</span>
                        <span>List</span>
                      </router-link>
                      <router-link
                        :to="`/projects/${project._id}?view=timeline`"
                        class="mobile-child-link"
                        @click="showMobileSidebar = false"
                      >
                        <span class="view-icon">📅</span>
                        <span>Timeline</span>
                      </router-link>
                      <div class="mobile-section-label">Whiteboards</div>
                      <router-link
                        v-for="board in getProjectWhiteboards(project._id)"
                        :key="board._id"
                        :to="`/projects/${project._id}?view=whiteboard&id=${board._id}`"
                        class="mobile-child-link"
                        @click="showMobileSidebar = false"
                      >
                        <span class="page-icon">🧩</span>
                        <span>{{ board.name || 'Untitled' }}</span>
                      </router-link>
                      <div v-if="getProjectWhiteboards(project._id).length === 0" class="mobile-empty">
                        No whiteboards yet
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mobile-sidebar-footer">
            <div class="mobile-user-info">
              <div class="avatar">{{ authStore.userInitials }}</div>
              <div class="user-details">
                <span class="user-name">{{ authStore.userName }}</span>
                <span class="user-role">{{ authStore.user?.role }}</span>
              </div>
            </div>
            <button class="logout-btn" @click="handleLogout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- Main content -->
    <main class="main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <slot />
    </main>

    <!-- Mobile Bottom Navigation -->
    <MobileNav v-if="!minimal" />
    
    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="showToast" class="toast-notification" @click="router.push('/chat')">
        <div class="toast-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="toast-content">
          <span class="toast-text">{{ toastMessage }}</span>
        </div>
        <button class="toast-close" @click.stop="showToast = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </Transition>
    
    <!-- Chat Widget -->
    <ChatWidget v-if="!minimal && authStore.isAuthenticated" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useWorkspaceStore } from '../stores/workspace'
import { useProjectStore } from '../stores/project'
import { usePageStore } from '../stores/page'
import { useSocketStore } from '../stores/socket'
import api from '../utils/api'
import Notifications from './Notifications.vue'
import MobileNav from './MobileNav.vue'
import ChatWidget from './ChatWidget.vue'
import { useChatStore } from '../stores/chat'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()
const pageStore = usePageStore()
const chatStore = useChatStore()

const chatUnreadCount = computed(() => chatStore.totalUnreadCount)
const socketStore = useSocketStore()
const showToast = ref(false)
const toastMessage = ref('')
let toastTimeout = null

// Watch for new messages and show toast
watch(chatUnreadCount, (newCount, oldCount) => {
  if (newCount > oldCount && route.path !== '/chat') {
    // Show toast notification
    toastMessage.value = `New message received`
    showToast.value = true
    
    // Clear previous timeout
    if (toastTimeout) clearTimeout(toastTimeout)
    
    // Hide after 3 seconds
    toastTimeout = setTimeout(() => {
      showToast.value = false
    }, 3000)
  }
})

const props = defineProps({
  minimal: {
    type: Boolean,
    default: false
  }
})

const showUserMenu = ref(false)
const showMobileSidebar = ref(false)
const sidebarCollapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true')
const whiteboardsByProject = ref({})
const allTasks = ref([])
const editingPageId = ref(null)
const editingPageTitle = ref('')
const expandedMobileWorkspaces = ref([])
const expandedMobileProjects = ref([])

// Watch sidebar collapsed state
watch(sidebarCollapsed, (val) => {
  localStorage.setItem('sidebarCollapsed', val)
})

// Load expanded state from localStorage
const savedExpandedWorkspaces = localStorage.getItem('expandedWorkspaces')
const savedExpandedProjects = localStorage.getItem('expandedProjects')
const savedExpandedPages = localStorage.getItem('expandedPages')
const expandedWorkspaces = ref(savedExpandedWorkspaces ? JSON.parse(savedExpandedWorkspaces) : [])
const expandedProjects = ref(savedExpandedProjects ? JSON.parse(savedExpandedProjects) : [])
const expandedPages = ref(savedExpandedPages ? JSON.parse(savedExpandedPages) : [])

// Save expanded state to localStorage when it changes
watch(expandedWorkspaces, (val) => {
  localStorage.setItem('expandedWorkspaces', JSON.stringify(val))
}, { deep: true })

watch(expandedProjects, (val) => {
  localStorage.setItem('expandedProjects', JSON.stringify(val))
}, { deep: true })

watch(expandedPages, (val) => {
  localStorage.setItem('expandedPages', JSON.stringify(val))
}, { deep: true })

onMounted(async () => {
  await workspaceStore.fetchWorkspaces()
  await projectStore.fetchProjects()
  // Load pages for all projects
  for (const project of projectStore.projects) {
    await pageStore.fetchPages(project._id)
  }
  await fetchWhiteboardsForProjects(projectStore.projects)
  await fetchAllTasks()
})

function toggleWorkspace(workspaceId) {
  const index = expandedWorkspaces.value.indexOf(workspaceId)
  if (index === -1) {
    expandedWorkspaces.value.push(workspaceId)
  } else {
    expandedWorkspaces.value.splice(index, 1)
  }
}

function toggleMobileWorkspace(workspaceId) {
  const index = expandedMobileWorkspaces.value.indexOf(workspaceId)
  if (index === -1) {
    expandedMobileWorkspaces.value.push(workspaceId)
  } else {
    expandedMobileWorkspaces.value.splice(index, 1)
  }
}

function toggleMobileProject(projectId) {
  const index = expandedMobileProjects.value.indexOf(projectId)
  if (index === -1) {
    expandedMobileProjects.value.push(projectId)
  } else {
    expandedMobileProjects.value.splice(index, 1)
  }
}

function toggleProject(projectId) {
  const index = expandedProjects.value.indexOf(projectId)
  if (index === -1) {
    expandedProjects.value.push(projectId)
  } else {
    expandedProjects.value.splice(index, 1)
  }
}

function getWorkspaceProjects(workspaceId) {
  return projectStore.projects.filter(p => p.workspace === workspaceId || p.workspace?._id === workspaceId)
}

function getProjectPages(projectId) {
  return pageStore.pages.filter(p => (p.project?._id || p.project) === projectId)
}

function getProjectWhiteboards(projectId) {
  return whiteboardsByProject.value[projectId] || []
}

function getVisiblePages(projectId) {
  const pages = getProjectPages(projectId)
  if (pages.length <= 5 || isPagesExpanded(projectId)) {
    return pages
  }
  // Show first 5, but always show active page if it's beyond 5
  const visible = pages.slice(0, 5)
  const activePageId = route.params.pageId
  if (activePageId) {
    const activePage = pages.find(p => p._id === activePageId)
    if (activePage && !visible.includes(activePage)) {
      visible.push(activePage)
    }
  }
  return visible
}

function showPagesExpand(projectId) {
  return getProjectPages(projectId).length > 5
}

function isPagesExpanded(projectId) {
  return expandedPages.value.includes(projectId)
}

function togglePagesExpand(projectId) {
  const index = expandedPages.value.indexOf(projectId)
  if (index === -1) {
    expandedPages.value.push(projectId)
  } else {
    expandedPages.value.splice(index, 1)
  }
}

function isProjectActive(projectId) {
  // Active when on project page (without pageId param) - includes board/list/timeline views
  return route.params.id === projectId && !route.params.pageId
}

async function createPage(projectId) {
  try {
    const page = await pageStore.createPage({
      project: projectId,
      title: 'Untitled',
      icon: '📄'
    })
    if (!expandedProjects.value.includes(projectId)) {
      expandedProjects.value.push(projectId)
    }
    router.push(`/projects/${projectId}/pages/${page._id}`)
    startRename(page)
  } catch (err) {
    console.error('Failed to create page:', err)
  }
}

function startRename(page) {
  editingPageId.value = page._id
  editingPageTitle.value = page.title || 'Untitled'
}

async function commitRename(page) {
  if (editingPageId.value !== page._id) return
  const title = editingPageTitle.value.trim() || 'Untitled'
  editingPageId.value = null
  editingPageTitle.value = ''
  if (title === (page.title || 'Untitled')) return
  try {
    await pageStore.updatePage(page._id, { title })
  } catch (err) {
    console.error('Failed to rename page:', err)
  }
}

function cancelRename() {
  editingPageId.value = null
  editingPageTitle.value = ''
}

async function deletePage(page, projectId) {
  if (!confirm(`Delete "${page.title || 'Untitled'}"? This cannot be undone.`)) return
  try {
    await pageStore.deletePage(page._id)
    if (route.params.pageId === page._id) {
      router.push(`/projects/${projectId}`)
    }
  } catch (err) {
    console.error('Failed to delete page:', err)
  }
}

async function createWhiteboard(projectId) {
  try {
    const { data } = await api.post('/whiteboards', {
      name: 'Untitled Whiteboard',
      projectId
    })
    const current = whiteboardsByProject.value[projectId] || []
    whiteboardsByProject.value = {
      ...whiteboardsByProject.value,
      [projectId]: [data, ...current]
    }
    if (!expandedProjects.value.includes(projectId)) {
      expandedProjects.value.push(projectId)
    }
    router.push(`/projects/${projectId}?view=whiteboard&id=${data._id}`)
  } catch (err) {
    console.error('Failed to create whiteboard:', err)
  }
}

async function fetchWhiteboardsForProjects(projects) {
  const results = {}
  for (const project of projects) {
    try {
      const { data } = await api.get(`/whiteboards/project/${project._id}`)
      results[project._id] = data
    } catch (err) {
      results[project._id] = []
    }
  }
  whiteboardsByProject.value = results
}

async function fetchAllTasks() {
  try {
    const { data } = await api.get('/tasks')
    allTasks.value = data
  } catch (err) {
    console.error('Failed to fetch tasks count:', err)
  }
}

function getProjectTaskCount(projectId) {
  return allTasks.value.filter(t => {
    const taskProjectId = t.project?._id || t.project || t.projectId
    return taskProjectId === projectId
  }).length
}

function handleLogout() {
  authStore.logout()
  socketStore.disconnect()
  router.push('/login')
}

function generateColor(str) {
  const colors = [
    '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', 
    '#10b981', '#f43f5e', '#6366f1', '#14b8a6'
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Mobile Header */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-subtle);
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-4);
  z-index: 100;
  padding-top: env(safe-area-inset-top, 0);
}

.hamburger-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
}

.hamburger-btn svg {
  width: 24px;
  height: 24px;
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
}

.mobile-brand .brand-icon {
  width: 32px;
  height: 32px;
}

.mobile-brand .brand-icon svg {
  width: 18px;
  height: 18px;
}

.mobile-brand .brand-text {
  font-size: 1.25rem;
}

.mobile-actions {
  display: flex;
  align-items: center;
}

/* Desktop Sidebar */
.sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  transition: width 0.3s ease;
}

.sidebar.sidebar-collapsed {
  width: 64px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  text-decoration: none;
  cursor: pointer;
}

.sidebar-collapsed .sidebar-brand {
  justify-content: center;
  padding: var(--space-4) 0;
}

.brand-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.brand-icon svg {
  width: 20px;
  height: 20px;
}

.brand-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--text-primary), var(--primary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.collapse-btn {
  position: absolute;
  top: var(--space-5);
  right: -12px;
  width: 24px;
  height: 24px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-tertiary);
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
}

.sidebar:hover .collapse-btn {
  opacity: 1;
}

.collapse-btn:hover {
  background: var(--primary-500);
  border-color: var(--primary-500);
  color: white;
}

.collapse-btn svg {
  width: 12px;
  height: 12px;
  transition: transform 0.3s ease;
}

.collapse-btn svg.rotate-180 {
  transform: rotate(180deg);
}

.sidebar-nav {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item.collapsed {
  justify-content: center;
  padding: var(--space-3);
}

.nav-item svg {
  width: 18px;
  height: 18px;
  opacity: 0.7;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item:hover svg {
  opacity: 1;
  color: var(--primary-400);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--primary-500-alpha-15, rgba(139, 92, 246, 0.15)), var(--accent-cyan-alpha-10, rgba(6, 182, 212, 0.1)));
  color: var(--text-primary);
  border: 1px solid var(--primary-500-alpha-20, rgba(139, 92, 246, 0.2));
}

.nav-item.active svg {
  opacity: 1;
  color: var(--primary-400);
}

.nav-badge {
  margin-left: auto;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--primary-500);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item.collapsed .nav-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 14px;
  height: 14px;
  font-size: 9px;
  padding: 0 3px;
}

.sidebar-section {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.section-header {
  padding: 0 var(--space-4);
  margin-bottom: var(--space-3);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
}

/* Workspace/Project Tree */
.workspace-tree {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.workspace-item {
  display: flex;
  flex-direction: column;
}

.tree-header {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.tree-toggle {
  width: 20px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.15s ease;
}

.tree-toggle:hover {
  color: var(--text-secondary);
  background: var(--bg-tertiary);
}

.tree-toggle svg {
  width: 12px;
  height: 12px;
  transition: transform 0.15s ease;
}

.tree-toggle.expanded svg {
  transform: rotate(90deg);
}

.tree-toggle.small {
  width: 18px;
  height: 24px;
}

.tree-toggle.small svg {
  width: 10px;
  height: 10px;
}

.tree-link {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.15s ease;
  min-width: 0;
}

.tree-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tree-link.active {
  background: var(--primary-500-alpha-10, rgba(139, 92, 246, 0.1));
  color: var(--text-primary);
}

.tree-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-dot,
.project-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tree-children {
  margin-left: var(--space-3);
  padding-left: var(--space-2);
  border-left: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.project-item {
  display: flex;
  flex-direction: column;
}

/* Content Groups (Notes, Tasks) */
.content-group {
  margin: var(--space-1) 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}

.group-header svg {
  width: 10px;
  height: 10px;
}



.add-btn {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-tertiary);
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: all 0.15s ease;
  margin-left: auto;
}

.content-group:hover .add-btn {
  opacity: 1;
}

.add-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.page-row {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding-right: var(--space-1);
}

.page-row.active .child-link {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.page-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.1s ease;
}

.page-row:hover .page-actions,
.page-row.active .page-actions {
  opacity: 1;
}

.page-action-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.1s ease;
}

.page-action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.page-action-btn.danger:hover {
  color: var(--danger-500);
}

.page-action-btn svg {
  width: 12px;
  height: 12px;
}

.page-edit {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
}

.page-edit-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text-primary);
}

.child-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.8125rem;
  transition: all 0.15s ease;
}

.child-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.child-link.active {
  background: var(--primary-500-alpha-10, rgba(139, 92, 246, 0.1));
  color: var(--text-primary);
}

.page-icon,
.view-icon {
  font-size: 12px;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.child-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-hint {
  padding: var(--space-1) var(--space-2);
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-style: italic;
}

/* Pages list with scroll and expand */
.pages-list {
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--bg-tertiary) transparent;
}

.pages-list::-webkit-scrollbar {
  width: 4px;
}

.pages-list::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
}

.count-badge {
  font-size: 0.625rem;
  padding: 1px 5px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  color: var(--text-tertiary);
  font-weight: 600;
}

.show-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--space-1) var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  font-size: 0.6875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-top: var(--space-1);
}

.show-more-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

/* Workspace section scrollable */
.workspace-section {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--bg-tertiary) transparent;
}

.workspace-section::-webkit-scrollbar {
  width: 4px;
}

.workspace-section::-webkit-scrollbar-thumb {
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
}

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-subtle);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.sidebar-footer-collapsed {
  padding: var(--space-3);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: center;
}

.avatar-btn {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu:hover {
  border-color: var(--border-strong);
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: capitalize;
}

.chevron {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  bottom: calc(100% + var(--space-2));
  left: var(--space-4);
  right: var(--space-4);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: slideIn 0.2s ease;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item svg {
  width: 16px;
  height: 16px;
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.dropdown-item.danger {
  color: var(--accent-rose);
}

.dropdown-item.danger:hover {
  background: var(--accent-rose-alpha-10, rgba(244, 63, 94, 0.1));
}

.dropdown-divider {
  height: 1px;
  background: var(--border-subtle);
  margin: var(--space-1) 0;
}

.main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  overflow: auto;
  transition: margin-left 0.3s ease;
}

.main.sidebar-collapsed {
  margin-left: 64px;
}

.layout.minimal .main {
  margin-left: 0;
}

/* Mobile Sidebar */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: var(--bg-secondary);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.mobile-nav {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.mobile-nav .nav-item {
  padding: var(--space-3) var(--space-4);
}

.mobile-sidebar-section {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--space-4) var(--space-4);
}

.mobile-workspace-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mobile-workspace-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.mobile-workspace-header,
.mobile-project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2);
  cursor: pointer;
}

.mobile-workspace-header .workspace-link,
.mobile-project-header .project-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9375rem;
}

.mobile-project-row {
  margin-left: var(--space-2);
}

.mobile-project-children {
  margin-left: var(--space-4);
  margin-top: var(--space-1);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-child-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 4px 0;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.8125rem;
}

.mobile-child-link:hover {
  color: var(--text-primary);
}

.mobile-section-label {
  margin-top: var(--space-2);
  font-size: 0.625rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.mobile-empty {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-style: italic;
  padding: 2px 0;
}

.mobile-workspace-header .chevron,
.mobile-project-header .chevron {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
  transition: transform 0.15s ease;
}

.mobile-workspace-header .chevron.open,
.mobile-project-header .chevron.open {
  transform: rotate(180deg);
}

.mobile-sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--accent-rose);
  font-size: 0.875rem;
  cursor: pointer;
}

.logout-btn svg {
  width: 16px;
  height: 16px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(-100%);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

/* Responsive Breakpoints */
@media (max-width: 1023px) {
  .sidebar {
    display: none;
  }
  
  .mobile-header {
    display: flex;
  }
  
  .main {
    margin-left: 0;
    padding-top: 56px;
    padding-bottom: 64px;
    min-height: calc(100vh - 56px);
  }
  
  .main.sidebar-collapsed {
    margin-left: 0;
  }
}

@media (max-width: 767px) {
  .mobile-header {
    height: 52px;
  }
  
  .main {
    padding-top: 52px;
  }
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 100px;
  right: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1001;
  cursor: pointer;
  animation: slideInToast 0.3s ease;
}

.toast-notification:hover {
  background: var(--bg-secondary);
}

@keyframes slideInToast {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-500);
  border-radius: 50%;
  color: white;
}

.toast-icon svg {
  width: 18px;
  height: 18px;
}

.toast-content {
  flex: 1;
}

.toast-text {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
}

.toast-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
}

.toast-close:hover {
  color: var(--text-primary);
}

.toast-close svg {
  width: 14px;
  height: 14px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Hide mobile nav on desktop */
@media (min-width: 1024px) {
  :deep(.mobile-nav) {
    display: none !important;
  }
}
</style>

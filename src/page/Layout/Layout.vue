<template>
  <div class="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-display">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed md:static inset-y-0 left-0 z-40 w-66 flex flex-col bg-white dark:bg-[#1e293b] border-r border-gray-200 dark:border-gray-700 transition-transform duration-300',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 px-6 border-b border-gray-200 dark:border-gray-700">
        <div
          class="size-10 rounded-lg bg-cover bg-center bg-no-repeat shadow-sm"
          @click="mobileMenuOpen = false"
          :style="{ backgroundImage: `url(${hotelLogo})` }"
        ></div>
        <div>
          <h1 class="text-lg font-bold leading-tight">Battambang Hotel</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Admin Panel</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <template v-for="item in finalMenuLeft" :key="item.key || item.label">
          <!-- Collapsible Parent: Users -->
          <div v-if="item.isParent">
            <button
              @click="usersOpen = !usersOpen"
              class="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3b4e] transition-colors"
            >
              <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
              <span class="flex-1 text-left">{{ item.label }}</span>
              <span
                class="material-symbols-outlined text-base transition-transform duration-200"
                :class="{ 'rotate-180': usersOpen }"
              >
                expand_more
              </span>
            </button>

            <div v-show="usersOpen" class="ml-10 mt-1 space-y-1">
              <RouterLink
                v-for="child in item.children"
                :key="child.key"
                :to="child.key"
                @click="mobileMenuOpen = false"
                class="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2d3b4e] transition-colors"
                :class="{ 'bg-[green]/10 text-[green] dark:text-green-400': route.path === child.key }"
              >
                <span class="material-symbols-outlined text-base">{{ child.icon }}</span>
                {{ child.label }}
              </RouterLink>
            </div>
          </div>

          <!-- Normal Menu Item -->
          <RouterLink
            v-else
            :to="item.key"
            @click="mobileMenuOpen = false"
            class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3b4e] transition-colors"
            :class="{ 'bg-[green]/10 text-[green] dark:text-green-400 hover:bg-[green]/20': route.path === item.key }"
          >
            <span class="material-symbols-outlined text-xl">{{ item.icon }}</span>
            {{ item.label }}
          </RouterLink>
        </template>
      </nav>

      <!-- User Profile Dropdown -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-4 relative">
        <div
          ref="userTriggerRef"
          @click="open = !open"
          class="flex items-center gap-3 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-[#374151] transition-colors"
        >
          <div
            class="size-10 rounded-full bg-cover bg-center bg-no-repeat border-2 border-gray-200 dark:border-gray-600"
            :style="{ backgroundImage: `url(${configurl.image_path}${profile?.profile?.image || userAvatar})` }"
          ></div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ profile?.name || 'User' }}</p>
            <p class="truncate text-xs text-gray-500 dark:text-gray-400">
              {{ Array.isArray(roles) ? roles.join(', ') : roles?.name || 'Role' }}
            </p>
          </div>
          <span
            class="material-symbols-outlined text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': open }"
          >
            expand_more
          </span>
        </div>

        <transition name="dropdown">
          <div
            v-if="open"
            ref="dropdownRef"
            class="absolute bottom-full left-4 right-4 mb-2 z-50 rounded-lg bg-white dark:bg-[#1f2937] shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <ul class="py-2 text-sm">
              <li @click="goTo('/profile')" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#2d3b4e] cursor-pointer transition-colors">
                <span class="material-symbols-outlined text-[18px] text-gray-500">person</span>
                <span>My Profile</span>
              </li>
              <li @click="goTo('/settings')" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-[#2d3b4e] cursor-pointer transition-colors">
                <span class="material-symbols-outlined text-[18px] text-gray-500">account_circle</span>
                <span>Account Settings</span>
              </li>
              <li class="border-t border-gray-200 dark:border-gray-700 my-1"></li>
              <li @click="handleLogout" class="flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-colors">
                <span class="material-symbols-outlined text-[18px]">logout</span>
                <span>Logout</span>
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 flex items-center justify-between bg-white dark:bg-[#1e293b] px-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-4">
          <button
            class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3b4e] transition-colors"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <span class="material-symbols-outlined text-2xl">menu</span>
          </button>
          <div class="hidden md:block">
            <h2 class="text-lg font-semibold capitalize">{{ currentPageTitle }}</h2>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ currentTime }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center rounded-lg bg-gray-100 dark:bg-[#2d3b4e] px-3 py-2 w-72 border border-transparent focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <span class="material-symbols-outlined text-gray-500 text-xl">search</span>
            <input v-model="headerSearchQuery" type="text" placeholder="Search reservations..." class="ml-2 w-full bg-transparent text-sm outline-none placeholder-gray-500 dark:placeholder-gray-400" />
          </div>

          <div class="flex items-center gap-2">
            <button class="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3b4e] transition-colors" aria-label="Notifications">
              <span class="material-symbols-outlined text-2xl">notifications</span>
              <span class="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-red-500 border-2 border-white dark:border-[#1e293b]"></span>
            </button>
            <button class="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3b4e] transition-colors" aria-label="Help">
              <span class="material-symbols-outlined text-2xl">help</span>
            </button>
            <button class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d3b4e] transition-colors">
              <span @click="goTo('/profile')" class="material-symbols-outlined text-2xl">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0f172a] p-4 md:p-6">
        <RouterView />
      </main>

      <footer class="h-12 flex items-center justify-between bg-white dark:bg-[#1e293b] px-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        <p> 2023 Battambang Hotel. All rights reserved.</p>
        <div class="flex items-center gap-4">
          <span>{{ currentDate }}</span>
          <span class="hidden sm:inline">v1.0.0</span>
        </div>
      </footer>
    </div>
    <ConfirmModal ref="confirmModal" title="Logout" message="Are you sure you want to log out of your account?" confirm-text="Logout" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, provide, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProfileStore } from '@/util/profile'
import { formatDate, formatTime } from '@/util/helpers'
import hotelLogo from '../../assets/Hotel_icon.png'
import userAvatar from '../../assets/user_avatar.png'

import request from '../../util/request'
import configurl from '../../util/configurl'
import ConfirmModal from '../../components/ConfirmModalLogout.vue'

const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()

const profile = computed(() => profileStore.profile)
const token = computed(() => profileStore.token)
const roles = computed(() => profileStore.roles)

// UI States
const mobileMenuOpen = ref(false)
const usersOpen = ref(false)
const open = ref(false)
const userTriggerRef = ref(null)
const dropdownRef = ref(null)
const confirmModal = ref(null)

const headerSearchQuery = ref('')
provide('reservationsSearchQuery', headerSearchQuery)

// Time
const now = ref(new Date())
const currentTime = computed(() => formatTime(now.value))
const currentDate = computed(() => formatDate(now.value))
const year = computed(() => now.value.getFullYear())

const currentPageTitle = computed(() => {
  const segment = route.path.split('/').filter(Boolean).pop() || 'dashboard'
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
})

// ==================== MENU CONFIG & PERMISSION FILTER ====================

// Menu configuration with router names
const menuConfig = [
  { key: '/dashboard', label: 'Dashboard', icon: 'dashboard', name: 'Dashboard' },
  { key: '/reservations', label: 'Reservations', icon: 'calendar_month', name: 'Reservations' },
  { key: '/rooms', label: 'Rooms', icon: 'bed', name: 'Rooms' },
  { key: '/guests', label: 'Guests', icon: 'groups', name: 'Guests' },
  { key: '/historys', label: 'Historys', icon: 'group', name: 'Historys' },
  { key: '/reports', label: 'Reports', icon: 'analytics', name: 'Reports' },
  { key: '/user', label: 'User', icon: 'person', parent: 'users', name: 'User' },
  { key: '/users_roles', label: 'Users_Roles', icon: 'badge', parent: 'users', name: 'Users_Roles' },
  { key: '/role', label: 'Role', icon: 'admin_panel_settings', parent: 'users', name: 'Role' },
  { key: '/permission', label: 'Permission', icon: 'shield', parent: 'users', name: 'Permission' },
  { key: '/permission_roles', label: 'Permission_Roles', icon: 'shield', parent: 'users', name: 'Permission_Roles' },
  { key: '/settings', label: 'Settings', icon: 'settings', name: 'Settings' },
]

// Get permissions from store
const permissions = computed(() => {
  const perms = profileStore.permissions || []
  return Array.isArray(perms) ? perms : []
})

// Check if user can access a route
const canAccessRoute = (routeName) => {
  if (!routeName) return false
  
  const userRole = profile.value?.role || ''
  const isSuperAdmin = userRole === 'super-admin'
  
  if (isSuperAdmin) return true
  
  const routePermissionMap = {
    'Dashboard': 'Dashboard.View',
    'Reservations': 'Reservations.View',
    'Rooms': 'Rooms.View',
    'Guests': 'Guests.View',
    'Historys': 'Historys.View',
    'Finance': 'Finance.View',
    'Reports': 'Reports.View',
    'User': 'User.View',
    'Users_Roles': 'Users_Roles.View',
    'Role': 'Role.View',
    'Permission_Roles': 'Permission_Roles.View',
    'Permission': 'Permission.View',
    'Settings': 'Settings.View'
  }
  
  const requiredPermission = routePermissionMap[routeName]
  if (!requiredPermission) return false
  
  return permissions.value.includes(requiredPermission)
}

// Filter allowed menu items
const allowedMenuItems = computed(() => {
  const userRole = profile.value?.role || ''
  const isSuperAdmin = userRole === 'super-admin'
  
  if (isSuperAdmin) {
    return menuConfig
  }
  
  return menuConfig.filter(item => {
    // Check permission for other routes
    return canAccessRoute(item.name)
  })
})

// Build final menu structure
const finalMenuLeft = computed(() => {
  const items = allowedMenuItems.value

  const mainItems = items.filter(item => !item.parent && item.key !== '/settings')
  const userSubItems = items.filter(item => item.parent === 'users')
  const settingsItem = items.find(item => item.key === '/settings')

  const menu = [...mainItems]

  // Add Users collapsible if any submenu exists
  if (userSubItems.length > 0) {
    menu.push({
      key: 'users-parent',
      label: 'Users',
      icon: 'manage_accounts',
      isParent: true,
      children: userSubItems
    })
  }

  // Add Settings at the bottom
  if (settingsItem) {
    menu.push(settingsItem)
  }

  return menu
})

// ==================== END MENU LOGIC ====================

const goTo = (path) => {
  open.value = false
  mobileMenuOpen.value = false
  router.push(path)
}

const handleLogout = async () => {
  const confirmed = await confirmModal.value?.open()
  open.value = false
  if (!confirmed) return
  try {
    await request('/logout', 'POST')
  } catch (err) {
    console.warn('Logout failed:', err)
  } finally {
    profileStore.logout()
    router.replace('/login')
  }
}

const handleClickOutside = (event) => {
  if (
    open.value &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target) &&
    userTriggerRef.value &&
    !userTriggerRef.value.contains(event.target)
  ) {
    open.value = false
  }
}

onMounted(() => {
  if (!token.value) {
    router.replace('/login')
    return
  }

  const timer = setInterval(() => {
    now.value = new Date()
  }, 60000)

  document.addEventListener('click', handleClickOutside)

  return () => {
    clearInterval(timer)
    document.removeEventListener('click', handleClickOutside)
  }
})

watch(
  () => route.path,
  (path) => {
    if (!path?.startsWith('/reservations')) {
      headerSearchQuery.value = ''
    }
  }
)

watch(
  () => headerSearchQuery.value,
  (val, oldVal) => {
    const prevHadSearch = typeof oldVal === 'string' && oldVal.trim().length > 0
    const nowHasSearch = typeof val === 'string' && val.trim().length > 0

    if (!prevHadSearch && nowHasSearch) {
      if (!route.path?.startsWith('/reservations')) {
        router.push('/reservations')
      }
      return
    }

    if (prevHadSearch && !nowHasSearch) {
      if (route.path !== '/dashboard') {
        router.push('/dashboard')
      }
    }
  }
)
</script>
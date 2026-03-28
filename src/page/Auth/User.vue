<template>
  <div class="space-y-6">
    <!-- ================= HEADER ================= -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Users
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage system users, permissions, and access
        </p>
      </div>

      <button
        @click="openAddModal"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
      >
        <span class="material-symbols-outlined">add</span>
        Add New User
      </button>
    </div>

    <!-- ================= FILTER ================= -->
    <div class="bg-white dark:bg-[#1e293b] p-4 rounded-xl border dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search by name -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">
            person
          </span>
          <input
            v-model="nameQuery"
            type="text"
            placeholder="Search by name..."
            class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
          />
        </div>

        <!-- Search by email -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">
            mail
          </span>
          <input
            v-model="emailQuery"
            type="text"
            placeholder="Search by email..."
            class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
          />
        </div>

        <!-- Email Verification Status -->
        <select
          v-model="emailVerifiedFilter"
          class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e]"
        >
          <option value="all">All Verification Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e]"
        >
          <option value="name">Sort by Name</option>
          <option value="email">Sort by Email</option>
          <option value="created_at">Sort by Created Date</option>
          <option value="updated_at">Sort by Updated Date</option>
        </select>
      </div>
    </div>

    <!-- ================= TABLE + ASYNC WRAPPER ================= -->
    <div class="bg-white dark:bg-[#1e293b] rounded-xl border dark:border-gray-700 overflow-hidden">
      <Async :promise="loadUsersPromise">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-[#2d3b4e] text-gray-600 dark:text-gray-300">
              <tr>
                <th class="px-6 py-4 text-left">ID</th>
                <th class="px-6 py-4 text-left">Name</th>
                <th class="px-6 py-4 text-left">Email</th>
                <th class="px-6 py-4 text-left">Email Verified</th>
                <th class="px-6 py-4 text-left">Created</th>
                <th class="px-6 py-4 text-left">Updated</th>
                <th class="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y dark:divide-gray-700">
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="hover:bg-gray-50 dark:hover:bg-[#2d3b4e]"
              >
                <td class="px-6 py-4 text-xs font-mono text-gray-500">
                  {{ user.id }}
                </td>

                <td class="px-6 py-4 font-medium">
                  <div class="flex items-center gap-3">
                    <img
                      :src="getUserAvatar(user)"
                      class="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                      alt="avatar"
                      @error="onAvatarError"
                    />
                    <span>{{ user.name }}</span>
                  </div>
                </td>

                <td class="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {{ user.email }}
                </td>

                <td class="px-6 py-4">
                  <span
                    :class="user.email_verified_at
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'"
                    class="px-3 py-1 rounded-full text-xs capitalize"
                  >
                    {{ user.email_verified_at ? 'Verified' : 'Unverified' }}
                  </span>
                </td>

                <td class="px-6 py-4">
                  <div>{{ formatDate(user.created_at) }}</div>
                  <div class="text-xs text-gray-400">
                    {{ formatTime(user.created_at) }}
                  </div>
                </td>

                <td class="px-6 py-4">
                  <div>{{ formatDate(user.updated_at) }}</div>
                  <div class="text-xs text-gray-400">
                    {{ formatTime(user.updated_at) }}
                  </div>
                </td>

                <td class="px-6 py-4 text-center">
                  <div class="flex justify-center gap-2">
                    <button
                      @click="openEditModal(user)"
                      class="p-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-[#406292] rounded"
                    >
                      <span class="material-symbols-outlined">edit</span>
                    </button>

                    <button
                      @click="openDeleteModal(user)"
                      class="p-2 text-red-600 hover:bg-gray-100 dark:hover:bg-[#774b3d] rounded"
                    >
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="!filteredUsers.length">
                <td colspan="7" class="text-center py-10 text-gray-400">
                  No users found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ================= FOOTER ================= -->
        <div class="flex justify-between items-center px-6 py-4 border-t dark:border-gray-700">
          <p class="text-sm text-gray-500">
            Total: {{ totalUsers }} users
          </p>
        </div>
      </Async>
    </div>

    <!-- ================= MODALS ================= -->
    <AddUserModal
      :isOpen="showAddModal"
      @close="closeAllModals"
      @created="refreshUsers"
    />

    <EditUserModal
      :isOpen="showEditModal"
      :user="selectedUser"
      @close="closeAllModals"
      @updated="refreshUsers"
    />

    <DeleteUserModal
      :isOpen="showDeleteModal"
      :user="selectedUser"
      @close="closeAllModals"
      @confirmed="refreshUsers"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import request from '@/util/request'
import { formatDate, formatTime } from '@/util/helpers'
import { showToast } from '@/util/toast'
import Async from '@/components/Async/Async.vue'
import AddUserModal from '@/components/user/AddUserModal.vue'
import EditUserModal from '@/components/user/EditUserModal.vue'
import DeleteUserModal from '@/components/user/DeleteUserModal.vue'
import configurl from '@/util/configurl'
import userAvatar from '@/assets/user_avatar.png'
import { resolveImageUrl } from '@/util/image'

/* ================= STATE ================= */
const users = ref([])
const nameQuery = ref('')
const emailQuery = ref('')
const emailVerifiedFilter = ref('all')
const sortBy = ref('name')

/* ================= MODALS ================= */
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const selectedUser = ref(null)

/* ================= ASYNC DATA ================= */
const loadUsersPromise = ref(null)

const fetchUsers = async () => {
  try {
    const data = await request('/users', 'GET')
    users.value = data
    return data
  } catch (error) {
    console.error('Failed to fetch users:', error)
    showToast('Failed to load users', 'error')
    throw error // let Async catch it
  }
}

// Create fresh promise on each refresh
const loadUsers = () => {
  loadUsersPromise.value = fetchUsers()
}

// Initial load
loadUsers()

/* ================= COMPUTED ================= */
const filteredUsers = computed(() => {
  let list = [...users.value]

  // Filter by name
  if (nameQuery.value) {
    const q = nameQuery.value.toLowerCase()
    list = list.filter(u => u.name?.toLowerCase().includes(q))
  }

  // Filter by email
  if (emailQuery.value) {
    const q = emailQuery.value.toLowerCase()
    list = list.filter(u => u.email?.toLowerCase().includes(q))
  }

  // Filter by email verification status
  if (emailVerifiedFilter.value !== 'all') {
    const isVerified = emailVerifiedFilter.value === 'verified'
    list = list.filter(u => !!u.email_verified_at === isVerified)
  }

  // Sort
  list.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name?.localeCompare(b.name || '') || 0
      case 'email':
        return a.email?.localeCompare(b.email || '') || 0
      case 'created_at':
        return new Date(b.created_at) - new Date(a.created_at)
      case 'updated_at':
        return new Date(b.updated_at) - new Date(a.updated_at)
      default:
        return 0
    }
  })

  return list
})

const totalUsers = computed(() => filteredUsers.value.length)

/* ================= METHODS ================= */
const openAddModal = () => showAddModal.value = true

const openEditModal = (user) => {
  selectedUser.value = user
  showEditModal.value = true
}

const openDeleteModal = (user) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const closeAllModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedUser.value = null
}

const refreshUsers = () => {
  loadUsers()
  closeAllModals()
}

const getUserAvatar = (user) => {
  const image = user?.profile?.image
  const resolved = resolveImageUrl(image)
  if (resolved) return resolved
  return userAvatar
}

const onAvatarError = (e) => {
  e.target.src = userAvatar
}
</script>
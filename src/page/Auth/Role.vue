<template>
  <div class="space-y-6">
    <!-- ================= HEADER ================= -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Role</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage user roles, permissions, and access levels
        </p>
      </div>

      <button
        @click="openAddModal"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
      >
        <span class="material-symbols-outlined">add</span>
        Add New Role
      </button>
    </div>

    <!-- ================= FILTER ================= -->
    <div class="bg-white dark:bg-[#1e293b] p-4 rounded-xl border dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-2 text-gray-400">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search role name or code..."
            class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
          />
        </div>

        <select v-model="statusFilter" class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e]">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select v-model="sortBy" class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e]">
          <option value="name">Sort by Name</option>
          <option value="created_at">Sort by Created Date</option>
        </select>
      </div>
    </div>

    <!-- ================= TABLE WRAPPER ================= -->
    <div class="bg-white dark:bg-[#1e293b] rounded-xl border dark:border-gray-700 overflow-hidden">
      <Async :promise="fetchPromise">
        <!-- Content when loaded successfully -->
        <template #default="{ data: loadedRoles }">
          <!-- Filter & Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-[#2d3b4e] text-gray-600 dark:text-gray-300">
                <tr>
                  <th class="px-6 py-4 text-left">ID</th>
                  <th class="px-6 py-4 text-left">Name</th>
                  <th class="px-6 py-4 text-left">Code</th>
                  <th class="px-6 py-4 text-left">Description</th>
                  <th class="px-6 py-4 text-left">Status</th>
                  <th class="px-6 py-4 text-left">Created</th>
                  <th class="px-6 py-4 text-left">Updated</th>
                  <th class="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y dark:divide-gray-700">
                <tr
                  v-for="role in filteredRoles"
                  :key="role.id"
                  class="hover:bg-gray-50 dark:hover:bg-[#2d3b4e]"
                >
                  <td class="px-6 py-4 text-xs font-mono text-gray-500">{{ role.id }}</td>
                  <td class="px-6 py-4 font-medium">{{ role.name }}</td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-gray-100 dark:bg-green-600 rounded text-xs font-mono">
                      {{ role.code }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-600 dark:text-gray-300 truncate max-w-xs">
                    {{ role.description || 'No description' }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="role.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                      class="px-3 py-1 rounded-full text-xs capitalize"
                    >
                      {{ role.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div>{{ formatDate(role.created_at) }}</div>
                    <div class="text-xs text-gray-400">{{ formatTime(role.created_at) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div>{{ formatDate(role.updated_at) }}</div>
                    <div class="text-xs text-gray-400">{{ formatTime(role.updated_at) }}</div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex justify-center gap-2">
                      <button
                        @click="openEditModal(role)"
                        class="p-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-[#406292] rounded"
                      >
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        @click="openDeleteModal(role)"
                        class="p-2 text-red-600 hover:bg-gray-100 dark:hover:bg-[#774b3d] rounded"
                      >
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredRoles.length">
                  <td colspan="8" class="text-center py-6 text-gray-400">
                    No roles found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div class="flex justify-between items-center px-6 py-4 border-t dark:border-gray-700">
            <p class="text-sm text-gray-500">Total: {{ totalRoles }} roles</p>
          </div>
        </template>
      </Async>
    </div>

    <!-- ================= MODALS ================= -->
    <AddRoleModal :isOpen="showAddModal" @close="closeAllModals" @created="refreshRoles" />
    <EditRoleModal :isOpen="showEditModal" :role="selectedRole" @close="closeAllModals" @updated="refreshRoles" />
    <DeleteRoleModal :isOpen="showDeleteModal" :role="selectedRole" :actionType="actionType" @close="closeAllModals" @confirmed="refreshRoles" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import request from '@/util/request'
import { formatDate, formatTime } from '@/util/helpers'
import Async from '@/components/Async/Async.vue'
import AddRoleModal from '@/components/role/AddRoleModal.vue'
import EditRoleModal from '@/components/role/EditRoleModal.vue'
import DeleteRoleModal from '@/components/role/DeleteRoleModal.vue'

/* ================= STATE ================= */
const roles = ref([])
const searchQuery = ref('')
const statusFilter = ref('all')
const sortBy = ref('name')

/* ================= MODALS ================= */
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedRole = ref(null)
const actionType = ref('delete')

/* ================= DATA FETCHING ================= */
const fetchPromise = ref(null)

const fetchRoles = () => {
  fetchPromise.value = request('/role', 'GET')
    .then(data => data.map(r => ({
      ...r,
      status: r.status === 1 ? 'active' : 'inactive'
    })))
    .then(fetched => {
      roles.value = fetched
      return fetched // Resolve with the mapped roles
    })
}

const refreshRoles = () => {
  fetchRoles()
  closeAllModals()
}

// Initial fetch
fetchRoles()

/* ================= COMPUTED ================= */
const filteredRoles = computed(() => {
  let list = [...roles.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q)
    )
  }

  if (statusFilter.value !== 'all') {
    list = list.filter(r => r.status === statusFilter.value)
  }

  list.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return list
})

const totalRoles = computed(() => filteredRoles.value.length)

/* ================= METHODS ================= */
const openAddModal = () => { showAddModal.value = true }
const openEditModal = (role) => {
  selectedRole.value = role
  showEditModal.value = true
}
const openDeleteModal = (role) => {
  selectedRole.value = role
  showDeleteModal.value = true
}
const closeAllModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedRole.value = null
}
</script>
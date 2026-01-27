<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Permission</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage permissions and access controls</p>
      </div>

      <button
        @click="openAddModal"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
      >
        <span class="material-symbols-outlined">add</span>
        Add New Permission
      </button>
    </div>

    <div class="bg-white dark:bg-[#1e293b] p-4 rounded-xl border dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-2 text-gray-400">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search permission name, group, route..."
            class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
          />
        </div>

        <select v-model="menuFilter" class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e]">
          <option value="all">All</option>
          <option value="menu">Menu Web</option>
          <option value="not_menu">Not Menu</option>
        </select>

        <select v-model="sortBy" class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e]">
          <option value="name">Sort by Name</option>
          <option value="group">Sort by Group</option>
          <option value="created_at">Sort by Created Date</option>
        </select>
      </div>
    </div>

    <div class="bg-white dark:bg-[#1e293b] rounded-xl border dark:border-gray-700 overflow-hidden">
      <Async :promise="fetchPromise">
        <template #default>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-[#2d3b4e] text-gray-600 dark:text-gray-300">
                <tr>
                  <th class="px-6 py-4 text-left">ID</th>
                  <th class="px-6 py-4 text-left">Name</th>
                  <th class="px-6 py-4 text-left">Group</th>
                  <th class="px-6 py-4 text-left">Menu Web</th>
                  <th class="px-6 py-4 text-left">Web Route Key</th>
                  <th class="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y dark:divide-gray-700">
                <tr
                  v-for="p in filteredPermissions"
                  :key="p.id"
                  class="hover:bg-gray-50 dark:hover:bg-[#2d3b4e]"
                >
                  <td class="px-6 py-4 text-xs font-mono text-gray-500">{{ p.id }}</td>
                  <td class="px-6 py-4 font-medium">{{ p.name }}</td>
                  <td class="px-6 py-4">{{ p.group }}</td>
                  <td class="px-6 py-4">
                    <span
                      class="px-3 py-1 rounded-full text-xs"
                      :class="p.is_menu_web ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'"
                    >
                      {{ p.is_menu_web ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-gray-100 dark:bg-green-600 rounded text-xs font-mono">
                      {{ p.web_route_key || '—' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex justify-center gap-2">
                      <button
                        @click="openEditModal(p)"
                        class="p-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-[#406292] rounded"
                      >
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        :disabled="deletingId === p.id"
                        @click="openDeleteModal(p)"
                        class="p-2 text-red-600 hover:bg-gray-100 dark:hover:bg-[#774b3d] rounded disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span v-if="deletingId === p.id" class="material-symbols-outlined animate-spin">refresh</span>
                        <span v-else class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!filteredPermissions.length">
                  <td colspan="8" class="text-center py-6 text-gray-400">No permissions found</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-between items-center px-6 py-4 border-t dark:border-gray-700">
            <p class="text-sm text-gray-500">Total: {{ totalPermissions }} permissions</p>
          </div>
        </template>
      </Async>
    </div>

    <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-lg rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 shadow-lg">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ formMode === 'create' ? 'Add Permission' : 'Edit Permission' }}</h3>
          <button
            :disabled="isSaving"
            @click="closeAllModals"
            class="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#2d3b4e] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="px-6 py-5 space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              v-model="form.name"
              type="text"
              class="mt-1 w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
              placeholder="e.g. reservations.view"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Group</label>
            <input
              v-model="form.group"
              type="text"
              class="mt-1 w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
              placeholder="e.g. Reservations"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Menu Web</label>
              <select
                v-model="form.is_menu_web"
                class="mt-1 w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
              >
                <option :value="false">No</option>
                <option :value="true">Yes</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Web Route Key</label>
              <input
                v-model="form.web_route_key"
                type="text"
                class="mt-1 w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
                placeholder="e.g. reports"
              />
            </div>
          </div>

          <p v-if="formError" class="text-sm text-red-600 dark:text-red-400">{{ formError }}</p>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            :disabled="isSaving"
            @click="closeAllModals"
            class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] hover:bg-gray-200 dark:hover:bg-[#334155] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            :disabled="isSaving || !isFormValid"
            @click="submitForm"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="isSaving" class="material-symbols-outlined animate-spin">refresh</span>
            {{ formMode === 'create' ? 'Create' : 'Update' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-md rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 shadow-lg">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Permission</h3>
        </div>

        <div class="px-6 py-5 space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete this permission?</p>
          <p class="text-sm font-mono text-gray-800 dark:text-gray-100">{{ selectedPermission?.name }}</p>
          <p v-if="deleteError" class="text-sm text-red-600 dark:text-red-400">{{ deleteError }}</p>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            :disabled="deletingId !== null"
            @click="closeAllModals"
            class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] hover:bg-gray-200 dark:hover:bg-[#334155] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            :disabled="deletingId !== null"
            @click="confirmDelete"
            class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="deletingId !== null" class="material-symbols-outlined animate-spin">refresh</span>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import request from '@/util/request'
import Async from '@/components/Async/Async.vue'

const permissions = ref([])
const fetchPromise = ref(null)

const searchQuery = ref('')
const menuFilter = ref('all')
const sortBy = ref('name')

const showFormModal = ref(false)
const showDeleteModal = ref(false)
const formMode = ref('create')
const selectedPermission = ref(null)

const isSaving = ref(false)
const deletingId = ref(null)

const form = ref({
  id: null,
  name: '',
  group: '',
  is_menu_web: false,
  web_route_key: ''
})

const formError = ref('')
const deleteError = ref('')

const fetchPermissions = () => {
  fetchPromise.value = request('/permissions', 'GET')
    .then(data => {
      permissions.value = Array.isArray(data) ? data : []
      return permissions.value
    })
}

const refreshPermissions = () => {
  fetchPermissions()
  closeAllModals()
}

fetchPermissions()

const filteredPermissions = computed(() => {
  let list = Array.isArray(permissions.value) ? [...permissions.value] : []

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      String(p.name || '').toLowerCase().includes(q) ||
      String(p.group || '').toLowerCase().includes(q) ||
      String(p.web_route_key || '').toLowerCase().includes(q)
    )
  }

  if (menuFilter.value !== 'all') {
    list = list.filter(p => {
      const isMenu = Boolean(p.is_menu_web)
      return menuFilter.value === 'menu' ? isMenu : !isMenu
    })
  }

  list.sort((a, b) => {
    if (sortBy.value === 'name') return String(a.name || '').localeCompare(String(b.name || ''))
    if (sortBy.value === 'group') return String(a.group || '').localeCompare(String(b.group || ''))
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return list
})

const totalPermissions = computed(() => filteredPermissions.value.length)

const isFormValid = computed(() => {
  return Boolean(String(form.value.name || '').trim()) && Boolean(String(form.value.group || '').trim())
})

const openAddModal = () => {
  formMode.value = 'create'
  selectedPermission.value = null
  formError.value = ''
  deleteError.value = ''
  form.value = { id: null, name: '', group: '', is_menu_web: false, web_route_key: '' }
  showFormModal.value = true
}

const openEditModal = (p) => {
  formMode.value = 'edit'
  selectedPermission.value = p
  formError.value = ''
  deleteError.value = ''
  form.value = {
    id: p.id,
    name: p.name || '',
    group: p.group || '',
    is_menu_web: Boolean(p.is_menu_web),
    web_route_key: p.web_route_key || ''
  }
  showFormModal.value = true
}

const openDeleteModal = (p) => {
  selectedPermission.value = p
  formError.value = ''
  deleteError.value = ''
  showDeleteModal.value = true
}

const closeAllModals = () => {
  showFormModal.value = false
  showDeleteModal.value = false
  selectedPermission.value = null
  formError.value = ''
  deleteError.value = ''
}

const submitForm = async () => {
  if (isSaving.value || !isFormValid.value) return
  formError.value = ''

  isSaving.value = true
  try {
    if (formMode.value === 'create') {
      await request('/permissions', 'POST', {
        name: String(form.value.name || '').trim(),
        group: String(form.value.group || '').trim(),
        is_menu_web: Boolean(form.value.is_menu_web),
        web_route_key: String(form.value.web_route_key || '').trim() || null
      })
    } else {
      await request(`/permissions/${form.value.id}`, 'PUT', {
        name: String(form.value.name || '').trim(),
        group: String(form.value.group || '').trim(),
        is_menu_web: Boolean(form.value.is_menu_web),
        web_route_key: String(form.value.web_route_key || '').trim() || null
      })
    }

    refreshPermissions()
  } catch (err) {
    formError.value = err?.response?.data?.message || 'Failed to save permission'
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = async () => {
  if (!selectedPermission.value || deletingId.value !== null) return
  deleteError.value = ''
  deletingId.value = selectedPermission.value.id

  try {
    await request(`/permissions/${selectedPermission.value.id}`, 'DELETE')
    refreshPermissions()
  } catch (err) {
    deleteError.value = err?.response?.data?.message || 'Failed to delete permission'
  } finally {
    deletingId.value = null
  }
}
</script>
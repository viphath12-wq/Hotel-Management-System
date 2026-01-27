<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Permission Roles</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Assign permissions to roles</p>
      </div>

      <button
        @click="openAddModal"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
      >
        <span class="material-symbols-outlined">add</span>
        Add New Assignment
      </button>
    </div>

    <div class="bg-white dark:bg-[#1e293b] p-4 rounded-xl border dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-2 text-gray-400">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search role / permission..."
            class="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
          />
        </div>

        <select v-model="roleFilter" class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e]">
          <option value="all">All Roles</option>
          <option v-for="r in roles" :key="r.id" :value="String(r.id)">{{ r.name }} ({{ r.code }})</option>
        </select>

        <select v-model="sortBy" class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e]">
          <option value="role">Sort by Role</option>
          <option value="permission">Sort by Permission</option>
          <option value="group">Sort by Group</option>
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
                  <th class="px-6 py-4 text-left">Role</th>
                  <th class="px-6 py-4 text-left">Permission</th>
                  <th class="px-6 py-4 text-left">Group</th>
                  <th class="px-6 py-4 text-left">Menu Web</th>
                  <th class="px-6 py-4 text-left">Route Key</th>
                  <th class="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y dark:divide-gray-700">
                <tr
                  v-for="row in filteredRows"
                  :key="`${row.role_id}-${row.permission_id}`"
                  class="hover:bg-gray-50 dark:hover:bg-[#2d3b4e]"
                >
                  <td class="px-6 py-4">
                    <div class="font-medium">{{ row.role_name }}</div>
                    <div class="text-xs text-gray-400 font-mono">{{ row.role_code }}</div>
                  </td>
                  <td class="px-6 py-4 font-mono text-xs">
                    <span class="px-2 py-1 bg-gray-100 dark:bg-green-600 rounded">
                      {{ row.permission_name }}
                    </span>
                  </td>
                  <td class="px-6 py-4">{{ row.permission_group }}</td>
                  <td class="px-6 py-4">
                    <span
                      class="px-3 py-1 rounded-full text-xs"
                      :class="row.permission_is_menu_web ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'"
                    >
                      {{ row.permission_is_menu_web ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-gray-100 dark:bg-green-600 rounded text-xs font-mono">
                      {{ row.permission_web_route_key || '—' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <div class="flex justify-center gap-2">
                      <button
                        @click="openEditModal(row)"
                        class="p-2 text-blue-600 hover:bg-gray-100 dark:hover:bg-[#406292] rounded"
                      >
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        :disabled="deletingKey === `${row.role_id}-${row.permission_id}`"
                        @click="openDeleteModal(row)"
                        class="p-2 text-red-600 hover:bg-gray-100 dark:hover:bg-[#774b3d] rounded disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span v-if="deletingKey === `${row.role_id}-${row.permission_id}`" class="material-symbols-outlined animate-spin">refresh</span>
                        <span v-else class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!filteredRows.length">
                  <td colspan="6" class="text-center py-6 text-gray-400">No assignments found</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-between items-center px-6 py-4 border-t dark:border-gray-700">
            <p class="text-sm text-gray-500">Total: {{ filteredRows.length }} assignments</p>
          </div>
        </template>
      </Async>
    </div>

    <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-lg rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 shadow-lg">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ formMode === 'create' ? 'Add Assignment' : 'Edit Assignment' }}</h3>
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
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select
              v-model="form.role_id"
              class="mt-1 w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
            >
              <option value="">Select Role</option>
              <option v-for="r in roles" :key="r.id" :value="String(r.id)">{{ r.name }} ({{ r.code }})</option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Permission</label>
            <select
              v-model="form.permission_id"
              class="mt-1 w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] outline-none"
            >
              <option value="">Select Permission</option>
              <option v-for="p in permissions" :key="p.id" :value="String(p.id)">{{ p.group }} - {{ p.name }}</option>
            </select>
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
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Assignment</h3>
        </div>

        <div class="px-6 py-5 space-y-2">
          <p class="text-sm text-gray-600 dark:text-gray-300">Are you sure you want to remove this permission from the role?</p>
          <p class="text-sm font-mono text-gray-800 dark:text-gray-100">{{ selectedRowLabel }}</p>
          <p v-if="deleteError" class="text-sm text-red-600 dark:text-red-400">{{ deleteError }}</p>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            :disabled="deletingKey !== null"
            @click="closeAllModals"
            class="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] hover:bg-gray-200 dark:hover:bg-[#334155] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            :disabled="deletingKey !== null"
            @click="confirmDelete"
            class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="deletingKey !== null" class="material-symbols-outlined animate-spin">refresh</span>
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

const roles = ref([])
const permissions = ref([])
const rows = ref([])

const fetchPromise = ref(null)

const searchQuery = ref('')
const roleFilter = ref('all')
const sortBy = ref('role')

const showFormModal = ref(false)
const showDeleteModal = ref(false)
const formMode = ref('create')
const selectedRow = ref(null)

const isSaving = ref(false)
const deletingKey = ref(null)

const form = ref({
  original_role_id: null,
  original_permission_id: null,
  role_id: '',
  permission_id: ''
})

const formError = ref('')
const deleteError = ref('')

const fetchAll = () => {
  fetchPromise.value = Promise.all([
    request('/role', 'GET'),
    request('/permissions', 'GET'),
    request('/permission_roles', 'GET')
  ]).then(([roleData, permissionData, rowsData]) => {
    roles.value = Array.isArray(roleData) ? roleData.map(r => ({
      ...r,
      status: r.status === 1 ? 'active' : 'inactive'
    })) : []
    permissions.value = Array.isArray(permissionData) ? permissionData : []
    rows.value = Array.isArray(rowsData) ? rowsData : []
    return rows.value
  })
}

const refresh = () => {
  fetchAll()
  closeAllModals()
}

fetchAll()

const filteredRows = computed(() => {
  let list = Array.isArray(rows.value) ? [...rows.value] : []

  if (roleFilter.value !== 'all') {
    list = list.filter(r => String(r.role_id) === String(roleFilter.value))
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(r =>
      String(r.role_name || '').toLowerCase().includes(q) ||
      String(r.role_code || '').toLowerCase().includes(q) ||
      String(r.permission_name || '').toLowerCase().includes(q) ||
      String(r.permission_group || '').toLowerCase().includes(q) ||
      String(r.permission_web_route_key || '').toLowerCase().includes(q)
    )
  }

  list.sort((a, b) => {
    if (sortBy.value === 'permission') return String(a.permission_name || '').localeCompare(String(b.permission_name || ''))
    if (sortBy.value === 'group') return String(a.permission_group || '').localeCompare(String(b.permission_group || ''))
    return String(a.role_name || '').localeCompare(String(b.role_name || ''))
  })

  return list
})

const isFormValid = computed(() => Boolean(form.value.role_id) && Boolean(form.value.permission_id))

const selectedRowLabel = computed(() => {
  if (!selectedRow.value) return ''
  return `${selectedRow.value.role_name} -> ${selectedRow.value.permission_name}`
})

const openAddModal = () => {
  formMode.value = 'create'
  selectedRow.value = null
  formError.value = ''
  deleteError.value = ''
  form.value = { original_role_id: null, original_permission_id: null, role_id: '', permission_id: '' }
  showFormModal.value = true
}

const openEditModal = (row) => {
  formMode.value = 'edit'
  selectedRow.value = row
  formError.value = ''
  deleteError.value = ''
  form.value = {
    original_role_id: row.role_id,
    original_permission_id: row.permission_id,
    role_id: String(row.role_id),
    permission_id: String(row.permission_id)
  }
  showFormModal.value = true
}

const openDeleteModal = (row) => {
  selectedRow.value = row
  formError.value = ''
  deleteError.value = ''
  showDeleteModal.value = true
}

const closeAllModals = () => {
  showFormModal.value = false
  showDeleteModal.value = false
  selectedRow.value = null
  formError.value = ''
  deleteError.value = ''
}

const submitForm = async () => {
  if (isSaving.value || !isFormValid.value) return
  formError.value = ''

  isSaving.value = true
  try {
    const payload = {
      role_id: Number(form.value.role_id),
      permission_id: Number(form.value.permission_id)
    }

    if (formMode.value === 'create') {
      await request('/permission_roles', 'POST', payload)
    } else {
      await request(`/permission_roles/${form.value.original_role_id}/${form.value.original_permission_id}`, 'PUT', payload)
    }

    refresh()
  } catch (err) {
    formError.value = err?.response?.data?.message || 'Failed to save assignment'
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = async () => {
  if (!selectedRow.value || deletingKey.value !== null) return
  deleteError.value = ''

  deletingKey.value = `${selectedRow.value.role_id}-${selectedRow.value.permission_id}`
  try {
    await request(`/permission_roles/${selectedRow.value.role_id}/${selectedRow.value.permission_id}`, 'DELETE')
    refresh()
  } catch (err) {
    deleteError.value = err?.response?.data?.message || 'Failed to delete assignment'
  } finally {
    deletingKey.value = null
  }
}
</script>
<template>
  <div v-if="isOpen && role" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md transform rounded-xl bg-white dark:bg-[#1e293b] shadow-xl transition-all">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Role</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Update role details and permissions</p>
          </div>
          <button @click="closeModal" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitForm" class="p-6 space-y-4">
          <!-- Role Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Role Code -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role Code <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.code"
              type="text"
              required
              :disabled="true"
              class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p class="mt-1 text-xs text-gray-500">Role code cannot be changed</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <!-- Permissions -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permissions
            </label>
            <div class="space-y-2 max-h-60 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div v-for="permission in permissionOptions" :key="permission.id" class="flex items-center">
                <input
                  :id="`edit-permission-${permission.id}`"
                  v-model="selectedPermissions"
                  :value="permission.id"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label :for="`edit-permission-${permission.id}`" class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  {{ permission.name }}
                </label>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div class="flex gap-4">
              <label class="flex items-center">
                <input
                  v-model="formData.status"
                  type="radio"
                  value="active"
                  class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="formData.status"
                  type="radio"
                  value="inactive"
                  class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Inactive</span>
              </label>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
              <span v-else>Update Role</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import request from '@/util/request.js'
import { showToast } from '@/util/toast'
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  role: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'updated'])

const formData = ref({})
const selectedPermissions = ref([])
const permissionOptions = ref([])
const errors = ref({})
const isSubmitting = ref(false)

const resetForm = () => {
  formData.value = {}
  selectedPermissions.value = []
  errors.value = {}
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const submitForm = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    const payload = {
      name: formData.value.name,
      code: formData.value.code,
      description: formData.value.description || '',
      status: formData.value.status === 'active' ? 1 : 0,
    }

    await request(`/role/${props.role.id}`, 'PUT', payload)
    
    emit('updated')
    closeModal()
    showToast('Role updated successfully', 'success')
  } catch (error) {
    console.error('Update error:', error)
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    } else {
        const message = error.response?.data?.message || 'Failed to update role'
        showToast(message, 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}
// Watch for role changes
watch(() => props.role, (newRole) => {
  if (newRole) {
    formData.value = {
      name: newRole.name,
      code: newRole.code,
      description: newRole.description || '',
      status: newRole.status
    }
  }
})
</script>
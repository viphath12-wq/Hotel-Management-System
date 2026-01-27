<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50" @click="closeModal"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-md transform rounded-xl bg-white dark:bg-[#1e293b] shadow-xl transition-all">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span v-if="actionType === 'delete'">Delete Role</span>
              <span v-else>Confirm Action</span>
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
          </div>
          <button @click="closeModal" class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Warning Icon -->
          <div class="flex justify-center mb-4">
            <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl text-red-600 dark:text-red-400">warning</span>
            </div>
          </div>

          <!-- Message -->
          <div class="text-center mb-6">
            <p class="text-gray-700 dark:text-gray-300 mb-2">
              <span v-if="actionType === 'delete'">
                Are you sure you want to permanently delete the role "<strong>{{ role?.name }}</strong>"?
              </span>
              <span v-else>
                Are you sure you want to perform this action?
              </span>
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400" v-if="role?.user_count > 0">
              ⚠️ This role is assigned to {{ role.user_count }} users. They will lose access if you proceed.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="confirmAction"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>
                <span v-if="actionType === 'delete'">Delete</span>
                <span v-else>Confirm</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from '@/util/request'
import { showToast } from '@/util/toast'
const props = defineProps({
  isOpen: Boolean,
  role: Object,
  actionType: {
    type: String,
    default: 'delete'
  }
})

const emit = defineEmits(['close', 'confirmed'])
const isSubmitting = ref(false)

const closeModal = () => {
  isSubmitting.value = false
  emit('close')
}

const confirmAction = async () => {
  if (!props.role?.id) return

  isSubmitting.value = true

  try {
    await request(`/role/${props.role.id}`, 'DELETE')
    emit('confirmed')
    closeModal()
    showToast('Role deleted successfully', 'success')
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    })
    
    const errorMessage = error.response?.data?.message || error.message || `Failed to ${props.actionType} role`
    showToast(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>
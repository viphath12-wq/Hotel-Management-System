<template>
  <Modal :isOpen="isOpen" @close="$emit('close')" title="Delete User">
    <div class="space-y-4">
      <p class="text-gray-600 dark:text-gray-300">
        Are you sure you want to delete user <strong>{{ user?.name }}</strong>?
      </p>
      <p class="text-sm text-red-600 dark:text-red-400">
        This action cannot be undone. All user data will be permanently deleted.
      </p>
      
      <div class="flex justify-end gap-2 pt-4">
        <button 
          type="button" 
          @click="$emit('close')" 
          class="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button 
          @click="confirmDelete" 
          :disabled="loading"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {{ loading ? 'Deleting...' : 'Delete User' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import request from '@/util/request'
import { showToast } from '@/util/toast'
import Modal from './ModalUser.vue'

const props = defineProps(['isOpen', 'user'])
const emit = defineEmits(['close', 'confirmed'])

const loading = ref(false)

const confirmDelete = async () => {
  loading.value = true
  try {
    await request(`/users/${props.user.id}`, 'DELETE')
    showToast('User deleted successfully', 'success')
    emit('confirmed')
  } catch (error) {
    console.error('Delete user error:', error)
    const message = error.response?.data?.message || 'Failed to delete user'
    showToast(message, 'error')
  } finally {
    loading.value = false
  }
}
</script>
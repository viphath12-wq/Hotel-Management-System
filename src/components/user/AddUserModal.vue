<template>
  <Modal :isOpen="isOpen" @close="$emit('close')" title="Add New User">
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Profile Image</label>
        <div class="flex items-center gap-4">
          <div class="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
            <img v-if="previewUrl" :src="previewUrl" alt="Preview" class="h-full w-full object-cover" />
            <span v-else class="material-symbols-outlined text-3xl text-gray-400">account_circle</span>
          </div>
          <div class="flex-1">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-[#218447] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#122118] hover:file:bg-[#2bc466]"
              @change="onFileChange"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">Max size: 2MB (JPG, PNG, GIF)</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Name</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Password</label>
        <input
          v-model="form.password"
          type="password"
          required
          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Confirm Password</label>
        <input
          v-model="form.password_confirmation"
          type="password"
          required
          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      
      <div class="flex justify-end gap-2 pt-4">
        <button 
          type="button" 
          @click="$emit('close')" 
          class="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          :disabled="loading"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {{ loading ? 'Creating...' : 'Create User' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import request from '@/util/request'
import { showToast } from '@/util/toast'
import Modal from './ModalUser.vue'

const props = defineProps(['isOpen'])
const emit = defineEmits(['close', 'created'])

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const fileInput = ref(null)
const imageFile = ref(null)
const previewUrl = ref('')

const loading = ref(false)

const submitForm = async () => {
  loading.value = true
  try {
    // Check if passwords match
    if (form.value.password !== form.value.password_confirmation) {
      showToast('Passwords do not match', 'error')
      return
    }
    
    const created = await request('/users', 'POST', form.value)

    const createdUser = created?.user || created?.data?.user || created?.data || created
    if (imageFile.value && createdUser?.id) {
      const formData = new FormData()
      formData.append('image', imageFile.value)
      await request(`/users/${createdUser.id}/profile/image`, 'POST', formData)
    }

    showToast('User created successfully', 'success')
    emit('created')
    
    // Reset form
    form.value = {
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    }

    imageFile.value = null
    previewUrl.value = ''
    if (fileInput.value) fileInput.value.value = ''
  } catch (error) {
    console.error('Create user error:', error)
    const message = error.response?.data?.message || 'Failed to create user'
    showToast(message, 'error')
  } finally {
    loading.value = false
  }
}

const onFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) {
    imageFile.value = null
    previewUrl.value = ''
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be less than 2MB', 'error')
    if (fileInput.value) fileInput.value.value = ''
    imageFile.value = null
    previewUrl.value = ''
    return
  }
  imageFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}
</script>
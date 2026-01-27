<template>
  <Modal :isOpen="isOpen" @close="$emit('close')" :title="`Edit User: ${user?.name}`">
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">Profile Image</label>
        <div class="flex items-center gap-4">
          <div class="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
            <img v-if="previewUrl" :src="previewUrl" alt="Preview" class="h-full w-full object-cover" />
            <span v-else class="material-symbols-outlined text-3xl text-gray-400">account_circle</span>
          </div>

          <div class="flex-1 space-y-2">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              :disabled="loading"
              @change="onFileChange"
              class="block w-full text-sm"
            />

            <div class="flex items-center gap-2">
              <button
                type="button"
                :disabled="loading || !user?.profile?.image"
                @click="removeImage"
                class="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Remove
              </button>
              <p class="text-xs text-gray-500 dark:text-gray-400">Max 2MB</p>
            </div>
          </div>
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
        <label class="block text-sm font-medium mb-2">New Password (leave blank to keep current)</label>
        <input
          v-model="form.password"
          type="password"
          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">Confirm New Password</label>
        <input
          v-model="form.password_confirmation"
          type="password"
          :required="!!form.password"
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
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Updating...' : 'Update User' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import request from '@/util/request'
import { showToast } from '@/util/toast'
import Modal from './ModalUser.vue'
import configurl from '@/util/configurl'

const props = defineProps(['isOpen', 'user'])
const emit = defineEmits(['close', 'updated'])

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

watch(() => props.user, (user) => {
  if (user) {
    form.value = {
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: ''
    }

    imageFile.value = null
    previewUrl.value = user?.profile?.image ? `${configurl.image_path}${user.profile.image}` : ''
    if (fileInput.value) fileInput.value.value = ''
  }
}, { immediate: true })

const submitForm = async () => {
  loading.value = true
  try {
    // Check if passwords match when provided
    if (form.value.password && form.value.password !== form.value.password_confirmation) {
      showToast('Passwords do not match', 'error')
      return
    }
    
    const data = { ...form.value }
    
    // Remove password fields if empty
    if (!data.password) {
      delete data.password
      delete data.password_confirmation
    }
    
    await request(`/users/${props.user.id}`, 'PUT', data)

    if (imageFile.value) {
      const formData = new FormData()
      formData.append('image', imageFile.value)
      await request(`/users/${props.user.id}/profile/image`, 'POST', formData)
    }

    showToast('User updated successfully', 'success')
    emit('updated')
  } catch (error) {
    console.error('Update user error:', error)
    const message = error.response?.data?.message || 'Failed to update user'
    showToast(message, 'error')
  } finally {
    loading.value = false
  }
}

const onFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) {
    imageFile.value = null
    previewUrl.value = props.user?.profile?.image ? `${configurl.image_path}${props.user.profile.image}` : ''
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be less than 2MB', 'error')
    if (fileInput.value) fileInput.value.value = ''
    imageFile.value = null
    previewUrl.value = props.user?.profile?.image ? `${configurl.image_path}${props.user.profile.image}` : ''
    return
  }
  imageFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const removeImage = async () => {
  if (loading.value) return
  if (!props.user?.profile?.image) return

  loading.value = true
  try {
    await request(`/users/${props.user.id}/profile/image`, 'DELETE')
    imageFile.value = null
    previewUrl.value = ''
    if (fileInput.value) fileInput.value.value = ''
    showToast('Profile image removed', 'success')
    emit('updated')
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to remove image'
    showToast(message, 'error')
  } finally {
    loading.value = false
  }
}
</script>
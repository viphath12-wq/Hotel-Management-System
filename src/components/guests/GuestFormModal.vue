<template>
  <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl w-full max-w-lg">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold">{{ isEditMode ? 'Edit Guest' : 'Add New Guest' }}</h2>
      </div>

      <div class="p-6 space-y-5">
        <div>
          <label class="block text-sm font-medium mb-1">Full Name *</label>
          <input
            v-model="form.name"
            type="text"
            :disabled="isSaving"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-60"
            :class="{ 'border-red-500': errors.name }"
            required
          />
          <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email *</label>
          <input
            v-model="form.email"
            type="email"
            :disabled="isSaving"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-60"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Phone</label>
          <input
            v-model="form.phone"
            type="tel"
            :disabled="isSaving"
            class="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-60"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Profile Image</label>
          <div class="flex items-center gap-4">
            <div class="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
              <img v-if="form.imagePreview" :src="form.imagePreview" alt="Preview" class="h-full w-full object-cover" />
              <span v-else class="material-symbols-outlined text-3xl text-gray-400">account_circle</span>
            </div>
            <div class="flex-1">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-[#218447] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#122118] hover:file:bg-[#2bc466]"
                @change="handleImageChange"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Max size: 2MB (JPG, PNG, GIF)</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="close"
          type="button"
          :disabled="isSaving"
          class="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          @click="save"
          :disabled="isSaving"
          class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
        >
          <span v-if="isSaving" class="animate-spin material-symbols-outlined">refresh</span>
          {{ isEditMode ? 'Update' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import request from '@/util/request'
import { showToast } from '@/util/toast'
import configurl from '@/util/configurl'
import { resolveImageUrl } from '@/util/image'

const emit = defineEmits(['saved', 'saving'])

const showModal = ref(false)
const isEditMode = ref(false)
const isSaving = ref(false)

const errors = ref({})

const getGuestImage = (guest) => {
  const resolved = resolveImageUrl(guest?.image)
  if (resolved) return resolved
  return avatar
}
const createGuestForm = () => ({
  id: null,
  name: '',
  email: '',
  phone: '',
  image: null,
  imagePreview: null,
  imageName: '',
})

const form = ref(createGuestForm())

const open = (guest) => {
  if (isSaving.value) return

  if (guest) {
    form.value = {
      ...createGuestForm(),
      id: guest.id,
      name: guest.name || '',
      email: guest.email || '',
      phone: guest.phone || '',
      image: null,
      imagePreview: guest.image ? getGuestImage(guest) : null,
      imageName: '',
    }
    isEditMode.value = true
  } else {
    form.value = createGuestForm()
    isEditMode.value = false
  }

  errors.value = {}
  showModal.value = true
}

const close = (force = false) => {
  if (isSaving.value && !force) return
  showModal.value = false
  form.value = createGuestForm()
  isEditMode.value = false
  errors.value = {}
}

const handleImageChange = (e) => {
  if (isSaving.value) return
  const file = e.target.files[0]
  if (!file) return

  form.value.image = file
  form.value.imageName = file.name

  const reader = new FileReader()
  reader.onload = (event) => {
    form.value.imagePreview = event.target.result
  }
  reader.readAsDataURL(file)
}

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!form.value.name?.trim()) {
    errors.value.name = 'Name is required'
    isValid = false
  }
  if (!form.value.email?.trim()) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Invalid email format'
    isValid = false
  }

  return isValid
}

const save = async () => {
  if (!validateForm()) return

  try {
    isSaving.value = true
    emit('saving', true)

    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('email', form.value.email)
    formData.append('phone', form.value.phone || '')

    if (form.value.image) {
      formData.append('image', form.value.image)
    }

    if (isEditMode.value) {
      formData.append('_method', 'PUT')
      await request(`/guests/${form.value.id}`, 'POST', formData)
      showToast('Guest updated successfully', 'success')
    } else {
      await request('/guests', 'POST', formData)
      showToast('Guest created successfully', 'success')
    }

    close(true)
    emit('saved')
  } catch (error) {
    showToast(error.response?.data?.message || 'Operation failed', 'error')
  } finally {
    isSaving.value = false
    emit('saving', false)
  }
}

defineExpose({ open, close })
</script>

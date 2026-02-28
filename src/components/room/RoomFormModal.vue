<template>
  <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white dark:bg-[#1e293b] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
            {{ editingRoom ? 'Edit Room' : 'Add New Room' }}
          </h2>
          <button
            @click="close"
            :disabled="isSaving"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="save" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Number *</label>
              <input
                v-model="form.number"
                type="text"
                required
                :disabled="isSaving"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b4e] focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Type *</label>
              <select
                v-model="form.type"
                required
                :disabled="isSaving"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b4e] focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
                <option value="">Select Type</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Family">Family</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Floor *</label>
              <select
                v-model="form.floor"
                required
                :disabled="isSaving"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b4e] focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
                <option value="">Select Floor</option>
                <option value="1st Floor">Floor 1</option>
                <option value="2nd Floor">Floor 2</option>
                <option value="3rd Floor">Floor 3</option>
                <option value="4th Floor">Floor 4</option>
                <option value="5th Floor">Floor 5</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity *</label>
              <input
                v-model.number="form.capacity"
                type="number"
                min="1"
                required
                :disabled="isSaving"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b4e] focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price per night ($) *</label>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                step="0.01"
                required
                :disabled="isSaving"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b4e] focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
              <select
                v-model="form.status"
                required
                :disabled="isSaving"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b4e] focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Image</label>
            <div class="flex items-center justify-between">
              <div class="h-24 w-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                <img v-if="previewImage" :src="previewImage" alt="Preview" class="h-full w-full object-cover" />
                <span v-else class="material-symbols-outlined text-5xl text-gray-400">photo_camera</span>
              </div>
              <div class="flex-1 ml-4">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  :disabled="isSaving"
                  @change="handleImageUpload"
                  class="block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-[#218447] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#122118] hover:file:bg-[#2bc466] disabled:opacity-60"
                />
              </div>
              <p class="text-xs text-gray-500 mt-1">Max size: 2MB (JPG, PNG, GIF)</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="close"
              :disabled="isSaving"
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-4 py-2 bg-[green] text-white rounded-lg hover:bg-[green]/90 disabled:opacity-50 transition flex items-center gap-2"
            >
              <span v-if="isSaving" class="material-symbols-outlined animate-spin text-xl">refresh</span>
              {{ isSaving ? 'Saving...' : (editingRoom ? 'Update Room' : 'Create Room') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import request from '@/util/request'
import { showToast } from '@/util/toast'
import configurl from '@/util/configurl'
import { resolveImageUrl } from '@/util/image'

const emit = defineEmits(['saved', 'saving'])

const showModal = ref(false)
const isSaving = ref(false)
const editingRoom = ref(null)
const previewImage = ref(null)

const getRoomImage = (room) => {
  const resolved = resolveImageUrl(room?.image)
  if (resolved) return resolved
  return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop'
}

const createRoomForm = () => ({
  number: '',
  type: '',
  floor: '',
  capacity: 1,
  price: 0,
  status: 'available',
  image: null,
})

const form = ref(createRoomForm())

const open = (room) => {
  if (isSaving.value) return

  if (room) {
    editingRoom.value = room.id
    form.value = {
      ...createRoomForm(),
      number: room.number,
      type: room.type,
      floor: room.floor,
      capacity: room.capacity,
      price: parseFloat(room.price),
      status: room.status,
      image: room.image,
    }
    previewImage.value = getRoomImage(room)
  } else {
    editingRoom.value = null
    form.value = createRoomForm()
    previewImage.value = null
  }

  showModal.value = true
}

const close = (force = false) => {
  if (isSaving.value && !force) return
  showModal.value = false
  editingRoom.value = null
  previewImage.value = null
  form.value = createRoomForm()
}

const handleImageUpload = (event) => {
  if (isSaving.value) return

  const file = event.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be under 2MB', 'error')
    return
  }

  form.value.image = file
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const save = async () => {
  try {
    isSaving.value = true
    emit('saving', true)

    const formData = new FormData()

    formData.append('number', form.value.number)
    formData.append('type', form.value.type)
    formData.append('floor', form.value.floor)
    formData.append('capacity', form.value.capacity)
    formData.append('price', form.value.price)
    formData.append('status', form.value.status)

    if (form.value.image instanceof File) {
      formData.append('image', form.value.image)
    }

    if (editingRoom.value) {
      formData.append('_method', 'PUT')
      await request(`/rooms/${editingRoom.value}`, 'POST', formData)
      showToast('Room updated successfully', 'success')
    } else {
      await request('/rooms', 'POST', formData)
      showToast('Room created successfully', 'success')
    }

    close(true)
    emit('saved')
  } catch (error) {
    const msg = error.response?.data?.message || 'Failed to save room'
    showToast(msg, 'error')
  } finally {
    isSaving.value = false
    emit('saving', false)
  }
}

defineExpose({ open, close })
</script>

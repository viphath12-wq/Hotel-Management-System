<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Rooms</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage room inventory, status, and details</p>
      </div>
      <button 
        @click="openModal(null)"
        :disabled="isLoading || isSaving"
        class="px-4 py-2 bg-[green] text-white rounded-lg hover:bg-[green]/90 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span v-if="isSaving" class="animate-spin material-symbols-outlined">refresh</span>
        <span v-else class="material-symbols-outlined text-xl">add</span>
        Add New Room
      </button>
    </div>

    <!-- Room Summary Cards - Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="space-y-3">
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
          <div class="p-3 rounded-lg bg-gray-300 dark:bg-gray-700 animate-pulse">
            <div class="size-6 bg-gray-400 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Room Summary Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rooms</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{{ rooms.length }}</p>
          </div>
          <div class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <span class="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">hotel</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{{ roomStats.available }}</p>
          </div>
          <div class="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
            <span class="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">check_circle</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Occupied</p>
            <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{{ roomStats.occupied }}</p>
          </div>
          <div class="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
            <span class="material-symbols-outlined text-3xl text-yellow-600 dark:text-yellow-400">bed</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
            <p class="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{{ roomStats.maintenance }}</p>
          </div>
          <div class="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <span class="material-symbols-outlined text-3xl text-orange-600 dark:text-orange-400">engineering</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="rounded-xl bg-white dark:bg-[#1e293b] p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-3 text-gray-500 text-xl">search</span>
          <input
            v-model="searchQuery"
            type="text"
            :disabled="isLoading || isSaving"
            placeholder="Search by room number, type..."
            class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-60"
          />
        </div>

        <select 
          v-model="statusFilter" 
          :disabled="isLoading || isSaving"
          class="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-60"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <select 
          v-model="typeFilter" 
          :disabled="isLoading || isSaving"
          class="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-60"
        >
          <option value="all">All Types</option>
          <option value="Standard">Standard</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Suite">Suite</option>
          <option value="Family">Family</option>
          <option value="Executive">Executive</option>
        </select>

        <select 
          v-model="floorFilter" 
          :disabled="isLoading || isSaving"
          class="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-60"
        >
          <option value="all">All Floors</option>
          <option value="1st Floor">Floor 1</option>
          <option value="2nd Floor">Floor 2</option>
          <option value="3rd Floor">Floor 3</option>
          <option value="4th Floor">Floor 4</option>
          <option value="5th Floor">Floor 5</option>
        </select>
      </div>
    </div>

    <!-- Rooms Grid Loading Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="rounded-xl bg-white dark:bg-[#1e293b] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Image Skeleton -->
        <div class="h-48 bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
        
        <div class="p-5">
          <!-- Header Skeleton -->
          <div class="flex justify-between items-start mb-4">
            <div class="space-y-2">
              <div class="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>
            <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20 animate-pulse"></div>
          </div>

          <!-- Footer Skeleton -->
          <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="space-y-2">
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
            <div class="flex gap-2">
              <div class="size-8 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div class="size-8 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rooms Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="room in filteredRooms"
        :key="room.id"
        class="rounded-xl bg-white dark:bg-[#1e293b] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="h-48 relative overflow-hidden">
          <img 
            :src="getRoomImage(room)" 
            :alt="`Room ${room.number}`"
            class="w-full h-full object-cover"
            @error="handleImageError($event, room)"
          />
          <div class="absolute inset-0 bg-black/30 to-transparent"></div>
        </div>

        <div class="p-5">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ room.number }} - {{ room.type }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatFloor(room.floor) }} • {{ room.capacity }} guests
              </p>
            </div>
            <span
              :class="{
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': room.status === 'available',
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': room.status === 'occupied',
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': room.status === 'cleaning',
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': room.status === 'maintenance',
              }"
              class="px-3 py-1 text-xs font-medium rounded-full capitalize"
            >
              {{ room.status }}
            </span>
          </div>

          <div class="mt-4 flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Price / night</p>
              <p class="text-xl font-bold text-gray-900 dark:text-gray-100">${{ room.price }}</p>
            </div>
            <div class="flex gap-2">
              <button 
                @click="openModal(room)" 
                title="Edit"
                :disabled="isSaving"
                class="p-2 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-900/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span class="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button 
                @click="deleteRoom(room.id)" 
                title="Delete"
                :disabled="isSaving"
                class="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span class="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isLoading && filteredRooms.length === 0" class="text-center py-12">
      <span class="material-symbols-outlined text-6xl text-gray-400">bed</span>
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No rooms found</h3>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or add a new room.</p>
    </div>

    <!-- Stats Loading Indicator -->
    <div v-if="isLoading" class="text-center py-4">
      <div class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span class="animate-spin material-symbols-outlined text-base">refresh</span>
        Loading room statistics...
      </div>
    </div>

    <!-- Modal -->
    <RoomFormModal ref="roomFormModal" @saved="fetchRooms" @saving="setSaving" />
    <ConfirmModalDelete 
      ref="confirmModalDelete"
      title="Delete Room"
      message="Are you sure you want to delete this room? This action cannot be undone."
      confirm-text="Delete Room"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '../util/request'
import { showToast } from '../util/toast'
import ConfirmModalDelete from '../components/ConfirmDeleteModel.vue'
import configurl from '../util/configurl'
import RoomFormModal from '@/components/room/RoomFormModal.vue'

const rooms = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const roomFormModal = ref(null)

const searchQuery = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const floorFilter = ref('all')

const setSaving = (value) => {
  isSaving.value = Boolean(value)
}

// Format floor display
const formatFloor = (floor) => {
  if (!floor) return '—'
  return floor
    .replace(/(\d+)(st|nd|rd|th)/i, '$1')
    .replace(/\s*Floors?\s*/i, '')
    .trim()
    .replace(/^(\d+)$/, 'Floor $1')
}

// Stats
const roomStats = computed(() => ({
  available: rooms.value.filter(r => r.status === 'available').length,
  occupied: rooms.value.filter(r => r.status === 'occupied').length,
  cleaning: rooms.value.filter(r => r.status === 'cleaning').length,
  maintenance: rooms.value.filter(r => r.status === 'maintenance').length
}))

// Filtered rooms
const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          room.type.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = statusFilter.value === 'all' || room.status === statusFilter.value
    const matchesType = typeFilter.value === 'all' || room.type === typeFilter.value
    const matchesFloor = floorFilter.value === 'all' || room.floor === floorFilter.value
    return matchesSearch && matchesStatus && matchesType && matchesFloor
  })
})

const getRoomImage = (room) => {
  if (room?.image) {
    return `${configurl.image_path}${room.image}`
  }
  return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop'
}

const handleImageError = (event, room) => {
  console.warn('Image failed to load:', event.target.src)
  event.target.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop'
}

const fetchRooms = async () => {
  try {
    isLoading.value = true
    const response = await request('/rooms', 'GET')
    rooms.value = response.data || response
  } catch (error) {
    showToast('Failed to load rooms', 'error')
  } finally {
    isLoading.value = false
  }
}

const openModal = (room) => {
  if (isSaving.value || isLoading.value) return
  roomFormModal.value?.open(room || null)
}

const confirmModalDelete = ref(null)

const deleteRoom = async (id) => {
  if (!confirmModalDelete.value || isLoading.value || isSaving.value) return
  const confirmed = await confirmModalDelete.value.open()
  if (!confirmed) return
  try {
    isSaving.value = true
    await request(`/rooms/${id}`, 'DELETE')
    showToast('Room deleted successfully', 'success')
    await fetchRooms()
  } catch (error) {
    showToast('Failed to delete room', 'error')
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchRooms)
</script>
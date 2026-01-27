<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Guests</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage guest profiles and registration history
        </p>
      </div>
      <button
        @click="openAddModal"
        :disabled="isLoading"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading" class="animate-spin material-symbols-outlined">refresh</span>
        <span v-else class="material-symbols-outlined text-xl">person_add</span>
        Add New Guest
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="rounded-xl bg-white dark:bg-[#1e293b] p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-3.5 text-gray-500 text-xl">search</span>
          <input
            v-model="searchQuery"
            type="text"
            :disabled="isLoading"
            placeholder="Search by name, email, phone or ID..."
            class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-60"
          />
        </div>

        <select
          v-model="sortBy"
          :disabled="isLoading"
          class="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:opacity-60"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
        </select>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="rounded-xl bg-white dark:bg-[#1e293b] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="p-6">
        <!-- Header Skeleton -->
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          </div>
          <div class="h-10 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>

        <!-- Table Skeleton -->
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
            <!-- Guest Info -->
            <div class="flex items-center space-x-4">
              <div class="size-12 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div>
                <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2 animate-pulse"></div>
                <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            
            <!-- Contact Info -->
            <div>
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-2 animate-pulse"></div>
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>
            
            <!-- Date Info -->
            <div>
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28 mb-2 animate-pulse"></div>
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
            
            <!-- Actions -->
            <div class="flex space-x-2">
              <div class="size-8 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div class="size-8 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Guests Table -->
    <div v-else class="rounded-xl bg-white dark:bg-[#1e293b] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-xs uppercase bg-gray-50 dark:bg-[#2d3b4e] text-gray-700 dark:text-gray-400">
            <tr>
              <th class="px-6 py-4 text-left">Guest</th>
              <th class="px-6 py-4 text-left">Contact</th>
              <th class="px-6 py-4 text-left">Registered</th>
              <th class="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="guest in displayedGuests" :key="guest.id" class="hover:bg-gray-50 dark:hover:bg-[#2d3b4e] transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="size-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-600"
                    :style="{ backgroundImage: `url(${getGuestImage(guest)})` }"
                  ></div>
                  <div>
                    <p class="font-medium">{{ guest.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">ID: {{ guest.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div>
                  <p class="text-sm">{{ guest.email }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ guest.phone || '—' }}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <time class="text-sm text-gray-600 dark:text-gray-300">
                  {{ formatDate(guest.created_at) }}
                </time>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ timeAgo(guest.created_at) }}
                </p>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    @click="openEditModal(guest)" 
                    :disabled="isSaving"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3d4b5e] disabled:opacity-60 disabled:cursor-not-allowed" 
                    aria-label="Edit"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button 
                    @click="confirmDelete(guest)" 
                    :disabled="isSaving"
                    class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 disabled:opacity-60 disabled:cursor-not-allowed" 
                    aria-label="Delete"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="displayedGuests.length === 0">
              <td colspan="4" class="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                <div class="flex flex-col items-center gap-2">
                  <span class="material-symbols-outlined text-4xl text-gray-400">group_off</span>
                  <p class="text-sm">No guests found matching your criteria</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          <span v-if="isLoading" class="inline-flex items-center gap-2">
            <span class="animate-spin material-symbols-outlined text-sm">refresh</span>
            Loading guests...
          </span>
          <span v-else>
            Showing {{ displayedGuests.length }} guest{{ displayedGuests.length !== 1 ? 's' : '' }}
          </span>
        </p>
      </div>
    </div>

    <GuestFormModal ref="guestFormModal" @saved="fetchGuests" @saving="setSaving" />
    <ConfirmModalDelete 
      ref="confirmModalDelete"
      title="Delete Guest"
      message="Are you sure you want to delete this guest? This action cannot be undone."
      confirm-text="Delete Guest"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import avatar from '../assets/user_avatar.png'
import ConfirmModalDelete from '../components/ConfirmDeleteModel.vue'
import GuestFormModal from '@/components/guests/GuestFormModal.vue'
import request from '../util/request'
import { showToast } from '../util/toast'
import configurl from '../util/configurl'
import { formatDate, timeAgo } from '@/util/helpers'

const guests = ref([])
const searchQuery = ref('')
const sortBy = ref('newest')

const isLoading = ref(false)
const isSaving = ref(false)

const guestFormModal = ref(null)

const setSaving = (value) => {
  isSaving.value = Boolean(value)
}

const displayedGuests = computed(() => {
  let filtered = guests.value.filter(guest => {
    const query = searchQuery.value.toLowerCase()
    return (
      guest.name?.toLowerCase().includes(query) ||
      guest.email?.toLowerCase().includes(query) ||
      (guest.phone && guest.phone.toLowerCase().includes(query)) ||
      guest.id?.toString().includes(query)
    )
  })

  if (sortBy.value === 'newest') {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } else if (sortBy.value === 'oldest') {
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  } else if (sortBy.value === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy.value === 'name-desc') {
    filtered.sort((a, b) => b.name.localeCompare(a.name))
  }

  return filtered
})

const getGuestImage = (guest) => {
  if (guest?.image) {
    return `${configurl.image_path}${guest.image}`
  }
  return avatar
}

const fetchGuests = async () => {
  isLoading.value = true
  try {
    const response = await request('/guests', 'GET')
    guests.value = response?.data || response || []
  } catch (error) {
    showToast('Error fetching guests', 'error')
  } finally {
    isLoading.value = false
  }
}

const openAddModal = () => {
  if (isLoading.value) return
  guestFormModal.value?.open(null)
}

const openEditModal = (guest) => {
  if (isLoading.value || isSaving.value) return
  guestFormModal.value?.open(guest)
}

const confirmModalDelete = ref(null)

const confirmDelete = async (guest) => {
  if (!confirmModalDelete.value || isLoading.value || isSaving.value) return

  const confirmed = await confirmModalDelete.value.open()
  
  if (!confirmed) return

  try {
    isSaving.value = true
    await request(`/guests/${guest.id}`, 'DELETE')
    showToast('Guest deleted successfully', 'success')
    await fetchGuests()
  } catch (error) {
    showToast(error.response?.data?.message || 'Failed to delete guest', 'error')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchGuests()
})
</script>
<template>
  <div class="space-y-6">
    <!-- Page Title -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Last updated: {{ lastUpdatedLabel }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue (This Month)</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{{ isLoadingReports ? '—' : `$${kpis.total_revenue}` }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Based on reservations in selected period</p>
          </div>
          <div class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <span class="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">payments</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Occupancy Rate</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{{ isLoadingReports ? '—' : `${kpis.occupancy_rate}%` }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Calculated from room-nights</p>
          </div>
          <div class="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
            <span class="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">trending_up</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings (This Month)</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{{ isLoadingReservations ? '—' : totalBookingsThisMonth }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Count of reservations (non-cancelled)</p>
          </div>
          <div class="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <span class="material-symbols-outlined text-3xl text-purple-600 dark:text-purple-400">calendar_month</span>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-white dark:bg-[#1e293b] p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Available Rooms</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{{ isLoadingRooms ? '—' : roomCounts.available }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Out of {{ totalRooms }} total rooms</p>
          </div>
          <div class="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <span class="material-symbols-outlined text-3xl text-orange-600 dark:text-orange-400">bed</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts and Table Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Reservations Table -->
      <div class="lg:col-span-2 rounded-xl bg-white dark:bg-[#1e293b] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Reservations</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#2d3b4e] dark:text-gray-400">
              <tr>
                <th class="px-6 py-3">Guest Name</th>
                <th class="px-6 py-3">Room</th>
                <th class="px-6 py-3">Check-in</th>
                <th class="px-6 py-3">Check-out</th>
                <th class="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="isLoadingReservations" class="hover:bg-gray-50 dark:hover:bg-[#2d3b4e]">
                <td colspan="5" class="px-6 py-10 text-center text-gray-400">
                  <span class="inline-flex items-center gap-2">
                    <span class="material-symbols-outlined animate-spin text-4xl text-blue-600">refresh</span>
                    Loading reservations...
                  </span>
                </td>
              </tr>

              <tr
                v-else
                v-for="r in recentReservations"
                :key="r.id"
                class="hover:bg-gray-50 dark:hover:bg-[#2d3b4e]"
              >
                <td class="px-6 py-4 font-medium">
                  <div class="flex items-center gap-3">
                    <img
                      class="size-9 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                      :src="getGuestImageSrc(r)"
                      :alt="r.guest"
                      @error="onGuestImageError"
                    />
                    <span class="truncate">{{ r.guest }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">{{ r.room }}</td>
                <td class="px-6 py-4">{{ formatDate(r.check_in) }}</td>
                <td class="px-6 py-4">{{ formatDate(r.check_out) }}</td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 text-xs rounded-full"
                    :class="statusBadgeClass(r.status)"
                  >
                    {{ r.status }}
                  </span>
                </td>
              </tr>

              <tr v-if="!isLoadingReservations && !recentReservations.length" class="hover:bg-gray-50 dark:hover:bg-[#2d3b4e]">
                <td colspan="5" class="px-6 py-10 text-center text-gray-400">No reservations</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Room Status -->
      <div class="rounded-xl bg-white dark:bg-[#1e293b] shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Room Status (Today)</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded bg-yellow-500"></div>
              <span class="text-sm font-medium">Occupied</span>
            </div>
            <span class="text-lg font-bold">{{ isLoadingRooms ? '—' : roomCounts.occupied }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded bg-blue-500"></div>
              <span class="text-sm font-medium">Reserved</span>
            </div>
            <span class="text-lg font-bold">{{ isLoadingRooms ? '—' : roomCounts.reserved }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded bg-gray-400"></div>
              <span class="text-sm font-medium">Cleaning</span>
            </div>
            <span class="text-lg font-bold">{{ isLoadingRooms ? '—' : roomCounts.cleaning }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded bg-red-500"></div>
              <span class="text-sm font-medium">Maintenance</span>
            </div>
            <span class="text-lg font-bold">{{ isLoadingRooms ? '—' : roomCounts.maintenance }}</span>
          </div>
          <div class="flex items-center justify-between border-t pt-4 mt-4">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded bg-green-500"></div>
              <span class="text-sm font-medium">Available</span>
            </div>
            <span class="text-lg font-bold text-green-600 dark:text-green-400">{{ isLoadingRooms ? '—' : roomCounts.available }}</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-6">Out of {{ totalRooms }} total rooms</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import request from '@/util/request'
import configurl from '@/util/configurl'
import userAvatar from '../assets/user_avatar.png'

const isLoadingReports = ref(false)
const isLoadingReservations = ref(false)
const isLoadingRooms = ref(false)

const lastUpdated = ref(null)

const kpis = ref({
  occupancy_rate: 0,
  adr: 0,
  revpar: 0,
  total_revenue: 0
})

const reservations = ref([])
const rooms = ref([])

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return '—'
  return lastUpdated.value.toLocaleString()
})

const mapReservation = r => ({
  id: r.id,
  guest: r.guest?.name ?? 'Unknown',
  guest_image: r.guest?.image ?? null,
  room: r.room ? `${r.room.type} #${r.room.number}` : 'N/A',
  check_in: r.check_in,
  check_out: r.check_out,
  status: r.status || 'Pending'
})

const getGuestImageSrc = (r) => {
  const path = r?.guest_image
  if (!path) return userAvatar
  return `${configurl.image_path}${path}`
}

const onGuestImageError = (e) => {
  if (!e?.target) return
  e.target.src = userAvatar
}

const recentReservations = computed(() => {
  const list = Array.isArray(reservations.value) ? reservations.value : []
  return list
    .filter(r => String(r.status || '').toLowerCase() !== 'cancelled')
    .slice(0, 7)
})

const totalBookingsThisMonth = computed(() => {
  const list = Array.isArray(reservations.value) ? reservations.value : []
  return list.filter(r => String(r.status || '').toLowerCase() !== 'cancelled').length
})

const roomCounts = computed(() => {
  const counts = {
    occupied: 0,
    reserved: 0,
    cleaning: 0,
    maintenance: 0,
    available: 0
  }

  const list = Array.isArray(rooms.value) ? rooms.value : []
  for (const room of list) {
    const s = String(room.status || '').toLowerCase()
    if (s in counts) counts[s] += 1
  }

  return counts
})

const totalRooms = computed(() => {
  const list = Array.isArray(rooms.value) ? rooms.value : []
  return list.length
})

const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString()
}

const statusBadgeClass = (status) => {
  const s = String(status || '').toLowerCase()
  if (s.includes('pending')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  if (s.includes('confirm')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  if (s.includes('cancel')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const loadReports = async () => {
  isLoadingReports.value = true
  try {
    const data = await request('/reports', 'GET', { period: 'month' })
    kpis.value = data?.kpis || kpis.value
  } finally {
    isLoadingReports.value = false
  }
}

const loadReservations = async () => {
  isLoadingReservations.value = true
  try {
    const data = await request('/reservations', 'GET')
    reservations.value = Array.isArray(data) ? data.map(mapReservation) : []
  } finally {
    isLoadingReservations.value = false
  }
}

const loadRooms = async () => {
  isLoadingRooms.value = true
  try {
    const data = await request('/rooms', 'GET')
    rooms.value = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])
  } finally {
    isLoadingRooms.value = false
  }
}

const refreshDashboard = async () => {
  await Promise.all([
    loadReports(),
    loadReservations(),
    loadRooms()
  ])
  lastUpdated.value = new Date()
}

onMounted(() => {
  refreshDashboard()
})
</script>
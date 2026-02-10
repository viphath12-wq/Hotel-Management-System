<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
    <!-- Loading State -->
    <div v-if="isLoading" class="p-6">
      <div class="flex items-center justify-center py-12">
        <span class="material-symbols-outlined animate-spin text-4xl text-blue-600">refresh</span>
        <span class="ml-3 text-gray-500 dark:text-gray-400">Loading reservations...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="reservations.length === 0" class="p-6">
      <div class="flex flex-col items-center justify-center py-12">
        <span class="material-symbols-outlined text-6xl text-gray-400 mb-4">event_busy</span>
        <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">No reservations found</p>
        <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your filters</p>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-xs uppercase bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-400">
          <tr>
            <th class="px-6 py-4 text-left">Guest</th>
            <th class="px-6 py-4 text-left">Room</th>
            <th class="px-6 py-4 text-left">Check-in</th>
            <th class="px-6 py-4 text-left">Check-out</th>
            <th class="px-6 py-4 text-left">Total</th>
            <th class="px-6 py-4 text-left">Status</th>
            <th class="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-slate-700">
          <tr
            v-for="reservation in reservations"
            :key="reservation.id"
            class="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="size-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-600"
                  :style="{ backgroundImage: `url(${getGuestImage(reservation)})` }"
                ></div>
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ reservation.guest }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ reservation.email || 'N/A' }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <p class="text-gray-900 dark:text-white">{{ reservation.room }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-gray-900 dark:text-white">{{ formatDate(reservation.checkIn) }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="text-gray-900 dark:text-white">{{ formatDate(reservation.checkOut) }}</p>
            </td>
            <td class="px-6 py-4">
              <p class="font-medium text-gray-900 dark:text-white">${{ reservation.total }}</p>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                  statusBadgeClasses[reservation.status] || statusBadgeClasses.pending
                ]"
              >
                {{ reservation.statusLabel }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="$emit('view', reservation)"
                  :disabled="isSaving"
                  class="inline-flex items-center justify-center size-9 rounded-lg border border-transparent text-blue-600 dark:text-blue-400 hover:bg-blue-50 hover:border-blue-100 dark:hover:bg-blue-900/20 dark:hover:border-blue-900/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  title="View"
                >
                  <span class="material-symbols-outlined text-[20px]">visibility</span>
                </button>
                <button
                  @click="$emit('pay', reservation)"
                  :disabled="isSaving"
                  class="inline-flex items-center justify-center size-9 rounded-lg border border-transparent text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 hover:border-emerald-100 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-900/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Payment"
                >
                  <span class="material-symbols-outlined text-[20px]">qr_code_2</span>
                </button>
                <button
                  @click="$emit('print', reservation)"
                  :disabled="isSaving"
                  class="inline-flex items-center justify-center size-9 rounded-lg border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:border-slate-200 dark:hover:bg-slate-700/50 dark:hover:border-slate-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Print Invoice"
                >
                  <span class="material-symbols-outlined text-[20px]">print</span>
                </button>
                <button
                  @click="$emit('edit', reservation)"
                  class="inline-flex items-center justify-center size-9 rounded-lg border border-transparent text-green-600 dark:text-green-400 hover:bg-green-50 hover:border-green-100 dark:hover:bg-green-900/20 dark:hover:border-green-900/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Edit"
                >
                  <span class="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                  @click="$emit('cancel', reservation)"
                  :disabled="(isSaving && cancellingId === reservation.id)"
                  class="inline-flex items-center justify-center size-9 rounded-lg border border-transparent text-red-600 dark:text-red-400 hover:bg-red-50 hover:border-red-100 dark:hover:bg-red-900/20 dark:hover:border-red-900/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Delete"
                >
                  <span
                    class="material-symbols-outlined text-[20px]"
                    :class="isSaving && cancellingId === reservation.id ? 'animate-spin' : ''"
                  >
                    {{ isSaving && cancellingId === reservation.id ? 'progress_activity' : 'delete' }}
                  </span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div v-if="!isLoading && reservations.length > 0" class="px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Showing {{ reservations.length }} reservation{{ reservations.length !== 1 ? 's' : '' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import configurl from '../../util/configurl'
import avatar from '../../assets/user_avatar.png'

defineProps({
  reservations: Array,
  isLoading: Boolean,
  isSaving: Boolean,
  cancellingId: {
    type: [Number, String],
    default: null
  },
  statusBadgeClasses: Object
})

defineEmits(['view', 'edit', 'cancel', 'print', 'pay'])

const getGuestImage = (reservation) => {
  if (reservation.raw?.guest?.image) {
    return `${configurl.image_path}${reservation.raw.guest.image}`
  }
  return avatar
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

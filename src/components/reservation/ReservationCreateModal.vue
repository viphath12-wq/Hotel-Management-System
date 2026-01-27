<template>
  <div
    class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl transform transition-all scale-100"
      @click.stop
    >
      <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Create New Reservation</h3>
      </div>

      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Guest</label>
            <select
              :value="form.guest_id"
              @input="$emit('update:form', 'guest_id', $event.target.value)"
              :disabled="isLoadingGuests || isSaving"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="" disabled>{{ isLoadingGuests ? 'Loading guests...' : 'Select guest' }}</option>
              <option v-for="guest in guests" :key="guest.id" :value="guest.id">
                {{ guest.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Room</label>
            <select
              :value="form.room_id"
              @input="$emit('update:form', 'room_id', $event.target.value)"
              :disabled="isLoadingRooms || isSaving"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="" disabled>{{ isLoadingRooms ? 'Loading rooms...' : form.check_in && form.check_out ? 'Select available room' : 'Select room' }}</option>
              <option 
                v-for="room in availableRooms" 
                :key="room.id" 
                :value="room.id"
              >
                {{ room.number }} — {{ room.type }}
              </option>
            </select>
            <p v-if="form.check_in && form.check_out && availableRooms.length === 0" 
               class="text-xs text-orange-500 dark:text-orange-400 mt-1 flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">info</span>
              No available rooms for the selected dates
            </p>
            <p v-if="!form.check_in || !form.check_out" 
               class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select check-in and check-out dates to see available rooms
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Check-in Date</label>
            <input
              type="date"
              :value="form.check_in"
              @input="$emit('update:form', 'check_in', $event.target.value)"
              :disabled="isSaving"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition disabled:opacity-60"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Check-out Date</label>
            <input
              type="date"
              :value="form.check_out"
              @input="$emit('update:form', 'check_out', $event.target.value)"
              :disabled="isSaving"
              class="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition disabled:opacity-60"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
          <select
            :value="form.status"
            @input="$emit('update:form', 'status', $event.target.value)"
            :disabled="isSaving"
            class="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition disabled:opacity-60"
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-900/50 rounded-b-2xl">
        <button
          type="button"
          class="px-5 py-2.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition disabled:opacity-50"
          @click="$emit('close')"
          :disabled="isSaving"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
          @click="$emit('submit')"
          :disabled="isSaving || !isValid"
        >
          <span v-if="isSaving" class="animate-spin material-symbols-outlined">refresh</span>
          {{ isSaving ? 'Creating...' : 'Create Reservation' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  form: Object,
  guests: Array,
  rooms: Array,
  reservations: Array,
  isLoadingGuests: Boolean,
  isLoadingRooms: Boolean,
  isSaving: Boolean,
  isValid: Boolean
})

defineEmits(['update:form', 'submit', 'close'])

const isRoomAvailable = (roomId) => {
  if (!props.form.check_in || !props.form.check_out) {
    return true
  }

  const checkIn = new Date(props.form.check_in)
  const checkOut = new Date(props.form.check_out)

  // Check if dates are valid
  if (checkIn >= checkOut) {
    return false
  }

  // Check for overlapping reservations
  const hasOverlap = props.reservations.some(reservation => {
    // Skip cancelled reservations
    if (reservation.status === 'cancelled') {
      return false
    }

    // Check if same room
    if (reservation.raw?.room?.id !== roomId) {
      return false
    }

    const resCheckIn = new Date(reservation.checkIn)
    const resCheckOut = new Date(reservation.checkOut)

    // Check for date overlap
    return (
      (checkIn >= resCheckIn && checkIn < resCheckOut) ||
      (checkOut > resCheckIn && checkOut <= resCheckOut) ||
      (checkIn <= resCheckIn && checkOut >= resCheckOut)
    )
  })

  return !hasOverlap
}

const availableRooms = computed(() => {
  // First filter by room status - only show 'available' rooms
  const availableStatusRooms = (props.rooms || []).filter(room => 
    room.status === 'available'
  )

  // If dates are not selected, show all available status rooms
  if (!props.form.check_in || !props.form.check_out) {
    return availableStatusRooms
  }

  // Filter to show only available rooms (both status and date-wise)
  return availableStatusRooms.filter(room => isRoomAvailable(room.id))
})
</script>

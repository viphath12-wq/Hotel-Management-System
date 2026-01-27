<template>
  <div
    class="fixed inset-0 bg-black/5 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl transform transition-all scale-100"
      @click.stop
    >
      <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Edit Reservation</h3>
      </div>

      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
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

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment</label>
                <select
                  :value="form.payment_status"
                  @input="$emit('update:form', 'payment_status', $event.target.value)"
                  :disabled="isSaving"
                  class="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition disabled:opacity-60"
                >
                  <option value="">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="digital_wallet">Digital Wallet</option>
                </select>
              </div>
            </div>
          </div>

          <div class="lg:col-span-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Card</label>
            <div class="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p v-if="form.total" class="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    Amount: <span class="font-semibold">${{ parseFloat(form.total).toFixed(2) }}</span>
                  </p>
                </div>
              </div>

              <div class="mt-4 flex justify-center">
                <img
                  :src="qrCodeImage"
                  alt="Payment QR Code"
                  class="rounded-lg bg-white p-2"
                />
              </div>
            </div>
          </div>
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
          {{ isSaving ? 'Updating...' : 'Update Reservation' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import qrCodeImage from '../../assets/QRcode.JPG'

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

const isRoomAvailable = (roomId, currentReservationId = null) => {
  if (!props.form.check_in || !props.form.check_out) {
    return true
  }

  const checkIn = new Date(props.form.check_in)
  const checkOut = new Date(props.form.check_out)

  // Check if dates are valid
  if (checkIn >= checkOut) {
    return false
  }

  // Check for overlapping reservations (excluding current reservation)
  const hasOverlap = props.reservations.some(reservation => {
    // Skip current reservation being edited
    if (currentReservationId && reservation.id === currentReservationId) {
      return false
    }

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
  // If dates are not selected, show all rooms
  if (!props.form.check_in || !props.form.check_out) {
    return props.rooms || []
  }

  // Get currently selected room
  const currentRoom = (props.rooms || []).find(room => room.id === Number(props.form.room_id))
  
  // Filter to show available rooms + currently selected room (if different)
  const available = (props.rooms || []).filter(room => {
    // Always include currently selected room
    if (currentRoom && room.id === currentRoom.id) {
      return true
    }
    // Include other available rooms
    return isRoomAvailable(room.id, props.form.id)
  })

  return available
})
</script>

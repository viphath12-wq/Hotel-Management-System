<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Reservations</h1>
      <button
        class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        @click="openCreate"
        :disabled="isLoading || isSaving"
      >
        <span class="material-symbols-outlined mr-2 text-xl">add</span>
        New Reservation
      </button>
    </div>

    <!-- Modals -->
    <ReservationCreateModal
      v-if="isCreateOpen"
      :form="createForm"
      :guests="guests"
      :rooms="rooms"
      :reservations="reservations"
      :is-loading-guests="isLoadingGuests"
      :is-loading-rooms="isLoadingRooms"
      :is-saving="isSaving"
      :is-valid="isFormValid"
      @update:form="updateCreateForm"
      @submit="submitCreate"
      @close="closeCreate"
    />

    <ReservationEditModal
      v-if="isEditOpen"
      :form="editForm"
      :guests="guests"
      :rooms="rooms"
      :reservations="reservations"
      :is-loading-guests="isLoadingGuests"
      :is-loading-rooms="isLoadingRooms"
      :is-saving="isSaving"
      :is-valid="isEditFormValid"
      @update:form="updateEditForm"
      @submit="submitEdit"
      @close="closeEdit"
    />

    <ReservationViewModal
      v-if="isViewOpen"
      :data="viewData"
      :status-badge-classes="statusBadgeClasses"
      @edit="openEditFromView"
      @print="printInvoice"
      @close="closeView"
    />

    <InvoicePrinter ref="invoicePrinter" />

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search guest, room, ID..."
            :disabled="isLoading"
            class="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:opacity-60 transition"
          />
        </div>

        <select
          v-model="statusFilter"
          :disabled="isLoading"
          class="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:opacity-60 transition"
        >
        <!-- Paid -->
         <!-- failed -->
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          v-model="checkInDate"
          :disabled="isLoading"
          class="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:opacity-60 transition"
        />

        <input
          type="date"
          v-model="checkOutDate"
          :disabled="isLoading"
          class="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none disabled:opacity-60 transition"
        />
      </div>
    </div>

    <!-- Table -->
    <ReservationTable
      :reservations="filteredReservations"
      :is-loading="isLoading"
      :is-saving="isSaving"
      :cancelling-id="cancellingId"
      :status-badge-classes="statusBadgeClasses"
      @view="openView"
      @print="printInvoice"
      @edit="openEdit"
      @cancel="cancelReservation"
      @pay="openPayment"
    />

    <div v-if="isPaymentOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60" @click="closePayment" />
      <div
        class="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden"
      >
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <div>
            <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">Bakong Payment</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Reservation #{{ paymentReservation?.id }}</div>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center size-9 rounded-lg border border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50"
            @click="closePayment"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-5 space-y-4">
          <div class="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 p-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Amount</span>
              <span class="font-semibold text-gray-900 dark:text-gray-100">${{ paymentAmount }}</span>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/20 p-4">
            <div v-if="paymentLoading" class="text-center text-sm text-gray-600 dark:text-gray-400">Generating QR...</div>
            <div v-else-if="paymentError" class="text-center text-sm text-red-600">{{ paymentError }}</div>
            <img v-else-if="paymentQrUrl" :src="paymentQrUrl" alt="Payment QR" class="w-full rounded-lg" />
            <div v-else class="text-center text-sm text-gray-600 dark:text-gray-400">QR unavailable</div>
          </div>

          <div v-if="paymentPaid" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Paid verified. Reservation confirmed.
          </div>

          <div v-if="paymentVerifying" class="text-xs text-gray-500 dark:text-gray-400">
            Auto verifying transaction...
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
              :disabled="paymentLoading || paymentVerifying || paymentPaid || !paymentMd5"
              @click="verifyNow"
            >
              {{ paymentVerifying ? 'Verifying...' : 'Verify Now' }}
            </button>
            <button
              type="button"
              class="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              :disabled="paymentLoading || paymentVerifying || paymentPaid"
              @click="cancelPaymentReservation"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModalDelete
      ref="confirmDeleteModal"
      title="Cancel Reservation"
      message="This action cannot be undone. Are you sure you want to cancel this reservation?"
      confirmText="Yes, Cancel Reservation"
      confirmClass="bg-red-600 hover:bg-red-700"
      :disabled="isSaving"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject, watch } from 'vue'
import request from '../util/request'
import { showToast } from '../util/toast'
import QRCode from 'qrcode'
import ConfirmModalDelete from '../components/ConfirmDeleteModel.vue'
import ReservationCreateModal from '../components/reservation/ReservationCreateModal.vue'
import ReservationEditModal from '../components/reservation/ReservationEditModal.vue'
import ReservationViewModal from '../components/reservation/ReservationViewModal.vue'
import ReservationTable from '../components/reservation/ReservationTable.vue'
import InvoicePrinter from '../components/reservation/InvoicePrinter.vue'

// Data
const reservations = ref([])
const guests = ref([])
const rooms = ref([])

// Loading states
const isLoading = ref(true)
const isLoadingGuests = ref(true)
const isLoadingRooms = ref(true)
const isSaving = ref(false)
const cancellingId = ref(null)

// Filters
const headerSearchQuery = inject('reservationsSearchQuery', null)
let searchQuery = ref('')
if (headerSearchQuery) {
  searchQuery = headerSearchQuery
}

// Payment modal state
const isPaymentOpen = ref(false)
const paymentReservation = ref(null)
const paymentQrUrl = ref('')
const paymentMd5 = ref('')
const paymentLoading = ref(false)
const paymentError = ref('')
const paymentVerifying = ref(false)
const paymentPaid = ref(false)
let paymentPollId = null

const clearPaymentPoll = () => {
  if (paymentPollId) {
    clearInterval(paymentPollId)
    paymentPollId = null
  }
}

const closePayment = () => {
  isPaymentOpen.value = false
  paymentReservation.value = null
  paymentQrUrl.value = ''
  paymentMd5.value = ''
  paymentLoading.value = false
  paymentError.value = ''
  paymentVerifying.value = false
  paymentPaid.value = false
  clearPaymentPoll()
}

const openPayment = async (reservation) => {
  isPaymentOpen.value = true
  paymentReservation.value = reservation
  paymentQrUrl.value = ''
  paymentMd5.value = ''
  paymentError.value = ''
  paymentPaid.value = false
  clearPaymentPoll()

  paymentLoading.value = true
  try {
    const amount = Number(reservation?.raw?.total || 0) || 0
    const khqrRes = await request('/public/bakong/khqr', 'POST', { amount })
    const khqr = String(khqrRes?.khqr ?? '')
    paymentMd5.value = String(khqrRes?.md5 ?? '')
    if (!khqr) throw new Error('Missing KHQR string from server.')
    paymentQrUrl.value = await QRCode.toDataURL(khqr, { errorCorrectionLevel: 'M', margin: 1, width: 420 })
    startPaymentPolling()
  } catch (e) {
    paymentError.value = e?.response?.data?.message || e?.message || 'Failed to generate QR.'
  } finally {
    paymentLoading.value = false
  }
}

const startPaymentPolling = () => {
  clearPaymentPoll()
  if (!paymentMd5.value || !paymentReservation.value?.id) return

  paymentPollId = setInterval(async () => {
    if (!isPaymentOpen.value) {
      clearPaymentPoll()
      return
    }
    if (paymentPaid.value) {
      clearPaymentPoll()
      return
    }
    if (paymentVerifying.value) return

    await verifyNow(true)
  }, 5000)
}

const verifyNow = async (silent = false) => {
  if (!paymentReservation.value?.id || !paymentMd5.value) return

  paymentVerifying.value = true
  try {
    const verifyRes = await request('/public/bakong/verify-transaction', 'POST', { md5: paymentMd5.value })
    const paid = Boolean(verifyRes?.paid)
    if (!paid) {
      if (!silent) showToast('Not paid yet. Try again.', 'warning')
      return
    }

    await request(`/public/reservations/${paymentReservation.value.id}/confirm-payment`, 'POST', { status: 'Confirmed' })
    paymentPaid.value = true
    clearPaymentPoll()
    showToast('Payment verified. Reservation confirmed.', 'success')
    await loadReservations()
  } catch (e) {
    if (!silent) {
      showToast(e?.response?.data?.message || e?.message || 'Verify failed', 'error')
    }
  } finally {
    paymentVerifying.value = false
  }
}

const cancelPaymentReservation = async () => {
  if (!paymentReservation.value?.id) return
  try {
    await request(`/public/reservations/${paymentReservation.value.id}/cancel`, 'POST')
    showToast('Reservation cancelled.', 'success')
    await loadReservations()
    closePayment()
  } catch (e) {
    showToast(e?.response?.data?.message || e?.message || 'Failed to cancel reservation', 'error')
  }
}
const statusFilter = ref('all')
const checkInDate = ref('')
const checkOutDate = ref('')

// Modal states
const isCreateOpen = ref(false)
const isEditOpen = ref(false)
const isViewOpen = ref(false)

// Forms
const createForm = ref({
  guest_id: '',
  room_id: '',
  check_in: '',
  check_out: '',
  status: 'Pending'
})

const paymentAmount = computed(() => {
  const total = paymentReservation.value?.raw?.total
  return Number(total || 0).toFixed(2)
})

const editForm = ref({
  id: '',
  guest_id: '',
  room_id: '',
  check_in: '',
  check_out: '',
  status: 'Pending',
  total: '',
  payment_status: ''
})

const viewData = ref({
  id: '',
  guest: '',
  email: '',
  room: '',
  checkIn: '',
  checkOut: '',
  status: '',
  statusLabel: '',
  total: '',
  raw: {}
})

const confirmDeleteModal = ref(null)
const invoicePrinter = ref(null)

// Computed
const isFormValid = computed(() =>
  createForm.value.guest_id &&
  createForm.value.room_id &&
  createForm.value.check_in &&
  createForm.value.check_out
)

const isEditFormValid = computed(() =>
  editForm.value.guest_id &&
  editForm.value.room_id &&
  editForm.value.check_in &&
  editForm.value.check_out
)

const statusBadgeClasses = {
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300',
  pending: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300',
  'checked-in': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300',
  'checked-out': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
}

const filteredReservations = computed(() => {
  let filtered = [...reservations.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(r =>
      r.guest?.toLowerCase().includes(q) ||
      r.room?.toLowerCase().includes(q) ||
      String(r.id).includes(q) ||
      r.email?.toLowerCase().includes(q)
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(r => r.status === statusFilter.value)
  }

  if (checkInDate.value) {
    filtered = filtered.filter(r => r.checkIn >= checkInDate.value)
  }
  if (checkOutDate.value) {
    filtered = filtered.filter(r => r.checkOut <= checkOutDate.value)
  }

  return filtered
})

// Methods
const mapReservation = r => ({
  id: r.id,
  guest: r.guest?.name ?? 'Unknown',
  email: r.guest?.email ?? '',
  room: r.room ? `${r.room.type} #${r.room.number}` : 'N/A',
  checkIn: r.check_in,
  checkOut: r.check_out,
  status: (r.status || 'pending').toLowerCase().replace(/\s+/g, '-'),
  statusLabel: r.status || 'Unknown',
  total: Number(r.total || 0).toFixed(2),
  raw: r
})

// Data loading
const loadReservations = async () => {
  try {
    isLoading.value = true
    const data = await request('/reservations', 'GET')
    reservations.value = Array.isArray(data) ? data.map(mapReservation) : []
  } catch {
    showToast('Failed to load reservations', 'error')
  } finally {
    isLoading.value = false
  }
}

const loadGuests = async () => {
  try {
    isLoadingGuests.value = true
    const data = await request('/guests', 'GET')
    guests.value = Array.isArray(data) ? data : []
  } catch {
    showToast('Failed to load guests', 'error')
  } finally {
    isLoadingGuests.value = false
  }
}

const loadRooms = async () => {
  try {
    isLoadingRooms.value = true
    const data = await request('/rooms', 'GET')
    rooms.value = Array.isArray(data) ? data : []
  } catch {
    showToast('Failed to load rooms', 'error')
  } finally {
    isLoadingRooms.value = false
  }
}

// Form updates
const updateCreateForm = (field, value) => {
  createForm.value[field] = value
}

const updateEditForm = (field, value) => {
  editForm.value[field] = value
}

// Modal operations
const openCreate = () => {
  createForm.value = { guest_id: '', room_id: '', check_in: '', check_out: '', status: 'Pending' }
  isCreateOpen.value = true
}

const closeCreate = () => {
  isCreateOpen.value = false
}

const openEdit = (reservation) => {
  editForm.value = {
    id: reservation.id,
    guest_id: reservation.raw.guest?.id || '',
    room_id: reservation.raw.room?.id || '',
    check_in: reservation.checkIn,
    check_out: reservation.checkOut,
    status: reservation.raw.status || 'Pending',
    total: reservation.raw.total || '',
    payment_status: reservation.raw.payment_status || ''
  }
  isEditOpen.value = true
}

const closeEdit = () => {
  isEditOpen.value = false
}

const openView = (reservation) => {
  viewData.value = {
    id: reservation.id,
    guest: reservation.guest,
    email: reservation.email,
    room: reservation.room,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    status: reservation.status,
    statusLabel: reservation.statusLabel,
    total: reservation.total,
    raw: reservation.raw
  }
  isViewOpen.value = true
}

const closeView = () => {
  isViewOpen.value = false
}

const openEditFromView = () => {
  closeView()
  openEdit(viewData.value)
}

const printInvoice = (reservation = null) => {
  const r = reservation || viewData.value
  invoicePrinter.value?.print(r)
}

// CRUD operations
const submitCreate = async () => {
  if (!isFormValid.value) {
    showToast('Please complete all required fields', 'warning')
    return
  }

  isSaving.value = true
  try {
    // Create the reservation
    await request('/reservations', 'POST', {
      guest_id: Number(createForm.value.guest_id),
      room_id: Number(createForm.value.room_id),
      check_in: createForm.value.check_in,
      check_out: createForm.value.check_out,
      status: createForm.value.status
    })
    
    // Update room status to occupied (booked)
    try {
      const formData = new FormData()
      formData.append('status', 'occupied')
      formData.append('_method', 'PUT')
      
      // Get current room data first to preserve other fields
      const room = rooms.value.find(r => r.id === Number(createForm.value.room_id))
      if (room) {
        formData.append('number', room.number)
        formData.append('type', room.type)
        formData.append('floor', room.floor)
        formData.append('capacity', room.capacity)
        formData.append('price', room.price)
      }
      
      await request(`/rooms/${createForm.value.room_id}`, 'POST', formData)
    } catch (roomErr) {
      console.warn('Failed to update room status:', roomErr)
      // Don't fail the entire operation if room status update fails
    }
    
    showToast('Reservation created successfully', 'success')
    closeCreate()
    await Promise.all([
      loadReservations(),
      loadRooms() // Reload rooms to reflect status change
    ])
  } catch (err) {
    showToast(err?.response?.data?.message || 'Failed to create reservation', 'error')
  } finally {
    isSaving.value = false
  }
}

const submitEdit = async () => {
  if (!isEditFormValid.value) {
    showToast('Please complete all required fields', 'warning')
    return
  }

  isSaving.value = true
  try {
    await request(`/reservations/${editForm.value.id}`, 'PUT', {
      guest_id: Number(editForm.value.guest_id),
      room_id: Number(editForm.value.room_id),
      check_in: editForm.value.check_in,
      check_out: editForm.value.check_out,
      status: editForm.value.status,
      payment_status: editForm.value.payment_status
    })
    showToast('Reservation updated successfully', 'success')
    closeEdit()
    await Promise.all([
      loadReservations(),
      loadRooms()
    ])
  } catch (err) {
    showToast(err?.response?.data?.message || 'Failed to update reservation', 'error')
  } finally {
    isSaving.value = false
  }
}

const cancelReservation = async (reservation) => {
  if (reservation.status === 'cancelled') return

  const confirmed = await confirmDeleteModal.value?.open()
  if (!confirmed) return

  isSaving.value = true
  cancellingId.value = reservation.id
  try {
    await request(`/reservations/${reservation.id}`, 'DELETE')
    showToast('Reservation cancelled successfully', 'success')
    await Promise.all([
      loadReservations(),
      loadRooms()
    ])
  } catch (err) {
    showToast(err?.response?.data?.message || 'Failed to cancel reservation', 'error')
  } finally {
    isSaving.value = false
    cancellingId.value = null
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      loadGuests(),
      loadRooms(),
      loadReservations()
    ])
  } catch {
    showToast('Failed to load initial data', 'error')
  }
})

watch(
  () => searchQuery.value,
  async (val, oldVal) => {
    const prevHadSearch = typeof oldVal === 'string' && oldVal.trim().length > 0
    const nowHasSearch = typeof val === 'string' && val.trim().length > 0
    if (prevHadSearch && !nowHasSearch) {
      await loadReservations()
    }
  }
)

onBeforeUnmount(() => {
  clearPaymentPoll()
})
</script>
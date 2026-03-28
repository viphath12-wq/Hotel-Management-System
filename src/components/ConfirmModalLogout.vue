<template>
  <!-- Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    @click.self="close"
  >
    <!-- Modal Card -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Icon -->
      <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
        <span class="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">
          warning
        </span>
      </div>

      <!-- Title & Message -->
      <h3 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
        {{ title }}
      </h3>
      <p class="text-center text-gray-600 dark:text-gray-400 mb-8">
        {{ message }}
      </p>

      <!-- Buttons -->
      <div class="flex gap-4 justify-center">
        <button
          @click="close"
          class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          Cancel
        </button>
        <button
          @click="confirm"
          :disabled="loading"
          class="px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-70 flex items-center gap-2 transition shadow-lg"
        >
          <span v-if="loading" class="material-symbols-outlined animate-spin text-xl">
            refresh
          </span>
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Are you sure you want to proceed?' },
  confirmText: { type: String, default: 'Confirm' },
})

// Emits
const emit = defineEmits(['confirm', 'cancel'])

// State
const isOpen = ref(false)
const loading = ref(false)
let resolvePromise = null

// Open modal and return a Promise
const open = () => {
  isOpen.value = true
  loading.value = false
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

// Close modal
const close = () => {
  isOpen.value = false
  resolvePromise?.(false)
  emit('cancel')
}

// Confirm action
const confirm = () => {
  loading.value = true
  resolvePromise?.(true)
  emit('confirm')
  // Note: We don't close here automatically — let the caller decide when to close
}

// Public methods
defineExpose({ open, close })
</script>
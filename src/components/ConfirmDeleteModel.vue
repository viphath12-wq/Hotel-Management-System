<!-- src/components/ConfirmModalDelete.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    @click.self="cancel"
  >
    <div
      class="bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {{ title }}
        </h3>
      </div>

      <!-- Body -->
      <div class="p-6">
        <p class="text-gray-600 dark:text-gray-300">
          {{ message }}
        </p>
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="cancel"
          type="button"
          class="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        
        <button
          @click="confirm"
          type="button"
          class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
          :disabled="loading"
        >
          <span v-if="loading" class="animate-spin material-symbols-outlined text-base">refresh</span>
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue'

const isOpen = ref(false)
const resolvePromise = ref(null)
const loading = ref(false)

const props = defineProps({
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  }
})

const open = () => {
  return new Promise((resolve) => {
    resolvePromise.value = resolve
    isOpen.value = true
    loading.value = false
  })
}

const confirm = async () => {
  loading.value = true
  if (resolvePromise.value) {
    resolvePromise.value(true)
  }
  // Give a tiny delay for visual feedback
  await new Promise(r => setTimeout(r, 300))
  isOpen.value = false
  resolvePromise.value = null
}

const cancel = () => {
  if (resolvePromise.value) {
    resolvePromise.value(false)
  }
  isOpen.value = false
  resolvePromise.value = null
  loading.value = false
}

// Expose the open method to parent components
defineExpose({
  open
})
</script>
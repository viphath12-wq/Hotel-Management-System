<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      @click.self="$emit('close')"
    >
      <div class="flex items-center justify-center min-h-screen p-4">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/50" />

        <!-- Modal Container -->
        <div class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ title }}
            </h3>
            <button
              @click="$emit('close')"
              class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6">
            <slot />
          </div>

          <!-- Footer (如果有的话) -->
          <div v-if="$slots.footer" class="p-6 border-t dark:border-gray-700">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  }
})

defineEmits(['close'])
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 10;
}
</style>
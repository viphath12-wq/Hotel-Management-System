<!-- src/components/Async.vue -->
<template>
  <div>
    <!-- Loading -->
    <div v-if="isLoading">
      <slot name="loading">
        <Spinner />
      </slot>
    </div>

    <!-- Error -->
    <div v-else-if="hasError" class="py-8 text-center">
      <div class="text-red-600 dark:text-red-400 mb-2 text-lg font-medium">
        Something went wrong
      </div>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        {{ errorMessage || "Failed to load data. Please try again." }}
      </p>
      <button
        @click="retry"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Try Again
      </button>
    </div>

    <!-- Content -->
    <slot v-else :data="resolvedData"></slot>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Spinner from './Spinner.vue'

const props = defineProps({
  promise: {
    type: Promise,
    required: true
  }
})

const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
const resolvedData = ref(null)

const load = async () => {
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    resolvedData.value = await props.promise
  } catch (err) {
    hasError.value = true
    errorMessage.value = err?.message || 'Unknown error occurred'
  } finally {
    isLoading.value = false
  }
}

const retry = () => load()

load()

watch(() => props.promise, () => {
  load()
}, { immediate: false })
</script>
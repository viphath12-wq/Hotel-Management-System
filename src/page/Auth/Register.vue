<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="w-full max-w-md">
      <div class="rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Register</h2>

        <!-- Error message -->
        <div v-if="errorMessage" class="mb-6 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg text-center text-sm">
          {{ errorMessage }}
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="mb-6 p-3 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-lg text-center text-sm">
          {{ successMessage }}
        </div>

        <form @submit.prevent="onRegister" class="space-y-6">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">person</span>
              <input
                v-model="name"
                type="text"
                required
                class="w-full pl-11 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                placeholder="Your Name"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">mail</span>
              <input
                v-model="email"
                type="email"
                required
                autocomplete="email"
                class="w-full pl-11 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">lock</span>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                autocomplete="new-password"
                class="w-full pl-11 pr-12 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">lock</span>
              <input
                v-model="password_confirmation"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                class="w-full pl-11 pr-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <!-- Profile Image -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Profile Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              @change="onFileChange"
              class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            <div v-if="imagePreview" class="mt-4">
              <img :src="imagePreview" alt="Preview" class="h-32 w-32 object-cover rounded-lg mx-auto shadow" />
            </div>
          </div>

          <!-- Phone & Address -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone (Optional)</label>
              <input
                v-model="phone"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none text-gray-900 dark:text-white"
                placeholder="+855 12 345 678"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address (Optional)</label>
              <input
                v-model="address"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none text-gray-900 dark:text-white"
                placeholder="Phnom Penh, Cambodia"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500/40 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ loading ? 'Creating account...' : 'Sign up' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
          Already have an account?
          <router-link to="/login" class="text-green-600 hover:text-green-500 font-medium">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '../../util/request'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const phone = ref('')
const address = ref('')
const image = ref(null)
const imagePreview = ref('')

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    image.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const onRegister = async () => {
  if (password.value !== password_confirmation.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('name', name.value.trim())
    formData.append('email', email.value.trim())
    formData.append('password', password.value)
    formData.append('password_confirmation', password_confirmation.value)
    if (phone.value) formData.append('phone', phone.value)
    if (address.value) formData.append('address', address.value)
    if (image.value) formData.append('image', image.value)

    const response = await request('/register', 'POST', formData)

    successMessage.value = response?.message || 'Registration successful!'
    setTimeout(() => router.push('/login'), 2000)
  } catch (err) {
    const errors = err?.response?.data?.errors
    if (errors) {
      errorMessage.value = Object.values(errors).flat().join(' ')
    } else {
      errorMessage.value = err?.response?.data?.message || 'Registration failed. Please try again.'
    }
    console.error('Register error:', err)
  } finally {
    loading.value = false
  }
}
</script>
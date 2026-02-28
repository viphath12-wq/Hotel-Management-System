<template>
  <div class="max-w-6xl mx-auto md:px-4 py-4">
    <div class="">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-32">
        <div class="flex flex-col items-center gap-4">
          <div class="h-16 w-16 animate-spin rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl"></div>
          <p class="text-lg text-gray-600 dark:text-gray-400 font-medium">Loading profile...</p>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="max-w-md mx-auto text-center py-20">
        <div class="w-24 h-24 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl text-red-600 dark:text-red-400">error</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ error }}</h3>
        <button @click="fetchProfile" class="px-8 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 focus:ring-4 focus:ring-red-500/20 transition-all shadow-lg">
          Try Again
        </button>
      </div>

      <!-- Profile Card -->
      <div v-else-if="profile" class="group">
        <div class="overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 max-w-5xl mx-auto">
          <!-- Gradient Header -->
          <div class="h-36 bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <!-- Content -->
          <div class="relative px-5 md:px-8 pb-10 -mt-16">
            <!-- Avatar Section -->
            <div class="flex justify-center lg:justify-start">
              <div class="relative group/avatar">
                <div class="relative h-32 w-32 md:h-36 md:w-36 rounded-3xl ring-8 ring-white dark:ring-gray-800 shadow-2xl transition-all duration-500 hover:scale-105 border-4 border-white/50 overflow-hidden">
                  <img
                    v-if="profileImageUrl"
                    :src="profileImageUrl"
                    alt="Profile avatar"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  />
                  <div v-else class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl">
                    <span class="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500">account_circle</span>
                  </div>

                  <!-- Hover Overlay -->
                  <div class="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                    <button
                      @click.stop="triggerAvatarUpload"
                      class="flex items-center justify-center w-14 h-14 bg-white/90 rounded-2xl shadow-2xl hover:bg-white hover:scale-110 transition-all"
                      title="Change photo"
                    >
                      <span class="material-symbols-outlined text-xl text-green-600">photo_camera</span>
                    </button>
                    <button
                      v-if="profile.profile?.image"
                      @click.stop="removeAvatar"
                      :disabled="uploadingAvatar"
                      class="flex items-center justify-center w-14 h-14 bg-red-500/90 text-white rounded-2xl shadow-2xl hover:bg-red-600 hover:scale-110 transition-all"
                      title="Remove photo"
                    >
                      <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                    <div v-if="uploadingAvatar" class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-3xl">
                      <span class="material-symbols-outlined animate-spin text-3xl text-white">refresh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Info -->
            <div class="mt-10 text-center lg:text-left lg:ml-4 lg:mt-0">
              <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                  <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {{ profile.name || 'User' }}
                  </h2>
                  <p class="text-base md:text-lg text-gray-600 dark:text-gray-400 mt-2 flex items-center justify-center lg:justify-start gap-2">
                    <span class="material-symbols-outlined text-green-500 text-lg">mail</span>
                    {{ profile.email }}
                  </p>
                </div>

                <div class="flex items-center justify-center lg:justify-end">
                  <div class="inline-flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800/50 rounded-2xl text-green-800 dark:text-green-200 font-medium text-sm shadow-lg">
                    <span class="material-symbols-outlined text-lg">verified_user</span>
                    Active Account
                  </div>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div class="text-center lg:text-left p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-all">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ formatDate(profile.created_at) }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Member Since</div>
                </div>
                <div class="text-center lg:text-left p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-all">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ profile.profile?.phone || 'Not set' }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Phone</div>
                </div>
                <div class="text-center lg:text-left p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-all">
                  <div class="text-2xl font-bold text-purple-600 dark:text-purple-400 truncate max-w-xs">{{ profile.profile?.address || 'Not set' }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Address</div>
                </div>
                <div class="text-center lg:text-left p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-600/30 transition-all">
                  <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 capitalize">{{ profile.profile?.type || 'User' }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Type</div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start mt-8">
              <button
                @click="openEditModal"
                class="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 focus:ring-4 focus:ring-green-500/30 shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                <span class="material-symbols-outlined">edit</span>
                Edit Profile
              </button>

              <button
                @click="openPasswordModal"
                class="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:ring-4 focus:ring-gray-500/20 shadow-md transition-all duration-300 whitespace-nowrap"
              >
                <span class="material-symbols-outlined">lock</span>
                Change Password
              </button>

              <button
                @click="onLogout"
                class="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 focus:ring-4 focus:ring-red-500/30 shadow-lg transition-all duration-300 whitespace-nowrap"
              >
                <span class="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input ref="avatarInput" type="file" accept="image/*" @change="handleAvatarUpload" class="hidden" />
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="closeEditModal">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>
        <form @submit.prevent="saveProfile" class="space-y-5">

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input v-model="editForm.name" type="text" required class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input v-model="editForm.phone" type="tel" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <input v-model="editForm.address" type="text" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closeEditModal" class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              Cancel
            </button>
            <button type="submit" :disabled="saving" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition">
              <span v-if="saving" class="material-symbols-outlined animate-spin text-xl">refresh</span>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="closePasswordModal">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
        <form @submit.prevent="changePassword" class="space-y-5">

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input v-model="passwordForm.current" type="password" required class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input v-model="passwordForm.new" type="password" required minlength="6" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input v-model="passwordForm.confirm" type="password" required minlength="6" class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-500 outline-none" />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="closePasswordModal" class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              Cancel
            </button>
            <button type="submit" :disabled="savingPassword" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition">
              <span v-if="savingPassword" class="material-symbols-outlined animate-spin text-xl">refresh</span>
              {{ savingPassword ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      ref="confirmModal"
      title="Logout"
      message="Are you sure you want to log out of your account?"
      confirm-text="Logout"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/util/request'
import { useProfileStore } from '@/util/profile'
import { formatDate, formatTime } from '@/util/helpers'
import configurl from '@/util/configurl'
import { showToast } from '../../util/toast'
import ConfirmModal from '../../components/ConfirmModalLogout.vue'
import { resolveImageUrl } from '@/util/image'

const profileStore = useProfileStore()

const loading = ref(true)
const error = ref('')
const avatarInput = ref(null)
const uploadingAvatar = ref(false)
const saving = ref(false)
const savingPassword = ref(false)

const showEditModal = ref(false)
const showPasswordModal = ref(false)
const confirmModal = ref(null)

const profile = computed(() => profileStore.profile)

// Image URL
const profileImageUrl = computed(() => {
  return resolveImageUrl(profile.value?.profile?.image)
})

const editForm = ref({
  name: '',
  phone: '',
  address: ''
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const fetchProfile = async () => {
  try {
    loading.value = true
    error.value = ''
    if (!profileStore.profile) {
      const response = await request('/user', 'GET')
      profileStore.setProfile(response.data || response)
      showToast('Profile loaded successfully', 'success')
    }
  } catch (err) {
    error.value = 'Failed to load profile. Please login again.'
    profileStore.logout()
  } finally {
    loading.value = false
  }
}

const triggerAvatarUpload = () => avatarInput.value?.click()

const handleAvatarUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('Image must be less than 2MB')
    return
  }

  uploadingAvatar.value = true

  try {
    await profileStore.uploadProfileImage(file)
    showToast('Profile picture updated successfully', 'success')
  } catch (err) {
    alert('Failed to upload image.')
  } finally {
    uploadingAvatar.value = false

    if (avatarInput.value) avatarInput.value.value = ''
  }
}

const removeAvatar = async () => {
  if (!confirm('Remove profile picture?')) return
  uploadingAvatar.value = true
  try {
    await profileStore.removeProfileImage()
    showToast('Profile picture removed.','success')
  } catch (err) {
    alert('Failed to remove image.')
  } finally {
    uploadingAvatar.value = false
  }
}

const openEditModal = () => {
  editForm.value = {
    name: profile.value.name || '',
    phone: profile.value.profile?.phone || '',
    address: profile.value.profile?.address || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveProfile = async () => {
  saving.value = true
  try {
    const response = await request('/profile', 'PUT', editForm.value)
    profileStore.setProfile(response.user || response.data || response)
    showToast('Profile updated successfully', 'success')
    closeEditModal()
  } catch (err) {
    alert('Failed to update profile.')
  } finally {
    saving.value = false
  }
}

const openPasswordModal = () => {
  passwordForm.value = { current: '', new: '', confirm: '' }
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
}

const changePassword = async () => {
  savingPassword.value = true
  try {
    await request('/profile/password', 'PUT', {
      current_password: passwordForm.value.current,
      password: passwordForm.value.new,
      password_confirmation: passwordForm.value.confirm
    })
    showToast('Password changed successfully', 'success')
    closePasswordModal()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to change password.')
  } finally {
    savingPassword.value = false
  }
}

const onLogout = async () => {
  const confirmed = await confirmModal.value?.open()

  if (confirmed) {
    profileStore.logout()
    window.location.href = '/login'
  }
}
onMounted(() => {
  fetchProfile()
})
</script>
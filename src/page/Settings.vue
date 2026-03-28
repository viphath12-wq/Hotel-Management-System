<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your hotel preferences and account settings</p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            activeTab === tab.id
              ? 'border-[green] text-[green] dark:text-[green]-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="rounded-xl bg-white dark:bg-[#1e293b] shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <!-- General Settings -->
      <div v-if="activeTab === 'general'">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">General Settings</h2>
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
            <select class="mt-1 w-full max-w-md px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none">
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
            <select class="mt-1 w-full max-w-md px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none">
              <option>UTC-05:00 Eastern Time</option>
              <option>UTC+00:00 Greenwich Mean Time</option>
              <option>UTC+01:00 Central European Time</option>
            </select>
          </div>
          <div class="flex items-center gap-3">
            <input type="checkbox" id="darkMode" class="size-5 rounded text-[green] focus:ring-[green]" />
            <label for="darkMode" class="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Dark Mode by Default</label>
          </div>
          <div class="pt-4">
            <button class="px-6 py-2.5 bg-[green] text-white rounded-lg hover:bg-[green]/90 transition-colors">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- Hotel Information -->
      <div v-if="activeTab === 'hotel'">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Hotel Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hotel Name</label>
            <input type="text" value="Grand Horizon Hotel" class="mt-1 w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</label>
            <input type="email" value="info@grandhorizon.com" class="mt-1 w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
            <input type="tel" value="+1 (555) 123-4567" class="mt-1 w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
            <input type="text" value="123 Ocean Drive, Miami, FL 33139" class="mt-1 w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
            <select class="mt-1 w-full max-w-md px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none">
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
              <option>GBP - British Pound</option>
            </select>
          </div>
        </div>
        <div class="pt-6">
          <button class="px-6 py-2.5 bg-[green] text-white rounded-lg hover:bg-[green]/90 transition-colors">Update Hotel Info</button>
        </div>
      </div>

      <!-- Notifications -->
      <div v-if="activeTab === 'notifications'">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Notification Preferences</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">New Reservation Alerts</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Email notification for new bookings</p>
            </div>
            <button class="relative inline-flex items-center h-6 rounded-full w-11 bg-[green] transition-colors">
              <span class="translate-x-6 size-4 bg-white rounded-full transition-transform"></span>
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">Check-in/Check-out Reminders</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Daily summary of arrivals and departures</p>
            </div>
            <button class="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-300 dark:bg-gray-600 transition-colors">
              <span class="translate-x-1 size-4 bg-white rounded-full transition-transform"></span>
            </button>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-gray-100">Low Occupancy Alerts</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Notify when occupancy drops below 50%</p>
            </div>
            <button class="relative inline-flex items-center h-6 rounded-full w-11 bg-[green] transition-colors">
              <span class="translate-x-6 size-4 bg-white rounded-full transition-transform"></span>
            </button>
          </div>
        </div>
        <div class="pt-6">
          <button class="px-6 py-2.5 bg-[green] text-white rounded-lg hover:bg-[green]/90 transition-colors">Save Preferences</button>
        </div>
      </div>

      <!-- Security -->
      <div v-if="activeTab === 'security'">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Security & Account</h2>
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
            <input type="password" class="mt-1 w-full max-w-md px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
            <input type="password" class="mt-1 w-full max-w-md px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
            <input type="password" class="mt-1 w-full max-w-md px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-[#2d3b4e] border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none" />
          </div>
          <div class="flex items-center gap-3">
            <input type="checkbox" id="2fa" class="size-5 rounded text-[green] focus:ring-[green]" />
            <label for="2fa" class="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Two-Factor Authentication</label>
          </div>
          <div>
            <button class="px-6 py-2.5 bg-[green] text-white rounded-lg hover:bg-[green]/90 transition-colors">Update Password</button>
          </div>
        </div>
      </div>

      <!-- Integrations (Placeholder) -->
      <div v-if="activeTab === 'integrations'">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Integrations</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Connect third-party services like payment gateways, channel managers, or booking engines.</p>
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
            <span class="material-symbols-outlined text-4xl text-gray-400">link</span>
            <p class="mt-2 font-medium">Stripe Payments</p>
            <button class="mt-4 text-sm text-[green]">Connect</button>
          </div>
          <div class="p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
            <span class="material-symbols-outlined text-4xl text-gray-400">link</span>
            <p class="mt-2 font-medium">Booking.com</p>
            <button class="mt-4 text-sm text-[green]">Connect</button>
          </div>
          <!-- Add more integration cards -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tabs = [
  { id: 'general', name: 'General' },
  { id: 'hotel', name: 'Hotel Info' },
  { id: 'notifications', name: 'Notifications' },
  { id: 'security', name: 'Security' },
  { id: 'integrations', name: 'Integrations' },
]

const activeTab = ref('general')
</script>
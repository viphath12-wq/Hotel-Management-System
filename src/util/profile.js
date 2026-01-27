// src/util/profile.js
import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null, 
    token: null,
    roles: null,
    permissions: []
  }),

  actions: {
    setProfile(profileData) {
      this.profile = profileData
    },
    setToken(token) {
      this.token = token
    },
    setRoles(rolesName) {
      this.roles = rolesName
    },
    setPermissions(permissionsArray) {
      this.permissions = permissionsArray
    },
    hasPermission(permissionName) {
      return this.permissions.some(perm => perm.name === permissionName)
    },
    hasAnyPermission(permissionNames) {
      return permissionNames.some(permName => 
        this.permissions.some(perm => perm.name === permName)
      )
    },
    getMenuPermissions() {
      return this.permissions.filter(perm => perm.is_menu_web === 1)
    },
    logout() {
      this.profile = null
      this.token = null
      this.permissions = []
    }
  },

  persist: {
    storage: localStorage,
    paths: ['token', 'profile', 'roles', 'permissions']
  }
})
import { defineStore } from 'pinia'
import axios from 'axios'
import configurl from './configurl'

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
    async uploadProfileImage(file) {
      if (!this.token) {
        throw new Error('Not authenticated')
      }
      const formData = new FormData()
      formData.append('image', file)

      const res = await axios({
        url: configurl.baseurl + '/profile/image',
        method: 'POST',
        data: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${this.token}`,
        },
      })

      const payload = res.data
      this.setProfile(payload.user || payload.data || payload)
      return payload
    },
    async removeProfileImage() {
      if (!this.token) {
        throw new Error('Not authenticated')
      }

      const res = await axios({
        url: configurl.baseurl + '/profile/image',
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      })

      const payload = res.data
      this.setProfile(payload.user || payload.data || payload)
      return payload
    },
    logout() {
      this.profile = null
      this.token = null
      this.permissions = []
    }
  },

  persist: {
    storage: sessionStorage,
    paths: ['token', 'profile', 'roles', 'permissions']
  }
})
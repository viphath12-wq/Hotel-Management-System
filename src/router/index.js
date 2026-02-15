import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../page/Layout/Layout.vue'
import Dashboard from '../page/Dashboard.vue'
import PageReservations from '../page/Reservations.vue'
import PageGuests from '../page/Guests.vue'
import PageHistorys from '../page/History.vue'
import PageRooms from '../page/Room.vue'
import PageReports from '../page/Reports.vue'
import PageSettings from '../page/Settings.vue'
import NotFound from '../page/Error/NotFound.vue'
import Login from '../page/Auth/Login.vue'
import Register from '../page/Auth/Register.vue'
import User from '../page/Auth/User.vue'
import Role from '../page/Auth/Role.vue'
import Users_Roles from '../page/Auth/Users_Roles.vue'
import Permission from '../page/Auth/Permission.vue'
import Profile from '../page/Auth/Profile.vue'
import Permission_Roles from '../page/Auth/Permission_Roles.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/',
        redirect: () => {
          try {
            const profile = JSON.parse(sessionStorage.getItem('profile') || 'null')
            const roles = JSON.parse(sessionStorage.getItem('roles') || 'null')
            const role = profile?.role || ''
            const hasRole = Array.isArray(roles) ? roles.length > 0 : Boolean(roles || role)
            return hasRole ? '/dashboard' : '/profile'
          } catch (e) {
            return '/profile'
          }
        }
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true, permission: 'Dashboard.View' }
      },
      {
        path: 'reservations',
        name: 'Reservations',
        component: PageReservations,
        meta: { requiresAuth: true, permission: 'Reservations.View' }
      },
      {
        path: 'rooms',
        name: 'Rooms',
        component: PageRooms,
        meta: { requiresAuth: true, permission: 'Rooms.View' }
      },
      {
        path: 'guests',
        name: 'Guests',
        component: PageGuests,
        meta: { requiresAuth: true, permission: 'Guests.View' }
      },
      {
        path: 'historys',
        name: 'Historys',
        component: PageHistorys,
        meta: { requiresAuth: true, permission: 'Historys.View' }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: PageReports,
        meta: { requiresAuth: true, permission: 'Reports.View' }
      },
      {
        path: 'user',
        name: 'User',
        component: User,
        meta: { requiresAuth: true, permission: 'User.View' }
      },
      {
        path: 'role',
        name: 'Role',
        component: Role,
        meta: { requiresAuth: true, permission: 'Role.View' }
      },
      {
        path: 'users_roles',
        name: 'Users_Roles',
        component: Users_Roles,
        meta: { requiresAuth: true, permission: 'Users_Roles.View' }
      },
      {
        path: 'permission_roles',
        name: 'Permission_Roles',
        component: Permission_Roles,
        meta: { requiresAuth: true, permission: 'Permission_Roles.View' }
      },
      {
        path: 'permission',
        name: 'role',
        component: Permission,
        meta: { requiresAuth: true, permission: 'Permission.View' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: PageSettings,
        meta: { requiresAuth: true, permission: 'Settings.View' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        meta: { requiresAuth: false }
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

import permissionGuard from './guards/permission'
router.beforeEach(permissionGuard)

export default router
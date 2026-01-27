// Store setup for use in guards
let profileStore = null

const beforeEach = async (to, from, next) => {
  // Initialize store only once
  if (!profileStore) {
    const { useProfileStore } = await import('@/util/profile')
    profileStore = useProfileStore()
  }
  
  // Public routes check
  const publicRoutes = ['/login', '/register']
  const roles = profileStore.roles
  const userRole = profileStore.profile?.role || ''
  const hasRole = Array.isArray(roles) ? roles.length > 0 : Boolean(roles || userRole)
  const isSuperAdmin = userRole === 'super-admin' || (Array.isArray(roles) && roles.includes('super-admin'))
  
  // Redirect to dashboard if already logged in and trying to access login/register
  if (publicRoutes.includes(to.path) && profileStore.token) {
    return next({ path: hasRole ? '/dashboard' : '/profile' })
  }
  
  // Redirect to login if not authenticated and trying to access protected route
  if (!profileStore.token && to.meta.requiresAuth !== false) {
    return next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
  }

  // If authenticated but no role, force user to complete profile first
  if (profileStore.token && !hasRole && to.path !== '/profile') {
    return next({ path: '/profile' })
  }
  
  // Skip permission check for public routes and 404
  if (publicRoutes.includes(to.path) || to.name === 'NotFound') {
    return next()
  }
  
  // Super admin bypass
  if (isSuperAdmin) {
    return next()
  }
  
  // Check permission from meta
  const requiredPermission = to.meta.permission
  
  if (requiredPermission) {
    const permissions = profileStore.permissions || []
    const hasPermission = permissions.includes(requiredPermission)
    
    if (!hasPermission) {
      console.warn(`Permission denied: ${requiredPermission} required for route ${to.fullPath}`)
      
      // Show error message using query params
      return next({ 
        path: '/dashboard',
        query: { 
          error: 'Not Required Permission',
          from: from.path,
          required: requiredPermission
        }
      })
    }
  }
  
  next()
}
export default beforeEach;

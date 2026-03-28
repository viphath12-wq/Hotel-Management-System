let profileStore = null

const beforeEach = async (to, from, next) => {
  if (!profileStore) {
    const { useProfileStore } = await import('@/util/profile')
    profileStore = useProfileStore()
  }
  
  const publicRoutes = ['/login', '/register']
  const roles = profileStore.roles
  const userRole = profileStore.profile?.role || ''
  const hasRole = Array.isArray(roles) ? roles.length > 0 : Boolean(roles || userRole)
  const isSuperAdmin = userRole === 'super-admin' || (Array.isArray(roles) && roles.includes('super-admin'))

  if (publicRoutes.includes(to.path) && profileStore.token) {
    return next({ path: hasRole ? '/dashboard' : '/profile' })
  }
  
  if (!profileStore.token && to.meta.requiresAuth !== false) {
    return next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
  }

  if (profileStore.token && !hasRole && to.path !== '/profile') {
    return next({ path: '/profile' })
  }
  
  if (publicRoutes.includes(to.path) || to.name === 'NotFound') {
    return next()
  }
  
  if (isSuperAdmin) {
    return next()
  }
  
  const requiredPermission = to.meta.permission
  
  if (requiredPermission) {
    const permissions = profileStore.permissions || []
    const hasPermission = permissions.includes(requiredPermission)
    
    if (!hasPermission) {
      console.warn(`Permission denied: ${requiredPermission} required for route ${to.fullPath}`)
      
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

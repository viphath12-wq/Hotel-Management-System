// /util/toast.js
import { createApp, h } from 'vue'

const ToastComponent = {
  props: {
    message: String,
    type: {
      type: String,
      default: 'info'
    }
  },
  setup(props) {
    const typeClasses = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }

    return () => h('div', {
      class: `fixed bottom-4 right-4 ${typeClasses[props.type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in`
    }, props.message)
  }
}

const toast = {
  install(app) {
    app.config.globalProperties.$toast = {
      show(message, type = 'info') {
        const toastApp = createApp(ToastComponent, { message, type })
        const div = document.createElement('div')
        document.body.appendChild(div)
        
        const instance = toastApp.mount(div)

        setTimeout(() => {
          toastApp.unmount()
          document.body.removeChild(div)
        }, 3000)
      },
      
      success(message) {
        this.show(message, 'success')
      },
      
      error(message) {
        this.show(message, 'error')
      },
      
      warning(message) {
        this.show(message, 'warning')
      },
      
      info(message) {
        this.show(message, 'info')
      }
    }
  }
}

export const showToast = (message, type = 'info') => {
  const toastApp = createApp(ToastComponent, { message, type })
  const div = document.createElement('div')
  document.body.appendChild(div)
  
  const instance = toastApp.mount(div)
  
  setTimeout(() => {
    toastApp.unmount()
    document.body.removeChild(div)
  }, 3000)
}

export default toast
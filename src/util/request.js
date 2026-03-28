import axios from 'axios'
import config from './configurl'
import { useProfileStore } from '../util/profile'

const request = (url = '', method = 'GET', data = null) => {
  const profileStore = useProfileStore()
  const token = profileStore.token
  let headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (data instanceof FormData) {
    headers = {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    }
  }
  return axios({
    url: config.baseurl + url,
    method,
    data: method !== 'GET' ? data : undefined,
    params: method === 'GET' ? data : undefined,
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
    .then(res => res.data)
    .catch(error => {
      if (error.response?.status === 401) {
        profileStore.logout()
      }
      throw error
    })
}

export default request
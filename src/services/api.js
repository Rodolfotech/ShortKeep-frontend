import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

export const channels = {
  list: () => api.get('/channels'),
  add: (data) => api.post('/channels', data),
  get: (id) => api.get(`/channels/${id}`),
  remove: (id) => api.delete(`/channels/${id}`),
  sync: (id) => api.post(`/channels/${id}/sync`),
  latestShorts: () => api.get('/channels/latest/shorts'),
}

export default api

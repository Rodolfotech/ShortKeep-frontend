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

function unwrap(res) {
  return res.data?.data !== undefined ? res.data.data : res.data
}

function mapChannel(c) {
  return {
    id: c.id_canal || c.id,
    name: c.nombre_canal || c.name || c.title,
    title: c.nombre_canal || c.name || c.title,
    thumbnail: c.url_miniatura || c.thumbnail,
    youtubeChannelId: c.youtube_channel_id,
    description: c.descripcion || c.description,
  }
}

function mapShort(s) {
  return {
    id: s.id_short || s.id,
    title: s.titulo || s.title,
    videoUrl: `https://www.youtube.com/shorts/${s.youtube_video_id}`,
    url: `https://www.youtube.com/shorts/${s.youtube_video_id}`,
    youtubeVideoId: s.youtube_video_id,
    thumbnail: s.url_miniatura || s.thumbnail,
    publishedAt: s.fecha_publicacion_yt || s.publishedAt,
    description: s.descripcion || s.description,
    channelName: s.nombre_canal || s.channelName,
    channelId: s.id_canal || s.channelId,
  }
}

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

export const channels = {
  list: async () => {
    const res = await api.get('/channels')
    const data = unwrap(res)
    return { data: Array.isArray(data) ? data.map(mapChannel) : [] }
  },
  add: async (data) => {
    const res = await api.post('/channels', data)
    const d = unwrap(res)
    return { data: mapChannel(d.channel || d) }
  },
  get: async (id) => {
    const res = await api.get(`/channels/${id}`)
    const d = unwrap(res)
    return { data: { channel: mapChannel(d.channel || d), shorts: (d.shorts || []).map(mapShort) } }
  },
  remove: (id) => api.delete(`/channels/${id}`),
  sync: async (id) => {
    const res = await api.post(`/channels/${id}/sync`)
    const d = unwrap(res)
    return { data: { ...d, shorts: (d.shorts || []).map(mapShort) } }
  },
  latestShorts: async () => {
    const res = await api.get('/channels/latest/shorts')
    const d = unwrap(res)
    if (!Array.isArray(d)) return { data: [] }
    const shorts = d.flatMap((entry) => {
      const ch = entry.channel || {}
      return (entry.videos || []).map((v) => ({
        id: v.youtubeVideoId,
        title: v.title,
        videoUrl: `https://www.youtube.com/shorts/${v.youtubeVideoId}`,
        youtubeVideoId: v.youtubeVideoId,
        thumbnail: v.thumbnail,
        publishedAt: v.publishedAt,
        channelName: ch.nombre,
        channelId: ch.id,
      }))
    })
    return { data: shorts }
  },
}

export default api

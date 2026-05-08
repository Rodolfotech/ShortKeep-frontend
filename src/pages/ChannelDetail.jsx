import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { channels as channelsApi } from '../services/api'
import ShortPlayer from '../components/ShortPlayer'

const STORAGE_KEY = 'saved_shorts'

export default function ChannelDetail() {
  const { id } = useParams()
  const [channel, setChannel] = useState(null)
  const [shorts, setShorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    loadChannel()
  }, [id])

  const loadChannel = async () => {
    try {
      setLoading(true)
      const { data } = await channelsApi.get(id)
      setChannel(data.channel || data)
      const items = data.shorts || data.videos || []
      setShorts(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const syncShorts = async () => {
    try {
      await channelsApi.sync(id)
      loadChannel()
    } catch (err) {
      console.error(err)
    }
  }

  const saveShort = (short) => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!saved.find((s) => s.id === short.id)) {
      saved.push(short)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    }
  }

  const removeShort = (id) => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const filtered = saved.filter((s) => s.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }

  const isSaved = (id) => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return saved.some((s) => s.id === id)
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="spinner" />
          <p>Cargando canal...</p>
        </div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="page">
        <div className="empty-state">
          <span className="empty-icon">❌</span>
          <h2>Canal no encontrado</h2>
          <Link to="/channels" className="btn-primary">Volver a canales</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/channels" className="back-link">← Volver</Link>
        <div className="channel-info-header">
          <img src={channel.thumbnail || channel.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name || channel.title)}&background=random`} alt={channel.name || channel.title} className="channel-header-thumb" />
          <div>
            <h1>{channel.name || channel.title}</h1>
            {channel.description && <p className="channel-desc">{channel.description}</p>}
          </div>
        </div>
        <button onClick={syncShorts} className="btn-secondary">🔄 Sincronizar shorts</button>
      </div>

      {shorts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📹</span>
          <h2>No hay shorts sincronizados</h2>
          <p>Sincroniza este canal para ver sus shorts</p>
        </div>
      ) : (
        <div className="shorts-container">
          <ShortPlayer
            shorts={shorts}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            isSaved={isSaved}
            onSave={saveShort}
            onRemove={removeShort}
          />
        </div>
      )}
    </div>
  )
}

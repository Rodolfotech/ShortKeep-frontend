import { useState, useEffect } from 'react'
import { channels } from '../services/api'
import ShortPlayer from '../components/ShortPlayer'

const STORAGE_KEY = 'saved_shorts'

export default function Explore() {
  const [shorts, setShorts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    loadShorts()
  }, [])

  const loadShorts = async () => {
    try {
      setLoading(true)
      const { data } = await channels.latestShorts()
      setShorts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Error al cargar shorts')
    } finally {
      setLoading(false)
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
        <div className="page-header">
          <h1>🔥 Explorar</h1>
        </div>
        <div className="loading-state">
          <div className="spinner" />
          <p>Cargando shorts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>🔥 Explorar</h1>
        </div>
        <div className="empty-state">
          <span className="empty-icon">⚠️</span>
          <h2>{error}</h2>
          <button onClick={loadShorts} className="btn-primary">Reintentar</button>
        </div>
      </div>
    )
  }

  if (shorts.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>🔥 Explorar</h1>
        </div>
        <div className="empty-state">
          <span className="empty-icon">📺</span>
          <h2>No hay shorts disponibles</h2>
          <p>Agrega canales para ver sus últimos shorts</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>🔥 Explorar</h1>
        <button onClick={loadShorts} className="btn-secondary">Actualizar</button>
      </div>
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
    </div>
  )
}

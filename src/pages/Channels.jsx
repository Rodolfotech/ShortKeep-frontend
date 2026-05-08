import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { channels as channelsApi } from '../services/api'

export default function Channels() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [syncingId, setSyncingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadChannels()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadChannels = async () => {
    try {
      setLoading(true)
      const { data } = await channelsApi.list()
      setChannels(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Error al cargar canales')
    } finally {
      setLoading(false)
    }
  }

  const normalizeUrl = (input) => {
    if (/youtube\.com\/@/.test(input) || /youtube\.com\/channel\//.test(input) || /youtube\.com\/c\//.test(input)) {
      return input
    }
    const match = input.match(/(?:youtube\.com\/|youtu\.be\/)([\w-]+)/)
    if (match && !match[1].startsWith('@')) {
      return input.replace(match[1], `@${match[1]}`)
    }
    return input
  }

  const addChannel = async (e) => {
    e.preventDefault()
    try {
      setAdding(true)
      setError('')
      const normalized = normalizeUrl(url)
      const { data } = await channelsApi.add({ url: normalized })
      const channel = data.channel || data
      setChannels((prev) => [...prev, channel])
      setShowModal(false)
      setUrl('')
      showToast('✅ Canal agregado correctamente')
      const syncResult = await channelsApi.sync(channel.id)
      const syncedCount = syncResult.data?.synced || 0
      showToast(`✅ Canal agregado — ${syncedCount} shorts sincronizados`)
      loadChannels()
    } catch (err) {
      const msg = err.response?.data?.message?.[0] || err.response?.data?.message || 'Error al agregar canal'
      setError(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setAdding(false)
    }
  }

  const syncChannel = async (id) => {
    try {
      setSyncingId(id)
      const res = await channelsApi.sync(id)
      const syncedCount = res.data?.synced || 0
      showToast(`🔄 ${syncedCount} shorts sincronizados`)
      loadChannels()
    } catch (err) {
      showToast('Error al sincronizar', 'error')
    } finally {
      setSyncingId(null)
    }
  }

  const removeChannel = async (id) => {
    try {
      await channelsApi.remove(id)
      setChannels((prev) => prev.filter((c) => c.id !== id))
      showToast('Canal eliminado')
    } catch (err) {
      setError('Error al eliminar canal')
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>📺 Canales</h1>
        </div>
        <div className="loading-state">
          <div className="spinner" />
          <p>Cargando canales...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
          {toast.message}
        </div>
      )}

      <div className="page-header">
        <h1>📺 Canales</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Agregar canal</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {channels.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📺</span>
          <h2>No sigues ningún canal</h2>
          <p>Agrega canales de YouTube para seguir sus shorts</p>
        </div>
      ) : (
        <div className="channels-grid">
          {channels.map((channel) => (
            <div key={channel.id} className="channel-card">
              <Link to={`/channels/${channel.id}`} className="channel-card-link">
                <img
                  src={channel.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=random`}
                  alt={channel.name}
                  className="channel-thumb"
                />
                <div className="channel-info">
                  <h3>{channel.name}</h3>
                </div>
              </Link>
              <div className="channel-actions">
                <button
                  onClick={() => syncChannel(channel.id)}
                  className={`btn-small ${syncingId === channel.id ? 'syncing' : ''}`}
                  disabled={syncingId === channel.id}
                  title="Sincronizar shorts"
                >
                  {syncingId === channel.id ? '⏳' : '🔄'} Sincronizar
                </button>
                <button onClick={() => removeChannel(channel.id)} className="btn-small btn-danger" title="Dejar de seguir">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Agregar canal de YouTube</h2>
            <form onSubmit={addChannel}>
              <div className="form-group">
                <label htmlFor="url">URL del canal</label>
                <input id="url" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/@midudev" required />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" disabled={adding}>{adding ? 'Agregando...' : 'Agregar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { channels as channelsApi } from '../services/api'

export default function Channels() {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadChannels()
  }, [])

  const loadChannels = async () => {
    try {
      setLoading(true)
      const { data } = await channelsApi.list()
      setChannels(Array.isArray(data) ? data : data.channels || [])
    } catch (err) {
      setError('Error al cargar canales')
    } finally {
      setLoading(false)
    }
  }

  const addChannel = async (e) => {
    e.preventDefault()
    try {
      const { data } = await channelsApi.add({ url })
      setChannels((prev) => [...prev, data.channel || data])
      setShowModal(false)
      setUrl('')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agregar canal')
    }
  }

  const removeChannel = async (id) => {
    try {
      await channelsApi.remove(id)
      setChannels((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError('Error al eliminar canal')
    }
  }

  const syncChannel = async (id) => {
    try {
      await channelsApi.sync(id)
    } catch (err) {
      setError('Error al sincronizar')
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
                  src={channel.thumbnail || channel.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name || channel.title)}&background=random`}
                  alt={channel.name || channel.title}
                  className="channel-thumb"
                />
                <div className="channel-info">
                  <h3>{channel.name || channel.title}</h3>
                  {channel.description && <p className="channel-desc">{channel.description}</p>}
                </div>
              </Link>
              <div className="channel-actions">
                <button onClick={() => syncChannel(channel.id)} className="btn-small" title="Sincronizar shorts">🔄</button>
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
                <input id="url" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/@canal" required />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Agregar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import ShortPlayer from '../components/ShortPlayer'

const STORAGE_KEY = 'saved_shorts'

function getSavedShorts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function MyShorts() {
  const [shorts, setShorts] = useState(getSavedShorts)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shorts))
  }, [shorts])

  const removeShort = (id) => {
    setShorts((prev) => prev.filter((s) => s.id !== id))
    if (currentIndex >= shorts.length - 1) {
      setCurrentIndex(Math.max(0, shorts.length - 2))
    }
  }

  const clearAll = () => {
    setShorts([])
    setCurrentIndex(0)
  }

  if (shorts.length === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>📁 Mis Shorts</h1>
        </div>
        <div className="empty-state">
          <span className="empty-icon">📂</span>
          <h2>No hay shorts guardados</h2>
          <p>Explora canales y guarda los shorts que más te interesen</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>📁 Mis Shorts</h1>
        <button onClick={clearAll} className="btn-danger">Eliminar todos</button>
      </div>
      <div className="shorts-container">
        <ShortPlayer
          shorts={shorts}
          currentIndex={currentIndex}
          onIndexChange={setCurrentIndex}
          onRemove={removeShort}
        />
      </div>
    </div>
  )
}

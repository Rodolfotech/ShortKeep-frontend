import { useRef, useEffect, useCallback } from 'react'

export default function ShortPlayer({ shorts, currentIndex, onIndexChange, isSaved, onSave, onRemove }) {
  const containerRef = useRef(null)

  const current = shorts[currentIndex]
  const saved = isSaved ? isSaved(current?.id) : false
  const videoId = extractYoutubeId(current?.url || current?.videoUrl || '')

  const scrollToIndex = useCallback((index) => {
    if (containerRef.current) {
      const child = containerRef.current.children[index]
      if (child) child.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const center = rect.top + rect.height / 2

    let closestIdx = currentIndex
    let closestDist = Infinity

    Array.from(container.children).forEach((child, idx) => {
      const cr = child.getBoundingClientRect()
      const childCenter = cr.top + cr.height / 2
      const dist = Math.abs(center - childCenter)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = idx
      }
    })

    if (closestIdx !== currentIndex) {
      onIndexChange(closestIdx)
    }
  }, [currentIndex, onIndexChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    scrollToIndex(currentIndex)
  }, [currentIndex, scrollToIndex])

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' && currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    } else if (e.key === 'ArrowDown' && currentIndex < shorts.length - 1) {
      onIndexChange(currentIndex + 1)
    }
  }

  return (
    <div className="short-player-wrapper" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="short-player-list" ref={containerRef}>
        {shorts.map((short, idx) => {
          const vidId = extractYoutubeId(short?.url || short?.videoUrl || '')
          const isSavedShort = isSaved ? isSaved(short.id) : false
          return (
            <div key={short.id || idx} className="short-item">
              <div className="short-video-container">
                {vidId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${vidId}?autoplay=${idx === currentIndex ? 1 : 0}&mute=1&loop=1&playlist=${vidId}`}
                    title={short.title || 'Short'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="short-iframe"
                  />
                ) : (
                  <div className="short-placeholder">
                    <span>🎬</span>
                    <p>{short.title || 'Sin título'}</p>
                  </div>
                )}
              </div>
              <div className="short-info">
                <h3>{short.title || 'Sin título'}</h3>
                <p className="short-channel">{short.channelName || short.channel?.name || ''}</p>
                <div className="short-actions-row">
                  {onSave && (
                    <button
                      onClick={() => isSavedShort ? onRemove(short.id) : onSave(short)}
                      className={`btn-icon ${isSavedShort ? 'saved' : ''}`}
                      title={isSavedShort ? 'Eliminar de guardados' : 'Guardar short'}
                    >
                      {isSavedShort ? '✅' : '💾'}
                    </button>
                  )}
                  <a href={short.url || short.videoUrl || '#'} target="_blank" rel="noopener noreferrer" className="btn-icon" title="Abrir en YouTube">
                    ▶️
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="short-nav">
        <button disabled={currentIndex === 0} onClick={() => onIndexChange(currentIndex - 1)} className="btn-nav">▲</button>
        <span className="short-counter">{currentIndex + 1} / {shorts.length}</span>
        <button disabled={currentIndex === shorts.length - 1} onClick={() => onIndexChange(currentIndex + 1)} className="btn-nav">▼</button>
      </div>

      {current && (
        <div className="short-detail-bar">
          <div className="short-detail-info">
            <h3>{current.title || 'Sin título'}</h3>
            <p>{current.channelName || current.channel?.name || ''}</p>
          </div>
          {onSave && (
            <button
              onClick={() => saved ? onRemove(current.id) : onSave(current)}
              className={`btn-save ${saved ? 'saved' : ''}`}
            >
              {saved ? '✅ Guardado' : '💾 Guardar'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function extractYoutubeId(url = '') {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

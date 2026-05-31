import { useEffect, useRef, useState } from 'react'
import { Play, Pause } from 'lucide-react'

interface Props {
  src: string
  startSec: number
  endSec: number
  label?: string
  height?: number
  autoLoop?: boolean
}

export default function SegmentClip({ src, startSec, endSec, label, height = 120, autoLoop = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onLoaded = () => {
      try { v.currentTime = startSec } catch { /* noop */ }
      setReady(true)
    }
    const onTime = () => {
      if (v.currentTime >= endSec) {
        if (autoLoop) {
          v.currentTime = startSec
        } else {
          v.pause()
          setPlaying(false)
        }
      }
    }
    v.addEventListener('loadedmetadata', onLoaded)
    v.addEventListener('timeupdate', onTime)
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded)
      v.removeEventListener('timeupdate', onTime)
    }
  }, [startSec, endSec, autoLoop])

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (playing) {
      v.pause()
      setPlaying(false)
    } else {
      if (v.currentTime < startSec || v.currentTime >= endSec) {
        v.currentTime = startSec
      }
      v.play().then(() => setPlaying(true)).catch(() => {/* user gesture required */})
    }
  }

  const duration = Math.max(0, endSec - startSec)

  return (
    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#000', height }}>
      <video
        ref={videoRef}
        muted
        playsInline
        preload="metadata"
        onClick={toggle}
        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', display: 'block' }}
      >
        <source src={src} />
      </video>

      {/* Overlay play indicator */}
      <button
        onClick={toggle}
        aria-label={playing ? 'pause' : 'play'}
        style={{
          position: 'absolute', inset: 0,
          display: playing ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.35))',
          border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Play size={16} color="#e8365d" fill="#e8365d" />
        </div>
      </button>

      {playing && (
        <button onClick={toggle} aria-label="pause"
          style={{
            position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <Pause size={12} color="#fff" />
        </button>
      )}

      <div style={{
        position: 'absolute', left: 6, bottom: 6,
        padding: '2px 7px', borderRadius: 6,
        background: 'rgba(0,0,0,0.6)', color: '#fff',
        fontSize: '0.62rem', fontWeight: 700, lineHeight: 1.2,
      }}>
        {startSec}s – {endSec}s · {duration.toFixed(1)}s
      </div>

      {label && (
        <div style={{
          position: 'absolute', right: 6, bottom: 6,
          padding: '2px 7px', borderRadius: 6,
          background: 'rgba(232,54,93,0.85)', color: '#fff',
          fontSize: '0.62rem', fontWeight: 700, maxWidth: '60%',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{label}</div>
      )}

      {!ready && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.7rem',
        }}>加载预览…</div>
      )}
    </div>
  )
}

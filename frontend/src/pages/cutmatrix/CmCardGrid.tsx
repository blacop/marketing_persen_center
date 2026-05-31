import { useNavigate } from 'react-router-dom'
import {
  Star, Music, Film as FilmIcon, FileText, Image as ImageIcon, Captions, Archive,
  Sparkles, Wrench,
} from 'lucide-react'
import { type CmCard, type CmStatus, type CmIO } from '../../lib/cm/cmCatalog'
import { loadFavorites, cmApi } from '../../lib/cm/cmApi'
import { useState } from 'react'

const STATUS_STYLE: Record<CmStatus, { bg: string; color: string }> = {
  '已上线': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  '内测中': { bg: 'color-mix(in srgb, var(--accent-primary) 14%, transparent)', color: 'var(--accent-primary)' },
  '规划中': { bg: 'rgba(148,163,184,0.18)', color: '#64748b' },
  '不支持': { bg: 'rgba(239,68,68,0.10)', color: '#ef4444' },
}

const IO_ICON: Record<CmIO, typeof Music> = {
  audio: Music,
  video: FilmIcon,
  text: FileText,
  image: ImageIcon,
  subtitle: Captions,
  archive: Archive,
}

interface Props {
  cards: CmCard[]
  routePrefix: string  // /cutmatrix/wf 或 /cutmatrix/tool
}

export default function CmCardGrid({ cards, routePrefix }: Props) {
  const nav = useNavigate()
  const [favs, setFavs] = useState<Set<string>>(new Set(loadFavorites()))

  const toggleFav = (e: React.MouseEvent, key: string) => {
    e.stopPropagation()
    cmApi.toggleFavorite(key)
    setFavs(new Set(loadFavorites()))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {cards.map(c => {
        const isFav = favs.has(c.key)
        return (
          <div key={c.key} onClick={() => nav(`${routePrefix}/${c.key}`)} style={{
            position: 'relative',
            background: 'var(--bg-card)', borderRadius: 14,
            border: c.highlight ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
            padding: '18px 20px', cursor: 'pointer',
            boxShadow: c.highlight ? '0 4px 16px color-mix(in srgb, var(--accent-primary) 12%, transparent)' : '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 18px color-mix(in srgb, var(--accent-primary) 16%, transparent)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = c.highlight ? 'var(--accent-primary)' : 'var(--border-light)'; (e.currentTarget as HTMLElement).style.boxShadow = c.highlight ? '0 4px 16px color-mix(in srgb, var(--accent-primary) 12%, transparent)' : '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {/* 标题行 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <button onClick={(e) => toggleFav(e, c.key)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 0, lineHeight: 0, color: isFav ? '#f59e0b' : 'var(--text-muted)',
              }} aria-label={isFav ? '取消收藏' : '收藏'}>
                <Star size={15} fill={isFav ? '#f59e0b' : 'none'} />
              </button>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{c.name}</span>
              <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, fontWeight: 700, ...STATUS_STYLE[c.status] }}>{c.status}</span>
              {c.highlight && (
                <span style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '2px 7px', borderRadius: 99, background: 'var(--gradient-1)', color: '#fff', fontWeight: 700 }}>
                  本项目特化
                </span>
              )}
            </div>

            {/* 描述 */}
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, minHeight: 56 }}>
              {c.desc}
            </div>

            {/* 场景标签 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {c.scenes.map(s => (
                <span key={s} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 6, background: 'color-mix(in srgb, var(--accent-primary) 8%, transparent)', color: 'var(--accent-dark)', fontWeight: 600 }}>{s}</span>
              ))}
            </div>

            {/* IO + cost */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                <span>输入</span>
                {c.inputs.map((io, i) => {
                  const Icon = IO_ICON[io]
                  return <Icon key={i} size={12} />
                })}
                <span style={{ marginLeft: 8 }}>输出</span>
                {c.outputs.map((io, i) => {
                  const Icon = IO_ICON[io]
                  return <Icon key={i} size={12} />
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function CmCatalogHeader({ icon: Icon, title, count }: { icon: typeof Sparkles | typeof Wrench; title: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
      <Icon size={18} color="var(--accent-primary)" />
      <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{title}</span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>共 {count} 项</span>
    </div>
  )
}

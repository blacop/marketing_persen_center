import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'
import { findCmCard } from '../../lib/cm/cmCatalog'

interface Props {
  category: 'workflow' | 'tool'
}

export default function CmDetailPlaceholder({ category }: Props) {
  const { key } = useParams()
  const nav = useNavigate()
  const card = key ? findCmCard(key) : undefined

  if (!card) {
    return (
      <div style={{ padding: '40px 28px', maxWidth: 720, margin: '0 auto' }}>
        <div style={errBox}><AlertCircle size={14} /> 找不到 key={key} 对应的{category === 'workflow' ? '工作流' : '小工具'}</div>
        <button onClick={() => nav('/cutmatrix')} style={btnGhost}>← 返回目录</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>
      <button onClick={() => nav(category === 'workflow' ? '/cutmatrix' : '/cutmatrix/tools')} style={backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回{category === 'workflow' ? '工作流' : '小工具'}目录
      </button>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
          {card.name}
          <span style={{ marginLeft: 8, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(148,163,184,0.18)', color: '#64748b', fontWeight: 700 }}>{card.status}</span>
        </h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6 }}>{card.desc}</div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '20px 22px', marginBottom: 14 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10 }}>
          <Sparkles size={14} color="var(--accent-primary)" style={{ verticalAlign: 'middle', marginRight: 6 }} />
          适用场景
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {card.scenes.map(s => <span key={s} style={tag}>{s}</span>)}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '20px 22px', marginBottom: 14 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10 }}>输入 / 输出</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.78rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 4 }}>输入</div>
            <div style={{ fontWeight: 600 }}>{card.inputs.join(' / ')}</div>
          </div>
          <ArrowRight size={14} color="var(--text-muted)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 4 }}>输出</div>
            <div style={{ fontWeight: 600 }}>{card.outputs.join(' / ')}</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '20px 22px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>实施状态</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          本{category === 'workflow' ? '工作流' : '小工具'}处于 <strong>{card.status}</strong> 阶段。
          {card.backendPath && <><br />预计后端路径: <code style={{ background: 'var(--bg-primary)', padding: '1px 6px', borderRadius: 4 }}>{card.backendPath}</code></>}
          <br />
          完整实施请见仓库根 <code style={{ background: 'var(--bg-primary)', padding: '1px 6px', borderRadius: 4 }}>task_plan.md</code> 阶段 19。
        </div>
      </div>
    </div>
  )
}

const tag: React.CSSProperties = { fontSize: '0.7rem', padding: '2px 9px', borderRadius: 6, background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', color: 'var(--accent-dark)', fontWeight: 600 }
const errBox: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 12 }
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' }
const backBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' }

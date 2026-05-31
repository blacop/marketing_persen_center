import { useMemo, useState } from 'react'
import { Wrench, Scissors, Search } from 'lucide-react'
import { CM_WORKFLOWS, CM_TOOLS, type CmStatus } from '../../lib/cm/cmCatalog'
import CmCardGrid, { CmCatalogHeader } from './CmCardGrid'

type Tab = 'workflow' | 'tool'

interface Props {
  defaultTab?: Tab
}

const STATUS_FILTERS: ('全部' | CmStatus)[] = ['全部', '已上线', '内测中', '规划中']

export default function CutmatrixHome({ defaultTab = 'workflow' }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab)
  const [filter, setFilter] = useState<typeof STATUS_FILTERS[number]>('全部')
  const [keyword, setKeyword] = useState('')

  const cards = tab === 'workflow' ? CM_WORKFLOWS : CM_TOOLS

  const filtered = useMemo(() => {
    let r = cards
    if (filter !== '全部') r = r.filter(c => c.status === filter)
    const k = keyword.trim().toLowerCase()
    if (k) r = r.filter(c =>
      c.name.toLowerCase().includes(k) ||
      c.desc.toLowerCase().includes(k) ||
      c.scenes.some(s => s.toLowerCase().includes(k))
    )
    return r
  }, [cards, filter, keyword])

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
            视频矩阵
            <span style={{ marginLeft: 8, fontSize: '0.7rem', padding: '2px 10px', borderRadius: 99, background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', color: 'var(--accent-primary)', fontWeight: 700 }}>NEW</span>
          </h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
            视频矩阵化生产工具集 · 工作流（端到端编排） + 小工具（原子能力） · 与现有飞轮链路隔离运行
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22, borderBottom: '1px solid var(--border-light)' }}>
        <TabBtn active={tab === 'workflow'} onClick={() => setTab('workflow')} icon={Wrench} label="工作流" count={CM_WORKFLOWS.length} />
        <TabBtn active={tab === 'tool'} onClick={() => setTab('tool')} icon={Scissors} label="小工具" count={CM_TOOLS.length} />
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-light)', minWidth: 240 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索工具名 / 描述 / 场景"
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.78rem', color: 'var(--text-primary)', flex: 1 }} />
        </div>
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', borderRadius: 99, border: '1px solid var(--border-light)',
            background: filter === f ? 'var(--accent-primary)' : 'var(--bg-card)',
            color: filter === f ? '#fff' : 'var(--text-secondary)',
            fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer',
          }}>{f}</button>
        ))}
      </div>

      {/* Section header */}
      <CmCatalogHeader
        icon={tab === 'workflow' ? Wrench : Scissors}
        title={tab === 'workflow' ? '工作流' : '小工具'}
        count={filtered.length}
      />

      {/* Cards */}
      {filtered.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          没有匹配的{tab === 'workflow' ? '工作流' : '小工具'}
        </div>
      ) : (
        <CmCardGrid cards={filtered} routePrefix={tab === 'workflow' ? '/cutmatrix/wf' : '/cutmatrix/tool'} />
      )}
    </div>
  )
}

function TabBtn({ active, onClick, icon: Icon, label, count }: {
  active: boolean; onClick: () => void; icon: typeof Wrench; label: string; count: number
}) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 18px', border: 'none', borderRadius: '8px 8px 0 0',
      cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
      background: active ? 'var(--accent-primary)' : 'transparent',
      color: active ? '#fff' : 'var(--text-muted)',
    }}>
      <Icon size={14} />
      {label}
      <span style={{ fontSize: '0.65rem', opacity: 0.85 }}>({count})</span>
    </button>
  )
}

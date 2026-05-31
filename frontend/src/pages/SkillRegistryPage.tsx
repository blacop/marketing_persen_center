import { useEffect, useMemo, useState } from 'react'
import { Database, FileCode2, Link2, Loader2, RefreshCw, ShieldCheck } from 'lucide-react'
import { SkillRegistry, agentApi } from '../lib/agentApi'

function statusClass(status?: string) {
  return status === 'ACTIVE' ? 'active' : 'inactive'
}

export default function SkillRegistryPage() {
  const [items, setItems] = useState<SkillRegistry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'LOCAL' | 'BUILTIN' | 'MCP' | 'HUB'>('ALL')
  const [error, setError] = useState('')

  async function loadSkills() {
    setLoading(true)
    setError('')
    try {
      const page = await agentApi.listSkills()
      setItems(page.records)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载 SkillRegistry 失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSkills()
  }, [])

  const filtered = useMemo(() => items.filter(item => {
    const text = `${item.name} ${item.skillId} ${item.category ?? ''}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesSource = sourceFilter === 'ALL' || item.source === sourceFilter
    return matchesSearch && matchesSource
  }), [items, search, sourceFilter])

  const stats = useMemo(() => ({
    total: items.length,
    local: items.filter(item => item.source === 'LOCAL').length,
    mcp: items.filter(item => item.source === 'MCP').length,
    active: items.filter(item => item.status === 'ACTIVE').length,
  }), [items])

  return (
    <div className="agent-os-page">
      <div className="agent-os-stack">
        <section className="agent-os-hero">
          <div className="agent-os-hero-top">
            <div>
              <div className="agent-os-kicker"><FileCode2 size={14} /> Agent OS / Skill Registry</div>
              <h1 className="agent-os-title">技能资产目录</h1>
              <p className="agent-os-subtitle">
                查看 Hermes 运行时可见的技能目录、来源、artifact 路径和 schema 信息。这一页会尽量保留原版的资产矩阵观感，同时承载真实资产字段。
              </p>
            </div>
            <div className="agent-os-actions">
              <button onClick={() => void loadSkills()} className="agent-os-button">
                <RefreshCw size={16} /> 刷新技能
              </button>
            </div>
          </div>

          <div className="agent-os-metrics">
            {[
              { label: '总技能数', value: stats.total, note: 'SkillRegistry 全量资产', icon: Database },
              { label: 'LOCAL', value: stats.local, note: '本地发布与本地产物', icon: FileCode2 },
              { label: 'MCP', value: stats.mcp, note: '外部连接器 / MCP 能力', icon: Link2 },
              { label: 'ACTIVE', value: stats.active, note: '当前有效技能条目', icon: ShieldCheck },
            ].map(item => (
              <article key={item.label} className="agent-os-metric-card">
                <div className="agent-os-metric-head">
                  <div className="agent-os-metric-label">{item.label}</div>
                  <span className="agent-os-metric-icon"><item.icon size={18} /></span>
                </div>
                <div className="agent-os-metric-value">{item.value}</div>
                <div className="agent-os-metric-note">{item.note}</div>
              </article>
            ))}
          </div>
        </section>

        {error && <div className="agent-os-alert error">{error}</div>}

        <section className="agent-os-panel">
          <div className="agent-os-panel-header">
            <div>
              <div className="agent-os-panel-title">Published Skills</div>
              <div className="agent-os-panel-desc">卡片矩阵最适合展示技能资产与产物元数据</div>
            </div>
            <div className="agent-os-actions">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索技能名 / skillId / 分类"
                className="agent-os-input"
                style={{ minWidth: 260 }}
              />
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value as 'ALL' | 'LOCAL' | 'BUILTIN' | 'MCP' | 'HUB')} className="agent-os-select">
                <option value="ALL">全部来源</option>
                <option value="LOCAL">LOCAL</option>
                <option value="BUILTIN">BUILTIN</option>
                <option value="MCP">MCP</option>
                <option value="HUB">HUB</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="agent-os-loading"><Loader2 size={18} className="animate-spin" /> 加载 Skills...</div>
          ) : filtered.length === 0 ? (
            <div className="agent-os-empty">当前筛选条件下暂无 Skill 数据。</div>
          ) : (
            <div className="agent-os-card-grid">
              {filtered.map(item => (
                <article key={item.id} className="agent-os-asset-card">
                  <div className="agent-os-list-title-row">
                    <div>
                      <h3>{item.name}</h3>
                      <div className="agent-os-list-subtitle">{item.skillId}</div>
                    </div>
                    <span className={`agent-os-status ${statusClass(item.status)}`}>{item.status ?? 'UNKNOWN'}</span>
                  </div>
                  <div className="agent-os-list-body">{item.description || '暂无技能描述'}</div>
                  <div className="agent-os-asset-meta">
                    <div><strong>source:</strong> {item.source ?? '-'}</div>
                    <div><strong>category:</strong> {item.category ?? '-'}</div>
                    <div><strong>version:</strong> {item.version ?? '-'}</div>
                    <div><strong>schema:</strong> {item.schemaVersion ?? '-'}</div>
                    <div><strong>trust:</strong> {item.trustLevel ?? '-'}</div>
                    <div><strong>artifact:</strong> {item.artifactPath ?? '-'}</div>
                    <div><strong>checksum:</strong> {item.artifactChecksum ?? '-'}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

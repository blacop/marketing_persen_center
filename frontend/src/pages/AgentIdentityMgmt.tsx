import { useEffect, useMemo, useState } from 'react'
import { Copy, Fingerprint, Loader2, RefreshCw, Shield, UserPlus } from 'lucide-react'
import { AgentIdentity, agentApi } from '../lib/agentApi'

type IdentityForm = {
  id?: number
  name: string
  agentUniqueId: string
  description: string
  ownerId: string
  agentType: string
  authPolicy: string
  publicKey: string
  status: string
}

const emptyForm: IdentityForm = {
  name: '',
  agentUniqueId: '',
  description: '',
  ownerId: 'team-agent-os',
  agentType: 'MACHINE',
  authPolicy: 'read:agent.*,write:trace.*',
  publicKey: '',
  status: 'ACTIVE',
}

function statusClass(status?: string) {
  if (status === 'ACTIVE') return 'active'
  if (status === 'SUSPENDED') return 'suspended'
  return 'inactive'
}

export default function AgentIdentityMgmt() {
  const [items, setItems] = useState<AgentIdentity[]>([])
  const [selected, setSelected] = useState<AgentIdentity | null>(null)
  const [form, setForm] = useState<IdentityForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadIdentities(preserve = true) {
    setLoading(true)
    setError('')
    try {
      const page = await agentApi.listIdentities()
      setItems(page.records)
      if (page.records.length === 0) {
        setSelected(null)
        setForm(emptyForm)
      } else if (preserve && selected) {
        const matched = page.records.find(item => item.id === selected.id) ?? page.records[0]
        pick(matched)
      } else {
        pick(page.records[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载身份失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadIdentities(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pick(item: AgentIdentity | null) {
    setSelected(item)
    if (!item) {
      setForm(emptyForm)
      return
    }
    setForm({
      id: item.id,
      name: item.name,
      agentUniqueId: item.agentUniqueId,
      description: item.description ?? '',
      ownerId: item.ownerId ?? '',
      agentType: item.agentType ?? 'MACHINE',
      authPolicy: item.authPolicy ?? '',
      publicKey: item.publicKey ?? '',
      status: item.status ?? 'ACTIVE',
    })
  }

  const filtered = useMemo(() => items.filter(item => `${item.name} ${item.agentUniqueId}`.toLowerCase().includes(search.toLowerCase())), [items, search])
  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter(item => item.status === 'ACTIVE').length,
    suspended: items.filter(item => item.status === 'SUSPENDED').length,
    hybrid: items.filter(item => item.agentType === 'HYBRID').length,
  }), [items])

  async function saveIdentity() {
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      if (form.id) {
        await agentApi.updateIdentity(form)
        setMessage('身份信息已更新。')
      } else {
        await agentApi.createIdentity(form)
        setMessage('身份已创建。')
      }
      await loadIdentities(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="agent-os-page">
      <div className="agent-os-stack">
        <section className="agent-os-hero">
          <div className="agent-os-hero-top">
            <div>
              <div className="agent-os-kicker"><Shield size={14} /> Agent OS / Identity</div>
              <h1 className="agent-os-title">身份与权限治理台</h1>
              <p className="agent-os-subtitle">
                管理 Agent 唯一身份、归属、授权策略与生命周期状态。页面上半区保持原版数字卡语言，下半区按治理后台组织为对象列表与分组表单。
              </p>
            </div>
            <div className="agent-os-actions">
              <button onClick={() => void loadIdentities(false)} className="agent-os-button">
                <RefreshCw size={16} /> 刷新身份
              </button>
            </div>
          </div>

          <div className="agent-os-metrics">
            {[
              { label: '总身份数', value: stats.total, note: 'AgentIdentity 全量记录', icon: Fingerprint },
              { label: 'ACTIVE', value: stats.active, note: '当前生效身份', icon: Shield },
              { label: 'SUSPENDED', value: stats.suspended, note: '已挂起，待人工恢复', icon: Shield },
              { label: 'HYBRID', value: stats.hybrid, note: '人机协同类型身份', icon: UserPlus },
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

        {(message || error) && (
          <div className={`agent-os-alert ${error ? 'error' : 'success'}`}>{error || message}</div>
        )}

        <section className="agent-os-shell">
          <div className="agent-os-panel">
            <div className="agent-os-panel-header">
              <div>
                <div className="agent-os-panel-title">Identity List</div>
                <div className="agent-os-panel-desc">选中一个身份后可编辑状态与授权策略</div>
              </div>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索名称 / Agent ID"
                className="agent-os-input"
                style={{ minWidth: 220 }}
              />
            </div>

            {loading ? (
              <div className="agent-os-loading"><Loader2 size={18} className="animate-spin" /> 加载身份...</div>
            ) : filtered.length === 0 ? (
              <div className="agent-os-empty">当前筛选条件下暂无 Identity 数据。</div>
            ) : (
              <div className="agent-os-list">
                {filtered.map(item => (
                  <button key={item.id} onClick={() => pick(item)} className={`agent-os-list-card ${selected?.id === item.id ? 'active' : ''}`}>
                    <div className="agent-os-list-title-row">
                      <div>
                        <div className="agent-os-list-title">{item.name}</div>
                        <div className="agent-os-list-subtitle">{item.agentUniqueId}</div>
                      </div>
                      <span className={`agent-os-status ${statusClass(item.status)}`}>{item.status ?? 'UNKNOWN'}</span>
                    </div>
                    <div className="agent-os-list-body">{item.description || '暂无身份说明'}</div>
                    <div className="agent-os-list-meta">
                      <span>owner: {item.ownerId ?? '-'}</span>
                      <span>type: {item.agentType ?? 'MACHINE'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="agent-os-panel">
            <div className="agent-os-panel-header">
              <div>
                <div className="agent-os-panel-title">Identity Editor</div>
                <div className="agent-os-panel-desc">按治理视角分组展示基本信息、权限与密钥</div>
              </div>
              <button onClick={() => { setSelected(null); setForm(emptyForm) }} className="agent-os-button ghost">新建身份</button>
            </div>

            <div className="agent-os-grid-2">
              <div className="agent-os-surface">
                <div className="agent-os-field-title">基本信息</div>
                <div className="agent-os-form-grid" style={{ marginTop: 14 }}>
                  <div className="agent-os-field">
                    <label>名称</label>
                    <input className="agent-os-input" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="agent-os-field">
                    <label>Agent Unique Id</label>
                    <input className="agent-os-input mono" value={form.agentUniqueId} onChange={e => setForm(prev => ({ ...prev, agentUniqueId: e.target.value }))} />
                  </div>
                  <div className="agent-os-field agent-os-form-span-2">
                    <label>描述</label>
                    <input className="agent-os-input" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                  <div className="agent-os-field">
                    <label>所属团队</label>
                    <input className="agent-os-input" value={form.ownerId} onChange={e => setForm(prev => ({ ...prev, ownerId: e.target.value }))} />
                  </div>
                  <div className="agent-os-field">
                    <label>类型</label>
                    <select className="agent-os-select" value={form.agentType} onChange={e => setForm(prev => ({ ...prev, agentType: e.target.value }))}>
                      <option value="MACHINE">MACHINE</option>
                      <option value="HYBRID">HYBRID</option>
                      <option value="HUMAN">HUMAN</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="agent-os-surface">
                <div className="agent-os-field-title">策略与状态</div>
                <div className="agent-os-form-grid" style={{ marginTop: 14 }}>
                  <div className="agent-os-field agent-os-form-span-2">
                    <label>授权策略</label>
                    <textarea className="agent-os-textarea" rows={4} value={form.authPolicy} onChange={e => setForm(prev => ({ ...prev, authPolicy: e.target.value }))} />
                  </div>
                  <div className="agent-os-field agent-os-form-span-2">
                    <label>公钥</label>
                    <textarea className="agent-os-textarea mono" rows={5} value={form.publicKey} onChange={e => setForm(prev => ({ ...prev, publicKey: e.target.value }))} />
                  </div>
                  <div className="agent-os-field">
                    <label>状态</label>
                    <select className="agent-os-select" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="agent-os-toolbar">
              <button onClick={() => void saveIdentity()} disabled={submitting} className="agent-os-button primary">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} 保存身份
              </button>
              {selected ? (
                <button onClick={() => void navigator.clipboard.writeText(selected.agentUniqueId)} className="agent-os-button">
                  <Copy size={16} /> 复制 Agent ID
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Activity, Bot, Loader2, RefreshCw, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react'
import { AgentRegistry, agentApi } from '../lib/agentApi'

function statusClass(status?: string) {
  if (status === 'ACTIVE') return 'active'
  if (status === 'SUSPENDED') return 'suspended'
  return 'inactive'
}

export default function AgentRegistryPage() {
  const [items, setItems] = useState<AgentRegistry[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadRegistries() {
    setLoading(true)
    setError('')
    try {
      const page = await agentApi.listRegistries()
      setItems(page.records)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载 Agent Registry 失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRegistries()
  }, [])

  const filtered = useMemo(() => items.filter(item => {
    const text = `${item.name} ${item.agentUniqueId ?? ''} ${item.category ?? ''}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || (item.status ?? '') === statusFilter
    return matchesSearch && matchesStatus
  }), [items, search, statusFilter])

  const stats = useMemo(() => {
    const active = items.filter(item => item.status === 'ACTIVE').length
    const suspended = items.filter(item => item.status === 'SUSPENDED').length
    const boundDefinitions = items.filter(item => item.definitionId).length
    return { total: items.length, active, suspended, boundDefinitions }
  }, [items])

  async function updateStatus(id: number, status: 'ACTIVE' | 'SUSPENDED') {
    setBusyId(id)
    setError('')
    setMessage('')
    try {
      if (status === 'ACTIVE') {
        await agentApi.activateRegistry(id)
        setMessage('Agent Registry 已激活。')
      } else {
        await agentApi.suspendRegistry(id)
        setMessage('Agent Registry 已挂起。')
      }
      await loadRegistries()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新状态失败')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="agent-os-page">
      <div className="agent-os-stack">
        <section className="agent-os-hero">
          <div className="agent-os-hero-top">
            <div>
              <div className="agent-os-kicker"><Bot size={14} /> Agent OS / Registry</div>
              <h1 className="agent-os-title">运行时实例总表</h1>
              <p className="agent-os-subtitle">
                查看当前运行时 Agent 注册表，包含定义映射、当前 skill、endpoint 类型，以及手动激活 / 挂起控制。这个页面承接发布后的运行态核验。
              </p>
            </div>
            <div className="agent-os-actions">
              <button onClick={() => void loadRegistries()} className="agent-os-button">
                <RefreshCw size={16} /> 同步状态
              </button>
            </div>
          </div>

          <div className="agent-os-metrics">
            {[
              { label: 'Registry 总数', value: stats.total, note: '当前已注册运行实例', icon: Bot },
              { label: '活跃运行', value: stats.active, note: 'status=ACTIVE', icon: Activity },
              { label: '挂起实例', value: stats.suspended, note: '待恢复或人工介入', icon: ToggleLeft },
              { label: '已绑定定义', value: stats.boundDefinitions, note: 'definitionId 已存在', icon: ShieldCheck },
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

        <section className="agent-os-panel">
          <div className="agent-os-panel-header">
            <div>
              <div className="agent-os-panel-title">Registry Table</div>
              <div className="agent-os-panel-desc">基于后端 `/agentRegistry/*` 接口的真实数据</div>
            </div>
            <div className="agent-os-actions">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索名称 / agentUniqueId / category"
                className="agent-os-input"
                style={{ minWidth: 260 }}
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'SUSPENDED')}
                className="agent-os-select"
              >
                <option value="ALL">全部状态</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="agent-os-loading"><Loader2 size={18} className="animate-spin" /> 加载 Registry...</div>
          ) : filtered.length === 0 ? (
            <div className="agent-os-empty">当前筛选条件下暂无 Registry 数据。</div>
          ) : (
            <div className="agent-os-table-wrap">
              <table className="agent-os-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Agent Id</th>
                    <th>Category</th>
                    <th>Definition</th>
                    <th>Current Skill</th>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="agent-os-table-title">{item.name}</div>
                        <div className="agent-os-table-subtitle">{item.agentType ?? 'MACHINE'} · {item.version ?? 'v1'}</div>
                      </td>
                      <td><span className="agent-os-code">{item.agentUniqueId ?? '-'}</span></td>
                      <td>{item.category ?? '-'}</td>
                      <td>
                        {item.definitionId ? (
                          <>
                            <div className="agent-os-table-title">#{item.definitionId}</div>
                            <div className="agent-os-table-subtitle">{item.definitionVersion ?? '-'}</div>
                          </>
                        ) : '-'}
                      </td>
                      <td><span className="agent-os-code">{item.currentSkillId ?? '-'}</span></td>
                      <td>
                        <div>{item.endpointType ?? '-'}</div>
                        <div className="agent-os-table-subtitle">{item.endpointUrl ?? '-'}</div>
                      </td>
                      <td>
                        <span className={`agent-os-status ${statusClass(item.status)}`}>{item.status ?? 'UNKNOWN'}</span>
                      </td>
                      <td>
                        <button
                          onClick={() => void updateStatus(item.id, item.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                          disabled={busyId === item.id}
                          className="agent-os-button"
                          style={{ minHeight: 36, paddingInline: 12 }}
                        >
                          {busyId === item.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : item.status === 'ACTIVE' ? (
                            <><ToggleRight size={15} /> 挂起</>
                          ) : (
                            <><ToggleLeft size={15} /> 激活</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

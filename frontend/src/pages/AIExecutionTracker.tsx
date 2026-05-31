import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertCircle, CheckCircle2, Clock3, GitBranch, Loader2, Package, RefreshCw, Sparkles, Workflow, XCircle } from 'lucide-react'
import { AgentDefinition, AgentPublishRecord, AgentTrace, agentApi } from '../lib/agentApi'

function formatDateTime(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatDuration(duration?: number) {
  if (duration === undefined || duration === null) return '-'
  if (duration < 1000) return `${duration} ms`
  if (duration < 60_000) return `${(duration / 1000).toFixed(1)} s`
  return `${(duration / 60_000).toFixed(1)} min`
}

function compactText(value?: string, max = 96) {
  if (!value) return '-'
  return value.length > max ? `${value.slice(0, max)}...` : value
}

function statusClass(status?: string) {
  if (status === 'SUCCESS') return 'success'
  if (status === 'RUNNING') return 'running'
  if (status === 'FAILED') return 'failed'
  return 'inactive'
}

export default function AIExecutionTracker() {
  const [definitions, setDefinitions] = useState<AgentDefinition[]>([])
  const [traces, setTraces] = useState<AgentTrace[]>([])
  const [publishRecords, setPublishRecords] = useState<AgentPublishRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [definitionId, setDefinitionId] = useState('')
  const [traceStatus, setTraceStatus] = useState('ALL')
  const [publishStatus, setPublishStatus] = useState('ALL')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const currentDefinitionId = definitionId ? Number(definitionId) : undefined
      const [definitionPage, tracePage, publishPage] = await Promise.all([
        agentApi.listDefinitions({ pageIndex: 1, pageSize: 200 }),
        agentApi.listTraces(
          { pageIndex: 1, pageSize: 100 },
          {
            definitionId: currentDefinitionId,
            traceStatus: traceStatus === 'ALL' ? undefined : traceStatus,
          },
        ),
        agentApi.listPublishRecords(
          { pageIndex: 1, pageSize: 100 },
          {
            definitionId: currentDefinitionId,
            publishStatus: publishStatus === 'ALL' ? undefined : publishStatus,
          },
        ),
      ])

      setDefinitions(definitionPage.records)
      setTraces(tracePage.records)
      setPublishRecords(publishPage.records)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载观测数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [definitionId, traceStatus, publishStatus])

  const definitionMap = useMemo(() => new Map(definitions.map(item => [item.id, item])), [definitions])

  const stats = useMemo(() => {
    const successTraceCount = traces.filter(item => item.traceStatus === 'SUCCESS').length
    const runningTraceCount = traces.filter(item => item.traceStatus === 'RUNNING').length
    const failedTraceCount = traces.filter(item => item.traceStatus === 'FAILED').length
    const successPublishCount = publishRecords.filter(item => item.publishStatus === 'SUCCESS').length
    const failedPublishCount = publishRecords.filter(item => item.publishStatus === 'FAILED').length
    const traceDurations = traces.map(item => item.duration).filter((value): value is number => typeof value === 'number' && value > 0)
    const averageDuration = traceDurations.length > 0 ? Math.round(traceDurations.reduce((sum, item) => sum + item, 0) / traceDurations.length) : undefined

    return {
      traceTotal: traces.length,
      successTraceCount,
      runningTraceCount,
      failedTraceCount,
      publishTotal: publishRecords.length,
      successPublishCount,
      failedPublishCount,
      averageDuration,
    }
  }, [publishRecords, traces])

  const timeline = useMemo(() => {
    const traceEvents = traces.map(item => ({
      id: `trace-${item.id}`,
      title: item.name || item.traceId,
      subtitle: `Trace · ${item.traceType ?? 'UNKNOWN'}`,
      status: item.traceStatus ?? 'UNKNOWN',
      time: item.startAt ?? item.createAt,
      detail: item.traceId,
    }))

    const publishEvents = publishRecords.map(item => ({
      id: `publish-${item.id}`,
      title: item.skillId || `Publish #${item.id}`,
      subtitle: `Publish · ${item.publisherType ?? 'UNKNOWN'}`,
      status: item.publishStatus ?? 'UNKNOWN',
      time: item.createAt,
      detail: item.definitionVersion ?? '-',
    }))

    return [...traceEvents, ...publishEvents]
      .sort((a, b) => new Date(b.time ?? 0).getTime() - new Date(a.time ?? 0).getTime())
      .slice(0, 8)
  }, [publishRecords, traces])

  return (
    <div className="agent-os-page">
      <div className="agent-os-stack">
        <section className="agent-os-hero">
          <div className="agent-os-hero-top">
            <div>
              <div className="agent-os-kicker"><Sparkles size={14} /> Agent OS / Observability</div>
              <h1 className="agent-os-title">发布闭环观测台</h1>
              <p className="agent-os-subtitle">
                基于真实后端接口汇总 <code>AgentTrace</code> 与 <code>AgentPublishRecord</code>，用于验证 Agent Studio 发布后是否完成 SKILL 生成、Hermes 同步以及 Registry / Trace 回写。
              </p>
            </div>
            <div className="agent-os-actions">
              <button onClick={() => void loadData()} className="agent-os-button">
                <RefreshCw size={16} /> 刷新观测数据
              </button>
            </div>
          </div>

          <div className="agent-os-metrics agent-os-metrics-6">
            {[
              { label: 'Trace 总数', value: stats.traceTotal, note: '全量观测记录', icon: Activity },
              { label: 'Trace 成功', value: stats.successTraceCount, note: 'traceStatus=SUCCESS', icon: CheckCircle2 },
              { label: '运行中', value: stats.runningTraceCount, note: '等待闭环完成', icon: Clock3 },
              { label: 'Trace 失败', value: stats.failedTraceCount, note: '需进入明细排查', icon: XCircle },
              { label: '发布记录', value: stats.publishTotal, note: 'PublishRecord 总量', icon: Package },
              { label: '平均耗时', value: formatDuration(stats.averageDuration), note: '平均 Trace duration', icon: Workflow },
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
              <div className="agent-os-panel-title">筛选条件</div>
              <div className="agent-os-panel-desc">按定义、Trace 状态与发布状态查看闭环执行结果</div>
            </div>
            <div className="agent-os-actions">
              <select value={definitionId} onChange={e => setDefinitionId(e.target.value)} className="agent-os-select">
                <option value="">全部定义</option>
                {definitions.map(item => (
                  <option key={item.id} value={item.id}>{item.name} · {item.agentDefId}</option>
                ))}
              </select>
              <select value={traceStatus} onChange={e => setTraceStatus(e.target.value)} className="agent-os-select">
                <option value="ALL">全部 Trace 状态</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="RUNNING">RUNNING</option>
                <option value="FAILED">FAILED</option>
              </select>
              <select value={publishStatus} onChange={e => setPublishStatus(e.target.value)} className="agent-os-select">
                <option value="ALL">全部发布状态</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          </div>

          <div className="agent-os-split-note">
            <div className="agent-os-note-card">
              <div className="agent-os-metric-label">闭环路径</div>
              <div className="agent-os-subtitle" style={{ marginTop: 10, maxWidth: 'unset', fontSize: '0.9rem' }}>
                Agent Definition → SKILL.md 产物 → Hermes 发布 → Registry / Trace 回写
              </div>
            </div>
            <div className="agent-os-note-card">
              <div className="agent-os-metric-label">发布成功率</div>
              <div className="agent-os-metric-value">{stats.publishTotal > 0 ? `${Math.round((stats.successPublishCount / stats.publishTotal) * 100)}%` : '0%'}</div>
              <div className="agent-os-metric-note">成功 {stats.successPublishCount} / 失败 {stats.failedPublishCount}</div>
            </div>
            <div className="agent-os-note-card">
              <div className="agent-os-metric-label">Trace 完成率</div>
              <div className="agent-os-metric-value">{stats.traceTotal > 0 ? `${Math.round((stats.successTraceCount / stats.traceTotal) * 100)}%` : '0%'}</div>
              <div className="agent-os-metric-note">成功 {stats.successTraceCount} / 运行中 {stats.runningTraceCount} / 失败 {stats.failedTraceCount}</div>
            </div>
          </div>
        </section>

        <section className="agent-os-shell" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
          <div className="agent-os-panel">
            <div className="agent-os-panel-header">
              <div>
                <div className="agent-os-panel-title">Trace Stream</div>
                <div className="agent-os-panel-desc">左侧保留高密度运行轨迹，用于快速筛查发布闭环状态</div>
              </div>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            </div>

            {loading ? (
              <div className="agent-os-loading"><Loader2 size={18} className="animate-spin" /> 加载 Trace...</div>
            ) : traces.length === 0 ? (
              <div className="agent-os-empty">当前筛选条件下暂无 Trace 记录。</div>
            ) : (
              <div className="agent-os-table-wrap">
                <table className="agent-os-table">
                  <thead>
                    <tr>
                      <th>Trace</th>
                      <th>Definition</th>
                      <th>Status</th>
                      <th>关联</th>
                      <th>耗时</th>
                      <th>时间</th>
                      <th>结果</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traces.map(item => {
                      const definition = item.definitionId ? definitionMap.get(item.definitionId) : undefined
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="agent-os-table-title">{item.name || item.traceId}</div>
                            <div className="agent-os-table-subtitle">{item.traceId}</div>
                            <div className="agent-os-table-subtitle">{item.traceType ?? 'UNKNOWN'} · {item.agentId ?? '-'}</div>
                          </td>
                          <td>
                            {definition ? (
                              <>
                                <div className="agent-os-table-title">{definition.name}</div>
                                <div className="agent-os-table-subtitle">{definition.agentDefId}</div>
                              </>
                            ) : (item.definitionId ?? '-')}
                          </td>
                          <td><span className={`agent-os-status ${statusClass(item.traceStatus)}`}>{item.traceStatus ?? 'UNKNOWN'}</span></td>
                          <td>
                            <div>publishRecord: {item.publishRecordId ?? '-'}</div>
                            <div className="agent-os-table-subtitle">registry: {item.registryId ?? '-'}</div>
                          </td>
                          <td>{formatDuration(item.duration)}</td>
                          <td>
                            <div>start {formatDateTime(item.startAt ?? item.createAt)}</div>
                            <div className="agent-os-table-subtitle">end {formatDateTime(item.endAt)}</div>
                          </td>
                          <td>
                            <div>{compactText(item.result ?? item.taskDescription)}</div>
                            {item.errorMsg ? <div className="agent-os-table-subtitle">{compactText(item.errorMsg, 120)}</div> : null}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="agent-os-stack">
            <section className="agent-os-panel">
              <div className="agent-os-panel-header">
                <div>
                  <div className="agent-os-panel-title">Recent Timeline</div>
                  <div className="agent-os-panel-desc">最近 8 条 Trace / Publish 事件</div>
                </div>
                <GitBranch size={18} />
              </div>
              <div className="agent-os-timeline">
                {timeline.length === 0 ? (
                  <div className="agent-os-empty">暂无事件。</div>
                ) : timeline.map(item => (
                  <article key={item.id} className="agent-os-timeline-card">
                    <div className="agent-os-timeline-head">
                      <div>
                        <div className="agent-os-timeline-title">{item.title}</div>
                        <div className="agent-os-timeline-subtitle">{item.subtitle}</div>
                      </div>
                      <span className={`agent-os-status ${statusClass(item.status)}`}>{item.status}</span>
                    </div>
                    <div className="agent-os-kv">
                      <div><strong>detail:</strong> {item.detail}</div>
                      <div><strong>time:</strong> {formatDateTime(item.time)}</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="agent-os-panel">
              <div className="agent-os-panel-header">
                <div>
                  <div className="agent-os-panel-title">Publish Records</div>
                  <div className="agent-os-panel-desc">真实发布记录与产物元数据</div>
                </div>
                <Package size={18} />
              </div>
              <div className="agent-os-timeline">
                {loading ? (
                  <div className="agent-os-loading"><Loader2 size={18} className="animate-spin" /> 加载发布记录...</div>
                ) : publishRecords.length === 0 ? (
                  <div className="agent-os-empty">当前筛选条件下暂无发布记录。</div>
                ) : publishRecords.map(item => {
                  const definition = item.definitionId ? definitionMap.get(item.definitionId) : undefined
                  return (
                    <article key={item.id} className="agent-os-timeline-card">
                      <div className="agent-os-timeline-head">
                        <div>
                          <div className="agent-os-timeline-title">{definition?.name ?? `Definition #${item.definitionId ?? '-'}`}</div>
                          <div className="agent-os-timeline-subtitle">{item.skillId ?? '-'}</div>
                        </div>
                        <span className={`agent-os-status ${statusClass(item.publishStatus)}`}>{item.publishStatus ?? 'UNKNOWN'}</span>
                      </div>
                      <div className="agent-os-kv">
                        <div><strong>publisher:</strong> {item.publisherType ?? '-'}</div>
                        <div><strong>version:</strong> {item.definitionVersion ?? '-'}</div>
                        <div><strong>createdAt:</strong> {formatDateTime(item.createAt)}</div>
                        <div><strong>artifact:</strong> {item.artifactPath ?? '-'}</div>
                        <div><strong>checksum:</strong> {item.artifactChecksum ?? '-'}</div>
                        {item.errorMsg ? <div><strong>error:</strong> {item.errorMsg}</div> : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          </div>
        </section>

        <section className="agent-os-panel">
          <div className="agent-os-panel-header">
            <div>
              <div className="agent-os-panel-title">最小闭环验证清单</div>
              <div className="agent-os-panel-desc">发布成功后建议按照以下顺序完成人工核验</div>
            </div>
            <AlertCircle size={18} />
          </div>
          <div className="agent-os-checklist">
            {[
              '在 Agent Studio 中保存并发布 Definition。',
              '在当前页确认 PublishRecord 生成成功，artifactPath / skillId 已回写。',
              '在 Trace Stream 中确认 PUBLISH Trace 完成，且 publishRecordId / registryId 已关联。',
            ].map(item => (
              <div key={item} className="agent-os-check-item">{item}</div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

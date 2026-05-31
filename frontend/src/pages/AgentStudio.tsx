import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Archive, CheckCircle2, Clock3, Loader2, Play, RefreshCw, Save, Sparkles, Wand2 } from 'lucide-react'
import { AgentDefinition, AgentDefinitionPublishResult, agentApi } from '../lib/agentApi'

type FormState = {
  id?: number
  name: string
  agentDefId: string
  description: string
  behaviorDsl: string
  modelConfig: string
  businessRules: string
  skillIds: string
  version: string
}

const emptyForm: FormState = {
  name: '',
  agentDefId: '',
  description: '',
  behaviorDsl: '',
  modelConfig: '{"model":"gpt-5.4","temperature":0.3}',
  businessRules: '仅返回与营销业务相关、可执行、可审计的结果。',
  skillIds: 'arch-reviewer,style-checker',
  version: 'v1',
}

const publishTone: Record<string, string> = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  FAILED: 'failed',
  ARCHIVED: 'archived',
}

function metricNote(definition: AgentDefinition) {
  return `${definition.status ?? 'ACTIVE'} · ${definition.version ?? 'v1'}`
}

export default function AgentStudio() {
  const navigate = useNavigate()
  const [definitions, setDefinitions] = useState<AgentDefinition[]>([])
  const [selected, setSelected] = useState<AgentDefinition | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [publishingId, setPublishingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [lastPublishResult, setLastPublishResult] = useState<AgentDefinitionPublishResult | null>(null)

  const stats = useMemo(() => {
    const published = definitions.filter(item => item.publishStatus === 'PUBLISHED').length
    const draft = definitions.filter(item => item.publishStatus === 'DRAFT').length
    const failed = definitions.filter(item => item.publishStatus === 'FAILED').length
    return {
      total: definitions.length,
      published,
      draft,
      failed,
    }
  }, [definitions])

  async function loadDefinitions(keepSelection = true) {
    setLoading(true)
    setError('')
    try {
      const page = await agentApi.listDefinitions()
      setDefinitions(page.records)
      if (page.records.length === 0) {
        setSelected(null)
        setForm(emptyForm)
      } else if (keepSelection && selected) {
        const matched = page.records.find(item => item.id === selected.id) ?? page.records[0]
        selectDefinition(matched)
      } else {
        selectDefinition(page.records[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载 Agent 定义失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDefinitions(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function selectDefinition(definition: AgentDefinition | null) {
    setSelected(definition)
    if (!definition) {
      setForm(emptyForm)
      return
    }
    setForm({
      id: definition.id,
      name: definition.name,
      agentDefId: definition.agentDefId,
      description: definition.description ?? '',
      behaviorDsl: definition.behaviorDsl,
      modelConfig: definition.modelConfig ?? '',
      businessRules: definition.businessRules ?? '',
      skillIds: definition.skillIds ?? '',
      version: definition.version ?? 'v1',
    })
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      if (form.id) {
        await agentApi.updateDefinition(form)
        setMessage('Agent 定义已更新，状态已回到 DRAFT。')
      } else {
        await agentApi.createDefinition(form)
        setMessage('Agent 定义已创建。')
      }
      await loadDefinitions(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePublish(definitionId: number, retry = false) {
    setPublishingId(definitionId)
    setMessage('')
    setError('')
    try {
      const result = retry
        ? await agentApi.retryPublishDefinition(definitionId)
        : await agentApi.publishDefinition(definitionId, form.version)
      setLastPublishResult(result)
      setMessage(`发布成功：skillId=${result.skillId}`)
      await loadDefinitions()
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败')
    } finally {
      setPublishingId(null)
    }
  }

  async function handleArchive(definitionId: number) {
    setMessage('')
    setError('')
    try {
      await agentApi.archiveDefinition(definitionId)
      setMessage('Agent 定义已归档。')
      await loadDefinitions()
    } catch (err) {
      setError(err instanceof Error ? err.message : '归档失败')
    }
  }

  return (
    <div className="agent-os-page">
      <div className="agent-os-stack">
        <section className="agent-os-hero">
          <div className="agent-os-hero-top">
            <div>
              <div className="agent-os-kicker"><Sparkles size={14} /> Agent OS / Studio</div>
              <h1 className="agent-os-title">定义、发布、校验一体化工作台</h1>
              <p className="agent-os-subtitle">
                业务定义进入 Spring Boot 元数据内核后，自动生成 <code>SKILL.md</code>，同步 Hermes，随后回写 Registry 与 Trace。这个页面是最小业务闭环的起点。
              </p>
            </div>
            <div className="agent-os-actions">
              <button onClick={() => void loadDefinitions(false)} className="agent-os-button">
                <RefreshCw size={16} /> 刷新定义
              </button>
            </div>
          </div>

          <div className="agent-os-pillbar">
            <span className="agent-os-pill active">Definition</span>
            <span className="agent-os-pill">Publish</span>
            <span className="agent-os-pill">Registry</span>
            <span className="agent-os-pill">Trace</span>
          </div>

          <div className="agent-os-metrics">
            {[
              { label: '总定义数', value: stats.total, note: '当前 AgentDefinition 总量', icon: Wand2 },
              { label: '已发布', value: stats.published, note: 'publishStatus=PUBLISHED', icon: CheckCircle2 },
              { label: '草稿', value: stats.draft, note: '等待发布或变更后待确认', icon: Clock3 },
              { label: '发布失败', value: stats.failed, note: '建议进入 Observability 排查', icon: AlertCircle },
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
          <div className={`agent-os-alert ${error ? 'error' : 'success'}`}>
            {error || message}
          </div>
        )}

        <section className="agent-os-shell">
          <div className="agent-os-panel">
            <div className="agent-os-panel-header">
              <div>
                <div className="agent-os-panel-title">Definition 列表</div>
                <div className="agent-os-panel-desc">选中一个定义即可编辑、发布或归档</div>
              </div>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            </div>

            {loading ? (
              <div className="agent-os-loading"><Loader2 size={18} className="animate-spin" /> 加载 Definition...</div>
            ) : definitions.length === 0 ? (
              <div className="agent-os-empty">当前还没有 AgentDefinition，右侧表单可直接创建第一条。</div>
            ) : (
              <div className="agent-os-list">
                {definitions.map(definition => (
                  <button
                    key={definition.id}
                    onClick={() => selectDefinition(definition)}
                    className={`agent-os-list-card ${selected?.id === definition.id ? 'active' : ''}`}
                  >
                    <div className="agent-os-list-title-row">
                      <div>
                        <div className="agent-os-list-title">{definition.name}</div>
                        <div className="agent-os-list-subtitle">{definition.agentDefId}</div>
                      </div>
                      <span className={`agent-os-status ${publishTone[definition.publishStatus ?? 'DRAFT'] ?? 'draft'}`}>
                        {definition.publishStatus ?? 'DRAFT'}
                      </span>
                    </div>
                    <div className="agent-os-list-body">{definition.description || definition.behaviorDsl}</div>
                    <div className="agent-os-list-meta">
                      <span>{metricNote(definition)}</span>
                      <span>skills: {definition.skillIds || '-'}</span>
                      <span>last publish: {definition.lastPublishAt || '-'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="agent-os-panel">
            <div className="agent-os-panel-header">
              <div>
                <div className="agent-os-panel-title">Definition 编辑器</div>
                <div className="agent-os-panel-desc">编辑结构化源数据，再生成可执行 skill 产物</div>
              </div>
              <button
                onClick={() => {
                  setSelected(null)
                  setForm(emptyForm)
                  setLastPublishResult(null)
                }}
                className="agent-os-button ghost"
              >
                新建定义
              </button>
            </div>

            <div className="agent-os-form-grid">
              <div className="agent-os-field">
                <label>名称</label>
                <input className="agent-os-input" value={form.name} onChange={e => updateForm('name', e.target.value)} />
              </div>
              <div className="agent-os-field">
                <label>AgentDefId</label>
                <input className="agent-os-input mono" value={form.agentDefId} onChange={e => updateForm('agentDefId', e.target.value)} />
              </div>
              <div className="agent-os-field agent-os-form-span-2">
                <label>描述</label>
                <input className="agent-os-input" value={form.description} onChange={e => updateForm('description', e.target.value)} />
              </div>
              <div className="agent-os-field agent-os-form-span-2">
                <label>行为 DSL</label>
                <textarea className="agent-os-textarea" rows={6} value={form.behaviorDsl} onChange={e => updateForm('behaviorDsl', e.target.value)} />
              </div>
              <div className="agent-os-field agent-os-form-span-2">
                <label>模型配置 JSON</label>
                <textarea className="agent-os-textarea mono" rows={4} value={form.modelConfig} onChange={e => updateForm('modelConfig', e.target.value)} />
              </div>
              <div className="agent-os-field agent-os-form-span-2">
                <label>业务规则</label>
                <textarea className="agent-os-textarea" rows={3} value={form.businessRules} onChange={e => updateForm('businessRules', e.target.value)} />
              </div>
              <div className="agent-os-field">
                <label>技能列表</label>
                <input className="agent-os-input mono" value={form.skillIds} onChange={e => updateForm('skillIds', e.target.value)} />
              </div>
              <div className="agent-os-field">
                <label>版本号</label>
                <input className="agent-os-input mono" value={form.version} onChange={e => updateForm('version', e.target.value)} />
              </div>
            </div>

            <div className="agent-os-toolbar">
              <button onClick={() => void handleSave()} disabled={submitting} className="agent-os-button primary">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 保存定义
              </button>
              {selected?.id ? (
                <>
                  <button onClick={() => void handlePublish(selected.id)} disabled={publishingId === selected.id} className="agent-os-button success">
                    {publishingId === selected.id ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} 发布到 Hermes
                  </button>
                  <button onClick={() => void handlePublish(selected.id, true)} disabled={publishingId === selected.id} className="agent-os-button">
                    <RefreshCw size={16} /> 重试发布
                  </button>
                  <button onClick={() => void handleArchive(selected.id)} className="agent-os-button ghost">
                    <Archive size={16} /> 归档
                  </button>
                </>
              ) : null}
            </div>

            <div className="agent-os-grid-2" style={{ marginTop: 20 }}>
              <div className="agent-os-surface">
                <div className="agent-os-field-title">Skill Preview</div>
                <pre className="agent-os-pre">
{`---
name: ${form.agentDefId || 'agent-id'}-${form.version || 'v1'}
description: "${form.description || 'Generated from AgentDefinition'}"
version: ${form.version || 'v1'}
source: beukay-agent-studio
---

# Purpose
${form.description || '待补充描述'}

# Workflow
${form.behaviorDsl || '待补充行为 DSL'}

# Constraints
${form.businessRules || '待补充业务规则'}
`}
                </pre>
              </div>
              <div className="agent-os-surface">
                <div className="agent-os-field-title">Last Publish</div>
                {lastPublishResult ? (
                  <div className="agent-os-kv" style={{ marginTop: 12 }}>
                    <div><strong>publishRecordId:</strong> {lastPublishResult.publishRecordId}</div>
                    <div><strong>traceId:</strong> <span className="agent-os-code">{lastPublishResult.traceId}</span></div>
                    <div><strong>skillId:</strong> <span className="agent-os-code">{lastPublishResult.skillId}</span></div>
                    <div><strong>registryId:</strong> {lastPublishResult.agentRegistryId}</div>
                    <div><strong>status:</strong> {lastPublishResult.publishStatus}</div>
                    <div style={{ marginTop: 10 }}>
                      <button onClick={() => navigate('/ai-tracker')} className="agent-os-button success">
                        查看闭环观测
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="agent-os-muted" style={{ marginTop: 12, lineHeight: 1.8 }}>
                    发布后将在这里显示产物与追踪结果，并支持直接跳转到 Observability 页面完成闭环验证。
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { BookOpen, ChevronRight, FileText, Layers, Loader2, RefreshCw, Search, X } from 'lucide-react'
import { productionApi, ScriptBlueprintResult, ScriptBlueprintSection } from '../lib/agentApi'

// ── 常量 ──────────────────────────────────────────────────────────────
const PLATFORM_OPTIONS = ['', 'douyin', 'kuaishou', 'xiaohongshu', 'tiktok']
const GOAL_OPTIONS = ['', 'SEEDING', 'CONVERSION', 'AWARENESS']
const GOAL_LABEL: Record<string, string> = {
  SEEDING: '种草',
  CONVERSION: '转化',
  AWARENESS: '品牌曝光',
}
const PLATFORM_LABEL: Record<string, string> = {
  douyin: '抖音',
  kuaishou: '快手',
  xiaohongshu: '小红书',
  tiktok: 'TikTok',
}
const STAGE_COLOR: Record<string, string> = {
  HOOK: '#e8365d',
  PROBLEM: '#f97316',
  SOLUTION: '#22c55e',
  PROOF: '#3b82f6',
  CTA: '#a855f7',
}

// ── 工具 ──────────────────────────────────────────────────────────────
function fmtDate(dt?: string) {
  if (!dt) return '—'
  return dt.replace('T', ' ').slice(0, 16)
}

// ── 蓝图详情面板 ──────────────────────────────────────────────────────
function BlueprintDetail({
  blueprint,
  onClose,
}: {
  blueprint: ScriptBlueprintResult
  onClose: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 680,
          maxWidth: '95vw',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '28px 32px',
          gap: 20,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              {blueprint.blueprintCode}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {blueprint.recommendedTemplateName || '脚本蓝图'}
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {blueprint.marketingGoal && (
                <span className="badge" style={{ background: '#e8365d22', color: '#e8365d', border: '1px solid #e8365d44' }}>
                  {GOAL_LABEL[blueprint.marketingGoal] ?? blueprint.marketingGoal}
                </span>
              )}
              {blueprint.platform && (
                <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                  {PLATFORM_LABEL[blueprint.platform] ?? blueprint.platform}
                </span>
              )}
              {blueprint.marketingNode && (
                <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                  {blueprint.marketingNode}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 摘要 */}
        {blueprint.blueprintSummary && (
          <div style={{
            background: 'var(--bg-hover)',
            borderRadius: 10,
            padding: '14px 18px',
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            borderLeft: '3px solid #e8365d',
          }}>
            {blueprint.blueprintSummary}
          </div>
        )}

        {/* 模板推荐理由 */}
        {blueprint.recommendedTemplateReason && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              推荐理由
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {blueprint.recommendedTemplateReason}
            </div>
          </div>
        )}

        {/* 蓝图分段 */}
        {blueprint.sections && blueprint.sections.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              内容结构（{blueprint.sections.length} 段）
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {blueprint.sections.map((sec: ScriptBlueprintSection) => (
                <div
                  key={sec.sectionNo}
                  style={{
                    background: 'var(--bg-hover)',
                    borderRadius: 10,
                    padding: '14px 16px',
                    borderLeft: `3px solid ${STAGE_COLOR[sec.stageCode] ?? '#6b7280'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: STAGE_COLOR[sec.stageCode] ?? '#6b7280',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>
                      {sec.stageCode}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {sec.stageName}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                      第 {sec.sectionNo} 段
                    </span>
                  </div>
                  {sec.goal && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      目标：{sec.goal}
                    </div>
                  )}
                  {sec.semanticIntent && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.6 }}>
                      {sec.semanticIntent}
                    </div>
                  )}
                  {sec.narrationHint && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
                      旁白提示：{sec.narrationHint}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 元信息 */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          <span>SKU：{blueprint.skuId || '—'}</span>
          <span>创建时间：{fmtDate(blueprint.createAt)}</span>
        </div>
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────────
export default function KnowledgeBase() {
  const [items, setItems] = useState<ScriptBlueprintResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterGoal, setFilterGoal] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [selected, setSelected] = useState<ScriptBlueprintResult | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await productionApi.listBlueprints({
        marketingGoal: filterGoal || undefined,
        platform: filterPlatform || undefined,
        pageSize: 50,
      })
      setItems(res.records ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterGoal, filterPlatform])

  async function openDetail(bp: ScriptBlueprintResult) {
    // If sections already loaded (from detail fetch), skip
    if (bp.sections && bp.sections.length > 0) {
      setSelected(bp)
      return
    }
    setDetailLoading(true)
    try {
      const full = await productionApi.getBlueprint(bp.blueprintCode)
      setSelected(full)
    } catch {
      setSelected(bp)
    } finally {
      setDetailLoading(false)
    }
  }

  const filtered = items.filter(item => {
    if (!search) return true
    const txt = `${item.blueprintCode} ${item.skuId ?? ''} ${item.blueprintSummary ?? ''} ${item.recommendedTemplateName ?? ''}`.toLowerCase()
    return txt.includes(search.toLowerCase())
  })

  const stats = {
    total: items.length,
    seeding: items.filter(i => i.marketingGoal === 'SEEDING').length,
    conversion: items.filter(i => i.marketingGoal === 'CONVERSION').length,
    platforms: [...new Set(items.map(i => i.platform).filter(Boolean))].length,
  }

  return (
    <div className="page-content" style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* 标题 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <BookOpen size={20} color="#e8365d" />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            知识库
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4, fontWeight: 400 }}>
            脚本蓝图
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
          存储所有已生成的脚本蓝图，可查看内容结构与语义意图
        </p>
      </div>

      {/* 统计卡 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: '蓝图总数', value: stats.total, icon: <FileText size={14} /> },
          { label: '种草蓝图', value: stats.seeding, icon: <Layers size={14} /> },
          { label: '转化蓝图', value: stats.conversion, icon: <ChevronRight size={14} /> },
          { label: '覆盖平台', value: stats.platforms, icon: <BookOpen size={14} /> },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 }}>
              {s.icon} {s.label}
            </div>
            <div className="card-value" style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="搜索蓝图代码、商品、摘要…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={filterGoal}
          onChange={e => setFilterGoal(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <option value="">全部目标</option>
          {GOAL_OPTIONS.filter(Boolean).map(g => (
            <option key={g} value={g}>{GOAL_LABEL[g] ?? g}</option>
          ))}
        </select>
        <select
          value={filterPlatform}
          onChange={e => setFilterPlatform(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <option value="">全部平台</option>
          {PLATFORM_OPTIONS.filter(Boolean).map(p => (
            <option key={p} value={p}>{PLATFORM_LABEL[p] ?? p}</option>
          ))}
        </select>
        <button
          onClick={load}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} /> 刷新
        </button>
      </div>

      {/* 错误 */}
      {error && (
        <div style={{
          padding: '10px 16px',
          borderRadius: 8,
          background: '#fee2e2',
          color: '#dc2626',
          fontSize: 13,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* 列表 */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          {items.length === 0 ? '暂无蓝图数据，去 Agent Playground 生成第一条蓝图吧' : '无匹配结果'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.map(bp => (
            <div
              key={bp.blueprintCode}
              className="card"
              style={{ padding: '16px 20px', cursor: 'pointer', position: 'relative' }}
              onClick={() => openDetail(bp)}
            >
              {/* 右上角平台 */}
              {bp.platform && (
                <span style={{
                  position: 'absolute',
                  top: 12,
                  right: 14,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-hover)',
                  padding: '2px 7px',
                  borderRadius: 4,
                }}>
                  {PLATFORM_LABEL[bp.platform] ?? bp.platform}
                </span>
              )}

              {/* 蓝图代码 */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'monospace' }}>
                {bp.blueprintCode}
              </div>

              {/* 模板名 */}
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, paddingRight: 60, lineHeight: 1.4 }}>
                {bp.recommendedTemplateName || '脚本蓝图'}
              </div>

              {/* 标签 */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {bp.marketingGoal && (
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: '#e8365d22',
                    color: '#e8365d',
                    fontWeight: 600,
                  }}>
                    {GOAL_LABEL[bp.marketingGoal] ?? bp.marketingGoal}
                  </span>
                )}
                {bp.marketingNode && (
                  <span style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'var(--bg-hover)',
                    color: 'var(--text-muted)',
                  }}>
                    {bp.marketingNode}
                  </span>
                )}
              </div>

              {/* 摘要 */}
              {bp.blueprintSummary && (
                <div style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {bp.blueprintSummary}
                </div>
              )}

              {/* 底部 */}
              <div style={{
                marginTop: 12,
                paddingTop: 10,
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: 'var(--text-muted)',
              }}>
                <span>SKU: {bp.skuId || '—'}</span>
                <span>{fmtDate(bp.createAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 加载详情 overlay */}
      {detailLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.3)',
          zIndex: 999,
        }}>
          <Loader2 size={32} className="spin" color="#e8365d" />
        </div>
      )}

      {/* 详情抽屉 */}
      {selected && !detailLoading && (
        <BlueprintDetail blueprint={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

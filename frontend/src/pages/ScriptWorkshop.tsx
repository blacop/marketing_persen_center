import { useState, useEffect } from 'react'
import { FileText, Zap, TrendingUp, CheckCircle2, Loader2, AlertCircle, RotateCcw, Plus, Settings2, Layers, Sparkles, RefreshCw } from 'lucide-react'
import ModelBadge from '../components/ModelBadge'
import { productionApi, type ScriptBlueprintResult, type ContentStructureCard } from '../lib/agentApi'

/* ═══════════════════════════════════════════════════════════════
   种草脚本工坊 —— 飞轮第2环 · 脚本=种草蓝图
   ═══════════════════════════════════════════════════════════════ */

const WORKSHOP_TABS = ['脚本蓝图（live）', '结构卡（live）', '脚本·种草预埋', '投流优化模板', '质量·转化分析']

const kpiCards = [
  { label: '总脚本数', value: '14', sub: '跨 3 个产品', icon: <FileText size={18} />, color: '#e8365d' },
  { label: '已通过', value: '10', sub: '通过率 71%', icon: <CheckCircle2 size={18} />, color: '#22c55e' },
  { label: '生成中', value: '1', sub: 'ContentGPT执行中', icon: <Loader2 size={18} />, color: '#3b82f6' },
  { label: '需重生成', value: '1', sub: '质量分低于阈值', icon: <AlertCircle size={18} />, color: '#f59e0b' },
]

const products = [
  {
    id: 'p1', name: '唇釉丝绒系列', type: 'KOL种草', status: '脚本完成',
    passed: 6, total: 12, quality: 94.2, versions: 14, progress: 50,
    statusColor: '#22c55e',
    scripts: [
      { no: 'S01', title: '丝绒唇釉不掉色测评｜哑光感绝了', duration: '2:20', seed: 91, cvr: 88, ver: 'V2', status: '已通过', note: '开场节奏快，种草信息密度高' },
      { no: 'S02', title: '约会妆口红推荐｜这支唇釉太治愈', duration: '1:50', seed: 94, cvr: 90, ver: 'V1', status: '已通过', note: '场景感强，情感共鸣好' },
      { no: 'S03', title: '成分解析｜为什么这支唇釉这么显白', duration: '2:05', seed: 89, cvr: 85, ver: 'V3', status: '审核中', note: '待KOL确认口播' },
      { no: 'S04', title: '冬日穿搭配色｜唇色决定整体气质', duration: '2:30', seed: 93, cvr: 91, ver: 'V1', status: '已通过', note: '搭配场景延伸到位' },
      { no: 'S05', title: '新款色号首发体验', duration: '0:00', seed: 0, cvr: 0, ver: 'V-', status: '生成中', note: '-' },
    ],
  },
  {
    id: 'p2', name: '眼影盘星空', type: '小红书笔记', status: '生成中',
    passed: 3, total: 24, quality: 92.6, versions: 8, progress: 13,
    statusColor: '#3b82f6',
    scripts: [
      { no: 'S01', title: '星空眼影10种叠涂方法｜新手必看', duration: '2:30', seed: 88, cvr: 85, ver: 'V3', status: '已通过', note: '技巧铺垫略多，已精简' },
      { no: 'S02', title: '约会妆 vs 职场妆｜一盘眼影全搞定', duration: '2:15', seed: 93, cvr: 90, ver: 'V2', status: '已通过', note: '场景感明确，种草点到位' },
      { no: 'S03', title: '眼影盘成分解析｜为什么显色度这么高', duration: '2:00', seed: 95, cvr: 92, ver: 'V1', status: '已通过', note: '成分党内容节奏佳' },
      { no: 'S04', title: '眼影晕染零失误技巧｜素颜感出片', duration: '2:20', seed: 90, cvr: 88, ver: 'V2', status: '审核中', note: '待确认KOL真实使用场景' },
      { no: 'S05', title: '玫瑰金眼影日常通勤穿搭联动', duration: '0:00', seed: 0, cvr: 0, ver: 'V-', status: '生成中', note: '-' },
    ],
  },
  {
    id: 'p3', name: '粉底液水光', type: '短视频脚本', status: '生成中',
    passed: 1, total: 16, quality: 88.5, versions: 9, progress: 6,
    statusColor: '#3b82f6',
    scripts: [
      { no: 'S01', title: '粉底液持妆12h实测｜素人也能拍出玻璃肌', duration: '1:45', seed: 88, cvr: 85, ver: 'V1', status: '已通过', note: '持妆场景真实感强' },
      { no: 'S02', title: '水光感粉底上妆教程', duration: '0:00', seed: 0, cvr: 0, ver: 'V-', status: '生成中', note: '-' },
    ],
  },
]

const templateData = [
  { name: 'HOOK_PROBLEM_SOLUTION', desc: '痛点引入→产品解决→情感收尾', platform: '抖音/快手', score: 92, use: 38 },
  { name: 'BEAUTY_TUTORIAL_SEEDING', desc: '教程带货：手法讲解→卖点展示→转化', platform: '小红书', score: 89, use: 25 },
  { name: 'COMPARE_PROOF', desc: '对比验证：使用前后/竞品对比', platform: '全平台', score: 87, use: 19 },
  { name: 'SCENE_LIFESTYLE', desc: '生活场景植入：情境→产品→情感', platform: '小红书/抖音', score: 85, use: 14 },
  { name: 'INGREDIENT_SCIENCE', desc: '成分科普→专业背书→种草', platform: '小红书', score: 83, use: 11 },
]

const qualityTrend = [
  { week: 'W1', avg: 86 }, { week: 'W2', avg: 88 }, { week: 'W3', avg: 87 },
  { week: 'W4', avg: 91 }, { week: 'W5', avg: 90 }, { week: 'W6', avg: 94 },
]

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    '已通过': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    '审核中': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    '生成中': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    '脚本完成': { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
    '需重生成': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  }
  const s = map[status] || { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' }
  return (
    <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600, background: s.bg, color: s.color }}>
      {status}
    </span>
  )
}

export default function ScriptWorkshop() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<string>('p2')

  // ── live data state ──
  const [blueprints, setBlueprints] = useState<ScriptBlueprintResult[]>([])
  const [blueprintLoading, setBlueprintLoading] = useState(false)
  const [blueprintError, setBlueprintError] = useState<string | null>(null)
  const [expandedBlueprint, setExpandedBlueprint] = useState<string | null>(null)
  const [blueprintDetailMap, setBlueprintDetailMap] = useState<Record<string, ScriptBlueprintResult>>({})

  const toggleBlueprint = (code: string) => {
    if (expandedBlueprint === code) { setExpandedBlueprint(null); return }
    setExpandedBlueprint(code)
    if (!blueprintDetailMap[code]) {
      productionApi.getBlueprint(code)
        .then(d => setBlueprintDetailMap(m => ({ ...m, [code]: d })))
        .catch(() => {/* ignore — show summary fallback */})
    }
  }

  const [cards, setCards] = useState<ContentStructureCard[]>([])
  const [cardLoading, setCardLoading] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const loadBlueprints = () => {
    setBlueprintLoading(true)
    setBlueprintError(null)
    productionApi.listBlueprints({ pageSize: 30 })
      .then(r => setBlueprints(r.records ?? []))
      .catch(e => setBlueprintError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setBlueprintLoading(false))
  }

  const loadCards = () => {
    setCardLoading(true)
    setCardError(null)
    productionApi.listStructureCards({ pageSize: 30 })
      .then(r => setCards(r.records ?? []))
      .catch(e => setCardError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setCardLoading(false))
  }

  useEffect(() => {
    if (activeTab === 0 && blueprints.length === 0 && !blueprintLoading) loadBlueprints()
    if (activeTab === 1 && cards.length === 0 && !cardLoading) loadCards()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const selected = products.find(p => p.id === selectedProduct)

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>

      {/* ══ 页面标题 ══ */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          <FileText size={22} style={{ marginRight: 8, verticalAlign: 'middle', color: '#e8365d' }} />
          种草脚本工坊
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {['飞轮第2环', '脚本=种草蓝图', 'KOL Brief+小红书笔记+短视频脚本', '种草钩子设计直接决定广告效果', '投放数据反哺模板优化'].map(tag => (
            <span key={tag} style={{ fontSize: '0.7rem', padding: '2px 10px', borderRadius: 99, background: 'rgba(232,54,93,0.08)', color: '#e8365d', fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* ══ 底层模型 ══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="ContentQuality-Scorer" color="#e8365d" />
        <ModelBadge name="多语言内容生成" color="#8b5cf6" />
        <ModelBadge name="ContentLLM-Beauty" color="#e8365d" />
      </div>

      {/* ══ KPI Cards ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpiCards.map(card => (
          <div key={card.label} style={{
            background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)',
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>{card.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ Tabs ══ */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22, borderBottom: '1px solid var(--border-light)', paddingBottom: 0 }}>
        {WORKSHOP_TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            padding: '8px 20px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
            background: activeTab === i ? '#e8365d' : 'transparent',
            color: activeTab === i ? '#fff' : 'var(--text-muted)',
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* ══ Tab 0: 脚本蓝图（live） ══ */}
      {activeTab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)',
            padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={15} color="#8b5cf6" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>脚本蓝图（实时）</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {blueprintLoading ? '加载中…' : `共 ${blueprints.length} 条 · 来自 /scriptBlueprint/list`}
              </span>
            </div>
            <button onClick={loadBlueprints} disabled={blueprintLoading} style={outlineBtn}>
              <RefreshCw size={13} style={{ marginRight: 4 }} />刷新
            </button>
          </div>

          {blueprintError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: '0.75rem', color: '#ef4444' }}>
              ⚠️ {blueprintError}
            </div>
          )}

          {!blueprintLoading && blueprints.length === 0 && !blueprintError && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', background: 'var(--bg-card)', borderRadius: 12, border: '1px dashed var(--border-light)' }}>
              暂无脚本蓝图。可在 BeukayClaw 对话中说："为 SEED_CUSHION_2 生成脚本蓝图"。
            </div>
          )}

          {blueprints.map(bp => {
            const expanded = expandedBlueprint === bp.blueprintCode
            const detail = blueprintDetailMap[bp.blueprintCode] ?? bp
            return (
              <div key={bp.blueprintCode} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <div onClick={() => toggleBlueprint(bp.blueprintCode)}
                  style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 80px', gap: 12, padding: '14px 18px', cursor: 'pointer', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{bp.recommendedTemplateName || '—'}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{bp.blueprintCode}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>SKU</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{bp.skuId || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>平台 / 营销节点</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{bp.platform || '—'} · {bp.marketingNode || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>段落 / 创建时间</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{detail.sections?.length ?? 0} 段 · {detail.createAt?.slice(0, 10) ?? '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.65rem', color: '#8b5cf6', fontWeight: 700 }}>{expanded ? '收起 ▲' : '展开 ▼'}</span>
                  </div>
                </div>
                {expanded && (
                  <div style={{ padding: '0 18px 16px', borderTop: '1px solid var(--border-light)' }}>
                    {detail.recommendedTemplateReason && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '12px 0 8px' }}>
                        <strong style={{ color: '#e8365d' }}>推荐理由：</strong>{detail.recommendedTemplateReason}
                      </div>
                    )}
                    {detail.blueprintSummary && (
                      <div style={{ fontSize: '0.74rem', lineHeight: 1.6, color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: 8, marginBottom: 10 }}>
                        {detail.blueprintSummary}
                      </div>
                    )}
                    {!detail.sections && !blueprintDetailMap[bp.blueprintCode] && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '10px 0' }}>加载详情中…</div>
                    )}
                    {detail.sections?.map(s => (
                      <div key={s.sectionNo} style={{ padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>{s.sectionNo}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>{s.stageName}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.stageCode}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: 26, marginBottom: 3 }}>{s.semanticIntent}</div>
                        {s.narrationHint && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic', marginLeft: 26 }}>「{s.narrationHint}」</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ══ Tab 1: 结构卡（live） ══ */}
      {activeTab === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)',
            padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={15} color="#22c55e" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>内容结构卡（实时）</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {cardLoading ? '加载中…' : `共 ${cards.length} 条 · 来自 /contentStructureCard/listPage`}
              </span>
            </div>
            <button onClick={loadCards} disabled={cardLoading} style={outlineBtn}>
              <RefreshCw size={13} style={{ marginRight: 4 }} />刷新
            </button>
          </div>

          {cardError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: '0.75rem', color: '#ef4444' }}>
              ⚠️ {cardError}
            </div>
          )}

          {!cardLoading && cards.length === 0 && !cardError && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', background: 'var(--bg-card)', borderRadius: 12, border: '1px dashed var(--border-light)' }}>
              暂无结构卡。可调用 /contentStructureCard/generate 或在 BeukayClaw 对话中触发结构卡生成。
            </div>
          )}

          {cards.map(c => {
            const cardKey = c.cardId ?? String(c.id ?? Math.random())
            const expanded = expandedCard === cardKey
            return (
              <div key={cardKey} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <div onClick={() => setExpandedCard(expanded ? null : cardKey)}
                  style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 80px', gap: 12, padding: '14px 18px', cursor: 'pointer', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{c.openingHook ?? c.hookType ?? '—'}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c.cardId ?? '—'} · {c.cardVersion ?? ''}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>SKU / 受众</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{c.skuId || '—'} · {c.targetAudience || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>营销节点 / 时长</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{c.marketingNode || '—'} · {c.videoDurationSec ? `${c.videoDurationSec}s` : '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>状态 / 创建时间</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{statusBadge(c.status ?? '—')} {c.createAt?.slice(0, 10) ?? ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 700 }}>{expanded ? '收起 ▲' : '展开 ▼'}</span>
                  </div>
                </div>
                {expanded && (
                  <div style={{ padding: '12px 18px 16px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {c.patternRankTop1 && (
                      <div style={{ fontSize: '0.72rem' }}>
                        <strong style={{ color: '#e8365d' }}>Top1 模式：</strong>{c.patternRankTop1}
                      </div>
                    )}
                    {c.referenceVideoId && (
                      <div style={{ fontSize: '0.72rem' }}>
                        <strong style={{ color: '#3b82f6' }}>参考视频：</strong><span style={{ fontFamily: 'monospace' }}>{c.referenceVideoId}</span>
                      </div>
                    )}
                    {c.cardJson && (
                      <pre style={{ fontSize: '0.65rem', background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: 8, margin: 0, maxHeight: 220, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {(() => { try { return JSON.stringify(JSON.parse(c.cardJson), null, 2) } catch { return c.cardJson } })()}
                      </pre>
                    )}
                    {c.logicTrace && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <strong>决策依据：</strong>{c.logicTrace}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ══ Tab 2: 脚本·种草预埋 ══ */}
      {activeTab === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>

          {/* 左侧产品列表 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {products.map(p => (
              <div key={p.id} onClick={() => setSelectedProduct(p.id)}
                style={{
                  background: 'var(--bg-card)', borderRadius: 14,
                  border: selectedProduct === p.id ? '2px solid #e8365d' : '1px solid var(--border-light)',
                  padding: '16px 18px', cursor: 'pointer', transition: 'all 0.18s',
                  boxShadow: selectedProduct === p.id ? '0 4px 16px rgba(232,54,93,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.type}</div>
                  </div>
                  {statusBadge(p.status)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                  {p.passed}/{p.total} 个已通过 · 平均质量 {p.quality} · 累计 {p.versions} 个版本
                </div>
                {/* Progress bar */}
                <div style={{ marginBottom: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>脚本进度</span>
                    <span style={{ fontWeight: 700, color: '#e8365d' }}>{p.progress}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-primary)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#e8365d,#ff7a95)', width: `${p.progress}%`, transition: 'width 0.4s' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 右侧脚本明细 */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
            {selected ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selected.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{selected.type} · {selected.scripts.length} 个脚本</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={outlineBtn}><RotateCcw size={13} style={{ marginRight: 4 }} />批量重生成</button>
                    <button style={outlineBtn}><Settings2 size={13} style={{ marginRight: 4 }} />模板参数</button>
                    <button style={{ ...outlineBtn, background: '#e8365d', color: '#fff', borderColor: '#e8365d' }}>
                      <Plus size={13} style={{ marginRight: 4 }} />生成新脚本
                    </button>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                        {['编号', '标题', '时长', '种草分', '转化分', '版本', '状态', '备注'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.scripts.map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={tdS}><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#e8365d' }}>{s.no}</span></td>
                          <td style={{ ...tdS, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</td>
                          <td style={tdS}>{s.duration}</td>
                          <td style={tdS}>
                            {s.seed > 0 ? <span style={{ fontWeight: 700, color: s.seed >= 90 ? '#22c55e' : '#f59e0b' }}>{s.seed}</span> : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                          </td>
                          <td style={tdS}>
                            {s.cvr > 0 ? <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{s.cvr}</span> : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                          </td>
                          <td style={tdS}>
                            <span style={{ padding: '1px 7px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(232,54,93,0.10)', color: '#e8365d' }}>{s.ver}</span>
                          </td>
                          <td style={tdS}>{statusBadge(s.status)}</td>
                          <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: '0.7rem' }}>{s.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                选择左侧产品查看脚本明细
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ Tab 3: 投流优化模板 ══ */}
      {activeTab === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              <Zap size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#e8365d' }} />
              种草模板库 · 按转化效果排序
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {templateData.map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderRadius: 10, border: '1px solid var(--border-light)', background: 'var(--bg-primary)',
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e8365d40' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#e8365d15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#e8365d' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{t.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                  </div>
                  <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600, background: 'rgba(59,130,246,0.10)', color: '#3b82f6' }}>{t.platform}</span>
                  <div style={{ textAlign: 'right', minWidth: 60 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: t.score >= 90 ? '#22c55e' : '#f59e0b' }}>{t.score}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>效果评分</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 50 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.use}次</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>使用次数</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { label: '模板平均效果', value: '89.2分', delta: '+3.1', up: true, color: '#22c55e' },
              { label: '最高使用模板', value: 'HOOK_PROBLEM', delta: '38次', up: true, color: '#e8365d' },
              { label: '本周新增模板', value: '2个', delta: '+2', up: true, color: '#3b82f6' },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '16px 18px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.value}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: m.color }}>{m.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ Tab 4: 质量·转化分析 ══ */}
      {activeTab === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { label: '平均种草分', value: '91.8', delta: '+2.4', up: true },
              { label: '平均转化分', value: '88.5', delta: '+1.8', up: true },
              { label: '一次过审率', value: '64%', delta: '+8%', up: true },
              { label: '平均迭代轮次', value: '2.1轮', delta: '-0.3', up: true },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '16px 18px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.value}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: m.up ? '#22c55e' : '#ef4444' }}>{m.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle', color: '#e8365d' }} />
              质量评分趋势（近6周）
            </h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120, padding: '0 8px' }}>
              {qualityTrend.map(d => (
                <div key={d.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#e8365d' }}>{d.avg}</span>
                  <div style={{ width: '100%', background: `linear-gradient(0deg,#e8365d,#ff7a95)`, borderRadius: '4px 4px 0 0', height: `${(d.avg - 80) * 8}px`, transition: 'height 0.3s' }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.week}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', padding: '20px 24px' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px 0' }}>审核问题分布</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '种草点不够密集', count: 8, pct: 40, color: '#e8365d' },
                { label: 'KOL口播与产品不符', count: 5, pct: 25, color: '#f59e0b' },
                { label: '开场吸引力不足', count: 4, pct: 20, color: '#3b82f6' },
                { label: '转化话术生硬', count: 3, pct: 15, color: '#8b5cf6' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.color }}>{item.count}次</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-primary)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: item.color, width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const outlineBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 8,
  border: '1px solid var(--border-light)', background: 'var(--bg-primary)',
  color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
}

const tdS: React.CSSProperties = {
  padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '0.76rem',
}

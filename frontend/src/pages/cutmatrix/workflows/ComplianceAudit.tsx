import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, Clipboard, ShieldCheck, ShieldAlert, AlertTriangle,
  Loader, CheckCircle2, X, Copy, Check,
} from 'lucide-react'
import { cmRemote, type ComplianceAuditResult } from '../../../lib/cm/cmApi'

// ─── 风险类型颜色 ─────────────────────────────────────────────────────────────

const RISK_TYPE_COLORS: Record<string, string> = {
  '极限词':   '#ef4444',
  '医疗暗示': '#dc2626',
  '虚假承诺': '#f97316',
  '比较广告': '#eab308',
  '数据无据': '#a855f7',
  '涉政敏感': '#7c2d12',
  '其他':     '#94a3b8',
}

const LEVEL_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  high:    { label: '高风险', color: '#dc2626', bg: 'rgba(239,68,68,0.12)' },
  medium:  { label: '中风险', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  low:     { label: '低风险', color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  safe:    { label: '安全',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  unknown: { label: '未知',   color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
}

const CATEGORIES = [
  { key: 'general', label: '通用' },
  { key: 'beauty',  label: '美妆护肤' },
]

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function ComplianceAudit() {
  const nav = useNavigate()

  const [text, setText] = useState('')
  const [category, setCategory] = useState('general')
  const [auditing, setAuditing] = useState(false)
  const [result, setResult] = useState<ComplianceAuditResult | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const MAX_CHARS = 5000

  const onFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const f = files[0]
    if (!f.type.startsWith('text/') && !f.name.match(/\.(txt|md|srt|vtt)$/i)) {
      setErr('仅支持 .txt / .md / .srt / .vtt 文本文件')
      return
    }
    try {
      const content = await f.text()
      setText(content.slice(0, MAX_CHARS))
      setErr(null)
    } catch (e) {
      setErr('读取文件失败：' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const pasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText()
      setText(t.slice(0, MAX_CHARS))
    } catch { /* ignore */ }
  }

  const submit = async () => {
    if (!text.trim()) { setErr('请输入或上传待审核文案'); return }
    setAuditing(true); setErr(null); setResult(null)
    try {
      const r = await cmRemote.complianceAudit({ text: text.trim(), category })
      if (r.status === 'SUCCEEDED') {
        setResult(r)
      } else {
        setErr(r.errMsg ?? '审核失败')
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : '审核失败')
    } finally {
      setAuditing(false)
    }
  }

  const reset = () => {
    setText('')
    setResult(null)
    setErr(null)
  }

  // 把原文按 risks[].idx 高亮
  const renderHighlightedText = () => {
    if (!result || !text) return null
    const sentences = splitSentences(text)
    const riskMap = new Map<number, ComplianceAuditResult['risks'][number]>()
    ;(result.risks ?? []).forEach(r => { if (r.idx) riskMap.set(r.idx, r) })

    return sentences.map((s, i) => {
      const risk = riskMap.get(i + 1)
      if (!risk) {
        return <span key={i} style={{ color: 'var(--text-secondary)' }}>{s}</span>
      }
      const lvl = LEVEL_LABELS[risk.level ?? 'low'] ?? LEVEL_LABELS.low
      return (
        <span key={i} style={{
          background: lvl.bg, padding: '2px 4px', borderRadius: 4,
          borderBottom: `2px solid ${lvl.color}`, color: lvl.color, fontWeight: 600,
        }} title={`${risk.riskType} · ${lvl.label}：${risk.violation}`}>
          {s}
        </span>
      )
    })
  }

  return (
    <div style={{ padding: '20px 28px', maxWidth: 1400, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix')} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录
      </button>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={20} color="#14b8a6" /> 话术合规审核
          <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontWeight: 700 }}>
            DashScope Qwen-Plus
          </span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
          上传或粘贴营销文案，依据《广告法》《化妆品监督管理条例》等扫描违规风险，标记风险句并生成修改建议。
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* 输入区 */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>待审核文案</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => fileInputRef.current?.click()} style={S.btnGhost}>
                <Upload size={11} style={{ marginRight: 4 }} />上传文件
              </button>
              <input ref={fileInputRef} type="file" accept=".txt,.md,.srt,.vtt,text/*" style={{ display: 'none' }} onChange={e => onFile(e.target.files)} />
              <button onClick={pasteFromClipboard} style={S.btnGhost}>
                <Clipboard size={11} style={{ marginRight: 4 }} />粘贴
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="把营销文案粘贴到这里。支持口播文案、商品描述、广告语、直播话术等。"
            style={S.textarea}
            rows={14}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span>{text.length} / {MAX_CHARS} 字</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>场景：</span>
              <select value={category} onChange={e => setCategory(e.target.value)} style={S.select}>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {err && (
            <div style={{ ...S.errBox, marginTop: 10 }}>
              <AlertTriangle size={13} />{err}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
            {result && <button onClick={reset} style={S.btnGhost}>重新输入</button>}
            <button
              onClick={submit}
              disabled={auditing || !text.trim()}
              style={{ ...S.btnPrimary, opacity: auditing || !text.trim() ? 0.5 : 1, gap: 5 }}
            >
              {auditing
                ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />扫描中…</>
                : <><ShieldCheck size={13} />开始合规扫描</>}
            </button>
          </div>
        </div>

        {/* 结果区 */}
        {result && (
          <div style={S.card}>
            {/* 总体结论 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <OverallBadge risk={result.overallRisk} />
              <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {result.summary}
              </div>
            </div>

            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              {result.provider} · {result.elapsedMs}ms · 命中 {(result.risks ?? []).length} 个风险句
            </div>

            {/* 修改前 / 修改后 全文对照 */}
            <BeforeAfterPanel text={text} risks={result.risks ?? []} renderHighlight={renderHighlightedText} />

            {/* 风险列表 */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
                逐句详情
              </div>
              {(result.risks ?? []).length === 0 ? (
                <div style={{ ...S.successBox, padding: '12px 14px' }}>
                  <CheckCircle2 size={14} />未检出违规风险，文案合规。
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflow: 'auto' }}>
                  {(result.risks ?? []).map((r, i) => <RiskCard key={i} risk={r} />)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── 总体徽章 ────────────────────────────────────────────────────────────────

function OverallBadge({ risk }: { risk?: string }) {
  const cfg = LEVEL_LABELS[risk ?? 'safe'] ?? LEVEL_LABELS.unknown
  const Icon = risk === 'safe' ? ShieldCheck : ShieldAlert
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 14px', borderRadius: 8,
      background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: '0.86rem',
      border: `1px solid ${cfg.color}33`, whiteSpace: 'nowrap',
    }}>
      <Icon size={16} />
      {cfg.label}
    </div>
  )
}

// ─── 修改前/修改后 全文对照 ──────────────────────────────────────────────────

function BeforeAfterPanel({ text, risks, renderHighlight }: {
  text: string
  risks: NonNullable<ComplianceAuditResult['risks']>
  renderHighlight: () => React.ReactNode
}) {
  const [copied, setCopied] = useState(false)

  // 按 idx → suggestion 映射，逐句替换原文
  const rewritten = (() => {
    if (!text) return ''
    const sentences = splitSentences(text)
    const map = new Map<number, string>()
    risks.forEach(r => { if (r.idx && r.suggestion) map.set(r.idx, r.suggestion) })
    return sentences.map((s, i) => map.get(i + 1) ?? s).join('')
  })()

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(rewritten)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
      {/* 修改前 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626' }}>修改前</span>
          <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>风险句已高亮</span>
        </div>
        <div style={{
          background: 'rgba(239,68,68,0.04)', borderRadius: 8,
          border: '1px solid rgba(239,68,68,0.2)',
          padding: '12px 14px',
          fontSize: '0.84rem', lineHeight: 2, wordBreak: 'break-all',
          minHeight: 120, maxHeight: 220, overflow: 'auto',
        }}>
          {renderHighlight()}
        </div>
      </div>

      {/* 修改后 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0d9488' }}>修改后</span>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>已应用全部修改建议</span>
          </div>
          {risks.length > 0 && (
            <button onClick={copyAll} style={{ ...S.btnGhost, padding: '3px 10px', fontSize: '0.7rem', gap: 4 }}>
              {copied ? <><Check size={11} color="#22c55e" />已复制</> : <><Copy size={11} />复制全文</>}
            </button>
          )}
        </div>
        <div style={{
          background: 'rgba(20,184,166,0.04)', borderRadius: 8,
          border: '1px solid rgba(20,184,166,0.25)',
          padding: '12px 14px',
          fontSize: '0.84rem', lineHeight: 2, wordBreak: 'break-all',
          minHeight: 120, maxHeight: 220, overflow: 'auto',
          color: 'var(--text-primary)',
        }}>
          {risks.length === 0 ? (
            <span style={{ color: '#16a34a' }}>{text || '（无变化）'}</span>
          ) : rewritten ? (
            renderRewrittenWithHighlight(text, rewritten, risks)
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>无修改建议</span>
          )}
        </div>
      </div>
    </div>
  )
}

/** 修改后视图：被替换的句子用青绿色加粗显示，未变的句子保持原色 */
function renderRewrittenWithHighlight(
  original: string,
  _rewritten: string,
  risks: NonNullable<ComplianceAuditResult['risks']>,
): React.ReactNode {
  const sentences = splitSentences(original)
  const map = new Map<number, string>()
  risks.forEach(r => { if (r.idx && r.suggestion) map.set(r.idx, r.suggestion) })

  return sentences.map((s, i) => {
    const sug = map.get(i + 1)
    if (!sug) {
      return <span key={i}>{s}</span>
    }
    return (
      <span key={i} style={{
        background: 'rgba(20,184,166,0.10)',
        color: '#0d9488', fontWeight: 600,
        borderBottom: '2px solid #0d9488', padding: '1px 3px',
        borderRadius: 3, marginRight: 1,
      }}>
        {sug}
      </span>
    )
  })
}

// ─── 风险卡片 ────────────────────────────────────────────────────────────────

function RiskCard({ risk }: { risk: ComplianceAuditResult['risks'][number] }) {
  const [copied, setCopied] = useState(false)
  const lvl = LEVEL_LABELS[risk.level ?? 'low'] ?? LEVEL_LABELS.low
  const typeColor = RISK_TYPE_COLORS[risk.riskType ?? '其他'] ?? '#94a3b8'

  const copySuggestion = async () => {
    if (!risk.suggestion) return
    try {
      await navigator.clipboard.writeText(risk.suggestion)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <div style={{
      border: `1px solid ${typeColor}40`,
      borderLeft: `4px solid ${typeColor}`,
      borderRadius: 7, padding: '10px 12px',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{risk.idx ?? '?'}</span>
        <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: 99, background: typeColor + '20', color: typeColor, fontWeight: 600 }}>
          {risk.riskType}
        </span>
        <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: 99, background: lvl.bg, color: lvl.color, fontWeight: 600 }}>
          {lvl.label}
        </span>
        {risk.violation && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            命中：<code style={{ ...S.code, color: typeColor }}>{risk.violation}</code>
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8, fontSize: '0.78rem', lineHeight: 1.7 }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>原句：</span>
        <span style={{ color: typeColor }}>{risk.text}</span>

        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>建议：</span>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <span style={{ flex: 1, color: '#0d9488', fontWeight: 500 }}>{risk.suggestion}</span>
          {risk.suggestion && (
            <button onClick={copySuggestion} style={S.iconBtn} title="复制建议">
              {copied ? <Check size={11} color="#22c55e" /> : <Copy size={11} />}
            </button>
          )}
        </div>

        {risk.regulation && (
          <>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>依据：</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{risk.regulation}</span>
          </>
        )}
      </div>
    </div>
  )
}

// ─── 工具：本地按句切分（与后端对齐） ────────────────────────────────────────

function splitSentences(text: string): string[] {
  const out: string[] = []
  let cur = ''
  for (const c of text) {
    cur += c
    if ('。！？!?'.includes(c)) {
      const s = cur.trim()
      if (s) out.push(s)
      cur = ''
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

// ─── 样式 ─────────────────────────────────────────────────────────────────────

const S = {
  backBtn:    { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  card:       { background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: 16 } as React.CSSProperties,
  textarea:   { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.84rem', resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', lineHeight: 1.7 } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', padding: '8px 16px', borderRadius: 8, border: 'none', background: '#14b8a6', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnGhost:   { display: 'inline-flex', alignItems: 'center', padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  iconBtn:    { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 4, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 } as React.CSSProperties,
  select:     { padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.74rem', outline: 'none', cursor: 'pointer' } as React.CSSProperties,
  errBox:     { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' } as React.CSSProperties,
  successBox: { display: 'flex', alignItems: 'center', gap: 6, borderRadius: 7, fontSize: '0.78rem', background: 'rgba(34,197,94,0.08)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' } as React.CSSProperties,
  code:       { padding: '0 4px', borderRadius: 3, background: 'rgba(0,0,0,0.05)', fontFamily: 'monospace', fontSize: '0.7rem' } as React.CSSProperties,
}

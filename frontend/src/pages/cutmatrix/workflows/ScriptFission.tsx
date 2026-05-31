import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Clipboard, Loader, AlertCircle, Plus, Trash2, ChevronRight,
  Sparkles, X, Link as LinkIcon, ShieldCheck, ShieldAlert, RotateCcw, CheckCircle2,
} from 'lucide-react'
import { cmRemote } from '../../../lib/cm/cmApi'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Shot {
  id: string
  name: string
  content: string
}

type StepNum = 1 | 2 | 3 | 4

function uid() { return `sh-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }

/** 与后端 CmComplianceService.splitSentences() 对齐：按 [。！？!?] 切句 */
function splitSentencesLocal(text: string): string[] {
  const out: string[] = []
  let cur = ''
  for (const c of text) {
    cur += c
    if ('。！？!?'.includes(c)) {
      const s = cur.trim()
      if (s) out.push(cur)  // 保留尾标点 + 不 trim 防止重组丢空格
      cur = ''
    }
  }
  if (cur) out.push(cur)
  return out
}

// ─── 文案分解：按句子标点切分 ─────────────────────────────────────────────────

function decomposeText(text: string): Shot[] {
  const sentences = text
    .split(/(?<=[。！？…]+)/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
  return sentences.map((content, i) => ({
    id: uid(),
    name: `分镜${i + 1}`,
    content,
  }))
}

// ─── Mock 裂变（后端上线前的占位） ────────────────────────────────────────────

const MOCK_PREFIXES  = ['', '说真的，', '不得不说，', '亲测有效，', '用过才知道，', '真的绝了，']
const MOCK_SUFFIXES  = ['', '超好用！', '强烈推荐。', '真的很不错。', '一用就爱上。', '太绝了！']
const COLLOQUIAL_MAP: [RegExp, string][] = [
  [/非常/g, '超级'], [/很/g, '贼'], [/可以/g, '能'], [/好用/g, '好使'],
  [/推荐/g, '安利'], [/真的/g, '确实'], [/特别/g, '超'],
]

function mockVariant(content: string, vIdx: number): string {
  const bare = content.replace(/[。！？…\.]+$/, '')
  if (vIdx === 0) return content
  if (vIdx % 3 === 1) {
    const p = MOCK_PREFIXES[vIdx % MOCK_PREFIXES.length]
    const s = MOCK_SUFFIXES[vIdx % MOCK_SUFFIXES.length]
    return `${p}${bare}，${s}`
  }
  let v = content
  for (const [re, rep] of COLLOQUIAL_MAP) v = v.replace(re, rep)
  return v
}

async function apiFission(
  title: string,
  shots: Shot[],
  count: number,
): Promise<string[][]> {
  try {
    const res = await cmRemote.scriptFission({
      title,
      shots: shots.map(s => ({ name: s.name, content: s.content })),
      count,
    })
    if (res.matrix && res.matrix.length > 0) return res.matrix
  } catch (e) {
    console.warn('[ScriptFission] backend failed, fallback to mock:', e)
  }
  // 兜底 mock
  await new Promise(res => setTimeout(res, 800))
  return shots.map(shot => Array.from({ length: count }, (_, i) => mockVariant(shot.content, i)))
}

// ─── 步骤指示器 ───────────────────────────────────────────────────────────────

const STEP_LABELS = ['导入文案', '拆解文案', '设置裂变参数', '裂变文案']

function StepBar({ current }: { current: StepNum }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, userSelect: 'none' }}>
      {STEP_LABELS.map((label, i) => {
        const n = (i + 1) as StepNum
        const active = n === current
        const done = n < current
        const color = active ? '#14b8a6' : done ? '#14b8a6' : '#cbd5e1'
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: active || done ? '#14b8a6' : 'transparent', border: `2px solid ${color}`, color: active || done ? '#fff' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                {n}
              </div>
              <span style={{ fontSize: '0.72rem', color: active ? '#14b8a6' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ width: 56, height: 2, background: done ? '#14b8a6' : '#e2e8f0', margin: '0 6px', marginBottom: 16, flexShrink: 0 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ScriptFission() {
  const nav = useNavigate()
  const loc = useLocation()
  const locState = loc.state as { captionText?: string; title?: string } | null

  const [step, setStep] = useState<StepNum>(1)

  // Step 1
  const [rawText, setRawText] = useState(locState?.captionText ?? '')
  const MAX_CHARS = 3500

  // Step 2
  const [docTitle, setDocTitle] = useState(locState?.title ?? '')
  const [shots, setShots] = useState<Shot[]>([])
  const contentRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Step 3
  const [count, setCount] = useState(3)
  const MAX_COUNT = 20
  const [generating, setGenerating] = useState(false)
  const [genErr, setGenErr] = useState<string | null>(null)

  // Step 4
  const [matrix, setMatrix] = useState<string[][]>([]) // [shotIdx][versionIdx]

  // 拆解 loading + provider 提示
  const [decomposing, setDecomposing] = useState(false)
  const [decomposeInfo, setDecomposeInfo] = useState<string | null>(null)

  // AI 文案调整 modal
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustUrl, setAdjustUrl] = useState('')
  const [adjustInstruction, setAdjustInstruction] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [adjustErr, setAdjustErr] = useState<string | null>(null)
  const [adjustInfo, setAdjustInfo] = useState<string | null>(null)
  const [adjustProductSummary, setAdjustProductSummary] = useState<string | null>(null)

  // 合规检测
  type ComplianceFix = { idx: number; before: string; after: string; riskType?: string; level?: string; violation?: string; regulation?: string }
  const [complianceLoading, setComplianceLoading] = useState(false)
  const [complianceErr, setComplianceErr] = useState<string | null>(null)
  const [complianceFixes, setComplianceFixes] = useState<ComplianceFix[]>([])
  const [complianceOriginal, setComplianceOriginal] = useState<string | null>(null)  // 修改前快照
  const [complianceCategory, setComplianceCategory] = useState<'general' | 'beauty'>('beauty')
  const [complianceSafe, setComplianceSafe] = useState(false)

  const runComplianceCheck = async () => {
    if (!rawText.trim() || complianceLoading) return
    setComplianceLoading(true)
    setComplianceErr(null)
    setComplianceFixes([])
    setComplianceSafe(false)
    const before = rawText
    try {
      const res = await cmRemote.complianceAudit({ text: before.trim(), category: complianceCategory })
      if (res.status !== 'SUCCEEDED') {
        setComplianceErr(res.errMsg ?? '合规检测失败')
        return
      }
      const risks = res.risks ?? []
      if (risks.length === 0) {
        setComplianceSafe(true)
        return
      }
      // 应用 suggestion 到 rawText：按 idx 替换原句
      const sentences = splitSentencesLocal(before)
      const map = new Map<number, typeof risks[number]>()
      risks.forEach(r => { if (r.idx) map.set(r.idx, r) })
      const fixes: ComplianceFix[] = []
      const newSentences = sentences.map((s, i) => {
        const r = map.get(i + 1)
        if (r && r.suggestion) {
          fixes.push({
            idx: i + 1, before: s, after: r.suggestion,
            riskType: r.riskType, level: r.level, violation: r.violation, regulation: r.regulation,
          })
          return r.suggestion
        }
        return s
      })
      setComplianceOriginal(before)
      setRawText(newSentences.join(''))
      setComplianceFixes(fixes)
    } catch (e) {
      setComplianceErr(e instanceof Error ? e.message : '合规检测失败')
    } finally {
      setComplianceLoading(false)
    }
  }

  const revertCompliance = () => {
    if (complianceOriginal != null) {
      setRawText(complianceOriginal)
      setComplianceOriginal(null)
      setComplianceFixes([])
      setComplianceSafe(false)
    }
  }

  const handleAdjust = async () => {
    if (!adjustUrl.trim() && !adjustInstruction.trim()) {
      setAdjustErr('URL 和 调整指令 至少填一个')
      return
    }
    setAdjusting(true)
    setAdjustErr(null)
    try {
      const res = await cmRemote.scriptAdjust({
        shots: shots.map(s => ({ name: s.name, content: s.content })),
        matrix: matrix.length > 0 ? matrix : undefined,
        productUrl: adjustUrl.trim() || undefined,
        instruction: adjustInstruction.trim() || undefined,
      })
      if (res.matrix && res.matrix.length > 0) {
        setMatrix(res.matrix)
        setAdjustInfo(`✓ 已调整：${res.elapsedMs}ms · ${res.provider}`)
        setAdjustProductSummary(res.productSummary ?? null)
        setAdjustOpen(false)
      } else {
        setAdjustErr(res.errMsg ?? '调整失败：返回为空')
      }
    } catch (e) {
      setAdjustErr(e instanceof Error ? e.message : '调整失败')
    } finally {
      setAdjusting(false)
    }
  }

  // ─── Step 1 actions ────────────────────────────────────────────────────────

  const gotoDecompose = async () => {
    if (!rawText.trim() || decomposing) return
    setDecomposing(true)
    setDecomposeInfo(null)
    try {
      const res = await cmRemote.scriptDecompose({ text: rawText.trim() })
      const built: Shot[] = (res.shots ?? []).map(s => ({ id: uid(), name: s.name, content: s.content }))
      if (built.length === 0) {
        // LLM 返回空，走前端正则兜底
        setShots(decomposeText(rawText.trim()))
        setDecomposeInfo('LLM 拆解失败，已使用本地正则兜底')
      } else {
        setShots(built)
        if (res.fallbackUsed) {
          setDecomposeInfo(`已使用正则兜底拆解${res.errMsg ? ' · ' + res.errMsg : ''}`)
        } else {
          setDecomposeInfo(`✓ 智能拆解完成：${built.length} 个分镜（${res.provider} · ${res.elapsedMs}ms）`)
        }
      }
      setStep(2)
    } catch (e) {
      console.warn('[ScriptFission] decompose failed, fallback to regex:', e)
      setShots(decomposeText(rawText.trim()))
      setDecomposeInfo('后端不可达，已使用本地正则兜底')
      setStep(2)
    } finally {
      setDecomposing(false)
    }
  }

  const gotoDirectFission = () => {
    if (!rawText.trim()) return
    setShots([{ id: uid(), name: '全文', content: rawText.trim() }])
    setStep(3)
  }

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setRawText(text.slice(0, MAX_CHARS))
    } catch { /* ignore permission deny */ }
  }

  // ─── Step 2 — shot table editing ──────────────────────────────────────────

  const updateShotName = (idx: number, val: string) =>
    setShots(ss => ss.map((s, i) => i === idx ? { ...s, name: val } : s))

  const updateShotContent = (idx: number, val: string) =>
    setShots(ss => ss.map((s, i) => i === idx ? { ...s, content: val } : s))

  const addShotAfter = (idx: number) => {
    const newId = uid()
    setShots(ss => {
      const next = [...ss]
      next.splice(idx + 1, 0, { id: newId, name: `分镜${idx + 2}`, content: '' })
      return next
    })
    setTimeout(() => contentRefs.current[newId]?.focus(), 30)
  }

  const deleteShot = (idx: number) =>
    setShots(ss => ss.filter((_, i) => i !== idx))

  const handleContentKeyDown = useCallback((idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    const pos = el.selectionStart ?? el.value.length

    if (e.key === 'Enter') {
      e.preventDefault()
      const before = el.value.slice(0, pos)
      const after  = el.value.slice(pos)
      const newId  = uid()
      setShots(ss => {
        const next = [...ss]
        next[idx] = { ...next[idx], content: before }
        next.splice(idx + 1, 0, { id: newId, name: `分镜${idx + 2}`, content: after })
        return next
      })
      setTimeout(() => contentRefs.current[newId]?.focus(), 30)
    } else if (e.key === 'Backspace' && pos === 0 && idx > 0) {
      e.preventDefault()
      setShots(ss => {
        const next = [...ss]
        const prevId  = next[idx - 1].id
        const prevLen = next[idx - 1].content.length
        next[idx - 1] = { ...next[idx - 1], content: next[idx - 1].content + next[idx].content }
        next.splice(idx, 1)
        setTimeout(() => {
          const prevEl = contentRefs.current[prevId]
          if (prevEl) { prevEl.focus(); prevEl.setSelectionRange(prevLen, prevLen) }
        }, 30)
        return next
      })
    }
  }, [])

  // ─── Step 3 → 4: generate ─────────────────────────────────────────────────

  const runFission = async () => {
    setGenerating(true); setGenErr(null)
    try {
      const result = await apiFission(docTitle, shots, count)
      setMatrix(result)
      setStep(4)
    } catch (e) {
      setGenErr(e instanceof Error ? e.message : '生成失败，请重试')
    } finally { setGenerating(false) }
  }

  const editMatrix = (si: number, vi: number, val: string) =>
    setMatrix(m => m.map((row, i) => i === si ? row.map((cell, j) => j === vi ? val : cell) : row))

  const saveResult = () => {
    const out = { title: docTitle, versions: count, shots: shots.map((s, i) => ({ ...s, versions: matrix[i] ?? [] })) }
    try { localStorage.setItem('cm_fission_result', JSON.stringify(out)) } catch { /**/ }
    alert('文案已保存（localStorage）')
  }

  // ─── step title map ────────────────────────────────────────────────────────
  const estimatedCount = shots.length * count

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '20px 28px', maxWidth: 1200, margin: '0 auto' }}>
      <button onClick={() => nav(-1)} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回
      </button>

      <StepBar current={step} />

      {/* ── Step 1: 导入文案 ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={S.card}>
          <div style={{ position: 'relative' }}>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value.slice(0, MAX_CHARS))}
              placeholder="在这里粘贴文案，支持口播文案、商品描述等…"
              style={{ ...S.textarea, height: 180 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            <button onClick={pasteFromClipboard} style={{ ...S.btnGhost, gap: 5, fontSize: '0.74rem' }}>
              <Clipboard size={13} />粘贴文案
            </button>
            <span style={{ fontSize: '0.74rem', color: rawText.length > MAX_CHARS * 0.9 ? '#f59e0b' : 'var(--text-muted)' }}>
              {rawText.length}/{MAX_CHARS}
            </span>

            {/* 合规检测 */}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <select value={complianceCategory}
                onChange={e => setComplianceCategory(e.target.value as 'general' | 'beauty')}
                style={{ ...S.inp, fontSize: '0.72rem', padding: '4px 8px' }}>
                <option value="general">通用</option>
                <option value="beauty">美妆护肤</option>
              </select>
              <button
                onClick={runComplianceCheck}
                disabled={!rawText.trim() || complianceLoading}
                style={{ ...S.btnGhost, gap: 5, fontSize: '0.74rem', opacity: !rawText.trim() || complianceLoading ? 0.5 : 1 }}
              >
                {complianceLoading
                  ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />合规检测中…</>
                  : <><ShieldCheck size={13} />合规检测并修复</>}
              </button>
            </span>

            <span style={{ marginLeft: 'auto' }} />
            <button
              onClick={gotoDirectFission}
              disabled={!rawText.trim()}
              style={{ ...S.btnGhost, opacity: rawText.trim() ? 1 : 0.4 }}
            >
              整段裂变
            </button>
            <button
              onClick={gotoDecompose}
              disabled={!rawText.trim() || decomposing}
              style={{ ...S.btnPrimary, gap: 6, opacity: !rawText.trim() || decomposing ? 0.6 : 1 }}
            >
              {decomposing
                ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />智能拆解中…</>
                : '拆解并裂变'}
            </button>
          </div>

          {/* 合规检测结果（底部） */}
          {complianceErr && (
            <div style={{ ...S.errBox, marginTop: 12 }}>
              <AlertCircle size={13} />合规检测失败：{complianceErr}
            </div>
          )}
          {complianceSafe && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(34,197,94,0.08)', color: '#16a34a', fontSize: '0.78rem',
              border: '1px solid rgba(34,197,94,0.25)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <CheckCircle2 size={14} />未检出违规风险，文案合规，可直接进入下一步。
            </div>
          )}
          {complianceFixes.length > 0 && (
            <div style={{
              marginTop: 14, border: '1px solid rgba(20,184,166,0.3)', borderRadius: 10,
              background: 'rgba(20,184,166,0.04)', padding: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={16} color="#0d9488" />
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0d9488' }}>
                    已自动修复 {complianceFixes.length} 处违规
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    上方文本已替换为合规版本
                  </span>
                </div>
                <button onClick={revertCompliance} style={{ ...S.btnGhost, gap: 5, fontSize: '0.72rem' }}>
                  <RotateCcw size={11} />还原原文
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {complianceFixes.map(fix => (
                  <div key={fix.idx} style={{
                    background: 'var(--bg-card)', borderRadius: 7, padding: '8px 10px',
                    border: '1px solid var(--border-light)',
                  }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)' }}>#{fix.idx}</span>
                      {fix.riskType && (
                        <span style={{ fontSize: '0.66rem', padding: '1px 7px', borderRadius: 99, background: 'rgba(239,68,68,0.10)', color: '#dc2626', fontWeight: 600 }}>
                          {fix.riskType}
                        </span>
                      )}
                      {fix.level && (
                        <span style={{ fontSize: '0.66rem', padding: '1px 7px', borderRadius: 99, background: 'rgba(249,115,22,0.10)', color: '#ea580c', fontWeight: 600 }}>
                          {fix.level === 'high' ? '高' : fix.level === 'medium' ? '中' : '低'}风险
                        </span>
                      )}
                      {fix.violation && (
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                          命中：<code style={{ padding: '0 4px', borderRadius: 3, background: 'rgba(0,0,0,0.05)', color: '#dc2626' }}>{fix.violation}</code>
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 6, fontSize: '0.76rem', lineHeight: 1.65 }}>
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>原句</span>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{fix.before}</span>
                      <span style={{ color: '#0d9488', fontWeight: 600 }}>改后</span>
                      <span style={{ color: '#0d9488', fontWeight: 500 }}>{fix.after}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: 拆解文案 ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div>
          {decomposeInfo && (
            <div style={{
              background: decomposeInfo.startsWith('✓') ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)',
              border: `1px solid ${decomposeInfo.startsWith('✓') ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.3)'}`,
              borderRadius: 8, padding: '6px 12px', fontSize: '0.74rem',
              color: decomposeInfo.startsWith('✓') ? '#22c55e' : '#f59e0b',
              marginBottom: 10,
            }}>
              {decomposeInfo}
            </div>
          )}
          {/* Hint bar */}
          <div style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>在句首 <kbd style={S.kbd}>Backspace</kbd> 可合并当前分镜与上一分镜</span>
            <span>在句中 <kbd style={S.kbd}>Enter</kbd> 可拆分当前分镜</span>
          </div>

          {/* 标题 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>标题</div>
            <input
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              placeholder="输入视频标题（可选）"
              style={{ ...S.inp, width: '100%', maxWidth: 500 }}
            />
          </div>

          {/* 分镜表 */}
          <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 8 }}>分镜表</div>
          <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ ...S.th, width: 48 }}></th>
                  <th style={{ ...S.th, width: 120 }}>名称</th>
                  <th style={S.th}>内容</th>
                  <th style={{ ...S.th, width: 100 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {shots.map((shot, idx) => (
                  <tr key={shot.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ ...S.td, color: 'var(--text-muted)', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={S.td}>
                      <input
                        value={shot.name}
                        onChange={e => updateShotName(idx, e.target.value)}
                        style={{ ...S.inp, width: '100%' }}
                      />
                    </td>
                    <td style={S.td}>
                      <input
                        ref={el => { contentRefs.current[shot.id] = el }}
                        value={shot.content}
                        onChange={e => updateShotContent(idx, e.target.value)}
                        onKeyDown={e => handleContentKeyDown(idx, e)}
                        style={{ ...S.inp, width: '100%' }}
                      />
                    </td>
                    <td style={S.td}>
                      <button onClick={() => addShotAfter(idx)} style={S.linkBtn}>添加</button>
                      <button onClick={() => deleteShot(idx)} style={{ ...S.linkBtn, color: '#ef4444', marginLeft: 4 }}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 10 }}>
            <button onClick={() => setStep(1)} style={S.btnGhost}>上一步</button>
            <button
              onClick={() => setStep(3)}
              disabled={shots.length === 0}
              style={{ ...S.btnPrimary, gap: 6, opacity: shots.length === 0 ? 0.4 : 1 }}
            >
              下一步 <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: 设置裂变参数 ──────────────────────────────────────────── */}
      {step === 3 && (
        <div style={{ ...S.card, textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 20 }}>
            <span style={{ fontSize: '1rem', fontWeight: 600 }}>裂变</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <input
                type="number"
                min={1}
                max={MAX_COUNT}
                value={count}
                onChange={e => setCount(Math.max(1, Math.min(MAX_COUNT, Number(e.target.value))))}
                style={{ ...S.inp, width: 70, textAlign: 'center', fontSize: '1rem', fontWeight: 700, padding: '6px 10px' }}
              />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 600 }}>次</span>
          </div>

          <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.8, marginBottom: 28 }}>
            <div>预计生成 <strong style={{ color: '#14b8a6' }}>{estimatedCount}</strong> 条文案。</div>
            <div>最多裂变 {MAX_COUNT} 次。若需更多次数，请使用下方「自定义模型」功能。</div>
          </div>

          {genErr && (
            <div style={{ ...S.errBox, marginBottom: 16, justifyContent: 'center' }}>
              <AlertCircle size={13} />{genErr}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => setStep(shots.length > 1 ? 2 : 1)} style={S.btnGhost}>上一步</button>
            <button style={S.btnGhost}>自定义模型</button>
            <button
              onClick={runFission}
              disabled={generating}
              style={{ ...S.btnPrimary, gap: 6 }}
            >
              {generating
                ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />生成中…</>
                : <>下一步 <ChevronRight size={14} /></>}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: 裂变文案 ──────────────────────────────────────────────── */}
      {step === 4 && matrix.length > 0 && (
        <div>
          {/* 顶部操作条：AI 文案调整 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {adjustInfo
                ? <span style={{ color: '#22c55e' }}>{adjustInfo}</span>
                : <>共 {shots.length} 个分镜 × {count} 个版本，可单元格编辑</>}
            </div>
            <button
              onClick={() => { setAdjustOpen(true); setAdjustErr(null); setAdjustInfo(null) }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: 'var(--gradient-1)',
                color: '#fff', fontSize: '0.78rem', fontWeight: 600,
                boxShadow: '0 2px 8px color-mix(in srgb, var(--accent-primary) 25%, transparent)',
              }}
            >
              <Sparkles size={13} />AI 文案调整
            </button>
          </div>

          {adjustProductSummary && (
            <div style={{
              background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)',
              borderRadius: 8, padding: '8px 12px', fontSize: '0.72rem',
              color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.6,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#14b8a6' }}>📦 产品信息已注入</div>
              <div style={{ maxHeight: 80, overflow: 'auto' }}>{adjustProductSummary}</div>
            </div>
          )}

          <div style={{ ...S.card, padding: 0, overflow: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: 600 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ ...S.th, width: 120, background: 'var(--bg-secondary)' }}>分镜名称</th>
                  {Array.from({ length: count }, (_, i) => (
                    <th key={i} style={{ ...S.th, background: 'var(--bg-secondary)' }}>版本 {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shots.map((shot, si) => (
                  <tr key={shot.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ ...S.td, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', fontSize: '0.74rem' }}>
                      {shot.name}
                    </td>
                    {Array.from({ length: count }, (_, vi) => (
                      <td key={vi} style={S.td}>
                        <input
                          value={matrix[si]?.[vi] ?? ''}
                          onChange={e => editMatrix(si, vi, e.target.value)}
                          style={{ ...S.inp, width: '100%', fontSize: '0.76rem' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={() => { setStep(1); setMatrix([]) }} style={S.btnGhost}>导入新文案</button>
            <button onClick={() => nav('/cutmatrix/wf/tts-batch', { state: { shots, matrix, count, title: docTitle } })} style={S.btnGhost}>去生成语音</button>
            <button onClick={saveResult} style={S.btnPrimary}>保存文案</button>
          </div>
        </div>
      )}

      {/* ── AI 文案调整 Modal ─────────────────────────────────────────────── */}
      {adjustOpen && (
        <div
          onClick={() => !adjusting && setAdjustOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)',
              width: '90%', maxWidth: 540, padding: '20px 22px', position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <button
              onClick={() => setAdjustOpen(false)}
              disabled={adjusting}
              style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>AI 文案调整</div>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              用于脚本智能迁移 + 加码：从竞品复刻文案后，注入新产品信息或自定义指令做整体改造。
              至少填一项；同时填则双重生效。
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
                <LinkIcon size={12} color="#14b8a6" />电商详情页 URL
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.7rem' }}>（可选，自动抽产品信息）</span>
              </div>
              <input
                value={adjustUrl}
                onChange={e => setAdjustUrl(e.target.value)}
                placeholder="https://detail.tmall.com/... 或 https://item.taobao.com/..."
                disabled={adjusting}
                style={{ ...S.inp, width: '100%', fontSize: '0.78rem' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>
                调整指令
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  （可选，例：把所有"X品牌"替换为"Y品牌"；加强保湿卖点；改成更年轻的口吻）
                </span>
              </div>
              <textarea
                value={adjustInstruction}
                onChange={e => setAdjustInstruction(e.target.value)}
                placeholder={'例：把品牌「完美日记」替换为「花西子」，并强调东方美学和持久不脱妆...'}
                disabled={adjusting}
                rows={4}
                style={{ ...S.inp, width: '100%', fontSize: '0.78rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            {adjustErr && (
              <div style={{ ...S.errBox, marginBottom: 12 }}>
                <AlertCircle size={13} />{adjustErr}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setAdjustOpen(false)} disabled={adjusting} style={S.btnGhost}>取消</button>
              <button
                onClick={handleAdjust}
                disabled={adjusting || (!adjustUrl.trim() && !adjustInstruction.trim())}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'var(--gradient-1)',
                  color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                  opacity: adjusting || (!adjustUrl.trim() && !adjustInstruction.trim()) ? 0.5 : 1,
                }}
              >
                {adjusting
                  ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />调整中…</>
                  : <><Sparkles size={13} />确定调整</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── 样式 ─────────────────────────────────────────────────────────────────────

const S = {
  backBtn:  { display: 'inline-flex', alignItems: 'center', marginBottom: 20, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  card:     { background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '16px 18px' } as React.CSSProperties,
  textarea: { width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.84rem', resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', lineHeight: 1.7 } as React.CSSProperties,
  inp:      { padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.78rem', outline: 'none', boxSizing: 'border-box' as const } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', padding: '8px 18px', borderRadius: 8, border: 'none', background: '#14b8a6', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnGhost: { display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  linkBtn:  { background: 'transparent', border: 'none', color: '#14b8a6', fontSize: '0.74rem', cursor: 'pointer', padding: '2px 4px' } as React.CSSProperties,
  errBox:   { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' } as React.CSSProperties,
  kbd:      { display: 'inline-block', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(20,184,166,0.3)', background: 'rgba(20,184,166,0.08)', fontSize: '0.72rem', fontFamily: 'monospace', color: '#14b8a6', fontWeight: 700 } as React.CSSProperties,
  th:       { padding: '10px 12px', textAlign: 'left' as const, fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' as const },
  td:       { padding: '8px 12px', verticalAlign: 'middle' as const },
  Plus,
}

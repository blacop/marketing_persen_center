import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, Video, Trash2, Loader, Download,
  RotateCcw, RotateCw, ChevronDown, ChevronRight, Square, Play,
  ArrowDownToLine, ArrowUpToLine, Sparkles, Folder, X, Check, AlertCircle,
} from 'lucide-react'
import { cmRemote, type LiveLoop } from '../../../lib/cm/cmApi'

// ─── Types ───────────────────────────────────────────────────────────────────

type MaterialStatus = 'uploading' | 'ready' | 'detecting' | 'done' | 'failed'

interface Material {
  id: string
  fileName: string
  size: number
  status: MaterialStatus
  assetCode?: string
  streamUrl?: string
  durationSec?: number
  loops?: LiveLoop[]
  errMsg?: string
}

const STORE_KEY = 'cm_live_loop_state'
const HIGHLIGHT_BG = 'rgba(167, 243, 208, 0.55)'  // 淡绿（黄金卖点高亮）

function uid() { return `ll-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }

function fmtClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${m}:${ss}`
}

function fmtDur(sec: number): string { return fmtClock(sec) }


// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function LiveLoop() {
  const nav = useNavigate()

  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') as Material[]
      // 重水化：blob URL 在页面刷新后失效；上传中态降级为 failed，避免卡住后续操作
      return raw.map(m => {
        if (m.status === 'uploading' && !m.assetCode) return { ...m, status: 'failed' as MaterialStatus, errMsg: '页面刷新丢失上传进度，请重新上传' }
        if (m.status === 'detecting') return { ...m, status: 'ready' as MaterialStatus }
        return m
      })
    } catch { return [] }
  })
  const [activeId, setActiveId] = useState<string | null>(materials[0]?.id ?? null)
  const [materialFilter] = useState<'all' | MaterialStatus>('all')
  const [activeLoopIdx, setActiveLoopIdx] = useState<number | null>(null)
  const [productCollapse, setProductCollapse] = useState<Record<string, boolean>>({})
  const [currentTime, setCurrentTime] = useState(0)
  const [language, setLanguage] = useState('中文及方言')
  const [minLoopMin, setMinLoopMin] = useState(0.5)
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{ zipUrl: string; clipCount: number } | null>(null)

  // banner
  const [lastAction, setLastAction] = useState<string | null>(null)
  const lastActionTimerRef = useRef<number | null>(null)
  const flashAction = (msg: string) => {
    setLastAction(msg)
    if (lastActionTimerRef.current) window.clearTimeout(lastActionTimerRef.current)
    lastActionTimerRef.current = window.setTimeout(() => setLastAction(null), 3000)
  }

  // undo/redo（loops 快照）
  type Snapshot = { matId: string; loops: LiveLoop[] }
  const historyRef = useRef<{ past: Snapshot[]; future: Snapshot[] }>({ past: [], future: [] })
  const [, setTick] = useState(0)
  const pushHistory = () => {
    if (!active?.loops) return
    historyRef.current.past.push({ matId: active.id, loops: JSON.parse(JSON.stringify(active.loops)) })
    if (historyRef.current.past.length > 50) historyRef.current.past.shift()
    historyRef.current.future = []
    setTick(t => t + 1)
  }
  const undo = () => {
    const h = historyRef.current
    if (h.past.length === 0) { flashAction('无可撤回操作'); return }
    const snap = h.past.pop()!
    if (active?.loops) h.future.push({ matId: active.id, loops: JSON.parse(JSON.stringify(active.loops)) })
    setMaterials(prev => prev.map(m => m.id === snap.matId ? { ...m, loops: snap.loops } : m))
    setTick(t => t + 1)
    flashAction(`↩ 已撤回（剩余 ${h.past.length} 步）`)
  }
  const redo = () => {
    const h = historyRef.current
    if (h.future.length === 0) { flashAction('无可重做操作'); return }
    const snap = h.future.pop()!
    if (active?.loops) h.past.push({ matId: active.id, loops: JSON.parse(JSON.stringify(active.loops)) })
    setMaterials(prev => prev.map(m => m.id === snap.matId ? { ...m, loops: snap.loops } : m))
    setTick(t => t + 1)
    flashAction(`↪ 已重做（剩余 ${h.future.length} 步）`)
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // ─── 持久化 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const persistable = materials.map(m => ({ ...m, streamUrl: m.streamUrl?.startsWith('blob:') ? undefined : m.streamUrl }))
      localStorage.setItem(STORE_KEY, JSON.stringify(persistable))
    } catch { /* ignore */ }
  }, [materials])

  // ─── 文件上传 ───────────────────────────────────────────────────────────
  const addMaterials = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const arr = Array.from(files)
    const incoming: Material[] = []
    for (const f of arr) {
      if (!f.type.startsWith('video/') && !f.name.match(/\.(mp4|mov|mkv|webm|avi|flv|ts)$/i)) continue
      incoming.push({ id: uid(), fileName: f.name, size: f.size, status: 'uploading' })
    }
    if (incoming.length === 0) { flashAction('未识别到视频文件'); return }
    setMaterials(prev => [...prev, ...incoming])
    if (!activeId) setActiveId(incoming[0].id)

    let okCount = 0
    for (let i = 0; i < incoming.length; i++) {
      const item = incoming[i]
      const file = arr[i]
      try {
        // 必须走后端 /cm/asset/upload — 拿到 assetCode 才能跑 ASR + LLM
        const upload = await cmRemote.uploadAsset(file)
        setMaterials(prev => prev.map(m => m.id === item.id
          ? { ...m, status: 'ready', assetCode: upload.assetCode, streamUrl: upload.streamUrl }
          : m))
        okCount++
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        setMaterials(prev => prev.map(m => m.id === item.id
          ? { ...m, status: 'failed', errMsg: `上传失败：${msg}` } : m))
      }
    }
    flashAction(okCount === incoming.length
      ? `📥 已上传 ${okCount} 个素材`
      : `⚠ 上传 ${okCount}/${incoming.length}，部分失败（点素材查看错误）`)
  }

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id))
    if (activeId === id) setActiveId(null)
    flashAction('🗑 已移除素材')
  }

  // ─── 检测话术循环 ──────────────────────────────────────────────────────
  const detectLoops = async () => {
    if (!active) { flashAction('请先选择素材'); return }
    if (active.status === 'uploading') { flashAction('素材尚未上传完成，请稍候'); return }
    if (!active.assetCode) {
      flashAction('素材未成功上传到后端（缺 assetCode），请重新上传')
      return
    }
    setMaterials(prev => prev.map(m => m.id === active.id ? { ...m, status: 'detecting', errMsg: undefined } : m))

    try {
      const res = await cmRemote.liveLoopDetect({
        inputAssetCode: active.assetCode,
        lang: language,
        minLoopSec: minLoopMin * 60,
      })
      if (res.status !== 'SUCCEEDED' || !res.loops || res.loops.length === 0) {
        throw new Error(res.errMsg ?? '未检测到话术循环')
      }
      setMaterials(prev => prev.map(m => m.id === active.id
        ? { ...m, status: 'done', loops: res.loops!, durationSec: res.durationSec ?? m.durationSec }
        : m))
      flashAction(`✨ 已检测到 ${res.loops.length} 个话术循环（耗时 ${((res.elapsedMs ?? 0) / 1000).toFixed(1)}s）`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setMaterials(prev => prev.map(m => m.id === active.id
        ? { ...m, status: 'failed', errMsg: msg } : m))
      flashAction(`检测失败：${msg}`)
    }
  }

  // ─── 循环操作 ──────────────────────────────────────────────────────────
  const toggleLoopSelect = (loopIdx: number) => {
    if (!active?.loops) return
    pushHistory()
    setMaterials(prev => prev.map(m => m.id === active.id
      ? { ...m, loops: m.loops?.map(l => l.idx === loopIdx ? { ...l, selected: !l.selected } : l) }
      : m))
  }

  const toggleProductSelect = (productName: string) => {
    if (!active?.loops) return
    pushHistory()
    const productLoops = active.loops.filter(l => l.productName === productName)
    const allSelected = productLoops.every(l => l.selected)
    setMaterials(prev => prev.map(m => m.id === active.id
      ? { ...m, loops: m.loops?.map(l => l.productName === productName ? { ...l, selected: !allSelected } : l) }
      : m))
  }

  const toggleHighlightSentence = (loopIdx: number, sentIdx: number) => {
    if (!active?.loops) return
    pushHistory()
    setMaterials(prev => prev.map(m => m.id === active.id
      ? { ...m, loops: m.loops?.map(l => l.idx === loopIdx
          ? { ...l, sentences: l.sentences.map((s, k) => k === sentIdx ? { ...s, isHighlight: !s.isHighlight } : s) }
          : l) }
      : m))
  }

  const moveLoop = (loopIdx: number, dir: -1 | 1) => {
    if (!active?.loops) return
    const loops = [...active.loops]
    const i = loops.findIndex(l => l.idx === loopIdx)
    const j = i + dir
    if (i < 0 || j < 0 || j >= loops.length) return
    pushHistory()
    ;[loops[i], loops[j]] = [loops[j], loops[i]]
    setMaterials(prev => prev.map(m => m.id === active.id ? { ...m, loops } : m))
    flashAction(`${dir === -1 ? '⬆' : '⬇'} 已${dir === -1 ? '上移' : '下移'}循环 #${loopIdx}`)
  }

  const deleteLoop = (loopIdx: number) => {
    if (!active?.loops) return
    pushHistory()
    setMaterials(prev => prev.map(m => m.id === active.id
      ? { ...m, loops: m.loops?.filter(l => l.idx !== loopIdx) }
      : m))
    flashAction(`🗑 已删除循环 #${loopIdx}`)
    if (activeLoopIdx === loopIdx) setActiveLoopIdx(null)
  }

  // ─── 播放控制 ──────────────────────────────────────────────────────────
  const seekTo = (sec: number) => {
    const v = videoRef.current
    if (!v) return
    try { v.currentTime = Math.max(0, sec); setCurrentTime(v.currentTime) } catch { /* */ }
  }

  const playLoop = (loop: LiveLoop) => {
    setActiveLoopIdx(loop.idx)
    seekTo(loop.start)
    videoRef.current?.play().catch(() => { /* */ })
    const stopAt = (e: Event) => {
      const t = (e.currentTarget as HTMLVideoElement).currentTime
      if (t >= loop.end) {
        videoRef.current?.pause()
        videoRef.current?.removeEventListener('timeupdate', stopAt)
      }
    }
    videoRef.current?.addEventListener('timeupdate', stopAt)
  }

  // ─── 导出 ──────────────────────────────────────────────────────────────
  const exportSelected = async () => {
    if (!active?.loops) return
    const selected = active.loops.filter(l => l.selected)
    if (selected.length === 0) { flashAction('请先勾选要导出的循环'); return }
    if (!active.assetCode) { flashAction('素材未上传到后端，无法切片导出'); return }
    setExporting(true); setExportResult(null)
    try {
      const res = await cmRemote.liveLoopExport({
        inputAssetCode: active.assetCode,
        loops: selected,
        format: 'mp4',
        codec: 'h264',
      })
      if (res.status === 'SUCCEEDED' && res.zipUrl) {
        setExportResult({ zipUrl: res.zipUrl, clipCount: res.clipCount ?? selected.length })
        flashAction(`📦 导出成功 ${res.clipCount ?? selected.length} 段`)
      } else {
        flashAction(res.errMsg ?? '导出失败')
      }
    } catch (e) {
      flashAction(`导出失败：${e instanceof Error ? e.message : String(e)}`)
    } finally { setExporting(false) }
  }

  // ─── 派生 ──────────────────────────────────────────────────────────────
  const active = useMemo(() => materials.find(m => m.id === activeId) ?? null, [materials, activeId])
  const filteredMats = useMemo(() => {
    if (materialFilter === 'all') return materials
    return materials.filter(m => m.status === materialFilter)
  }, [materials, materialFilter])
  const totalDur = active?.durationSec ?? (active?.loops?.[active.loops.length - 1]?.end ?? 0)

  // 按产品分组循环（左侧"果然粉底液 7个循环"折叠组）
  const productGroups = useMemo(() => {
    const map = new Map<string, LiveLoop[]>()
    if (!active?.loops) return [] as Array<{ name: string; loops: LiveLoop[] }>
    // 提取主产品名（去掉 "· 二轮" 后缀）
    const extractMain = (n: string) => n.replace(/\s*[·•]\s*.+$/, '').trim() || n
    for (const l of active.loops) {
      const k = extractMain(l.productName)
      if (!map.has(k)) map.set(k, [])
      map.get(k)!.push(l)
    }
    return Array.from(map.entries()).map(([name, loops]) => ({ name, loops }))
  }, [active?.loops])

  const activeLoop = active?.loops?.find(l => l.idx === activeLoopIdx) ?? null
  const selectedCount = active?.loops?.filter(l => l.selected).length ?? 0

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '20px 28px', maxWidth: 1600, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix')} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录
      </button>

      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          🔁 拆解电商直播话术循环
          <span style={S.statusBadge}>ASR + LLM 话术节点检测</span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
          循环 = 达人开始<b style={{ color: '#0d9488' }}>重复讲解同一内容</b>的边界。前后大意一致才切新循环；推进式介绍/演示/答疑/收单全部留在同一循环内。
        </div>
      </div>

      {/* 顶部 toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <button onClick={() => fileInputRef.current?.click()} style={{ ...S.btnGhost, gap: 5 }}>
          <Upload size={12} />上传直播回放
        </button>
        <input ref={fileInputRef} type="file" multiple accept="video/*"
          style={{ display: 'none' }} onChange={e => addMaterials(e.target.files)} />

        <span style={S.divider} />

        <select value={language} onChange={e => setLanguage(e.target.value)}
          style={{ ...S.inp, fontSize: '0.74rem', padding: '5px 8px' }} title="素材语言">
          <option>中文及方言</option><option>普通话</option><option>粤语</option><option>英语</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          最小循环时长
          <input type="range" min={0.2} max={5} step={0.1}
            value={minLoopMin} onChange={e => setMinLoopMin(Number(e.target.value))}
            style={{ width: 90, accentColor: '#14b8a6' }} />
          <span style={{ color: '#14b8a6', fontWeight: 700, width: 32 }}>{minLoopMin.toFixed(1)}m</span>
        </div>

        <span style={S.divider} />

        <button onClick={undo} disabled={historyRef.current.past.length === 0}
          title={`撤回 (${historyRef.current.past.length})`}
          style={{ ...S.btnGhost, gap: 4, opacity: historyRef.current.past.length === 0 ? 0.4 : 1 }}>
          <RotateCcw size={12} />撤回
        </button>
        <button onClick={redo} disabled={historyRef.current.future.length === 0}
          title={`重做 (${historyRef.current.future.length})`}
          style={{ ...S.btnGhost, gap: 4, opacity: historyRef.current.future.length === 0 ? 0.4 : 1 }}>
          <RotateCw size={12} />重做
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={detectLoops}
          disabled={!active || active.status === 'detecting'}
          style={{ ...S.btnPrimary, gap: 5, opacity: !active || active.status === 'detecting' ? 0.5 : 1 }}>
          {active?.status === 'detecting'
            ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />检测中</>
            : <><Sparkles size={12} />检测话术循环</>}
        </button>
        <button onClick={exportSelected}
          disabled={exporting || selectedCount === 0}
          style={{ ...S.btnGhost, gap: 5, opacity: exporting || selectedCount === 0 ? 0.4 : 1 }}>
          {exporting ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />导出中</>
            : <><Download size={12} />切片导出 ({selectedCount})</>}
        </button>
      </div>

      {/* banner */}
      {lastAction && (
        <div style={{
          marginBottom: 8, padding: '6px 12px', borderRadius: 999,
          background: 'rgba(33, 185, 173, 0.12)', color: '#119184',
          fontSize: '0.74rem', border: '1px solid rgba(33, 185, 173, 0.35)',
          display: 'inline-block',
        }}>{lastAction}</div>
      )}

      {active?.errMsg && (
        <div style={{ ...S.errBox, marginBottom: 10 }}>
          <AlertCircle size={13} />{active.errMsg}
        </div>
      )}
      {exportResult && (
        <div style={{ ...S.okBox, marginBottom: 10 }}>
          <Check size={13} />导出 {exportResult.clipCount} 段
          {exportResult.zipUrl && exportResult.zipUrl !== '#mock' && (
            <a href={exportResult.zipUrl} target="_blank" rel="noreferrer"
              style={{ color: '#0d9488', textDecoration: 'underline', marginLeft: 6 }}>下载 zip</a>
          )}
        </div>
      )}

      {/* 三列主体 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '220px minmax(360px, 1fr) minmax(320px, 1fr) 360px',
        gap: 12,
      }}>

        {/* 1. 素材列表 */}
        <div style={{ ...S.card, padding: 10, height: 'calc(100vh - 280px)', minHeight: 480, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>素材</span>
            <button onClick={() => fileInputRef.current?.click()} style={S.plainIconBtn}>
              <Upload size={13} />
            </button>
          </div>
          {filteredMats.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', padding: '20px 4px', lineHeight: 1.7 }}>
              请上传直播回放
            </div>
          ) : filteredMats.map(m => (
            <div key={m.id} onClick={() => setActiveId(m.id)}
              style={{
                padding: '7px 9px', borderRadius: 7, marginBottom: 5, cursor: 'pointer',
                background: activeId === m.id ? 'rgba(20,184,166,0.08)' : 'var(--bg-secondary)',
                borderLeft: `3px solid ${activeId === m.id ? '#14b8a6' : 'transparent'}`,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Video size={11} color="#14b8a6" />
                <span style={{ flex: 1, fontSize: '0.7rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.fileName}>
                  {m.fileName}
                </span>
                <button onClick={e => { e.stopPropagation(); removeMaterial(m.id) }}
                  style={{ ...S.plainIconBtn, color: '#ef4444' }} title="移除">
                  <Trash2 size={10} />
                </button>
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3, display: 'flex', justifyContent: 'space-between' }}>
                <span>{m.durationSec ? fmtDur(m.durationSec) : '—'}</span>
                <span style={{ color: m.status === 'done' ? '#0d9488' : m.status === 'failed' ? '#ef4444' : 'var(--text-muted)' }}>
                  {m.status === 'uploading' ? '上传中' : m.status === 'detecting' ? '检测中' : m.status === 'done' ? '已完成' : m.status === 'failed' ? '失败' : '就绪'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 2. 循环列表 */}
        <div style={{ ...S.card, padding: 10, height: 'calc(100vh - 280px)', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>
              循环列表 ({active?.loops?.length ?? 0})
            </span>
            {active?.loops?.length ? (
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                已选择 {selectedCount} / {active.loops.length}
              </span>
            ) : null}
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {!active ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '32px 8px' }}>
                选择素材后查看话术循环
              </div>
            ) : !active.loops || active.loops.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '32px 8px', lineHeight: 1.7 }}>
                点击「检测话术循环」<br />AI 拆出每轮产品讲解
              </div>
            ) : productGroups.map(group => {
              const allSel = group.loops.every(l => l.selected)
              const partSel = !allSel && group.loops.some(l => l.selected)
              const collapsed = !!productCollapse[group.name]
              return (
                <div key={group.name} style={{ marginBottom: 6 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 8px', borderRadius: 6, background: 'var(--bg-secondary)',
                    cursor: 'pointer',
                  }} onClick={() => setProductCollapse(c => ({ ...c, [group.name]: !c[group.name] }))}>
                    <input
                      type="checkbox" checked={allSel}
                      ref={el => { if (el) el.indeterminate = partSel }}
                      onClick={e => { e.stopPropagation(); toggleProductSelect(group.name) }}
                      onChange={() => { /* */ }}
                    />
                    {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 700 }}>{group.name}</span>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{group.loops.length} 个循环</span>
                  </div>
                  {!collapsed && group.loops.map(loop => {
                    const isActive = activeLoopIdx === loop.idx
                    return (
                      <div key={loop.idx}
                        onClick={() => { setActiveLoopIdx(loop.idx); seekTo(loop.start) }}
                        style={{
                          margin: '4px 0 4px 22px', padding: '7px 10px', borderRadius: 7,
                          background: isActive ? 'rgba(20,184,166,0.12)' : 'transparent',
                          border: isActive ? '1px solid #14b8a6' : '1px solid var(--border-light)',
                          cursor: 'pointer',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="checkbox" checked={!!loop.selected}
                            onClick={e => e.stopPropagation()}
                            onChange={() => toggleLoopSelect(loop.idx)} />
                          <span style={{ fontSize: '0.74rem', fontWeight: 600 }}>循环 {loop.idx}</span>
                          <button onClick={e => { e.stopPropagation(); playLoop(loop) }}
                            title="播放该循环" style={{ ...S.plainIconBtn, color: '#14b8a6', marginLeft: 'auto' }}>
                            <Play size={10} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); moveLoop(loop.idx, -1) }}
                            title="上移" style={S.plainIconBtn}>
                            <ArrowUpToLine size={10} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); moveLoop(loop.idx, 1) }}
                            title="下移" style={S.plainIconBtn}>
                            <ArrowDownToLine size={10} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); deleteLoop(loop.idx) }}
                            title="删除该循环" style={{ ...S.plainIconBtn, color: '#ef4444' }}>
                            <Trash2 size={10} />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 3, display: 'flex', gap: 10 }}>
                          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtClock(loop.start)} – {fmtClock(loop.end)}</span>
                          <span>时长 {fmtDur(loop.end - loop.start)}</span>
                        </div>
                        {loop.keywords && loop.keywords.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                            {loop.keywords.map(k => (
                              <span key={k} style={{
                                fontSize: '0.6rem', padding: '1px 6px', borderRadius: 8,
                                background: 'rgba(20,184,166,0.12)', color: '#0d9488',
                              }}>{k}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* 底部 切片导出 / 文件夹 */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
            <button onClick={exportSelected} disabled={selectedCount === 0 || exporting}
              style={{ ...S.btnPrimary, gap: 5, flex: 1, justifyContent: 'center', opacity: selectedCount === 0 ? 0.4 : 1 }}>
              {exporting ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />导出中</>
                : <><Download size={12} />切片导出 ({selectedCount})</>}
            </button>
            <button style={S.plainIconBtn} title="打开输出目录"><Folder size={13} /></button>
          </div>
        </div>

        {/* 3. 转写 + 高亮（钩子话术） */}
        <div style={{ ...S.card, padding: 12, height: 'calc(100vh - 280px)', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
          {!activeLoop ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '40px 8px', lineHeight: 1.7 }}>
              选中循环后查看转写与黄金卖点
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{activeLoop.productName} · 循环 {activeLoop.idx}</div>
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {fmtClock(activeLoop.start)} – {fmtClock(activeLoop.end)}，共 {activeLoop.sentences.length} 句
                </div>
              </div>
              <div style={{ flex: 1, overflow: 'auto', fontSize: '0.78rem', lineHeight: 1.85 }}>
                {activeLoop.sentences.map((s, i) => {
                  const isCurrent = currentTime >= s.start && currentTime < s.end
                  return (
                    <p key={i}
                      onClick={() => seekTo(s.start)}
                      onDoubleClick={() => toggleHighlightSentence(activeLoop.idx, i)}
                      title="单击跳转 · 双击切换黄金卖点高亮"
                      style={{
                        margin: '0 0 10px 0', padding: '4px 8px', borderRadius: 6,
                        background: s.isHighlight ? HIGHLIGHT_BG : 'transparent',
                        outline: isCurrent ? '1px solid #ff7a1a' : 'none',
                        cursor: 'pointer',
                      }}>
                      {s.text}
                    </p>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* 4. 视频预览 */}
        <div style={{ ...S.card, padding: 10, height: 'calc(100vh - 280px)', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, background: '#000', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
            {active?.streamUrl ? (
              <video
                ref={videoRef}
                src={active.streamUrl}
                controls
                onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={e => {
                  const d = e.currentTarget.duration
                  if (Number.isFinite(d) && d > 0 && active) {
                    setMaterials(prev => prev.map(m => m.id === active.id ? { ...m, durationSec: m.durationSec ?? d } : m))
                  }
                }}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.78rem', textAlign: 'center' }}>
                <Video size={36} color="#475569" /><br />从左侧选择素材
              </div>
            )}
          </div>

          {/* 时间轴 */}
          {active?.loops && totalDur > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <button onClick={() => { videoRef.current?.pause(); seekTo(0) }}
                  style={{ ...S.plainIconBtn }} title="停止"><Square size={11} /></button>
                <button onClick={() => videoRef.current?.play()}
                  style={{ ...S.plainIconBtn, color: '#14b8a6' }} title="播放"><Play size={11} /></button>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', marginLeft: 'auto' }}>
                  {fmtClock(currentTime)} / {fmtClock(totalDur)}
                </span>
              </div>
              <div style={{ position: 'relative', height: 20, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                {active.loops.map(l => (
                  <div key={l.idx}
                    onClick={() => { setActiveLoopIdx(l.idx); seekTo(l.start) }}
                    title={`循环 ${l.idx} · ${fmtClock(l.start)}–${fmtClock(l.end)}`}
                    style={{
                      position: 'absolute',
                      left: `${(l.start / totalDur) * 100}%`,
                      width: `${((l.end - l.start) / totalDur) * 100}%`,
                      top: 0, bottom: 0,
                      background: l.selected ? '#14b8a6' : 'rgba(148,163,184,0.5)',
                      opacity: activeLoopIdx === l.idx ? 1 : 0.75,
                      borderRight: '1px solid rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                    }} />
                ))}
                {/* playhead */}
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${(currentTime / totalDur) * 100}%`,
                  width: 2, background: '#ff7a1a', pointerEvents: 'none',
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── 样式 ──────────────────────────────────────────────────────────────────
const S = {
  backBtn:    { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  card:       { background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: 7, border: 'none', background: '#14b8a6', color: '#fff', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnGhost:   { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  plainIconBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 4, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 4 } as React.CSSProperties,
  inp:        { padding: '4px 8px', borderRadius: 5, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.74rem', outline: 'none' } as React.CSSProperties,
  divider:    { width: 1, height: 16, background: 'var(--border-light)' } as React.CSSProperties,
  errBox:     { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' } as React.CSSProperties,
  okBox:      { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(20,184,166,0.08)', color: '#0d9488', border: '1px solid rgba(20,184,166,0.2)' } as React.CSSProperties,
  statusBadge: { fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontWeight: 700 } as React.CSSProperties,
}

// suppress unused warnings for icons reserved for future toolbar growth
void X

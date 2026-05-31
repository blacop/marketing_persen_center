import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, Video, Music, X, Loader, RefreshCw,
  CheckSquare, Square, Trash2, Volume2, VolumeX,
} from 'lucide-react'
import { cmRemote, type CmToolBackendResult } from '../../../lib/cm/cmApi'

interface MaterialItem {
  id: string
  fileName: string
  size: number
  uploadState: 'idle' | 'uploading' | 'ready' | 'error'
  assetCode?: string
  streamUrl?: string
  resultUrl?: string
  resultStatus?: 'idle' | 'processing' | 'done' | 'failed'
}

interface BgmItem {
  id: string
  fileName: string
  assetCode?: string
  streamUrl?: string
  uploadState: 'uploading' | 'ready' | 'error'
}

interface AudioOpsTask {
  id: string
  fileName: string
  removeOriginal: boolean
  bgmName?: string
  volume: number
  bgmVolume: number
  createdAt: string
  completedAt?: string
  status: 'processing' | 'done' | 'failed'
  resultUrl?: string
  msg?: string
}

const STORE_KEY = 'cm_audio_ops_tasks'

function loadTasks(): AudioOpsTask[] { try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') } catch { return [] } }
function saveTasks(t: AudioOpsTask[]): void { try { localStorage.setItem(STORE_KEY, JSON.stringify(t)) } catch { /* ignore */ } }
function uid() { return `ao-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }

function fmtSize(b: number): string {
  if (b < 1024) return `${b}B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`
  return `${(b / 1024 / 1024).toFixed(1)}MB`
}

export default function AudioOps() {
  const nav = useNavigate()
  const [tab, setTab] = useState<'create' | 'queue'>('create')

  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [bgm, setBgm] = useState<BgmItem | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const bgmInputRef = useRef<HTMLInputElement | null>(null)

  const [removeOriginal, setRemoveOriginal] = useState(false)
  const [volume, setVolume] = useState(1.0)
  const [bgmVolume, setBgmVolume] = useState(0.3)

  const [submitting, setSubmitting] = useState(false)
  const [tasks, setTasks] = useState<AudioOpsTask[]>(() => loadTasks())
  const [view, setView] = useState<AudioOpsTask | null>(null)

  const upload = async (file: File): Promise<{ assetCode?: string; streamUrl?: string }> => {
    try {
      const r = await (cmRemote as unknown as { uploadAsset?: (f: File) => Promise<{ assetCode: string; streamUrl: string }> }).uploadAsset?.(file)
      if (r) return r
    } catch { /* fallback */ }
    return { streamUrl: URL.createObjectURL(file) }
  }

  const addMaterials = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const incoming: MaterialItem[] = []
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('video/') && !f.name.match(/\.(mp4|mov|mkv|webm|avi|flv)$/i)) continue
      incoming.push({ id: uid(), fileName: f.name, size: f.size, uploadState: 'uploading' })
    }
    if (incoming.length === 0) return
    setMaterials(prev => [...prev, ...incoming])
    if (!activeId) setActiveId(incoming[0].id)

    const arr = Array.from(files)
    for (let i = 0; i < incoming.length; i++) {
      const item = incoming[i]
      const file = arr[i]
      const { assetCode, streamUrl } = await upload(file)
      setMaterials(prev => prev.map(m => m.id === item.id
        ? { ...m, uploadState: 'ready', assetCode, streamUrl, resultStatus: 'idle' } : m))
    }
  }

  const setBgmFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const f = files[0]
    if (!f.type.startsWith('audio/') && !f.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) return
    const id = uid()
    setBgm({ id, fileName: f.name, uploadState: 'uploading' })
    const { assetCode, streamUrl } = await upload(f)
    setBgm({ id, fileName: f.name, assetCode, streamUrl, uploadState: 'ready' })
  }

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id))
    if (activeId === id) {
      const remain = materials.filter(m => m.id !== id)
      setActiveId(remain[0]?.id ?? null)
    }
  }

  const submitOne = async (m: MaterialItem) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', '')
    const taskId = uid()
    const taskBase: AudioOpsTask = {
      id: taskId, fileName: m.fileName,
      removeOriginal, bgmName: bgm?.fileName, volume, bgmVolume,
      createdAt: now, status: 'processing',
    }
    setTasks(prev => [taskBase, ...prev])
    setMaterials(prev => prev.map(x => x.id === m.id ? { ...x, resultStatus: 'processing' } : x))

    try {
      let res: CmToolBackendResult
      if (m.assetCode) {
        res = await cmRemote.toolAudioOps({
          inputAssetCode: m.assetCode,
          removeOriginal,
          bgmAssetCode: bgm?.assetCode,
          volume, bgmVolume,
        })
      } else {
        await new Promise(r => setTimeout(r, 1000))
        res = { status: 'SUCCEEDED', streamUrl: m.streamUrl, message: 'mock 处理完成' } as CmToolBackendResult
      }
      const completed = new Date().toLocaleString('zh-CN', { hour12: false }).replace(',', '')
      const final: AudioOpsTask = {
        ...taskBase, completedAt: completed,
        status: res.status === 'SUCCEEDED' ? 'done' : 'failed',
        resultUrl: res.streamUrl, msg: res.message,
      }
      setTasks(prev => { const next = prev.map(t => t.id === taskId ? final : t); saveTasks(next); return next })
      setMaterials(prev => prev.map(x => x.id === m.id
        ? { ...x, resultUrl: res.streamUrl, resultStatus: res.status === 'SUCCEEDED' ? 'done' : 'failed' } : x))
    } catch (e) {
      const failed: AudioOpsTask = { ...taskBase, status: 'failed', msg: e instanceof Error ? e.message : '处理失败' }
      setTasks(prev => { const next = prev.map(t => t.id === taskId ? failed : t); saveTasks(next); return next })
    }
  }

  const submitActive = async () => {
    const m = materials.find(x => x.id === activeId)
    if (!m || m.uploadState !== 'ready') return
    setSubmitting(true)
    await submitOne(m)
    setSubmitting(false)
  }
  const submitAll = async () => {
    const ready = materials.filter(m => m.uploadState === 'ready')
    setSubmitting(true)
    for (const m of ready) await submitOne(m)
    setSubmitting(false)
  }

  const active = useMemo(() => materials.find(m => m.id === activeId) ?? null, [materials, activeId])

  return (
    <div style={{ padding: '20px 28px', maxWidth: 1500, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix')} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录
      </button>

      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Volume2 size={20} color="#14b8a6" /> 操作视频声音
          <span style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontWeight: 700 }}>
            FFmpeg amix + volume
          </span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
          批量去除原声、添加 BGM、调整音量。
        </div>
      </div>

      <div style={{ display: 'flex', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: 'var(--border-light)', marginBottom: 14 }}>
        {(['create', 'queue'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', border: 'none', background: 'transparent', fontSize: '0.84rem', cursor: 'pointer',
            borderBottomWidth: 2, borderBottomStyle: 'solid',
            borderBottomColor: tab === t ? '#14b8a6' : 'transparent',
            color: tab === t ? '#14b8a6' : 'var(--text-muted)',
            fontWeight: tab === t ? 700 : 500, marginBottom: -2,
          }}>{t === 'create' ? '创建任务' : '任务队列'}</button>
        ))}
      </div>

      {tab === 'create' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 360px 1fr', gap: 14 }}>
          {/* 素材 */}
          <div style={{ ...S.card, padding: 12, height: 'calc(100vh - 280px)', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => fileInputRef.current?.click()} style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
              <Upload size={13} />添加视频
            </button>
            <input ref={fileInputRef} type="file" multiple accept="video/*" style={{ display: 'none' }} onChange={e => addMaterials(e.target.files)} />
            <div style={{ flex: 1, overflow: 'auto' }}>
              {materials.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.74rem', padding: '24px 8px' }}>支持批量视频</div>
              ) : materials.map(m => (
                <div key={m.id} onClick={() => setActiveId(m.id)} style={{
                  padding: '7px 9px', borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                  background: activeId === m.id ? 'rgba(20,184,166,0.1)' : 'transparent',
                  border: `1px solid ${activeId === m.id ? '#14b8a6' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Video size={12} color="var(--accent-primary)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.fileName}>{m.fileName}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                      {fmtSize(m.size)}
                      <span style={{ marginLeft: 6, color: m.uploadState === 'ready' ? '#22c55e' : '#f59e0b' }}>
                        {m.uploadState === 'ready' ? '✓' : '⋯'}
                        {m.resultStatus === 'done' && ' 完成'}
                      </span>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteMaterial(m.id) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 参数 */}
          <div style={{ ...S.card, padding: 16, height: 'calc(100vh - 280px)', overflow: 'auto' }}>
            {/* 去原声 */}
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '6px 0' }}>
              <input type="checkbox" checked={removeOriginal} onChange={e => setRemoveOriginal(e.target.checked)} style={{ marginRight: 8 }} />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>去除视频素材原声</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>勾选后视频静音，常配合 BGM 使用</div>
              </div>
            </label>

            <div style={{ height: 1, background: 'var(--border-light)', margin: '12px 0' }} />

            {/* 原声音量 */}
            <div style={{ marginBottom: 14, opacity: removeOriginal ? 0.5 : 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>原声音量</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {volume === 0 ? <VolumeX size={13} color="var(--text-muted)" /> : <Volume2 size={13} color="#14b8a6" />}
                <input type="range" min={0} max={2} step={0.05} disabled={removeOriginal} value={volume}
                  onChange={e => setVolume(Number(e.target.value))} style={{ flex: 1, accentColor: '#14b8a6' }} />
                <span style={{ width: 50, textAlign: 'right', fontSize: '0.74rem', color: '#14b8a6', fontWeight: 600 }}>{(volume * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border-light)', margin: '12px 0' }} />

            {/* BGM */}
            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 8 }}>背景音乐 (BGM)</div>
            {bgm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 6, marginBottom: 10 }}>
                <Music size={13} color="#14b8a6" />
                <span style={{ flex: 1, fontSize: '0.74rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bgm.fileName}</span>
                <span style={{ fontSize: '0.66rem', color: bgm.uploadState === 'ready' ? '#22c55e' : '#f59e0b' }}>
                  {bgm.uploadState === 'ready' ? '✓' : '⋯'}
                </span>
                <button onClick={() => setBgm(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => bgmInputRef.current?.click()} style={{ ...S.btnGhost, width: '100%', justifyContent: 'center', gap: 5, marginBottom: 10 }}>
                <Upload size={11} />上传 BGM (mp3/wav/...)
              </button>
            )}
            <input ref={bgmInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => setBgmFile(e.target.files)} />

            {/* BGM 音量 */}
            <div style={{ marginBottom: 14, opacity: bgm ? 1 : 0.4 }}>
              <div style={{ fontSize: '0.78rem', marginBottom: 6 }}>BGM 音量</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Music size={11} color="var(--text-muted)" />
                <input type="range" min={0} max={1} step={0.05} disabled={!bgm} value={bgmVolume}
                  onChange={e => setBgmVolume(Number(e.target.value))} style={{ flex: 1, accentColor: '#14b8a6' }} />
                <span style={{ width: 50, textAlign: 'right', fontSize: '0.74rem', color: '#14b8a6', fontWeight: 600 }}>{(bgmVolume * 100).toFixed(0)}%</span>
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 4 }}>
                BGM 时长 &lt; 视频时长会自动循环（stream_loop -1）
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border-light)', margin: '12px 0' }} />

            {/* 操作概览 */}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 14 }}>
              {removeOriginal && bgm && '✓ 替换原声为 BGM'}
              {removeOriginal && !bgm && '✓ 视频静音输出'}
              {!removeOriginal && bgm && '✓ 原声 + BGM 混音'}
              {!removeOriginal && !bgm && '✓ 仅调整原声音量'}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submitActive} disabled={!active || active.uploadState !== 'ready' || submitting}
                style={{ ...S.btnGhost, flex: 1, justifyContent: 'center', opacity: !active || active.uploadState !== 'ready' || submitting ? 0.4 : 1 }}>
                处理当前
              </button>
              <button onClick={submitAll} disabled={materials.filter(m => m.uploadState === 'ready').length === 0 || submitting}
                style={{ ...S.btnPrimary, flex: 2, justifyContent: 'center', gap: 5, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />处理中</> : '批量处理'}
              </button>
            </div>
          </div>

          {/* 预览 */}
          <div style={{ ...S.card, padding: 16, height: 'calc(100vh - 280px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 10 }}>
              {active ? active.fileName : '从左侧选择视频'}
            </div>
            <div style={{ flex: 1, background: '#0f172a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
              {active?.streamUrl ? (
                <video src={active.resultUrl ?? active.streamUrl} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>添加视频后预览</div>
              )}
            </div>
            {active?.resultStatus === 'done' && (
              <div style={{ ...S.successBox, marginTop: 8 }}>✓ 处理完成 · 上方播放为处理后视频</div>
            )}
          </div>
        </div>
      )}

      {tab === 'queue' && <QueueView tasks={tasks} setTasks={setTasks} onView={setView} />}

      {view && (
        <Modal onClose={() => setView(null)} maxWidth={680}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{view.fileName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            {view.removeOriginal ? '去原声' : `原声 ${(view.volume * 100).toFixed(0)}%`}
            {view.bgmName && ` · BGM "${view.bgmName}" ${(view.bgmVolume * 100).toFixed(0)}%`}
          </div>
          {view.resultUrl && <video src={view.resultUrl} controls style={{ width: '100%', maxHeight: 360 }} />}
          {view.msg && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 8 }}>{view.msg}</div>}
        </Modal>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function QueueView({ tasks, setTasks, onView }: { tasks: AudioOpsTask[]; setTasks: (t: AudioOpsTask[]) => void; onView: (t: AudioOpsTask) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const toggle = (id: string) => { const n = new Set(selected); if (n.has(id)) n.delete(id); else n.add(id); setSelected(n) }
  const deleteOne = (id: string) => { const next = tasks.filter(t => t.id !== id); setTasks(next); saveTasks(next) }
  const deleteSelected = () => { if (selected.size === 0) return; const next = tasks.filter(t => !selected.has(t.id)); setTasks(next); saveTasks(next); setSelected(new Set()) }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>共 {tasks.length} 条 · 已选 {selected.size}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTasks(loadTasks())} style={S.btnGhost}><RefreshCw size={11} style={{ marginRight: 4 }} />刷新</button>
          <button onClick={deleteSelected} disabled={selected.size === 0} style={{ ...S.btnGhost, color: '#ef4444', opacity: selected.size === 0 ? 0.4 : 1 }}>
            <Trash2 size={11} style={{ marginRight: 4 }} />删除已选
          </button>
        </div>
      </div>
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ ...S.th, width: 40 }}></th>
              <th style={{ ...S.th, width: 50 }}>序号</th>
              <th style={S.th}>文件名</th>
              <th style={{ ...S.th, width: 80 }}>去原声</th>
              <th style={{ ...S.th, width: 90 }}>原声音量</th>
              <th style={{ ...S.th, width: 130 }}>BGM</th>
              <th style={{ ...S.th, width: 90 }}>BGM 音量</th>
              <th style={{ ...S.th, width: 140 }}>创建时间</th>
              <th style={{ ...S.th, width: 70 }}>状态</th>
              <th style={{ ...S.th, width: 90 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (<tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>暂无记录</td></tr>)}
            {tasks.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <td style={S.td} onClick={() => toggle(t.id)}>
                  {selected.has(t.id) ? <CheckSquare size={13} color="#14b8a6" style={{ cursor: 'pointer' }} /> : <Square size={13} color="var(--text-muted)" style={{ cursor: 'pointer' }} />}
                </td>
                <td style={{ ...S.td, color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ ...S.td, maxWidth: 200 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.fileName}>{t.fileName}</span></td>
                <td style={S.td}>{t.removeOriginal ? '是' : '否'}</td>
                <td style={S.td}>{t.removeOriginal ? '—' : `${(t.volume * 100).toFixed(0)}%`}</td>
                <td style={{ ...S.td, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.bgmName ?? '无'}</td>
                <td style={S.td}>{t.bgmName ? `${(t.bgmVolume * 100).toFixed(0)}%` : '—'}</td>
                <td style={{ ...S.td, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.createdAt}</td>
                <td style={S.td}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.status === 'done' ? '#22c55e' : t.status === 'failed' ? '#ef4444' : '#f59e0b' }}>
                    {t.status === 'done' ? '成功' : t.status === 'failed' ? '失败' : '处理中'}
                  </span>
                </td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {t.status === 'done' && t.resultUrl && <button onClick={() => onView(t)} style={S.linkBtn}>查看</button>}
                    <button onClick={() => deleteOne(t.id)} style={{ ...S.linkBtn, color: '#ef4444' }}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Modal({ children, onClose, maxWidth = 480 }: { children: React.ReactNode; onClose: () => void; maxWidth?: number }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-light)', width: '90%', maxWidth, padding: '20px 22px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        {children}
      </div>
    </div>
  )
}

const S = {
  backBtn:  { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' } as React.CSSProperties,
  card:     { background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-light)' } as React.CSSProperties,
  btnPrimary: { display: 'inline-flex', alignItems: 'center', padding: '8px 14px', borderRadius: 8, border: 'none', background: '#14b8a6', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  btnGhost: { display: 'inline-flex', alignItems: 'center', padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.76rem', cursor: 'pointer', whiteSpace: 'nowrap' as const } as React.CSSProperties,
  linkBtn:  { background: 'transparent', border: 'none', color: '#14b8a6', fontSize: '0.72rem', cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline', textUnderlineOffset: 2 } as React.CSSProperties,
  th:       { padding: '10px 12px', textAlign: 'left' as const, fontWeight: 600, fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' as const },
  td:       { padding: '8px 12px', verticalAlign: 'middle' as const },
  successBox: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, fontSize: '0.74rem', background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' } as React.CSSProperties,
}

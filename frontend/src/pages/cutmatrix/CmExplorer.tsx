import { useEffect, useState } from 'react'
import {
  Folder, FolderPlus, Trash2, Upload, Sparkles, X, ChevronRight,
  ChevronDown, FileVideo, RefreshCw,
} from 'lucide-react'
import {
  cmRemote,
  type CmRemoteCollection, type CmRemoteChapter, type CmRemoteSegment,
} from '../../lib/cm/cmApi'
import { videoAssetApi } from '../../lib/agentApi'
import SegmentClip from '../../components/SegmentClip'

export default function CmExplorer() {
  const [collections, setCollections] = useState<CmRemoteCollection[]>([])
  const [activeCollCode, setActiveCollCode] = useState<string | null>(null)
  const [chapters, setChapters] = useState<CmRemoteChapter[]>([])
  const [activeChapCode, setActiveChapCode] = useState<string | null>(null)
  const [segments, setSegments] = useState<CmRemoteSegment[]>([])
  const [showImport, setShowImport] = useState(false)
  const [showNewColl, setShowNewColl] = useState(false)
  const [globalErr, setGlobalErr] = useState<string | null>(null)

  const reload = async () => {
    try {
      const colls = await cmRemote.listCollections()
      setCollections(colls)
      if (!activeCollCode && colls.length > 0) setActiveCollCode(colls[0].collectionCode)
      setGlobalErr(null)
    } catch (e) {
      setGlobalErr(e instanceof Error ? e.message : '加载品名失败')
    }
  }

  useEffect(() => { void reload() }, [])

  useEffect(() => {
    if (!activeCollCode) { setChapters([]); setSegments([]); return }
    cmRemote.listChapters(activeCollCode)
      .then(chs => {
        setChapters(chs)
        if (!activeChapCode || !chs.find(c => c.chapterCode === activeChapCode)) {
          setActiveChapCode(chs[0]?.chapterCode ?? null)
        }
      })
      .catch(e => setGlobalErr(e instanceof Error ? e.message : '加载章节失败'))
  }, [activeCollCode])

  useEffect(() => {
    if (!activeCollCode) { setSegments([]); return }
    cmRemote.listSegments(activeCollCode, activeChapCode ?? undefined)
      .then(setSegments)
      .catch(e => setGlobalErr(e instanceof Error ? e.message : '加载片段失败'))
  }, [activeCollCode, activeChapCode, chapters])

  const activeColl = collections.find(c => c.collectionCode === activeCollCode)
  const activeChap = chapters.find(c => c.chapterCode === activeChapCode)

  const handleDelete = async () => {
    if (!activeColl) return
    if (!confirm(`删除品名 "${activeColl.name}"? 章节和片段会一起软删`)) return
    try {
      await cmRemote.deleteCollection(activeColl.collectionCode)
      setActiveCollCode(null)
      void reload()
    } catch (e) {
      setGlobalErr(e instanceof Error ? e.message : '删除失败')
    }
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
            <Folder size={18} color="var(--accent-primary)" style={{ verticalAlign: 'middle', marginRight: 8 }} />
            素材组织
            <span style={{ marginLeft: 8, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 700 }}>backend live</span>
          </h2>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
            按 <code style={{ background: 'var(--bg-primary)', padding: '1px 5px', borderRadius: 4 }}>品名 / 章节 / 片段</code> 三级结构组织。来源：人工上传 / 拆解结果导入。后端 /cm/* 真实存储。
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => void reload()} style={btnGhost}><RefreshCw size={13} style={{ marginRight: 4 }} />刷新</button>
          <button onClick={() => setShowNewColl(true)} style={btnPrimary}>
            <FolderPlus size={13} style={{ marginRight: 5 }} />新建品名
          </button>
        </div>
      </div>

      {globalErr && <div style={errBox}>⚠️ {globalErr}</div>}

      {collections.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 14, border: '1px dashed var(--border-light)' }}>
          <Folder size={36} color="#cbd5e1" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 6 }}>还没有任何品名</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: 14 }}>
            创建一个品名（一级目录）开始组织素材
          </div>
          <button onClick={() => setShowNewColl(true)} style={btnPrimary}>
            <FolderPlus size={13} style={{ marginRight: 5 }} />新建品名
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
          {/* 左侧目录树 */}
          <aside style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: 12 }}>
            {collections.map(c => {
              const isActive = c.collectionCode === activeCollCode
              return (
                <div key={c.collectionCode} style={{ marginBottom: 4 }}>
                  <div onClick={() => setActiveCollCode(c.collectionCode)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6,
                    cursor: 'pointer', background: isActive ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                  }}>
                    {isActive ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <Folder size={13} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{c.mode}</span>
                  </div>
                  {isActive && chapters.length > 0 && (
                    <div style={{ paddingLeft: 18, marginTop: 4 }}>
                      {chapters.map(ch => {
                        const isCh = ch.chapterCode === activeChapCode
                        return (
                          <div key={ch.chapterCode} onClick={() => setActiveChapCode(ch.chapterCode)} style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6,
                            cursor: 'pointer', background: isCh ? 'color-mix(in srgb, var(--accent-primary) 6%, transparent)' : 'transparent',
                            fontSize: '0.74rem', color: isCh ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: isCh ? 700 : 500,
                          }}>
                            <Folder size={11} />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{ch.segmentCount ?? 0}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </aside>

          {/* 右侧片段网格 */}
          <main style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: 16 }}>
            {!activeColl ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>选择左侧品名查看章节与片段</div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                      {activeColl.name} {activeChap && <><span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>/</span>{activeChap.name}</>}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      <code style={{ fontFamily: 'monospace', fontSize: '0.66rem' }}>{activeColl.collectionCode}</code> · {chapters.length} 章节 · {segments.length} 片段
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowImport(true)} style={btnPrimary}>
                      <Sparkles size={12} style={{ marginRight: 4 }} />从拆解结果导入
                    </button>
                    <button onClick={() => alert('上传本地视频 P1 待接入 /cm/asset/upload')} style={btnGhost}>
                      <Upload size={12} style={{ marginRight: 4 }} />上传本地
                    </button>
                    <button onClick={handleDelete} style={{ ...btnGhost, color: '#ef4444' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {!activeChap ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    没有章节。点击 "从拆解结果导入" 自动按 4 段卖点框架建章节。
                  </div>
                ) : segments.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    本章节暂无片段
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {segments.map(s => (
                      <div key={s.segmentCode} style={{ background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                        <SegmentClip src={s.videoUrl} startSec={Number(s.startSec)} endSec={Number(s.endSec)} label={s.caption ?? `#${s.orderNo ?? ''}`} height={120} />
                        <div style={{ padding: '8px 10px' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                            {Number(s.durationSec).toFixed(1)}s · {s.sourceType ?? 'UPLOAD'}
                          </div>
                          {(s.sceneTags || s.sellingPointTags) && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                              {parseJsonTags(s.sceneTags).slice(0, 2).map(t => <span key={'sc'+t} style={cTag('#3b82f6')}>{t}</span>)}
                              {parseJsonTags(s.sellingPointTags).slice(0, 2).map(t => <span key={'sp'+t} style={cTag('#e8365d')}>{t}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      )}

      {showNewColl && <NewCollectionModal onClose={() => setShowNewColl(false)} onCreated={async (c) => { setShowNewColl(false); await reload(); setActiveCollCode(c.collectionCode) }} />}
      {showImport && activeColl && <ImportFromDeconModal collectionCode={activeColl.collectionCode} skuId={activeColl.skuId} onClose={() => setShowImport(false)} onImported={async () => { setShowImport(false); const chs = await cmRemote.listChapters(activeColl.collectionCode); setChapters(chs); const segs = await cmRemote.listSegments(activeColl.collectionCode, activeChapCode ?? undefined); setSegments(segs) }} />}
    </div>
  )
}

function NewCollectionModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: CmRemoteCollection) => void }) {
  const [name, setName] = useState('')
  const [skuId, setSkuId] = useState('SEED_CUSHION_2')
  const [mode, setMode] = useState('paragraph-align')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const create = async () => {
    if (!name.trim()) return
    setBusy(true); setErr(null)
    try {
      const c = await cmRemote.createCollection(name.trim(), mode, skuId.trim() || undefined)
      onCreated(c)
    } catch (e) {
      setErr(e instanceof Error ? e.message : '创建失败')
    } finally { setBusy(false) }
  }
  return (
    <ModalShell title="新建品名（一级目录）" onClose={onClose}>
      <FormRow label="品名"><input value={name} onChange={e => setName(e.target.value)} placeholder="例：种籽气垫秋冬款" style={inp} /></FormRow>
      <FormRow label="关联 SKU"><input value={skuId} onChange={e => setSkuId(e.target.value)} placeholder="SEED_CUSHION_2" style={inp} /></FormRow>
      <FormRow label="编排模式">
        <select value={mode} onChange={e => setMode(e.target.value)} style={inp}>
          <option value="paragraph-align">段落对齐（推荐）</option>
          <option value="zhuge">按章节混剪（章节独立配音）</option>
          <option value="sunwukong">整段配音驱动混剪（整段配音）</option>
        </select>
      </FormRow>
      {err && <div style={errBox}>{err}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
        <button onClick={onClose} style={btnGhost} disabled={busy}>取消</button>
        <button onClick={create} style={btnPrimary} disabled={busy || !name.trim()}>{busy ? '创建中…' : '创建'}</button>
      </div>
    </ModalShell>
  )
}

function ImportFromDeconModal({ collectionCode, skuId, onClose, onImported }: { collectionCode: string; skuId?: string; onClose: () => void; onImported: () => void }) {
  const [filterSku, setFilterSku] = useState(skuId ?? 'SEED_CUSHION_2')
  const [list, setList] = useState<{ id: string; videoId?: string; skuId?: string; createAt?: string; hookType?: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [chosen, setChosen] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState<number | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const reload = () => {
    setLoading(true); setErr(null)
    videoAssetApi.listDeconstructionResults({ pageSize: 50, skuId: filterSku || undefined })
      .then(r => setList(r.records.map(x => ({ id: String(x.id ?? ''), videoId: x.videoId, skuId: x.skuId, createAt: x.createAt, hookType: x.hookType }))))
      .catch(e => setErr(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false))
  }
  useEffect(reload, [])

  const toggle = (id: string) => {
    const next = new Set(chosen)
    if (next.has(id)) next.delete(id); else next.add(id)
    setChosen(next)
  }
  const doImport = async () => {
    if (chosen.size === 0) return
    setImporting(true); setErr(null)
    try {
      const count = await cmRemote.importFromDeconstruction(collectionCode, [...chosen])
      setImported(count)
      setTimeout(() => onImported(), 1200)
    } catch (e) {
      setErr(e instanceof Error ? e.message : '导入失败')
    } finally { setImporting(false) }
  }

  return (
    <ModalShell title="从拆解结果导入素材" onClose={onClose} width={680}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input value={filterSku} onChange={e => setFilterSku(e.target.value)} placeholder="SKU 过滤" style={{ ...inp, flex: 1 }} />
        <button onClick={reload} disabled={loading} style={btnGhost}><RefreshCw size={12} /></button>
      </div>
      {err && <div style={errBox}>{err}</div>}
      {loading ? (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>加载中…</div>
      ) : list.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>没有找到拆解结果</div>
      ) : (
        <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 8 }}>
          {list.map(item => {
            const checked = chosen.has(item.id)
            return (
              <label key={item.id} style={{
                display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10, padding: '10px 14px',
                borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
                background: checked ? 'color-mix(in srgb, var(--accent-primary) 6%, transparent)' : 'transparent',
              }}>
                <input type="checkbox" checked={checked} onChange={() => toggle(item.id)} />
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                    <FileVideo size={12} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--accent-primary)' }} />
                    {item.videoId?.slice(0, 28) ?? '—'}…
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                    SKU {item.skuId ?? '—'} · {item.hookType ?? '—'} · {item.createAt?.slice(0, 10) ?? '—'}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      )}
      {imported != null && <div style={okBox}>✓ 后端已写入 {imported} 个片段（按 stage_code 自动归章节）</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>已选 {chosen.size} 条</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={btnGhost}>取消</button>
          <button onClick={doImport} disabled={chosen.size === 0 || importing} style={btnPrimary}>
            {importing ? '导入中…' : `导入 ${chosen.size} 条`}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

function parseJsonTags(raw?: string): string[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v.map(String) : []
  } catch { return raw.split(/[,，]/).filter(Boolean) }
}

function ModalShell({ title, onClose, children, width = 480 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)', zIndex: 400, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80 }}>
      <div onClick={e => e.stopPropagation()} style={{ width, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', background: 'var(--bg-card)', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}
const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border-light)', fontSize: '0.8rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 7, border: 'none', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }
const errBox: React.CSSProperties = { padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 10 }
const okBox: React.CSSProperties = { padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(34,197,94,0.10)', color: '#15803d', border: '1px solid rgba(34,197,94,0.25)', marginTop: 10 }
function cTag(color: string): React.CSSProperties {
  return { fontSize: '0.6rem', padding: '1px 6px', borderRadius: 5, background: `${color}18`, color, fontWeight: 600 }
}

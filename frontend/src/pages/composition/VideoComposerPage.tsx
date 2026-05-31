import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Film, Folder, Upload, Trash2, X, Search, Filter, Loader2, Plus,
} from 'lucide-react'
import {
  type MaterialCategory, type MaterialClipDTO, type MaterialKind, type MaterialTagDTO, type VoiceoverAssetDTO,
  MATERIAL_CATEGORIES, UNCATEGORIZED_KEY, categoryLabel,
  createMaterial, createTag, createVoiceover, deleteMaterial, deleteTag, deleteVoiceover,
  listTags, pageMaterials, pageVoiceovers, probeAudio, probeVideo,
  updateMaterialTags, uploadDirectToBackend,
} from '../../api/composition'

type CategoryFilter = MaterialCategory | typeof UNCATEGORIZED_KEY | 'ALL'
import ProjectPanel from './ProjectPanel'
import SplitPanel from './SplitPanel'

type TabKey = 'project' | 'material' | 'voiceover' | 'split' | 'tag'

// ── 通用样式（沿用项目玫红主题 CSS 变量） ──
const card: React.CSSProperties = {
  background: 'var(--bg-card)', border: '1px solid var(--border-light)',
  borderRadius: 12, padding: 20, boxShadow: 'var(--shadow-sm)',
}
const btn: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6,
}
const btnPrimary: React.CSSProperties = {
  ...btn, background: 'var(--gradient-1)', color: '#fff', border: 'none',
}
const btnDanger: React.CSSProperties = { ...btn, color: 'var(--danger)' }
const inputStyle: React.CSSProperties = {
  padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-light)',
  background: 'var(--bg-secondary)', fontSize: 13, color: 'var(--text-primary)', outline: 'none',
}

export default function VideoComposerPage() {
  const nav = useNavigate()
  const [tab] = useState<TabKey>('project')

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <button
        onClick={() => nav('/cutmatrix')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginBottom: 14, padding: '5px 12px', borderRadius: 7,
          border: '1px solid var(--border-light)', background: 'transparent',
          color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
        }}
      >
        <ArrowLeft size={13} />返回工作流目录
      </button>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>按章节混剪</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          按章节高质量混剪：每章节独立画面 + 独立配音，颗粒度更细，画面与配音双重变量。
        </p>
      </div>

      {tab === 'project' && <ProjectPanel />}
      {tab === 'material' && <MaterialPanel />}
      {tab === 'voiceover' && <VoiceoverPanel />}
      {tab === 'split' && <SplitPanel />}
      {tab === 'tag' && <TagPanel />}
    </div>
  )
}

// ─────────────────────────── 素材库 ───────────────────────────

function MaterialPanel() {
  const [tags, setTags] = useState<MaterialTagDTO[]>([])
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL')
  const [filter, setFilter] = useState<{ kind?: MaterialKind; name?: string; tagIds: number[] }>({ tagIds: [] })
  const [data, setData] = useState<MaterialClipDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<{ filename: string; progress: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  // 上传两步走：第一步弹窗选 category，确认后再触发隐藏的 <input type="file"> 选文件
  const [uploadCategory, setUploadCategory] = useState<MaterialCategory | null>(null)
  const [pickerCategory, setPickerCategory] = useState<MaterialCategory | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { void listTags().then(setTags).catch(e => setError(String(e))) }, [])
  useEffect(() => { void reload() }, [activeCategory, filter.kind, filter.name, filter.tagIds.join(',')])

  async function reload() {
    setLoading(true)
    try {
      const p = await pageMaterials({
        pageIndex: 1, pageSize: 50,
        kind: filter.kind, name: filter.name,
        tagIds: filter.tagIds.length ? filter.tagIds : undefined,
        category: activeCategory === 'ALL' ? undefined : activeCategory,
      })
      setData(p.records ?? [])
      setTotal(p.total ?? 0)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function startUpload() {
    // 默认带入当前左侧导航选中的 category（"全部"和"未分类"时回退到第一个枚举）
    const guess = activeCategory !== 'ALL' && activeCategory !== UNCATEGORIZED_KEY
      ? activeCategory : MATERIAL_CATEGORIES[0].value
    setPickerCategory(guess)
  }

  function confirmUploadCategory() {
    if (!pickerCategory) return
    setUploadCategory(pickerCategory)
    setPickerCategory(null)
    // 弹文件选择器
    setTimeout(() => fileInputRef.current?.click(), 0)
  }

  async function onFilePicked(files: FileList | null) {
    if (!files || files.length === 0) { setUploadCategory(null); return }
    const cat = uploadCategory
    setUploadCategory(null)
    if (!cat) return
    setError(null)
    for (const file of Array.from(files)) {
      try {
        const isVideo = file.type.startsWith('video/')
        const kind: MaterialKind = isVideo ? 'VIDEO' : 'IMAGE'

        setUploading({ filename: file.name, progress: '探测元信息…' })
        const probe = isVideo ? await probeVideo(file) : {}

        setUploading({ filename: file.name, progress: '上传到后端…' })
        const up = await uploadDirectToBackend('material', file)

        setUploading({ filename: file.name, progress: '元数据入库…' })
        await createMaterial({
          ossKey: up.ossKey, kind, originalName: file.name, category: cat,
          fileSize: up.fileSize, sha256: up.sha256,
          durationMs: probe.durationMs, width: probe.width, height: probe.height,
        })
      } catch (e) {
        setError(`上传 ${file.name} 失败：${String(e)}`)
      }
    }
    setUploading(null)
    void reload()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, alignItems: 'flex-start' }}>
      {/* 左侧：分类导航 */}
      <div style={{ ...card, padding: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 4 }}>素材分类</div>
        <CategoryNavItem label="全部" icon={<Folder size={14} />} active={activeCategory === 'ALL'}
          onClick={() => setActiveCategory('ALL')} />
        {MATERIAL_CATEGORIES.map(c => (
          <CategoryNavItem key={c.value} label={c.label} icon={<Folder size={14} />}
            active={activeCategory === c.value} onClick={() => setActiveCategory(c.value)} />
        ))}
        <CategoryNavItem label="未分类" icon={<Folder size={14} />}
          active={activeCategory === UNCATEGORIZED_KEY} onClick={() => setActiveCategory(UNCATEGORIZED_KEY)}
          dim />
      </div>

      {/* 右侧：筛选 + 网格 */}
      <div>
        {error && <ErrorBar msg={error} onClose={() => setError(null)} />}

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={filter.kind ?? ''}
              onChange={e => setFilter({ ...filter, kind: (e.target.value || undefined) as MaterialKind | undefined })}
              style={inputStyle}
            >
              <option value="">全部类型</option>
              <option value="VIDEO">VIDEO</option>
              <option value="IMAGE">IMAGE</option>
            </select>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
              <input
                placeholder="按文件名搜索"
                value={filter.name ?? ''}
                onChange={e => setFilter({ ...filter, name: e.target.value || undefined })}
                style={{ ...inputStyle, paddingLeft: 30, width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tags.map(t => {
                const active = filter.tagIds.includes(t.id)
                return (
                  <button
                    key={t.id}
                    onClick={() => setFilter({
                      ...filter,
                      tagIds: active ? filter.tagIds.filter(x => x !== t.id) : [...filter.tagIds, t.id],
                    })}
                    style={{
                      ...btn, padding: '4px 10px', fontSize: 12,
                      background: active ? 'var(--gradient-1)' : 'var(--bg-secondary)',
                      color: active ? '#fff' : t.color || 'var(--text-secondary)',
                      border: active ? 'none' : `1px solid ${t.color || 'var(--border-light)'}`,
                    }}
                  >
                    {t.name}
                  </button>
                )
              })}
            </div>
            <button style={{ ...btnPrimary, cursor: 'pointer', marginLeft: 'auto' }} onClick={startUpload}>
              <Upload size={14} />上传素材
            </button>
            {/* 真正的文件选择器，仅在 confirmUploadCategory 后被代码触发 */}
            <input
              ref={fileInputRef}
              type="file" multiple accept="video/*,image/*" style={{ display: 'none' }}
              onChange={e => { void onFilePicked(e.target.files); e.currentTarget.value = '' }}
            />
          </div>

          {uploading && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={14} className="spin" />
              {uploading.filename}：{uploading.progress}
            </div>
          )}
        </div>

        <div style={{ ...card }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {activeCategory === 'ALL' ? '全部' : categoryLabel(activeCategory)} · 共 {total} 条素材
            </div>
            {loading && <Loader2 size={14} className="spin" color="var(--accent-primary)" />}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {data.map(m => (
              <MaterialCard key={m.id} m={m} tags={tags} onChange={reload} />
            ))}
            {data.length === 0 && !loading && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                暂无素材
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 上传前选分类弹窗 */}
      {pickerCategory && (
        <Modal onClose={() => setPickerCategory(null)} title="选择素材分类">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            选定后会立即弹出文件选择器；同一批文件会归到此分类。
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            {MATERIAL_CATEGORIES.map(c => {
              const active = pickerCategory === c.value
              return (
                <button key={c.value}
                  onClick={() => setPickerCategory(c.value)}
                  style={{
                    ...btn, padding: '10px 8px', fontSize: 12, justifyContent: 'center',
                    background: active ? 'var(--gradient-1)' : 'var(--bg-secondary)',
                    color: active ? '#fff' : 'var(--text-primary)',
                    border: active ? 'none' : '1px solid var(--border-light)',
                  }}>
                  {c.label}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button style={btn} onClick={() => setPickerCategory(null)}>取消</button>
            <button style={btnPrimary} onClick={confirmUploadCategory}>下一步：选文件</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function CategoryNavItem({ label, icon, active, onClick, dim }: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void; dim?: boolean
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      width: '100%', padding: '8px 10px', borderRadius: 6,
      border: 'none', background: active ? 'var(--rose-100)' : 'transparent',
      color: active ? 'var(--rose-700)' : (dim ? 'var(--text-muted)' : 'var(--text-primary)'),
      cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 400,
      textAlign: 'left', marginBottom: 2,
    }}>
      {icon}<span>{label}</span>
    </button>
  )
}

function MaterialCard({ m, tags, onChange }: { m: MaterialClipDTO; tags: MaterialTagDTO[]; onChange: () => void }) {
  const [editingTags, setEditingTags] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(m.tags?.map(t => t.id) ?? [])
  const sec = m.durationMs ? `${(m.durationMs / 1000).toFixed(1)}s` : '—'
  const size = m.fileSize ? `${(m.fileSize / 1024 / 1024).toFixed(1)}MB` : '—'

  return (
    <div style={{ ...card, padding: 12, position: 'relative' }}>
      <div style={{
        height: 120, background: 'var(--rose-50)', borderRadius: 8, display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: 10, color: 'var(--rose-300)', fontSize: 32,
      }}>
        {m.kind === 'VIDEO' ? <Film size={32} /> : <span style={{ fontSize: 12 }}>IMG</span>}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {m.originalName}
      </div>
      <div style={{ fontSize: 11, marginBottom: 4 }}>
        <span style={{
          padding: '2px 8px', borderRadius: 10,
          background: m.category ? 'var(--rose-100)' : 'var(--bg-secondary)',
          color: m.category ? 'var(--rose-700)' : 'var(--text-muted)',
        }}>
          {categoryLabel(m.category)}
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
        {m.kind} · {sec} · {size} {m.width && m.height ? `· ${m.width}×${m.height}` : ''}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8, minHeight: 22 }}>
        {(m.tags ?? []).map(t => (
          <span key={t.id} style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 10,
            background: t.color ? `${t.color}20` : 'var(--rose-100)',
            color: t.color ?? 'var(--rose-700)',
          }}>{t.name}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={{ ...btn, fontSize: 11, padding: '4px 8px' }} onClick={() => setEditingTags(true)}>编辑标签</button>
        <button
          style={{ ...btnDanger, fontSize: 11, padding: '4px 8px' }}
          onClick={async () => {
            if (!confirm(`删除素材 ${m.originalName}?`)) return
            await deleteMaterial(m.id)
            onChange()
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>

      {editingTags && (
        <Modal onClose={() => setEditingTags(false)} title="编辑标签">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, maxHeight: 300, overflow: 'auto' }}>
            {tags.map(t => {
              const active = selectedTagIds.includes(t.id)
              return (
                <button
                  key={t.id}
                  style={{
                    ...btn, padding: '6px 12px',
                    background: active ? 'var(--gradient-1)' : 'var(--bg-secondary)',
                    color: active ? '#fff' : t.color || 'var(--text-secondary)',
                    border: active ? 'none' : `1px solid ${t.color || 'var(--border-light)'}`,
                  }}
                  onClick={() => setSelectedTagIds(active
                    ? selectedTagIds.filter(x => x !== t.id)
                    : [...selectedTagIds, t.id])}
                >{t.name}</button>
              )
            })}
            {tags.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>暂无标签，请先到「标签管理」创建</div>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button style={btn} onClick={() => setEditingTags(false)}>取消</button>
            <button style={btnPrimary} onClick={async () => {
              await updateMaterialTags(m.id, selectedTagIds)
              setEditingTags(false)
              onChange()
            }}>保存</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─────────────────────────── 配音库 ───────────────────────────

function VoiceoverPanel() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL')
  const [data, setData] = useState<VoiceoverAssetDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState<{ filename: string; progress: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [textCache, setTextCache] = useState<Record<string, string>>({})
  const [uploadCategory, setUploadCategory] = useState<MaterialCategory | null>(null)
  const [pickerCategory, setPickerCategory] = useState<MaterialCategory | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { void reload() }, [text, activeCategory])

  async function reload() {
    setLoading(true)
    try {
      const p = await pageVoiceovers({
        pageIndex: 1, pageSize: 50, text: text || undefined,
        category: activeCategory === 'ALL' ? undefined : activeCategory,
      })
      setData(p.records ?? [])
      setTotal(p.total ?? 0)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function startUpload() {
    const guess = activeCategory !== 'ALL' && activeCategory !== UNCATEGORIZED_KEY
      ? activeCategory : MATERIAL_CATEGORIES[0].value
    setPickerCategory(guess)
  }

  function confirmUploadCategory() {
    if (!pickerCategory) return
    setUploadCategory(pickerCategory)
    setPickerCategory(null)
    setTimeout(() => fileInputRef.current?.click(), 0)
  }

  async function onFilePicked(files: FileList | null) {
    if (!files || files.length === 0) { setUploadCategory(null); return }
    const cat = uploadCategory
    setUploadCategory(null)
    if (!cat) return
    setError(null)
    for (const file of Array.from(files)) {
      try {
        setUploading({ filename: file.name, progress: '探测时长…' })
        const probe = await probeAudio(file)

        setUploading({ filename: file.name, progress: '上传到后端…' })
        const up = await uploadDirectToBackend('voiceover', file)

        setUploading({ filename: file.name, progress: '入库…' })
        const ext = file.name.split('.').pop()?.toLowerCase()
        await createVoiceover({
          ossKey: up.ossKey, source: 'UPLOAD', category: cat,
          fileSize: up.fileSize, durationMs: probe.durationMs,
          format: ext, textContent: textCache[file.name],
        })
      } catch (e) {
        setError(`上传 ${file.name} 失败：${String(e)}`)
      }
    }
    setUploading(null)
    setTextCache({})
    void reload()
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, alignItems: 'flex-start' }}>
      {/* 左侧：分类导航（与素材库共用枚举） */}
      <div style={{ ...card, padding: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 4 }}>配音分类</div>
        <CategoryNavItem label="全部" icon={<Folder size={14} />} active={activeCategory === 'ALL'}
          onClick={() => setActiveCategory('ALL')} />
        {MATERIAL_CATEGORIES.map(c => (
          <CategoryNavItem key={c.value} label={c.label} icon={<Folder size={14} />}
            active={activeCategory === c.value} onClick={() => setActiveCategory(c.value)} />
        ))}
        <CategoryNavItem label="未分类" icon={<Folder size={14} />}
          active={activeCategory === UNCATEGORIZED_KEY} onClick={() => setActiveCategory(UNCATEGORIZED_KEY)}
          dim />
      </div>

      {/* 右侧：搜索 + 列表 */}
      <div>
        {error && <ErrorBar msg={error} onClose={() => setError(null)} />}

        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: 11 }} />
              <input
                placeholder="按文案搜索" value={text} onChange={e => setText(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 30, width: '100%' }}
              />
            </div>
            <button style={{ ...btnPrimary, cursor: 'pointer', marginLeft: 'auto' }} onClick={startUpload}>
              <Upload size={14} />上传配音
            </button>
            <input
              ref={fileInputRef}
              type="file" multiple accept="audio/*" style={{ display: 'none' }}
              onChange={e => { void onFilePicked(e.target.files); e.currentTarget.value = '' }}
            />
          </div>
          {uploading && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={14} className="spin" />
              {uploading.filename}：{uploading.progress}
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {activeCategory === 'ALL' ? '全部' : categoryLabel(activeCategory)} · 共 {total} 条配音
            </div>
            {loading && <Loader2 size={14} className="spin" color="var(--accent-primary)" />}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <th style={th}>ID</th>
                <th style={th}>OSS Key</th>
                <th style={th}>分类</th>
                <th style={th}>来源</th>
                <th style={th}>时长</th>
                <th style={th}>大小</th>
                <th style={th}>文案</th>
                <th style={th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={td}>{v.id}</td>
                  <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                    {v.ossKey?.split('/').pop()}
                  </td>
                  <td style={td}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 11,
                      background: v.category ? 'var(--rose-100)' : 'var(--bg-secondary)',
                      color: v.category ? 'var(--rose-700)' : 'var(--text-muted)',
                    }}>
                      {categoryLabel(v.category)}
                    </span>
                  </td>
                  <td style={td}>{v.source}</td>
                  <td style={td}>{v.durationMs ? `${(v.durationMs / 1000).toFixed(1)}s` : '—'}</td>
                  <td style={td}>{v.fileSize ? `${(v.fileSize / 1024).toFixed(1)}KB` : '—'}</td>
                  <td style={{ ...td, maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.textContent || '—'}
                  </td>
                  <td style={td}>
                    <button
                      style={{ ...btnDanger, padding: '2px 8px', fontSize: 11 }}
                      onClick={async () => {
                        if (!confirm('删除该配音?')) return
                        await deleteVoiceover(v.id); reload()
                      }}
                    ><Trash2 size={11} /></button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && !loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>暂无配音</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 上传前选分类弹窗 */}
      {pickerCategory && (
        <Modal onClose={() => setPickerCategory(null)} title="选择配音分类">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            选定后会立即弹出文件选择器；同一批文件会归到此分类。
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            {MATERIAL_CATEGORIES.map(c => {
              const active = pickerCategory === c.value
              return (
                <button key={c.value}
                  onClick={() => setPickerCategory(c.value)}
                  style={{
                    ...btn, padding: '10px 8px', fontSize: 12, justifyContent: 'center',
                    background: active ? 'var(--gradient-1)' : 'var(--bg-secondary)',
                    color: active ? '#fff' : 'var(--text-primary)',
                    border: active ? 'none' : '1px solid var(--border-light)',
                  }}>
                  {c.label}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button style={btn} onClick={() => setPickerCategory(null)}>取消</button>
            <button style={btnPrimary} onClick={confirmUploadCategory}>下一步：选文件</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontWeight: 500, fontSize: 12 }
const td: React.CSSProperties = { padding: '10px 12px' }

// ─────────────────────────── 标签管理 ───────────────────────────

function TagPanel() {
  const [tags, setTags] = useState<MaterialTagDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', category: '动机', color: '#e8365d', description: '' })

  useEffect(() => { void reload() }, [])

  async function reload() {
    setLoading(true)
    try {
      setTags(await listTags())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const grouped = useMemo(() => {
    const g: Record<string, MaterialTagDTO[]> = {}
    for (const t of tags) {
      if (!g[t.category]) g[t.category] = []
      g[t.category].push(t)
    }
    return g
  }, [tags])

  return (
    <div>
      {error && <ErrorBar msg={error} onClose={() => setError(null)} />}

      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>共 {tags.length} 个标签</div>
          <button style={btnPrimary} onClick={() => setCreating(true)}><Plus size={14} />新建标签</button>
        </div>
      </div>

      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat} style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>{cat}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {list.map(t => (
              <div key={t.id} style={{
                ...btn, padding: '6px 12px',
                color: t.color ?? 'var(--text-secondary)',
                border: `1px solid ${t.color ?? 'var(--border-light)'}`,
                cursor: 'default',
              }}>
                {t.name}
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 4, color: 'var(--text-muted)' }}
                  onClick={async () => {
                    if (!confirm(`删除标签 ${t.name}?`)) return
                    await deleteTag(t.id); reload()
                  }}
                ><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {tags.length === 0 && !loading && (
        <div style={{ ...card, textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          暂无标签
        </div>
      )}

      {creating && (
        <Modal onClose={() => setCreating(false)} title="新建标签">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={labelStyle}>
              <span>名称</span>
              <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </label>
            <label style={labelStyle}>
              <span>类别</span>
              <select style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option>动机</option><option>手法</option><option>场景</option><option>其他</option>
              </select>
            </label>
            <label style={labelStyle}>
              <span>颜色</span>
              <input type="color" style={{ ...inputStyle, padding: 4, width: 80 }} value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
            </label>
            <label style={labelStyle}>
              <span>描述</span>
              <input style={inputStyle} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button style={btn} onClick={() => setCreating(false)}>取消</button>
            <button
              style={btnPrimary}
              disabled={!form.name || !form.category}
              onClick={async () => {
                try {
                  await createTag(form)
                  setCreating(false)
                  setForm({ name: '', category: '动机', color: '#e8365d', description: '' })
                  reload()
                } catch (e) {
                  setError(String(e))
                }
              }}
            >创建</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }

// ─────────────────────────── 通用组件 ───────────────────────────

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(61,10,26,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)', borderRadius: 12, padding: 20,
          minWidth: 420, maxWidth: 600, boxShadow: 'var(--shadow-lg)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ErrorBar({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{
      ...card, borderColor: 'var(--danger)', color: 'var(--danger)',
      marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontSize: 13 }}>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
        <X size={16} />
      </button>
    </div>
  )
}

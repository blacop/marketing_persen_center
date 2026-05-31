import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, AlertCircle, Film, Upload, X } from 'lucide-react'
import { cmRemote, type CmRemoteCollection, type CmComposeBackendResult } from '../../../lib/cm/cmApi'
import SegmentClip from '../../../components/SegmentClip'

/**
 * 孙悟空 / 诸葛亮 模式编排器（共用页面，按路径末段分流）
 *  孙悟空：整段配音长度 + 全章节随机镜头填充
 *  诸葛亮：每章节目标时长 + 章节内随机镜头填充
 */
export default function CmComposerMode() {
  const loc = useLocation()
  const nav = useNavigate()
  const isSunwukong = loc.pathname.includes('sunwukong')

  const [colls, setColls] = useState<CmRemoteCollection[]>([])
  const [collCode, setCollCode] = useState<string | null>(null)
  const [duration, setDuration] = useState(isSunwukong ? 30 : 8)
  const [seed, setSeed] = useState<number | ''>('')
  const [narrationCode, setNarrationCode] = useState('')
  const [uploading, setUploading] = useState(false)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<CmComposeBackendResult | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    cmRemote.listCollections().then(all => {
      setColls(all)
      if (!collCode && all.length > 0) setCollCode(all[0].collectionCode)
    }).catch(e => setErr(e instanceof Error ? e.message : '加载品名失败'))
  }, [])

  const uploadNarration = async (file: File) => {
    setUploading(true); setErr(null)
    try {
      const r = await cmRemote.uploadAsset(file)
      setNarrationCode(r.assetCode)
    } catch (e) { setErr(e instanceof Error ? e.message : '上传配音失败') }
    finally { setUploading(false) }
  }

  const run = async () => {
    if (!collCode) { setErr('请选择品名'); return }
    setRunning(true); setErr(null); setResult(null)
    try {
      const seedVal = seed === '' ? undefined : Number(seed)
      const r = isSunwukong
        ? await cmRemote.sunwukong(collCode, duration, narrationCode || undefined, seedVal)
        : await cmRemote.zhuge(collCode, duration, seedVal)
      setResult(r)
      if (r.status === 'FAILED') setErr(r.errorMsg ?? '编排失败')
    } catch (e) { setErr(e instanceof Error ? e.message : '编排失败') }
    finally { setRunning(false) }
  }

  const title = isSunwukong ? '整段配音驱动混剪' : '按章节混剪'
  const subtitle = isSunwukong
    ? '整段配音驱动：以配音时长为骨架，从全部章节随机抽取镜头填充。适用直播集锦 / 电商短视频 / 信息流。'
    : '按章节高质量混剪：每章节内随机抽取镜头填到目标时长，章节顺序播放。'

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix')} style={backBtn}><ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录</button>

      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
          <Film size={18} color="var(--accent-primary)" style={{ verticalAlign: 'middle', marginRight: 8 }} />
          {title}
          <span style={{ marginLeft: 8, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 700 }}>backend live</span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>{subtitle}</div>
      </div>

      <Card title="① 选择品名">
        <FormRow label="品名">
          {colls.length === 0 ? (
            <Link to="/cutmatrix/explorer" style={{ fontSize: '0.74rem', color: 'var(--accent-primary)' }}>请先到「素材组织」创建品名 →</Link>
          ) : (
            <select value={collCode ?? ''} onChange={e => setCollCode(e.target.value)} style={inp}>
              {colls.map(c => <option key={c.collectionCode} value={c.collectionCode}>{c.name} {c.skuId ? `· ${c.skuId}` : ''}</option>)}
            </select>
          )}
        </FormRow>
      </Card>

      <Card title="② 编排参数">
        <FormRow label={isSunwukong ? '总配音时长（秒）' : '每章节时长（秒）'}>
          <input type="number" min={1} value={duration} onChange={e => setDuration(Math.max(1, Number(e.target.value)))} style={inp} />
        </FormRow>
        <FormRow label="随机种子（可空）">
          <input value={seed} onChange={e => setSeed(e.target.value === '' ? '' : Number(e.target.value))} placeholder="留空 = 当前时间戳" style={inp} />
        </FormRow>
        {isSunwukong && (
          <FormRow label="配音 mp3 / wav（可选, 替换原声）">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px dashed var(--border-light)',
                borderRadius: 8, cursor: uploading ? 'wait' : 'pointer', background: 'var(--bg-primary)', fontSize: '0.78rem',
                color: 'var(--text-secondary)', flex: 1,
              }}>
                <Upload size={14} /> {uploading ? '上传中…' : (narrationCode ? `已上传: ${narrationCode}` : '点击上传配音')}
                <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) void uploadNarration(f) }} />
              </label>
              {narrationCode && !uploading && (
                <button
                  onClick={() => setNarrationCode('')}
                  title="移除配音"
                  style={{ background: 'transparent', border: '1px solid var(--border-light)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)', padding: '6px 8px', display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </FormRow>
        )}
      </Card>

      {err && <div style={errBox}><AlertCircle size={13} /> {err}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button onClick={run} disabled={running || !collCode} style={{ ...btnPrimary, padding: '10px 20px', fontSize: '0.85rem' }}>
          <Play size={14} style={{ marginRight: 6 }} />
          {running ? '编排中（ffmpeg 渲染中…）' : `运行 ${title} → 实出 mp4`}
        </button>
      </div>

      {result && (
        <Card title="③ 编排结果">
          <div style={{ marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, background: result.status === 'SUCCEEDED' ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)', color: result.status === 'SUCCEEDED' ? '#15803d' : '#ef4444', fontWeight: 700 }}>{result.status}</span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              任务 {result.taskCode.slice(0, 16)} · 总时长 {Number(result.totalDurationSec).toFixed(1)}s · {result.clips.length} 个片段
            </span>
          </div>
          {result.resultVideoUrl && (
            <div style={{ marginBottom: 14 }}>
              <video controls style={{ width: '100%', maxHeight: 480, borderRadius: 8, background: '#000' }}>
                <source src={result.resultVideoUrl} type="video/mp4" />
              </video>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'monospace' }}>{result.resultVideoUrl}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0' }}>
            {result.clips.map((c, i) => (
              <div key={i} style={{ width: 140, flexShrink: 0 }}>
                <SegmentClip src={c.videoUrl} startSec={Number(c.startSec)} endSec={Number(c.endSec)} label={c.stageCode} height={90} />
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 2 }}>#{i+1} · {Number(c.durationSec).toFixed(1)}s</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '16px 18px', marginBottom: 14 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}
function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 10, alignItems: 'center' }}>
      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{label}</span>
      {children}
    </div>
  )
}
const inp: React.CSSProperties = { padding: '6px 10px', borderRadius: 7, border: '1px solid var(--border-light)', fontSize: '0.78rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }
const backBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' }
const errBox: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 12 }

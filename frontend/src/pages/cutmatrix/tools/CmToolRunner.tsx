import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Upload, AlertCircle, Wrench } from 'lucide-react'
import { cmRemote, type CmToolBackendResult } from '../../../lib/cm/cmApi'
import { findCmCard } from '../../../lib/cm/cmCatalog'

/**
 * 5 个原子工具的统一运行器（按 :key 路由分流）。
 *  - aspect-convert / audio-ops / uniform-split / silence-filter / scene-split
 *  共用：上传 inputAsset → 配置参数 → 运行 → 显示输出 mp4 / 多文件预览
 */
export default function CmToolRunner() {
  const loc = useLocation()
  const nav = useNavigate()
  const key = loc.pathname.split('/').filter(Boolean).pop()
  const card = key ? findCmCard(key) : undefined

  const [inputCode, setInputCode] = useState('')
  const [bgmCode, setBgmCode] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadInfo, setUploadInfo] = useState<{ name: string; size: number; url: string } | null>(null)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<CmToolBackendResult | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // tool-specific params
  const [targetAspect, setTargetAspect] = useState('9:16')
  const [shortEdge, setShortEdge] = useState(1080)
  const [aspectMode, setAspectMode] = useState('crop')

  const [removeOriginal, setRemoveOriginal] = useState(false)
  const [volume, setVolume] = useState(1.0)
  const [bgmVolume, setBgmVolume] = useState(0.3)

  const [segmentSec, setSegmentSec] = useState(5)
  const [noiseDb, setNoiseDb] = useState(-30)
  const [minSilenceSec, setMinSilenceSec] = useState(0.5)
  const [sceneThreshold, setSceneThreshold] = useState(0.4)
  const [minSegSec, setMinSegSec] = useState(1.5)

  // subtitle-gen
  const [subFormat, setSubFormat] = useState<'srt' | 'vtt' | 'both'>('srt')
  const [subLang, setSubLang] = useState<'zh' | 'en'>('zh')
  const [subBurnIn, setSubBurnIn] = useState(false)

  // add-bg
  const [bgColor, setBgColor] = useState('#000000')
  const [outWidth, setOutWidth] = useState(1080)
  const [outHeight, setOutHeight] = useState(1920)
  const [bgScaleMode, setBgScaleMode] = useState<'fit' | 'cover'>('fit')
  const [bgScaleRatio, setBgScaleRatio] = useState(0.7)
  const [bgAnchor, setBgAnchor] = useState<'center' | 'top' | 'bottom'>('center')

  // text-style-fission
  const [tsText, setTsText] = useState('限时秒杀 立省 50%')
  const [tsCount, setTsCount] = useState(4)
  const [tsFontSize, setTsFontSize] = useState(64)
  const [tsFontColor, setTsFontColor] = useState('#FFFFFF')
  const [tsBorderColor, setTsBorderColor] = useState('#000000')
  const [tsXPct, setTsXPct] = useState(50)
  const [tsYPct, setTsYPct] = useState(80)
  const [tsPreset, setTsPreset] = useState<'default' | 'shock' | 'cute' | 'business'>('shock')

  if (!card) {
    return (
      <div style={{ padding: 40 }}>
        <div style={errBox}><AlertCircle size={14} /> 未知工具 key={key}</div>
        <button onClick={() => nav('/cutmatrix/tools')} style={btnGhost}>← 返回</button>
      </div>
    )
  }

  const handleUpload = async (file: File, target: 'main' | 'bgm') => {
    setUploading(true); setErr(null)
    try {
      const r = await cmRemote.uploadAsset(file)
      if (target === 'main') {
        setInputCode(r.assetCode)
        setUploadInfo({ name: r.originalName, size: r.size, url: r.streamUrl })
      } else {
        setBgmCode(r.assetCode)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : '上传失败')
    } finally { setUploading(false) }
  }

  const run = async () => {
    if (!inputCode) { setErr('请先上传输入视频'); return }
    setRunning(true); setErr(null); setResult(null)
    try {
      let r: CmToolBackendResult
      switch (key) {
        case 'aspect-convert':
          r = await cmRemote.toolAspectConvert({ inputAssetCode: inputCode, targetAspect, shortEdge, mode: aspectMode })
          break
        case 'audio-ops':
          r = await cmRemote.toolAudioOps({ inputAssetCode: inputCode, removeOriginal, bgmAssetCode: bgmCode || undefined, volume, bgmVolume })
          break
        case 'uniform-split':
          r = await cmRemote.toolUniformSplit({ inputAssetCode: inputCode, segmentSec })
          break
        case 'silence-filter':
          r = await cmRemote.toolSilenceFilter({ inputAssetCode: inputCode, noiseDb, minSilenceSec })
          break
        case 'scene-split':
          r = await cmRemote.toolSceneSplit({ inputAssetCode: inputCode, sceneThreshold, minSegmentSec: minSegSec })
          break
        case 'subtitle-gen':
          r = await cmRemote.toolSubtitleGen({ inputAssetCode: inputCode, format: subFormat, lang: subLang, burnIn: subBurnIn })
          break
        case 'add-bg':
          r = await cmRemote.toolAddBg({
            inputAssetCode: inputCode,
            bgImageAssetCode: bgmCode || undefined,  // 复用次级 asset 槽
            bgColor: bgmCode ? undefined : bgColor,
            outWidth, outHeight,
            scaleMode: bgScaleMode,
            scaleRatio: bgScaleRatio,
            anchor: bgAnchor,
          })
          break
        case 'text-style-fission':
          r = await cmRemote.toolTextStyleFission({
            inputAssetCode: inputCode,
            text: tsText,
            count: tsCount,
            fontSize: tsFontSize,
            fontColor: tsFontColor,
            borderColor: tsBorderColor,
            xPct: tsXPct,
            yPct: tsYPct,
            stylePreset: tsPreset,
          })
          break
        default:
          throw new Error('该工具暂未接入运行器: ' + key)
      }
      setResult(r)
      if (r.status === 'FAILED') setErr(r.message ?? '运行失败')
    } catch (e) {
      setErr(e instanceof Error ? e.message : '运行失败')
    } finally { setRunning(false) }
  }

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1200, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix/tools')} style={backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回小工具目录
      </button>

      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
          <Wrench size={18} color="var(--accent-primary)" style={{ verticalAlign: 'middle', marginRight: 8 }} />
          {card.name}
          <span style={{ marginLeft: 8, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontWeight: 700 }}>backend live</span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{card.desc}</div>
      </div>

      {/* 上传输入 */}
      <Card title="① 输入视频">
        <FileDrop onPick={f => handleUpload(f, 'main')} accept="video/*" hint={uploadInfo ? `已上传 ${uploadInfo.name} (${(uploadInfo.size/1024/1024).toFixed(2)}MB)` : '点击或拖入视频文件'} busy={uploading} />
        {inputCode && (
          <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            assetCode: <code>{inputCode}</code>
          </div>
        )}
      </Card>

      {/* 工具参数 */}
      <Card title="② 工具参数">
        {key === 'aspect-convert' && (
          <>
            <FormRow label="目标比例">
              <select value={targetAspect} onChange={e => setTargetAspect(e.target.value)} style={inp}>
                {['9:16','16:9','1:1','4:3','3:4'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </FormRow>
            <FormRow label="短边像素"><input type="number" value={shortEdge} onChange={e => setShortEdge(Number(e.target.value))} style={inp} /></FormRow>
            <FormRow label="模式">
              <select value={aspectMode} onChange={e => setAspectMode(e.target.value)} style={inp}>
                <option value="crop">crop（居中裁切）</option>
                <option value="fit">fit（黑边填充）</option>
              </select>
            </FormRow>
          </>
        )}
        {key === 'audio-ops' && (
          <>
            <FormRow label="去除原声">
              <input type="checkbox" checked={removeOriginal} onChange={e => setRemoveOriginal(e.target.checked)} />
            </FormRow>
            <FormRow label="原声音量倍数（去原声后无效）"><input type="number" step="0.1" value={volume} onChange={e => setVolume(Number(e.target.value))} style={inp} /></FormRow>
            <FormRow label="BGM 文件（可选）">
              <FileDrop onPick={f => handleUpload(f, 'bgm')} accept="audio/*" hint={bgmCode ? `已上传 BGM: ${bgmCode}` : '点击或拖入 mp3/wav'} busy={uploading} compact />
            </FormRow>
            <FormRow label="BGM 音量倍数"><input type="number" step="0.1" value={bgmVolume} onChange={e => setBgmVolume(Number(e.target.value))} style={inp} /></FormRow>
          </>
        )}
        {key === 'uniform-split' && (
          <FormRow label="每段秒数"><input type="number" min={1} value={segmentSec} onChange={e => setSegmentSec(Number(e.target.value))} style={inp} /></FormRow>
        )}
        {key === 'silence-filter' && (
          <>
            <FormRow label="静音阈值 dB（默认 -30）"><input type="number" value={noiseDb} onChange={e => setNoiseDb(Number(e.target.value))} style={inp} /></FormRow>
            <FormRow label="最小静音时长 秒（默认 0.5）"><input type="number" step="0.1" value={minSilenceSec} onChange={e => setMinSilenceSec(Number(e.target.value))} style={inp} /></FormRow>
          </>
        )}
        {key === 'scene-split' && (
          <>
            <FormRow label="场景变化阈值 0-1（默认 0.4）"><input type="number" step="0.05" min={0} max={1} value={sceneThreshold} onChange={e => setSceneThreshold(Number(e.target.value))} style={inp} /></FormRow>
            <FormRow label="每段最小秒数（默认 1.5）"><input type="number" step="0.5" value={minSegSec} onChange={e => setMinSegSec(Number(e.target.value))} style={inp} /></FormRow>
          </>
        )}
        {key === 'subtitle-gen' && (
          <>
            <FormRow label="输出格式">
              <select value={subFormat} onChange={e => setSubFormat(e.target.value as 'srt' | 'vtt' | 'both')} style={inp}>
                <option value="srt">SRT（剪映 / Premiere 通用）</option>
                <option value="vtt">VTT（Web video 通用）</option>
                <option value="both">两种都生成</option>
              </select>
            </FormRow>
            <FormRow label="语言">
              <select value={subLang} onChange={e => setSubLang(e.target.value as 'zh' | 'en')} style={inp}>
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </FormRow>
            <FormRow label="硬烧字幕到视频">
              <input type="checkbox" checked={subBurnIn} onChange={e => setSubBurnIn(e.target.checked)} />
              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginLeft: 8 }}>勾选会输出带字幕的 mp4，否则只输出字幕文件</span>
            </FormRow>
          </>
        )}
        {key === 'add-bg' && (
          <>
            <FormRow label="背景图（可选，优先于纯色）">
              <FileDrop onPick={f => handleUpload(f, 'bgm')} accept="image/*"
                hint={bgmCode ? `已上传背景图: ${bgmCode}` : '点击或拖入 jpg/png/webp'} busy={uploading} compact />
            </FormRow>
            <FormRow label="背景纯色（无图时使用）">
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ ...inp, padding: 2, width: 60 }} />
            </FormRow>
            <FormRow label="输出尺寸">
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" value={outWidth} onChange={e => setOutWidth(Number(e.target.value))} style={inp} placeholder="宽" />
                <span style={{ alignSelf: 'center' }}>×</span>
                <input type="number" value={outHeight} onChange={e => setOutHeight(Number(e.target.value))} style={inp} placeholder="高" />
              </div>
            </FormRow>
            <FormRow label="视频缩放模式">
              <select value={bgScaleMode} onChange={e => setBgScaleMode(e.target.value as 'fit' | 'cover')} style={inp}>
                <option value="fit">fit（保留全图，留边）</option>
                <option value="cover">cover（铺满，裁掉超出）</option>
              </select>
            </FormRow>
            <FormRow label={`视频占比 ${(bgScaleRatio * 100).toFixed(0)}%`}>
              <input type="range" min={0.2} max={1} step={0.05} value={bgScaleRatio}
                onChange={e => setBgScaleRatio(Number(e.target.value))} style={{ width: 200 }} />
            </FormRow>
            <FormRow label="位置">
              <select value={bgAnchor} onChange={e => setBgAnchor(e.target.value as 'center' | 'top' | 'bottom')} style={inp}>
                <option value="center">居中</option>
                <option value="top">靠上</option>
                <option value="bottom">靠下</option>
              </select>
            </FormRow>
          </>
        )}
        {key === 'text-style-fission' && (
          <>
            <FormRow label="文字内容">
              <input type="text" value={tsText} onChange={e => setTsText(e.target.value)} style={inp} maxLength={40} />
            </FormRow>
            <FormRow label={`版本数 ${tsCount}`}>
              <input type="range" min={1} max={8} value={tsCount} onChange={e => setTsCount(Number(e.target.value))} style={{ width: 200 }} />
            </FormRow>
            <FormRow label="风格预设">
              <select value={tsPreset} onChange={e => setTsPreset(e.target.value as 'default' | 'shock' | 'cute' | 'business')} style={inp}>
                <option value="default">通用</option>
                <option value="shock">震撼大字（电商促销）</option>
                <option value="cute">少女风（粉色系）</option>
                <option value="business">商务风（深色稳重）</option>
              </select>
            </FormRow>
            <FormRow label={`字号 ${tsFontSize}px`}>
              <input type="range" min={24} max={120} value={tsFontSize} onChange={e => setTsFontSize(Number(e.target.value))} style={{ width: 200 }} />
            </FormRow>
            <FormRow label="基础色 / 描边色">
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="color" value={tsFontColor} onChange={e => setTsFontColor(e.target.value)} style={{ ...inp, padding: 2, width: 60 }} />
                <input type="color" value={tsBorderColor} onChange={e => setTsBorderColor(e.target.value)} style={{ ...inp, padding: 2, width: 60 }} />
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', alignSelf: 'center' }}>预设会覆盖此处</span>
              </div>
            </FormRow>
            <FormRow label={`位置 X ${tsXPct}%`}>
              <input type="range" min={0} max={100} value={tsXPct} onChange={e => setTsXPct(Number(e.target.value))} style={{ width: 200 }} />
            </FormRow>
            <FormRow label={`位置 Y ${tsYPct}%`}>
              <input type="range" min={0} max={100} value={tsYPct} onChange={e => setTsYPct(Number(e.target.value))} style={{ width: 200 }} />
            </FormRow>
          </>
        )}
        {!['aspect-convert','audio-ops','uniform-split','silence-filter','scene-split','subtitle-gen','add-bg','text-style-fission'].includes(key ?? '') && (
          <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            本工具尚未接入运行器（仅目录占位）。规划列表见 task_plan.md。
          </div>
        )}
      </Card>

      {err && <div style={errBox}><AlertCircle size={13} /> {err}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button onClick={run} disabled={running || !inputCode} style={{ ...btnPrimary, padding: '10px 20px', fontSize: '0.85rem' }}>
          <Play size={14} style={{ marginRight: 6 }} />
          {running ? '运行中（ffmpeg 处理中…）' : '运行 → 实出 mp4'}
        </button>
      </div>

      {result && (
        <Card title="③ 运行结果">
          <div style={{ marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 99, background: result.status === 'SUCCEEDED' ? 'rgba(34,197,94,0.10)' : 'rgba(239,68,68,0.10)', color: result.status === 'SUCCEEDED' ? '#15803d' : '#ef4444', fontWeight: 700 }}>{result.status}</span>
            {result.message && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{result.message}</span>}
          </div>
          {result.streamUrl && (
            <div style={{ marginBottom: 12 }}>
              <video controls style={{ width: '100%', maxHeight: 420, borderRadius: 8, background: '#000' }}>
                <source src={result.streamUrl} type="video/mp4" />
              </video>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 4, fontFamily: 'monospace' }}>{result.streamUrl}</div>
            </div>
          )}
          {result.streamUrls && result.streamUrls.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
              {result.streamUrls.map((u, i) => (
                <div key={u}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>part {i + 1}</div>
                  <video controls style={{ width: '100%', borderRadius: 8, background: '#000' }}>
                    <source src={u} type="video/mp4" />
                  </video>
                </div>
              ))}
            </div>
          )}
          {result.stderrTail && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.74rem', color: 'var(--text-muted)' }}>ffmpeg stderr 末端</summary>
              <pre style={{ fontSize: '0.65rem', background: 'var(--bg-primary)', padding: 10, borderRadius: 8, maxHeight: 200, overflow: 'auto' }}>{result.stderrTail}</pre>
            </details>
          )}
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
function FileDrop({ onPick, accept, hint, busy, compact }: { onPick: (f: File) => void; accept: string; hint: string; busy: boolean; compact?: boolean }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 8, padding: compact ? '8px 12px' : '20px 12px', border: '1px dashed var(--border-light)', borderRadius: 8,
      cursor: busy ? 'wait' : 'pointer', background: 'var(--bg-primary)', fontSize: '0.78rem',
      color: 'var(--text-secondary)',
    }}>
      <Upload size={14} /> {busy ? '上传中…' : hint}
      <input type="file" accept={accept} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f) }} />
    </label>
  )
}

const inp: React.CSSProperties = { padding: '6px 10px', borderRadius: 7, border: '1px solid var(--border-light)', fontSize: '0.78rem', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' }
const backBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', marginBottom: 14, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' }
const errBox: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 7, fontSize: '0.74rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', marginBottom: 12 }

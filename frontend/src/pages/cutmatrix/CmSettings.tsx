import { useState, useEffect } from 'react'
import { Sliders, Folder, Trash2, Server, Settings as SettingsIcon, RefreshCw } from 'lucide-react'
import { cmStore } from '../../lib/cm/cmApi'
import { apiFetch } from '../../lib/apiClient'

type BackendStatus = 'checking' | 'online' | 'offline'

async function probeBackend(): Promise<BackendStatus> {
  try {
    const res = await apiFetch('/cm/collection/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(4000),
    })
    return res.ok || res.status === 400 ? 'online' : 'offline'
  } catch {
    return 'offline'
  }
}

export default function CmSettings() {
  const [cleared, setCleared] = useState(false)
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking')
  const [probing, setProbing] = useState(false)
  const colls = cmStore.listCollections()

  const runProbe = async () => {
    setProbing(true)
    setBackendStatus('checking')
    const s = await probeBackend()
    setBackendStatus(s)
    setProbing(false)
  }

  useEffect(() => { runProbe() }, [])

  const statusNode = backendStatus === 'checking'
    ? <span style={{ color: 'var(--text-muted)' }}>● 探测中…</span>
    : backendStatus === 'online'
      ? <span style={{ color: '#22c55e' }}>● 已连接</span>
      : <span style={{ color: '#ef4444' }}>● 离线（后端未启动）</span>

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, marginBottom: 16 }}>
        <Sliders size={18} color="var(--accent-primary)" style={{ verticalAlign: 'middle', marginRight: 8 }} />
        本机配置
      </h2>

      <Section title="存储位置" icon={Folder}>
        <Row label="素材本地缓存"><code style={code}>localStorage::cm_collections / cm_chapters / cm_segments</code></Row>
        <Row label="素材集数量">{colls.length} 个品名</Row>
        <Row label="对象存储">未配置（P1 接入 OSS / S3）</Row>
      </Section>

      <Section title="后端连接" icon={Server}>
        <Row label="API base"><code style={code}>/cm/*</code></Row>
        <Row label="状态">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {statusNode}
            <button onClick={runProbe} disabled={probing} title="重新探测"
              style={{ background: 'transparent', border: 'none', cursor: probing ? 'not-allowed' : 'pointer', padding: 2, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={12} style={{ animation: probing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </span>
        </Row>
      </Section>

      <Section title="渲染引擎" icon={SettingsIcon}>
        <Row label="本地 ffmpeg">不需要（自托管 docker 内 ffmpeg）</Row>
        <Row label="渲染队列">P0 未启用</Row>
      </Section>

      <Section title="危险操作" icon={Trash2}>
        <button onClick={() => { if (confirm('确认清空所有本地缓存的素材集 / 章节 / 片段?')) { cmStore.clearAll(); setCleared(true) } }}
          style={{ padding: '8px 14px', borderRadius: 7, background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
          清空本地素材缓存
        </button>
        {cleared && <span style={{ marginLeft: 10, fontSize: '0.74rem', color: '#22c55e' }}>✓ 已清空</span>}
      </Section>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Folder; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '16px 18px', marginBottom: 12 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={14} color="var(--accent-primary)" />{title}
      </div>
      {children}
    </div>
  )
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.78rem', borderBottom: '1px dashed var(--border-light)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span>{children}</span>
    </div>
  )
}
const code: React.CSSProperties = { fontSize: '0.7rem', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 4 }

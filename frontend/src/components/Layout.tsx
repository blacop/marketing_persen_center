import { useRef, useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Bot, Film, Megaphone, BarChart3,
  Monitor, Settings, Users,
  Globe, CreditCard, CheckSquare, Target, Inbox,
  Brain, Workflow, TrendingUp, UserCheck,
  Banknote, Layers, Sparkles, FlaskConical, ShieldAlert,
  Radio, AlertCircle, Pen, Video, Package,
  X, Heart, ShoppingBag, Database, GitBranch,
  MessageCircle, Image, Archive, FileText, Send,
  Zap, Rocket, HardDrive, Activity, RotateCcw, PlayCircle, BookOpen,
  ChevronDown, Wrench, Sliders, Folder, Palette, Scissors,
} from 'lucide-react'
import AIConfigPanel from './AIConfigPanel'
import { useAIConfigPanel } from '../context/AIConfigContext'

/* ── 主题切换 ── */
const THEME_KEY = 'app_theme'
type AppTheme = 'white' | 'dark' | 'pink' | 'blue'

const THEMES: { id: AppTheme; label: string; desc: string; dot: string }[] = [
  { id: 'white', label: '白色', desc: '白天',    dot: '#ffb4c6' },  // `:root` 白粉（默认）
  { id: 'dark',  label: '黑色', desc: '黑夜',    dot: '#1e293b' },
  { id: 'pink',  label: '粉色', desc: '自主选择', dot: '#f4587a' },  // 更浓郁粉色
  { id: 'blue',  label: '蓝色', desc: '蓝色',    dot: '#2563eb' },
]

function ThemeSwitcher({ theme, setTheme }: { theme: AppTheme; setTheme: (t: AppTheme) => void }) {
  const [open, setOpen] = useState(false)
  const activeDot = THEMES.find(t => t.id === theme)?.dot ?? '#cbd5e1'

  return (
    <div style={{ position: 'relative' }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 6,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 8, boxShadow: 'var(--shadow-md)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, zIndex: 10,
        }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 8px', borderRadius: 8, cursor: 'pointer',
                background: theme === t.id ? 'var(--bg-hover)' : 'transparent',
                border: theme === t.id ? '1.5px solid var(--accent-primary)' : '1.5px solid transparent',
                fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)',
              }}
            >
              <span style={{
                width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
                background: t.dot,
                border: '1.5px solid rgba(0,0,0,0.08)',
                boxShadow: t.id === 'dark' ? 'none' : `0 0 5px ${t.dot}88`,
              }} />
              <div>
                <div style={{ lineHeight: 1.2 }}>{t.label}</div>
                <div style={{ fontSize: '0.62rem', fontWeight: 400, color: 'var(--text-muted)' }}>{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 10px', borderRadius: 8, border: 'none',
          background: open ? 'var(--bg-hover)' : 'transparent',
          cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 500,
        }}
      >
        <Palette size={13} />
        <span>更换主题</span>
        <span style={{
          marginLeft: 'auto', width: 10, height: 10, borderRadius: '50%',
          background: activeDot,
          border: '1.5px solid rgba(0,0,0,0.08)',
          flexShrink: 0,
        }} />
      </button>
    </div>
  )
}

/**
 * 可折叠侧边导航分组：点击标题展开 / 收起下方菜单项。
 * - 当前路由匹配 paths 中任一前缀时：自动展开 + 标题高亮 (.active)。
 * - 否则使用 localStorage 中的折叠状态（默认收起）。
 * - localStorage key: nav-group:<title>
 */
function NavGroup({
  title,
  paths,
  children,
  defaultOpen = false,
}: {
  title: string
  /** 当前路由前缀匹配集合，用于判断分组是否处于激活状态 */
  paths: string[]
  children: ReactNode
  defaultOpen?: boolean
}) {
  const location = useLocation()
  // 注：v2 重置一次，因 v1 默认全部展开，会覆盖新版"默认收起"
  const storageKey = `nav-group:v2:${title}`

  // 精确匹配：pathname 等于 paths 中任一条目即视为激活；
  // 不做前缀匹配，避免 "/content" 误匹配 "/content/creative" 等姊妹分组下的路径。
  // 子路由（如 /content/script/123 详情页）应在 paths 中显式列出。
  const isActiveGroup = paths.includes(location.pathname)

  const [userOpen, setUserOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultOpen
    const stored = window.localStorage.getItem(storageKey)
    return stored === null ? defaultOpen : stored === '1'
  })

  // 路由切换到本组内时自动展开（不覆盖用户后续手动收起）
  useEffect(() => {
    if (isActiveGroup) setUserOpen(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActiveGroup])

  const open = userOpen

  const toggle = () => {
    setUserOpen(prev => {
      const next = !prev
      try { window.localStorage.setItem(storageKey, next ? '1' : '0') } catch { /* ignore */ }
      return next
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={`nav-section-title ${isActiveGroup ? 'active' : ''}`}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', border: 'none',
          margin: 0, cursor: 'pointer',
          font: 'inherit', textAlign: 'left',
        }}
        aria-expanded={open}
      >
        <ChevronDown
          size={11}
          style={{
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
            opacity: 0.7,
          }}
        />
        <span style={{ flex: 1 }}>{title}</span>
        {isActiveGroup && !open && (
          <span
            aria-hidden="true"
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--accent-primary)', flexShrink: 0,
              boxShadow: '0 0 6px color-mix(in srgb, var(--accent-primary) 60%, transparent)',
            }}
          />
        )}
      </button>
      {open && <div className="nav-section-items">{children}</div>}
    </>
  )
}

export default function Layout() {
  const { config, panelOpen, setPanelOpen } = useAIConfigPanel()
  const panelRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // 主题
  const [theme, setTheme] = useState<AppTheme>(() => {
    try { return (localStorage.getItem(THEME_KEY) as AppTheme) || 'white' } catch { return 'white' }
  })

  const applyTheme = (t: AppTheme) => {
    setTheme(t)
    try { localStorage.setItem(THEME_KEY, t) } catch { /* ignore */ }
  }

  useEffect(() => {
    // 白色（默认）= 不设 data-theme，由 :root 变量生效（白粉配色）
    // 其他主题 = 设置对应 data-theme attribute
    if (theme === 'white') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  // 初始化时立即应用（避免闪烁）
  useEffect(() => {
    if (theme === 'white') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 页面切换时自动关闭面板
  useEffect(() => {
    setPanelOpen(false)
  }, [location.pathname, setPanelOpen])

  // 点击外部关闭面板
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // 检查是否点击了触发按钮
        const target = e.target as HTMLElement
        if (target.closest('[data-ai-config-trigger]')) return
        setPanelOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && panelOpen) setPanelOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [panelOpen, setPanelOpen])

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>玛丽黛佳</h1>
          <p>美妆智能投流中心</p>
        </div>
        <nav className="sidebar-nav">

          {/* ── L1: 顶部固定项（始终可见，最高优先级） ── */}
          <NavLink to="/workbench" className={({ isActive }) => `nav-item nav-l1 ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              background: isActive ? undefined : 'var(--bg-hover)',
              borderLeft: isActive ? undefined : '2px solid var(--accent-primary)',
            })}>
            {({ isActive }) => (
              <><Inbox size={15} color={isActive ? 'white' : 'var(--accent-primary)'} />
              <span style={{ color: isActive ? 'white' : 'var(--accent-primary)', fontWeight: 600 }}>人工工作台</span></>
            )}
          </NavLink>
          <NavLink to="/beukay-claw" className={({ isActive }) => `nav-item nav-l1 ${isActive ? 'active' : ''}`}
            style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 15 }}>💄</span>
            <span>Beukay agent</span>
          </NavLink>

          <NavGroup title="全局概览" paths={['/', '/agents']}>
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={15} /> 控制台
            </NavLink>
            <NavLink to="/agents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Bot size={15} /> 智能体矩阵
            </NavLink>
          </NavGroup>

          {/* Agent OS — 冻结中，过度设计暂不展示
          <NavGroup title="Agent OS" paths={['/agent-studio', '/agent-playground', '/agent-registry', '/skill-registry', '/agent-identities', '/ai-tracker', '/knowledge-base']}>
            <NavLink to="/agent-studio" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Sparkles size={15} /> Agent Studio
            </NavLink>
            <NavLink to="/agent-playground" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <PlayCircle size={15} /> Agent Playground
            </NavLink>
            <NavLink to="/agent-registry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Bot size={15} /> Agent Registry
            </NavLink>
            <NavLink to="/skill-registry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Package size={15} /> Skill Registry
            </NavLink>
            <NavLink to="/agent-identities" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={15} /> Agent Identity
            </NavLink>
            <NavLink to="/ai-tracker" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Activity size={15} /> Observability
              <span style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#10b981', color: '#fff', fontWeight: 600 }}>闭环</span>
            </NavLink>
            <NavLink to="/knowledge-base" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BookOpen size={15} /> 知识库
            </NavLink>
          </NavGroup>
          */}

          <NavGroup title="视频矩阵" paths={['/cutmatrix', '/cutmatrix/explorer', '/cutmatrix/settings', '/cutmatrix/wf/zhuge-mode']}>
            <NavLink to="/cutmatrix" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Wrench size={15} /> 工作流
              <span style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'var(--accent-primary)', color: '#fff', fontWeight: 600 }}>NEW</span>
            </NavLink>
            <NavLink to="/cutmatrix/explorer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Folder size={15} /> 素材组织
            </NavLink>
            <NavLink to="/cutmatrix/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Sliders size={15} /> 本机配置
            </NavLink>
          </NavGroup>

          <NavGroup title="AI决策系统" paths={['/data-hub', '/data-warehouse', '/models', '/ai-decisions', '/ai-launch', '/automation', '/experiments', '/attribution']}>
            {/* ① 数据输入 */}
            <NavLink to="/data-hub" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Database size={15} /> 数据采集中心
            </NavLink>
            <NavLink to="/data-warehouse" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <HardDrive size={15} /> 数据仓库
            </NavLink>
            {/* ② AI训练 */}
            <NavLink to="/models" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Brain size={15} /> AI 模型中心
            </NavLink>
            {/* ③ AI决策 */}
            <NavLink to="/ai-decisions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Zap size={15} /> AI 决策中心
              <span style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#e8365d', color: '#fff', fontWeight: 700 }}>23</span>
            </NavLink>
            <NavLink to="/ai-launch" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Rocket size={15} /> AI 投放向导
              <span style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 6px', borderRadius: 8, background: '#22c55e', color: '#fff', fontWeight: 600 }}>新手必看</span>
            </NavLink>
            {/* ④ 自动执行 */}
            <NavLink to="/automation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Workflow size={15} /> 自动化引擎
            </NavLink>
            {/* ⑤ 验证 */}
            <NavLink to="/experiments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FlaskConical size={15} /> 实验中心
            </NavLink>
            {/* ⑥ 归因 */}
            <NavLink to="/attribution" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <GitBranch size={15} /> 归因分析
            </NavLink>
          </NavGroup>

          <NavGroup title="种草内容飞轮" paths={['/flywheel', '/content', '/content/manga', '/content/script', '/content/video']}>
            <NavLink to="/flywheel" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? undefined : 'rgba(14,165,233,0.08)',
                borderLeft: isActive ? undefined : '2px solid rgba(14,165,233,0.5)',
              })}>
              {({ isActive }) => (
                <><RotateCcw size={15} color={isActive ? 'white' : '#0ea5e9'} />
                <span style={{ color: isActive ? 'white' : '#0ea5e9', fontWeight: 600 }}>AI内容飞轮引擎</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, padding: '1px 5px', borderRadius: 8, background: '#0ea5e9', color: '#fff', fontWeight: 700 }}>闭环</span></>
              )}
            </NavLink>
            <NavLink to="/content" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Film size={15} /> 内容总控台
            </NavLink>
            <NavLink to="/content/manga" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Package size={15} /> 产品线管理
            </NavLink>
            <NavLink to="/content/script" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Pen size={15} /> 种草脚本工坊
            </NavLink>
            <NavLink to="/content/video" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Video size={15} /> 视频素材产出
            </NavLink>
          </NavGroup>

          <NavGroup title="AI素材生产" paths={['/content/creative', '/content/review']}>
            <NavLink to="/content/creative" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Sparkles size={15} /> AI创意工厂
            </NavLink>
            <NavLink to="/content/review" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <CheckSquare size={15} /> 内容合规审核
            </NavLink>
          </NavGroup>

          <NavGroup title="🇨🇳 国内投放" paths={['/ads', '/ads/campaigns', '/ads/kuaishou', '/ads/douyin', '/ads/xiaohongshu', '/ads/budget']}>
            <NavLink to="/ads" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Megaphone size={15} /> AI投手总控台
            </NavLink>
            <NavLink to="/ads/campaigns" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Target size={15} /> 营销活动管理
            </NavLink>
            <NavLink to="/ads/kuaishou" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Film size={15} /> 快手·AI投放
            </NavLink>
            <NavLink to="/ads/douyin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Heart size={15} /> 抖音·AI投放
            </NavLink>
            <NavLink to="/ads/xiaohongshu" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ShoppingBag size={15} /> 小红书·AI投放
            </NavLink>
            <NavLink to="/ads/budget" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <CreditCard size={15} /> AI预算引擎
            </NavLink>
          </NavGroup>

          <NavGroup title="🌍 国际投放" paths={['/intl/dashboard', '/intl/facebook', '/intl/tiktok', '/intl/google', '/intl/compliance']}>
            <NavLink to="/intl/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Globe size={15} /> 全球总控台
            </NavLink>
            <NavLink to="/intl/facebook" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Send size={15} /> Facebook · Instagram
            </NavLink>
            <NavLink to="/intl/tiktok" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Video size={15} /> TikTok Global
            </NavLink>
            <NavLink to="/intl/google" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Rocket size={15} /> Google · YouTube
            </NavLink>
            <NavLink to="/intl/compliance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <CheckSquare size={15} /> 全球合规中心
            </NavLink>
          </NavGroup>

          <NavGroup title="达人生态" paths={['/operations', '/kol-discovery', '/localization']}>
            <NavLink to="/operations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={15} /> 达人与用户运营
            </NavLink>
            <NavLink to="/kol-discovery" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Sparkles size={15} /> KOL智能发现
            </NavLink>
            <NavLink to="/localization" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Layers size={15} /> 多平台内容适配
            </NavLink>
          </NavGroup>

          <NavGroup title="情报与洞察" paths={['/competitive', '/audience', '/revenue', '/livestream', '/trends']}>
            <NavLink to="/competitive" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <TrendingUp size={15} /> 竞品监控
            </NavLink>
            <NavLink to="/audience" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <UserCheck size={15} /> 受众洞察
            </NavLink>
            <NavLink to="/revenue" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Banknote size={15} /> GMV收益中心
            </NavLink>
            <NavLink to="/livestream" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Radio size={15} /> 直播数据中心
            </NavLink>
            <NavLink to="/trends" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Sparkles size={15} /> 趋势洞察中心
            </NavLink>
          </NavGroup>

          <NavGroup title="营销C端运营" paths={['/consumer']}>
            <NavLink to="/consumer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Heart size={15} /> 消费者运营中心
            </NavLink>
          </NavGroup>

          <NavGroup title="私域与资产" paths={['/private-domain', '/asset-library', '/sentiment', '/inventory', '/reports']}>
            <NavLink to="/private-domain" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={15} /> 私域运营中心
            </NavLink>
            <NavLink to="/asset-library" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Image size={15} /> 素材资产库
            </NavLink>
            <NavLink to="/sentiment" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <MessageCircle size={15} /> 评论舆情中心
            </NavLink>
            <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Archive size={15} /> 库存联动投放
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={15} /> ROI日报周报
            </NavLink>
          </NavGroup>

          <NavGroup title="运维与系统" paths={['/analytics', '/anti-fraud', '/alerts', '/ads/platforms', '/system', '/events', '/settings']}>
            <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart3 size={15} /> 数据分析
            </NavLink>
            <NavLink to="/anti-fraud" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ShieldAlert size={15} /> 反欺诈情报
            </NavLink>
            <NavLink to="/alerts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <AlertCircle size={15} /> 告警中心
            </NavLink>
            <NavLink to="/ads/platforms" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Globe size={15} /> 平台API中心
            </NavLink>
            <NavLink to="/system" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Monitor size={15} /> 系统监控
            </NavLink>
            <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Radio size={15} /> 协同数据总线
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={15} /> 系统设置
            </NavLink>
          </NavGroup>

        </nav>
        <div style={{ borderTop: '1px solid var(--border)', padding: '8px 12px' }}>
          <ThemeSwitcher theme={theme} setTheme={applyTheme} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '3px 10px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 5px #22c55e88', flexShrink: 0 }} />
            56 智能体运行中
          </div>
          <div style={{ padding: '0 10px 4px', fontSize: '0.62rem', color: 'var(--text-muted)' }}>v2.0.0 · 全球化双轨投流版</div>
        </div>
      </aside>

      {/* ── 顶栏 ── */}
      <div style={{
        position: 'fixed', top: 0, left: 'var(--sidebar-width)', right: 0, height: 48, zIndex: 100,
        background: 'var(--topbar-bg)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 24px', gap: 8,
      }}>
        {/* AI配置按钮 — 仅当页面有AI配置时显示 */}
        {config && (
          <button
            data-ai-config-trigger
            onClick={() => setPanelOpen(!panelOpen)}
            style={{
              height: 34, borderRadius: 8, cursor: 'pointer', padding: '0 14px',
              display: 'flex', alignItems: 'center', gap: 7,
              background: panelOpen ? 'linear-gradient(135deg, #e8365d, #ff7a95)' : 'rgba(232,54,93,0.08)',
              border: panelOpen ? 'none' : '1px solid rgba(232,54,93,0.2)',
              transition: 'all 0.2s',
              boxShadow: panelOpen ? '0 2px 10px rgba(232,54,93,0.3)' : 'none',
            }}
          >
            <Brain size={15} color={panelOpen ? 'white' : '#e8365d'} />
            <span style={{
              fontSize: '0.78rem', fontWeight: 600,
              color: panelOpen ? 'white' : '#e8365d',
            }}>AI 配置 · {config.moduleName}</span>
            {!panelOpen && (
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#22c55e', boxShadow: '0 0 6px #22c55e88',
              }} />
            )}
          </button>
        )}
      </div>

      <main className="main-content" style={{ paddingTop: 48 }}>
        <Outlet />
      </main>

      {/* ── AI配置侧滑面板 ── */}
      {panelOpen && config && (
        <>
          {/* 遮罩层 */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 199,
            background: 'rgba(61,10,26,0.15)', backdropFilter: 'blur(2px)',
          }} onClick={() => setPanelOpen(false)} />

          {/* 面板 */}
          <div
            ref={panelRef}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 680, maxWidth: 'calc(100vw - var(--sidebar-width))',
              zIndex: 200, background: 'var(--bg-primary)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-8px 0 30px rgba(61,10,26,0.12)',
              display: 'flex', flexDirection: 'column',
              animation: 'slideInRight 0.25s ease-out',
            }}
          >
            {/* 面板头 */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(232,54,93,0.06) 0%, rgba(255,122,149,0.03) 100%)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #e8365d, #ff7a95)',
                }}>
                  <Brain size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    AI 自适应配置 · {config.moduleName}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    AI根据实时数据自主学习、自动调优参数
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none',
                  background: 'var(--bg-card)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={16} color="var(--text-muted)" />
              </button>
            </div>

            {/* 面板内容 — 可滚动 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <AIConfigPanel
                groups={config.groups}
                learningStatus={config.learningStatus}
                moduleName={config.moduleName}
              />
            </div>
          </div>
        </>
      )}

      {/* slideInRight 动画 */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

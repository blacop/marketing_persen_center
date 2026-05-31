import { useState } from 'react'
import {
  Layers, CheckCircle, AlertTriangle,
  Clock, TrendingUp, BarChart3, RefreshCw, FileText, Brain, Shield
} from 'lucide-react'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'
import {
  Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ComposedChart, Line
} from 'recharts'

/* ═══════════════════════════════════════════════════════════════
   多平台内容适配中心 —— 玛丽黛佳 国内平台素材适配管理
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['素材适配任务', '平台规范管理', '合规检查']

// ===== Tab1: 素材适配任务 =====
const adaptationStats = {
  activePlatforms: 5,
  monthlyTasks: 326,
  aiAdaptRate: 94.2,
  avgDelivery: '1.8h',
}

const adaptationQueue = [
  {
    id: 'AD-1001',
    material: '唇釉丝绒哑光教程',
    source: '抖音',
    targets: ['小红书', '快手'],
    adaptType: '格式/图文/BGM',
    status: 'AI适配中',
    progress: 58,
    priority: '高',
    duration: '60s',
  },
  {
    id: 'AD-1002',
    material: '618大促主图视频',
    source: '抖音',
    targets: ['微信视频号', '天猫品销宝'],
    adaptType: '比例/时长/文案',
    status: '已完成',
    progress: 100,
    priority: '紧急',
    duration: '15s',
  },
  {
    id: 'AD-1003',
    material: '粉底液测评长视频',
    source: '小红书',
    targets: ['抖音'],
    adaptType: '剪辑/竖版/字幕',
    status: '适配中',
    progress: 41,
    priority: '高',
    duration: '3min',
  },
  {
    id: 'AD-1004',
    material: '眼影盘星空色教程',
    source: '快手',
    targets: ['小红书', '抖音'],
    adaptType: '种草文案/比例/BGM',
    status: '排队中',
    progress: 0,
    priority: '中',
    duration: '45s',
  },
  {
    id: 'AD-1005',
    material: '新品发布直播切片',
    source: '直播录像',
    targets: ['抖音', '小红书', '快手', '微信视频号'],
    adaptType: '精剪/格式/封面',
    status: '人工复核',
    progress: 85,
    priority: '紧急',
    duration: '2h录像',
  },
]

// ===== Tab2: 平台规范管理 =====
const platformSpecs = [
  {
    platform: '抖音',
    ratio: '9:16',
    duration: '15s / 60s / 3min',
    maxSize: '4GB (视频)',
    special: ['竖版优先', '热门BGM加持', '话题挑战标签', '前3秒强Hook'],
    colorTag: '#e8365d',
  },
  {
    platform: '小红书',
    ratio: '3:4 / 1:1 / 图文',
    duration: '图文不限 / 视频≤15min',
    maxSize: '图片<20MB / 视频<4GB',
    special: ['种草tone文案', 'SEO关键词优化', '长文笔记结构', '真实使用体验感'],
    colorTag: '#f97316',
  },
  {
    platform: '快手',
    ratio: '9:16',
    duration: '≤10min',
    maxSize: '2GB',
    special: ['真实感/原生风格', '下沉市场受众', '快手专属贴纸', '主播实名认证'],
    colorTag: '#f59e0b',
  },
  {
    platform: '微信视频号',
    ratio: '9:16 / 16:9',
    duration: '≤30min',
    maxSize: '1GB',
    special: ['偏专业/生活化内容', '微信生态分享', '公众号联动', '适中时长3-8min'],
    colorTag: '#22c55e',
  },
  {
    platform: '天猫/京东',
    ratio: '1:1 (主图) / 3:4 (详情)',
    duration: '主图视频≤120s',
    maxSize: '图片<3MB / 视频<500MB',
    special: ['白底主图必备', '场景图展示', '功效须有检测报告', '详情页真实商品图'],
    colorTag: '#8b5cf6',
  },
]

const platformAdaptTrend = [
  { week: 'W1', ai: 48, manual: 12, quality: 91.5 },
  { week: 'W2', ai: 55, manual: 10, quality: 92.8 },
  { week: 'W3', ai: 62, manual: 9, quality: 93.4 },
  { week: 'W4', ai: 71, manual: 8, quality: 94.1 },
  { week: 'W5', ai: 68, manual: 11, quality: 93.9 },
  { week: 'W6', ai: 80, manual: 7, quality: 94.7 },
]

// ===== Tab3: 合规检查 =====
const complianceChecks = [
  {
    category: '广告法禁用词',
    platform: '全平台',
    issue: '文案含"最滋润"一词',
    severity: '严重',
    autoFixed: true,
    material: '唇釉丝绒哑光教程-小红书版',
    detail: 'AI自动替换为"深层滋养"，符合广告法规范',
  },
  {
    category: '功效声明',
    platform: '天猫/京东',
    issue: '宣称"28天显著淡斑"缺乏检测报告',
    severity: '严重',
    autoFixed: false,
    material: '粉底液详情页-功效说明',
    detail: '需上传相应功效检测报告或修改描述',
  },
  {
    category: '广告标注',
    platform: '小红书',
    issue: '品牌合作笔记未标注#广告',
    severity: '中等',
    autoFixed: true,
    material: '眼影盘KOL种草笔记',
    detail: 'AI已自动在末尾添加#广告 #品牌合作 标签',
  },
  {
    category: '对比图合规',
    platform: '小红书',
    issue: '使用前后效果合成对比图',
    severity: '严重',
    autoFixed: false,
    material: '粉底液测评-效果展示',
    detail: '小红书禁止PS合成对比图，需替换为真实使用照片',
  },
  {
    category: '医疗功效声明',
    platform: '抖音',
    issue: '视频中提及"改善皮肤屏障"相关医学表述',
    severity: '中等',
    autoFixed: false,
    material: '粉底液测评长视频-抖音精剪版',
    detail: '未经认证医疗功效声明，需删除相关片段或修改措辞',
  },
  {
    category: '直播合规',
    platform: '抖音',
    issue: '新品直播切片主播身份未实名认证',
    severity: '严重',
    autoFixed: false,
    material: '新品发布直播切片',
    detail: '抖音直播须实名认证，请联系主播完成认证后再发布',
  },
  {
    category: '未成年保护',
    platform: '快手',
    issue: '内容涉及针对年轻用户的减重暗示',
    severity: '中等',
    autoFixed: true,
    material: '修容粉教程-快手版',
    detail: 'AI已移除"显瘦"等可能暗示快速减肥效果的词语',
  },
]

const platformComplianceScore = [
  { platform: '抖音', score: 96 },
  { platform: '小红书', score: 91 },
  { platform: '快手', score: 94 },
  { platform: '微信视频号', score: 98 },
  { platform: '天猫/京东', score: 89 },
]

// ===== Task Detail Data =====
const adaptationDetailData: Record<string, {
  sourceDesc: string
  adaptEngine: string
  qualityScore: number
  platformNotes: string
  formatRequirements: string
  reviewStatus: string
  approvalChain: string[]
}> = {
  'AD-1001': {
    sourceDesc: '抖音原版唇釉丝绒哑光60s竖版教程，含背景音乐及贴纸特效',
    adaptEngine: 'AI自动适配 (格式转换 + 图文生成)',
    qualityScore: 0,
    platformNotes: '小红书版需拆解为图文步骤，文案调整为种草tone；快手版保留视频但替换BGM为快手热歌库曲目',
    formatRequirements: '小红书：图文≥9张，标题≤20字；快手：9:16 竖版，≤2GB',
    reviewStatus: 'AI适配中',
    approvalChain: ['AI格式转换 →', '文案重写 →', '合规检查 →', '发布'],
  },
  'AD-1002': {
    sourceDesc: '抖音618大促15s主图视频，横版9:16，产品展示+促销文字',
    adaptEngine: 'AI自动适配 (比例裁剪 + 文案本地化)',
    qualityScore: 96,
    platformNotes: '微信视频号版本去除跑马灯字幕，调整封面；天猫品销宝版本增加价格标注和大促角标',
    formatRequirements: '微信视频号：9:16，封面1280×720；天猫品销宝：1:1主图，文字比例≤30%',
    reviewStatus: '已完成',
    approvalChain: ['AI格式转换 ✓', '文案审核 ✓', '合规检查 ✓', '已发布 ✓'],
  },
  'AD-1003': {
    sourceDesc: '小红书3分钟粉底液测评长视频，横版，含详细步骤讲解',
    adaptEngine: 'AI精剪 + 竖版重构',
    qualityScore: 78,
    platformNotes: '抖音版压缩至60s以内，提取核心使用步骤，添加字幕和热门BGM，前3秒需强化Hook',
    formatRequirements: '抖音：9:16竖版，60s内，帧率≥30fps，字幕字号≥32px',
    reviewStatus: '适配中',
    approvalChain: ['AI精剪 →', '竖版裁剪 →', '字幕生成 →', '人工复核 →', '发布'],
  },
  'AD-1004': {
    sourceDesc: '快手版眼影盘星空色教程45s，原生风格，带快手贴纸',
    adaptEngine: 'AI排队中',
    qualityScore: 0,
    platformNotes: '小红书版需改写为种草笔记图文形式，去除快手平台标识；抖音版需添加挑战话题标签和热门BGM',
    formatRequirements: '小红书：图文步骤≥6张；抖音：9:16，添加#眼影 #彩妆教程等话题标签',
    reviewStatus: '排队中',
    approvalChain: ['等待AI适配 →', '格式转换 →', '文案重写 →', '合规检查 →', '发布'],
  },
  'AD-1005': {
    sourceDesc: '2小时新品发布直播录像，含产品讲解、试色、互动环节',
    adaptEngine: 'AI智能精剪 + 人工复核',
    qualityScore: 88,
    platformNotes: '各平台精剪侧重不同：抖音版15-60s多素材；小红书版3-5min完整测评；快手版保留互动高光；微信视频号版偏正式发布剪辑',
    formatRequirements: '抖音：多切片15-60s；小红书：≤15min；快手：≤10min；微信视频号：3-8min',
    reviewStatus: '人工复核中',
    approvalChain: ['AI精剪 ✓', '主播认证确认 →', '合规审核 →', '多平台发布'],
  },
}

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

// ── AI配置: 多平台内容适配 ──
const adaptAIConfigGroups: AIConfigGroup[] = [
  {
    title: '素材适配质量阈值',
    icon: <Brain size={16} />,
    params: [
      createParam('adaptQualityThreshold', '适配质量阈值', 82, '', '低于此分数的适配结果需人工复核', 82, 88, { min: 0, max: 100 }),
      createParam('videoResolutionMin', '最低输出分辨率', 1080, 'p', '输出视频最低分辨率要求', 1080, 92, { min: 720, max: 4096 }),
      createParam('textAdaptConfidence', '文案重写置信度', 88, '%', '低于此值的文案重写需人工审核', 88, 85, { min: 0, max: 100 }),
    ],
  },
  {
    title: '自动适配开关',
    icon: <Layers size={16} />,
    params: [
      createParam('autoAdaptDouyin', '抖音自动适配', 1, '', '开启后AI自动处理抖音格式转换', 1, 90, { min: 0, max: 1 }),
      createParam('autoAdaptXiaohongshu', '小红书自动适配', 1, '', '开启后AI自动生成图文/种草文案', 1, 87, { min: 0, max: 1 }),
      createParam('autoAdaptKuaishou', '快手自动适配', 1, '', '开启后AI自动适配快手风格及BGM', 1, 84, { min: 0, max: 1 }),
      createParam('autoAdaptWeixinSP', '微信视频号自动适配', 0, '', '关闭时所有视频号内容需人工确认', 0, 80, { min: 0, max: 1 }),
      createParam('autoAdaptEcom', '天猫/京东自动适配', 1, '', '开启后AI自动生成白底图和场景图', 1, 82, { min: 0, max: 1 }),
    ],
  },
  {
    title: '合规检测灵敏度',
    icon: <Shield size={16} />,
    params: [
      createParam('adLawSensitivity', '广告法禁用词检测', 9, '', '1-10档，越高对禁用词越敏感', 9, 95, { min: 1, max: 10 }),
      createParam('platformRuleSensitivity', '平台规范合规检测', 8, '', '1-10档，越高对平台规范偏差越敏感', 8, 88, { min: 1, max: 10 }),
      createParam('efficacyClaimCheck', '功效宣称检测力度', 8, '', '检测美妆功效声明是否符合法规要求', 8, 90, { min: 1, max: 10 }),
    ],
  },
]

const adaptAILearningStatus: AILearningStatus = {
  modelVersion: 'v3.0.2-adapt',
  lastTraining: '32分钟前',
  totalDataPoints: 87500,
  avgConfidence: 91,
  autoAdjustCount24h: 27,
  learningRate: '0.003',
  nextTraining: '2小时后',
  improvementRate: '+12.4%',
}

const overlayStyleAdapt: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.45)', zIndex: 999,
  display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
}

export default function LocalizationCenter() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedTask, setSelectedTask] = useState<typeof adaptationQueue[0] | null>(null)
  useRegisterAIConfig(adaptAIConfigGroups, adaptAILearningStatus, '多平台内容适配')

  const priorityColor = (p: string) =>
    p === '紧急' ? '#f87171' : p === '高' ? '#fbbf24' : p === '中' ? '#60a5fa' : 'var(--text-muted)'

  const statusColor = (s: string) =>
    s === '已完成' ? '#4ade80'
    : s === 'AI适配中' || s === '适配中' ? '#60a5fa'
    : s === '人工复核' ? '#fbbf24'
    : s === '排队中' ? 'var(--text-muted)'
    : 'var(--text-muted)'

  return (
    <>
      {/* ══ Task Detail Slide-over ══ */}
      {selectedTask && (() => {
        const t = selectedTask
        const det = adaptationDetailData[t.id] || {
          sourceDesc: '-', adaptEngine: '-', qualityScore: 0,
          platformNotes: '-', formatRequirements: '-', reviewStatus: '-', approvalChain: [],
        }
        return (
          <div style={overlayStyleAdapt} onClick={() => setSelectedTask(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              width: 500, height: '100vh', background: 'var(--bg-card)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', overflowY: 'auto', padding: 28,
              display: 'flex', flexDirection: 'column', gap: 18,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-primary)' }}>{t.id} · {t.material}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {t.source} → {t.targets.join(' / ')} · {t.adaptType}
                  </div>
                </div>
                <button onClick={() => setSelectedTask(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
              </div>

              {/* Source info */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>任务信息</div>
                {[
                  { label: '源素材', value: det.sourceDesc },
                  { label: '来源平台', value: t.source },
                  { label: '目标平台', value: t.targets.join('、') },
                  { label: '适配类型', value: t.adaptType },
                  { label: '适配引擎', value: det.adaptEngine },
                  { label: '优先级', value: t.priority },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 6, padding: '7px 10px' }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Quality + platform notes */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>适配质量与平台要求</div>
                {det.qualityScore > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>适配质量评分</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: det.qualityScore >= 90 ? '#4ade80' : det.qualityScore >= 80 ? '#fbbf24' : '#f87171' }}>{det.qualityScore}/100</span>
                    </div>
                    <div style={{ height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${det.qualityScore}%`, background: det.qualityScore >= 90 ? '#4ade80' : det.qualityScore >= 80 ? '#fbbf24' : '#f87171', borderRadius: 4 }} />
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>平台适配备注</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 6, padding: '7px 10px' }}>{det.platformNotes}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>格式规范要求</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 6, padding: '7px 10px' }}>{det.formatRequirements}</div>
                </div>
              </div>

              {/* Approval chain */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>审批状态</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: statusColor(det.reviewStatus), marginBottom: 12 }}>{det.reviewStatus}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  {det.approvalChain.map((step, i) => (
                    <span key={i} style={{
                      fontSize: '0.72rem', padding: '4px 10px', borderRadius: 20,
                      background: step.includes('✓') ? 'rgba(74,222,128,0.12)' : step.includes('→') ? 'rgba(96,165,250,0.12)' : 'rgba(251,191,36,0.12)',
                      color: step.includes('✓') ? '#4ade80' : step.includes('→') ? '#60a5fa' : '#fbbf24',
                      fontWeight: 600,
                    }}>{step}</span>
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>适配进度</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 7, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${t.progress}%`, background: 'var(--accent-primary)', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: '审核', primary: true },
                  { label: '重新适配', primary: false },
                  { label: '发布', primary: false },
                  { label: '退回修改', primary: false },
                ].map(btn => (
                  <button key={btn.label} onClick={() => setSelectedTask(null)} style={{
                    padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    border: btn.primary ? 'none' : '1px solid var(--accent-primary)',
                    background: btn.primary ? 'var(--accent-primary)' : 'transparent',
                    color: btn.primary ? '#fff' : 'var(--accent-primary)',
                  }}>{btn.label}</button>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={22} style={{ color: 'var(--accent-primary)' }} />
          多平台内容适配中心
        </h2>
        <p>玛丽黛佳 · 国内主流平台素材格式适配 · AI自动化转换 · 广告法合规检查</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="CulturalAdapt-Classifier" color="#e8365d" />
        <ModelBadge name="MultiLingual-ContentLLM" color="#e8365d" />
        <ModelBadge name="ContentQuality-Scorer" color="#e8365d" />
      </div>

      <div className="page-content">
        {/* Header badges */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(232,54,93,0.06)', color: 'var(--accent-primary)',
            padding: '4px 12px', borderRadius: 8, fontSize: '0.85rem',
          }}>
            <Layers size={14} />{adaptationStats.activePlatforms}个平台
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(232,54,93,0.06)', color: '#4ade80',
            padding: '4px 12px', borderRadius: 8, fontSize: '0.85rem',
          }}>
            <CheckCircle size={14} />AI适配率 {adaptationStats.aiAdaptRate}%
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(232,54,93,0.06)', color: '#60a5fa',
            padding: '4px 12px', borderRadius: 8, fontSize: '0.85rem',
          }}>
            <Clock size={14} />平均交付 {adaptationStats.avgDelivery}
          </span>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: 素材适配任务 */}
        {activeTab === 0 && (
          <>
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {[
                { label: '覆盖平台', value: adaptationStats.activePlatforms, icon: <Layers size={14} />, unit: '个' },
                { label: '本月适配任务', value: adaptationStats.monthlyTasks.toLocaleString(), icon: <FileText size={14} />, unit: '条' },
                { label: 'AI适配率', value: adaptationStats.aiAdaptRate, icon: <CheckCircle size={14} />, unit: '%' },
                { label: '平均交付', value: adaptationStats.avgDelivery, icon: <Clock size={14} />, unit: '' },
              ].map(s => (
                <div className="card" key={s.label}>
                  <div className="card-title">{s.icon} {s.label}</div>
                  <div className="card-value" style={{ color: '#ff9eb5' }}>
                    {s.value}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>{s.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-title">
                <RefreshCw size={16} style={{ color: 'var(--accent-primary)' }} /> 适配任务队列
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>任务ID</th>
                    <th>素材名称</th>
                    <th>来源平台</th>
                    <th>目标平台</th>
                    <th>适配类型</th>
                    <th>优先级</th>
                    <th>状态</th>
                    <th>进度</th>
                  </tr>
                </thead>
                <tbody>
                  {adaptationQueue.map(t => (
                    <tr key={t.id} onClick={() => setSelectedTask(t)} style={{ cursor: 'pointer' }}>
                      <td style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{t.id}</td>
                      <td style={{ fontWeight: 500 }}>{t.material}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{t.source}</td>
                      <td style={{ fontSize: '0.75rem' }}>{t.targets.join('、')}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.adaptType}</td>
                      <td style={{ fontWeight: 600, color: priorityColor(t.priority) }}>{t.priority}</td>
                      <td style={{ fontWeight: 600, color: statusColor(t.status) }}>{t.status}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 64, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${t.progress}%`, background: 'var(--accent-primary)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab 2: 平台规范管理 */}
        {activeTab === 1 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
              {platformSpecs.map(p => (
                <div className="card" key={p.platform}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.colorTag, flexShrink: 0 }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: p.colorTag }}>{p.platform}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { label: '画面比例', value: p.ratio },
                      { label: '时长限制', value: p.duration },
                      { label: '文件大小', value: p.maxSize },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>特殊要求</div>
                      {p.special.map(s => (
                        <div key={s} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, padding: '3px 0' }}>
                          <span style={{ color: p.colorTag, fontSize: '0.7rem' }}>•</span>{s}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-title">
                <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} /> AI适配产能趋势 (6周)
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={platformAdaptTrend}>
                  <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} domain={[85, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar yAxisId="left" dataKey="ai" name="AI适配" fill="#e8365d" radius={[2, 2, 0, 0]} />
                  <Bar yAxisId="left" dataKey="manual" name="人工适配" fill="#6b7280" radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="quality" name="质量评分" stroke="#4ade80" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Tab 3: 合规检查 */}
        {activeTab === 2 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
              {platformComplianceScore.map(r => (
                <div className="card" key={r.platform} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.5rem', fontWeight: 700,
                    color: r.score >= 95 ? '#4ade80' : r.score >= 90 ? '#fbbf24' : '#fb923c',
                  }}>{r.score}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{r.platform}合规分</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title">
                <AlertTriangle size={16} style={{ color: '#fbbf24' }} /> 合规检查记录
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>类别</th>
                    <th>适用平台</th>
                    <th>问题描述</th>
                    <th>严重度</th>
                    <th>涉及素材</th>
                    <th>处理详情</th>
                    <th>AI自动修复</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceChecks.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: 'var(--accent-primary)' }}>{c.category}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.platform}</td>
                      <td style={{ fontSize: '0.75rem', maxWidth: 200 }}>{c.issue}</td>
                      <td style={{ fontWeight: 600, color: c.severity === '严重' ? '#f87171' : c.severity === '中等' ? '#fbbf24' : 'var(--text-muted)' }}>{c.severity}</td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.material}</td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: 220 }}>{c.detail}</td>
                      <td>
                        {c.autoFixed
                          ? <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>AI已修复</span>
                          : <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>需人工</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="section-title">
                <BarChart3 size={16} style={{ color: 'var(--accent-primary)' }} /> 国内平台合规规则库
              </div>
              <div className="grid-3">
                {[
                  {
                    title: '广告法通用规范',
                    rules: ['禁用词: 最/第一/极致/唯一', '禁止虚假功效宣传', '促销活动须标明期限', '价格须真实有据'],
                  },
                  {
                    title: '小红书平台规范',
                    rules: ['禁止PS合成前后对比图', '须标注#广告或#品牌合作', 'SEO关键词不得虚假', '种草内容须真实体验'],
                  },
                  {
                    title: '抖音/快手规范',
                    rules: ['禁止未认证医疗功效声明', '直播须主播实名认证', '快手:不得暗示快速减肥', '未成年人保护内容限制'],
                  },
                  {
                    title: '天猫/京东规范',
                    rules: ['主图须为真实商品图', '功效须有检测报告支撑', '白底图须无任何装饰', '详情页禁止虚假对比'],
                  },
                  {
                    title: 'KOL/达人合规',
                    rules: ['合作内容须明确标识广告', '不得诱导虚假评价', '禁止刷单/虚假销量', '直播带货须资质合规'],
                  },
                  {
                    title: '微信视频号规范',
                    rules: ['内容须与微信生态契合', '禁止诱导分享/转发', '商业推广须申请资质', '违禁品目录同步执行'],
                  },
                ].map(r => (
                  <div key={r.title} style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: 8 }}>{r.title}</div>
                    {r.rules.map(rule => (
                      <div key={rule} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={10} style={{ color: '#4ade80', flexShrink: 0 }} />{rule}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, CheckCircle, Clock, Bell, Filter,
  Zap, DollarSign, Shield, Bot, Globe, TrendingUp, TrendingDown,
  Mail, MessageSquare, Phone, Plus, Edit2, Trash2, Play,
  AlertOctagon, Info, ArrowUpRight, Eye, X, Activity,
  RefreshCw, Download, Brain
} from 'lucide-react'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
  AreaChart, Area
} from 'recharts'
import { exportObjectsCsv } from '../utils/exportCsv'
import ModelBadge from '../components/ModelBadge'

// ─── Types ────────────────────────────────────────────────────────────────────
type Severity = '紧急' | '高' | '中' | '低'
type Category = '预算' | 'API' | '智能体' | '反欺诈' | '内容' | '平台' | '国际'
type AlertStatus = '活跃' | '处理中' | '已解决'

interface Alert {
  id: string
  severity: Severity
  category: Category
  status: AlertStatus
  title: string
  description: string
  component: string
  autoHandled: boolean
  timestamp: string
  age: string
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
}

// ─── Static Data ───────────────────────────────────────────────────────────────
const severityMeta: Record<Severity, { color: string; bg: string; border: string }> = {
  紧急: { color: '#e8365d', bg: 'rgba(232,54,93,0.12)', border: '#e8365d' },
  高:   { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: '#f97316' },
  中:   { color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: '#eab308' },
  低:   { color: '#9b8cb8', bg: 'rgba(155,140,184,0.12)', border: '#9b8cb8' },
}

const categoryMeta: Record<Category, { icon: React.ElementType; color: string }> = {
  预算:  { icon: DollarSign,    color: '#e8365d' },
  API:   { icon: Globe,         color: '#6366f1' },
  智能体: { icon: Bot,          color: '#ff7a95' },
  反欺诈: { icon: Shield,       color: '#e8365d' },
  内容:  { icon: AlertTriangle, color: '#f97316' },
  平台:  { icon: Zap,           color: '#0ea5e9' },
  国际:  { icon: Globe,         color: '#10b981' },
}

const baseAlerts: Alert[] = [
  {
    id: 'ALT-284731', severity: '紧急', category: 'API', status: '活跃',
    title: '抖音巨量引擎 API 请求频率超限，广告投放中断',
    description: '巨量引擎 Marketing API 返回错误码 429 (Rate Limit Exceeded)，当前每小时请求量 9,847/10,000，DQN出价智能体无法同步实时竞价数据，预估影响 ¥23,000/小时投放收益。',
    component: '抖音巨量投放引擎 / DQN出价智能体',
    autoHandled: false, timestamp: '14:31:07', age: '3分钟前'
  },
  {
    id: 'ALT-284718', severity: '紧急', category: '预算', status: '处理中',
    title: '唇釉丝绒系列抖音日预算已消耗96.3%，自动暂停',
    description: '当前时间14:31，距离日结算还有9.5小时，预算消耗速率为¥2,180/小时，按当前速率将在43分钟内耗尽。预算管理智能体已自动暂停新竞价，等待人工审批追加预算。',
    component: '预算管理智能体 / 抖音巨量投放模块',
    autoHandled: true, timestamp: '14:28:44', age: '5分钟前'
  },
  {
    id: 'ALT-284705', severity: '高', category: '反欺诈', status: '活跃',
    title: 'GNN反欺诈拦截率异常飙升至18.7%(正常基线3%)',
    description: '过去30分钟内，来自IP段 103.45.x.x 和 185.220.x.x 的点击被GNN标记为异常。拦截量累计12,847次，估算节省无效消耗 \u00A58,934。但拦截率持续异常高位，可能影响真实用户流量。',
    component: 'GNN反欺诈智能体 / 流量过滤模块',
    autoHandled: true, timestamp: '14:25:19', age: '8分钟前'
  },
  {
    id: 'ALT-284693', severity: '高', category: '内容', status: '活跃',
    title: '素材疲劳积压告警: 47个素材CTR下降超50%',
    description: '内容质检智能体检测到47个已运行7天以上的素材CTR从均值2.8%下降至1.1%以下，ROAS已破盈亏平衡线。素材疲劳导致日均损耗约\u00A534,000。建议立即启动新一批素材AB测试。',
    component: '创意优化智能体 / 内容质检模块',
    autoHandled: false, timestamp: '14:22:53', age: '11分钟前'
  },
  {
    id: 'ALT-284681', severity: '高', category: '智能体', status: '活跃',
    title: 'DQN出价模型偏离基准值32%，出价策略异常',
    description: 'DQN Bidding模型在过去2小时内出价决策偏离历史基准32%，导致部分高价值用户群体出价不足(错失率41%)，部分低价值流量出价过高(溢价率28%)。怀疑奖励函数出现漂移。',
    component: 'DQN出价优化智能体 / 强化学习模块',
    autoHandled: false, timestamp: '14:19:30', age: '14分钟前'
  },
  {
    id: 'ALT-284670', severity: '高', category: 'API', status: '处理中',
    title: '快手磁力引擎 API Token 过期，直播带货投放中断',
    description: '快手磁力API Access Token 已过期(有效期90天)，影响直播带货推广计划的自动出价。智能体已尝试使用Refresh Token续期但失败，需手动重新授权。中断时长已达23分钟。',
    component: '快手磁力平台连接器 / OAuth认证模块',
    autoHandled: false, timestamp: '14:08:15', age: '25分钟前'
  },
  {
    id: 'ALT-284659', severity: '中', category: '智能体', status: '活跃',
    title: '种草内容审核智能体响应延迟超阈值(P99: 8.7s)',
    description: '内容合规审核服务在高并发下P99延迟从正常1.2s上升至8.7s，导致种草内容审核管道堵塞。当前待审核内容队列积压427条。GPU利用率94%，已自动触发横向扩容但尚未生效。',
    component: '内容审核智能体 / GPU推理集群',
    autoHandled: true, timestamp: '14:05:40', age: '28分钟前'
  },
  {
    id: 'ALT-284647', severity: '中', category: '平台', status: '活跃',
    title: '天猫品销宝数据回传延迟 > 4小时',
    description: '天猫品销宝转化数据回传出现延迟，当前归因数据延迟约4.2小时(正常 < 30min)。导致归因智能体无法准确计算当日ROAS，已有3个推广计划因归因数据缺失暂停了出价调整。',
    component: '天猫品销宝平台连接器 / 归因追踪模块',
    autoHandled: false, timestamp: '14:01:22', age: '32分钟前'
  },
  {
    id: 'ALT-284635', severity: '中', category: '预算', status: '处理中',
    title: '眼影盘星空系列小红书单日ROI跌破1.5警戒线',
    description: '眼影盘星空系列今日ROI已降至1.38(7日均值2.1)，种草内容转化成本从¥28上升至¥41。预算管理智能体已将日预算自动削减20%，并通知品牌运营团队。',
    component: '预算管理智能体 / 小红书聚光优化模块',
    autoHandled: true, timestamp: '13:55:08', age: '39分钟前'
  },
  {
    id: 'ALT-284622', severity: '中', category: '智能体', status: '活跃',
    title: '达人合作智能体检测到3个高价值KOL账号异常离线',
    description: '达人合作管理智能体无法联系到 @美妆小仙女 (3.5M)、@彩妆日记 (2.1M) 和 @护肤成分党 (1.8M) 三位合作中的KOL，账号状态显示私密或注销。涉及未履约合同金额¥128,000。',
    component: '达人合作智能体 / KOL状态监控',
    autoHandled: false, timestamp: '13:48:55', age: '45分钟前'
  },
  {
    id: 'ALT-284610', severity: '低', category: '内容', status: '已解决',
    title: '种草内容批量字幕渲染队列堵塞，延迟15分钟',
    description: '字幕渲染服务因配置错误导致15分钟堵塞，影响抖音/小红书/快手多平台适配版本的字幕生成。智能体已自动重启渲染服务并清空积压队列，所有版本已恢复正常生产。',
    component: '内容生产智能体 / 字幕渲染服务',
    autoHandled: true, timestamp: '13:40:17', age: '54分钟前'
  },
  {
    id: 'ALT-284598', severity: '低', category: 'API', status: '已解决',
    title: '天猫品销宝 API 批量更新操作超时(非关键路径)',
    description: '天猫品销宝 API 批量创建推广计划操作超时，涉及低优先级广告系列配置更新。智能体已拆分批次重试，所有操作已在13:42:00前完成。延迟影响约12分钟的计划创建效率。',
    component: '天猫品销宝平台连接器',
    autoHandled: true, timestamp: '13:35:29', age: '59分钟前'
  },
  {
    id: 'ALT-284590', severity: '紧急', category: '国际', status: '活跃',
    title: 'Meta EU CAPI 归因回传失败，欧洲区转化数据中断',
    description: 'Conversions API 向Meta服务器上报EU区购买事件时持续返回400错误，错误代码INVALID_EVENT_TIME。受影响的广告账户共4个，欧洲区日消耗约¥46,000，当前无法优化投放出价。建议立即检查事件时间戳格式并修复服务器端上报脚本。',
    component: 'Meta广告智能投手 / CAPI归因模块',
    autoHandled: false, timestamp: '13:28:44', age: '66分钟前'
  },
  {
    id: 'ALT-284581', severity: '高', category: '国际', status: '处理中',
    title: 'EUR/CNY汇率1小时波动1.8%，触发预算熔断',
    description: 'EUR/CNY汇率从7.82快速下跌至7.68，跌幅1.79%，超过1.5%熔断阈值。汇率风险管理智能体已自动锁定欧洲区待投入预算¥62,000，并向财务团队发送对冲建议。当前EU广告投放已暂停等待汇率稳定。',
    component: '汇率风险管理智能体 / 自动熔断模块',
    autoHandled: true, timestamp: '13:15:20', age: '79分钟前'
  },
  {
    id: 'ALT-284572', severity: '中', category: '国际', status: '活跃',
    title: 'TikTok Global日本区广告账户余额不足48小时',
    description: 'TikTok Japan广告账户当前余额¥18,400，按当前日消耗¥9,200估算仅剩2天余额。请及时充值或调整日预算上限，否则将导致JP投放中断，错过当前ROI=4.2x的高效投放窗口。',
    component: 'TikTok全球投流智能体 / 账户余额监控',
    autoHandled: false, timestamp: '13:08:55', age: '85分钟前'
  },
]

const newAlertPool: Omit<Alert, 'id' | 'timestamp' | 'age'>[] = [
  {
    severity: '紧急', category: 'API', status: '活跃',
    title: '抖音巨量引擎 API 批量接口返回500错误',
    description: '巨量引擎 /batch 端点返回HTTP 500，影响批量素材上传和创意审核状态查询。',
    component: '抖音巨量API 素材上传模块', autoHandled: false
  },
  {
    severity: '高', category: '预算', status: '活跃',
    title: '粉底液水光系列小红书聚光ROAS跌至0.9',
    description: 'ROAS低于盈亏平衡线1.2，预算管理智能体已标记并等待人工决策是否暂停种草投放。',
    component: '预算管理智能体 / 小红书聚光模块', autoHandled: false
  },
  {
    severity: '中', category: '智能体', status: '处理中',
    title: '内容审核智能体队列积压超500条',
    description: '高并发提交导致审核队列积压，平均等待时间已达47分钟，正常阈值15分钟。',
    component: '内容质检智能体 / 审核管道', autoHandled: true
  },
]

// ─── Chart Data ────────────────────────────────────────────────────────────────
const weeklyAlertData = [
  { day: '3/28', 紧急: 4, 高: 12, 中: 23, 低: 8 },
  { day: '3/29', 紧急: 7, 高: 15, 中: 19, 低: 11 },
  { day: '3/30', 紧急: 3, 高: 9,  中: 28, 低: 6  },
  { day: '3/31', 紧急: 9, 高: 18, 中: 31, 低: 14 },
  { day: '4/1',  紧急: 5, 高: 11, 中: 22, 低: 9  },
  { day: '4/2',  紧急: 6, 高: 14, 中: 27, 低: 7  },
  { day: '4/3',  紧急: 8, 高: 16, 中: 18, 低: 5  },
]

const categoryDistData = [
  { name: 'API告警', value: 31, color: '#6366f1' },
  { name: '预算告警', value: 24, color: '#e8365d' },
  { name: '智能体告警', value: 19, color: '#ff7a95' },
  { name: '反欺诈', value: 13, color: '#e8365d' },
  { name: '内容告警', value: 8,  color: '#f97316' },
  { name: '平台告警', value: 5,  color: '#0ea5e9' },
]

const responseTimeData = [
  { day: '3/28', 自动: 0.8, 人工: 18.4, 综合: 4.2 },
  { day: '3/29', 自动: 0.7, 人工: 22.1, 综合: 5.1 },
  { day: '3/30', 自动: 0.9, 人工: 15.3, 综合: 3.8 },
  { day: '3/31', 自动: 1.1, 人工: 28.7, 综合: 6.3 },
  { day: '4/1',  自动: 0.8, 人工: 19.2, 综合: 4.5 },
  { day: '4/2',  自动: 0.7, 人工: 16.8, 综合: 3.9 },
  { day: '4/3',  自动: 0.6, 人工: 21.4, 综合: 4.1 },
]

const categorySummary = [
  { category: 'API告警',   count: 31, total: 47, avgTime: '1.2分钟', autoRate: '74%' },
  { category: '预算告警',  count: 24, total: 38, avgTime: '0.8分钟', autoRate: '89%' },
  { category: '智能体告警', count: 19, total: 29, avgTime: '2.1分钟', autoRate: '62%' },
  { category: '反欺诈',   count: 13, total: 18, avgTime: '0.5分钟', autoRate: '94%' },
  { category: '内容告警',  count: 8,  total: 11, avgTime: '3.4分钟', autoRate: '45%' },
  { category: '平台告警',  count: 5,  total: 9,  avgTime: '5.7分钟', autoRate: '33%' },
]

const escalationRecords = [
  { alertId: 'ALT-284505', reason: '预算调整超审批上限¥5万', escalatedAt: '13:22:14', taskId: 'WB-003', handler: '李财务', duration: '18分钟', result: '已审批，追加¥8.5万' },
  { alertId: 'ALT-284487', reason: '内容政治敏感度>90%，AI无法判定', escalatedAt: '12:55:38', taskId: 'WB-001', handler: '王审核', duration: '32分钟', result: '违规确认，已下架' },
  { alertId: 'ALT-284463', reason: 'GNN欺诈置信度58%，灰色区间', escalatedAt: '12:31:05', taskId: 'WB-005', handler: '张安全', duration: '24分钟', result: '决策放行，加强监控' },
  { alertId: 'ALT-284441', reason: '达人合同条款超模板授权范围', escalatedAt: '11:48:22', taskId: 'WB-002', handler: '刘BD', duration: '45分钟', result: '特殊条款已批准' },
  { alertId: 'ALT-284398', reason: 'KOL合作追加坑位费¥8,500', escalatedAt: '10:33:17', taskId: 'WB-006', handler: '赵法务', duration: '67分钟', result: '已付款确认' },
  { alertId: 'ALT-284362', reason: 'DQN出价异常，偏离>40%', escalatedAt: '09:55:44', taskId: 'WB-009', handler: '陈算法', duration: '28分钟', result: '模型回滚v2.3.1' },
  { alertId: 'ALT-284337', reason: '抖音账号异常，需申诉', escalatedAt: '09:12:31', taskId: 'WB-011', handler: '周运营', duration: '93分钟', result: '申诉通过，恢复投放' },
  { alertId: 'ALT-284298', reason: '用户投诉涉及法律责任', escalatedAt: '08:44:08', taskId: 'WB-014', handler: '吴客服', duration: '51分钟', result: '已退款并暂停广告主' },
]

const alertRules = [
  { id: 'R001', icon: DollarSign, name: '预算超标告警', condition: '预算消耗 >= 85%', severity: '高' as Severity, channels: ['系统通知', '邮件'], enabled: true },
  { id: 'R002', icon: Globe, name: 'API限速告警', condition: '请求量 >= 90% 限速上限', severity: '紧急' as Severity, channels: ['系统通知', 'Webhook'], enabled: true },
  { id: 'R003', icon: Shield, name: '欺诈率异常', condition: '拦截率 > 10% 或 < 0.5%', severity: '高' as Severity, channels: ['系统通知', '企业微信'], enabled: true },
  { id: 'R004', icon: TrendingDown, name: 'ROAS跌破警戒线', condition: 'ROAS < 1.2 持续 > 30分钟', severity: '高' as Severity, channels: ['系统通知', '邮件', 'Webhook'], enabled: true },
  { id: 'R005', icon: Bot, name: '智能体离线告警', condition: '智能体心跳超时 > 60秒', severity: '紧急' as Severity, channels: ['系统通知', 'Webhook'], enabled: true },
  { id: 'R006', icon: Zap, name: 'API Token过期', condition: 'Token剩余有效期 < 7天', severity: '中' as Severity, channels: ['系统通知', '邮件'], enabled: true },
  { id: 'R007', icon: AlertTriangle, name: '素材疲劳告警', condition: 'CTR下降 > 40% 且 Age > 5天', severity: '中' as Severity, channels: ['系统通知'], enabled: false },
  { id: 'R008', icon: Clock, name: '响应延迟告警', condition: 'P99延迟 > 5秒 持续 > 10分钟', severity: '高' as Severity, channels: ['系统通知', '企业微信'], enabled: true },
]

const channels = [
  { icon: Bell, name: '系统通知', type: '内置', status: '已启用', desc: '实时推送到管理控制台和移动端App', config: '接收人: 全体管理员', ok: true },
  { icon: Mail, name: '邮件 (SMTP)', type: 'SMTP', status: '已配置', desc: 'smtp.gmail.com:587, TLS加密', config: 'alert@mariedalgar.com -> ops-team@mariedalgar.com', ok: true },
  { icon: MessageSquare, name: '钉钉 Webhook', type: 'Webhook', status: '已配置', desc: '推送到 运营告警 群', config: '群机器人: 玛丽黛佳运营告警Bot', ok: true },
  { icon: Phone, name: '企业微信', type: '企业微信', status: '已配置', desc: '企业ID: wx8a3f21e9c7d84512', config: 'AgentID: 1000002 (运营告警)', ok: true },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '12px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
          background: t.type === 'success' ? '#065f46' : t.type === 'error' ? '#7f1d1d' : t.type === 'warning' ? '#78350f' : '#1e1b4b',
          color: '#fff', fontSize: '0.82rem', fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.3s ease', minWidth: 280,
          border: `1px solid ${t.type === 'success' ? '#059669' : t.type === 'error' ? '#dc2626' : t.type === 'warning' ? '#d97706' : '#e8365d'}`,
        }}>
          {t.type === 'success' && <CheckCircle size={16} color="#34d399" />}
          {t.type === 'info' && <Activity size={16} color="#ff9eb5" />}
          {t.type === 'warning' && <AlertTriangle size={16} color="#fbbf24" />}
          {t.type === 'error' && <AlertTriangle size={16} color="#f87171" />}
          <span style={{ flex: 1 }}>{t.message}</span>
          <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => onDismiss(t.id)} />
        </div>
      ))}
    </div>
  )
}

function ModalOverlay({ title, onClose, children, width }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary, #1a1a2e)', borderRadius: 16, border: '1px solid var(--border)',
        width: width || 700, maxWidth: '92vw', maxHeight: '85vh', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(232,54,93,0.2)', animation: 'fadeIn 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid #6b1530',
          background: 'linear-gradient(135deg, rgba(232,54,93,0.15), rgba(168,85,247,0.08))',
        }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
            background: 'rgba(232,54,93,0.1)', color: '#ff9eb5', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><X size={16} /></button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(85vh - 65px)' }}>{children}</div>
      </div>
    </div>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onCancel}>
      <div style={{ background: 'var(--bg-secondary, #1a1a2e)', borderRadius: 14, border: '1px solid var(--border)', padding: '28px 32px', width: 420, maxWidth: '90vw', boxShadow: '0 24px 64px rgba(232,54,93,0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,54,93,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="#ff9eb5" />
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{message}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: '#ff9eb5', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>取消</button>
          <button onClick={onConfirm} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #e8365d, #ff7a95)', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>确认</button>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = severityMeta[severity]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700,
      color: meta.color, background: meta.bg, border: `1px solid ${meta.color}30`
    }}>
      {severity === '紧急' && <AlertOctagon size={10} />}
      {severity === '高' && <AlertTriangle size={10} />}
      {severity === '中' && <Info size={10} />}
      {severity === '低' && <CheckCircle size={10} />}
      {severity}
    </span>
  )
}

function CategoryBadge({ category }: { category: Category }) {
  const meta = categoryMeta[category]
  const Icon = meta.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600,
      color: meta.color, background: `${meta.color}15`
    }}>
      <Icon size={10} />
      {category}
    </span>
  )
}

function AlertCard({ alert, onResolve, onEscalate, onViewDetail }: { alert: Alert; onResolve: (id: string) => void; onEscalate: (id: string) => void; onViewDetail: (alert: Alert) => void }) {
  const meta = severityMeta[alert.severity]
  return (
    <div className="card" style={{ borderLeft: `4px solid ${meta.border}`, padding: '16px 20px', marginBottom: 12, cursor: 'pointer', transition: 'all 0.15s' }}
      onClick={() => onViewDetail(alert)}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(232,54,93,0.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(232,54,93,0.06)', padding: '2px 6px', borderRadius: 4 }}>
              {alert.id}
            </span>
            <SeverityBadge severity={alert.severity} />
            <CategoryBadge category={alert.category} />
            <span style={{
              fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12,
              background: alert.status === '已解决' ? 'rgba(232,54,93,0.12)' : alert.status === '处理中' ? 'rgba(234,179,8,0.12)' : 'rgba(232,54,93,0.1)',
              color: alert.status === '已解决' ? '#e8365d' : alert.status === '处理中' ? '#a16207' : '#e8365d',
              fontWeight: 600
            }}>
              {alert.status}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{alert.age}</span>
          </div>

          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            {alert.title}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>
            {alert.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>影响组件: </strong>{alert.component}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12,
              background: alert.autoHandled ? 'rgba(232,54,93,0.12)' : 'rgba(234,179,8,0.12)',
              color: alert.autoHandled ? '#e8365d' : '#a16207', fontWeight: 600
            }}>
              {alert.autoHandled ? <><CheckCircle size={10} /> AI已自动处理</> : <><AlertTriangle size={10} /> 需人工介入</>}
            </span>
          </div>
        </div>

        {alert.status !== '已解决' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => onViewDetail(alert)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'white', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500
            }}>
              <Eye size={12} /> 查看详情
            </button>
            <button onClick={() => onEscalate(alert.id)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', borderRadius: 6, border: '1px solid #f97316',
              background: 'rgba(249,115,22,0.08)', color: '#c2410c', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500
            }}>
              <ArrowUpRight size={12} /> 升级至工作台
            </button>
            <button onClick={() => onResolve(alert.id)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', borderRadius: 6, border: 'none',
              background: 'var(--gradient-1)', color: 'white', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500
            }}>
              <CheckCircle size={12} /> 已解决
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AlertCenter() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'realtime' | 'analysis' | 'escalation' | 'rules' | 'channels'>('realtime')
  const [alerts, setAlerts] = useState<Alert[]>(baseAlerts)
  const [severityFilter, setSeverityFilter] = useState<string>('全部')
  const [categoryFilter, setCategoryFilter] = useState<string>('全部')
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [activeCount, setActiveCount] = useState(247)
  const [resolvedToday, setResolvedToday] = useState(1834)
  const [avgResponseTime] = useState('4.1分钟')
  const [autoResolveRate, setAutoResolveRate] = useState(78.3)
  const [rules, setRules] = useState(alertRules)
  const [channelList] = useState(channels)
  const [testMsg, setTestMsg] = useState('')
  const tickerRef = useRef(0)

  // Toast system
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(0)
  const addToast = (message: string, type: Toast['type']) => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }
  const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  // Modal states
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [kpiModal, setKpiModal] = useState<string | null>(null)
  const [selectedEscalation, setSelectedEscalation] = useState<(typeof escalationRecords)[number] | null>(null)
  const [selectedRule, setSelectedRule] = useState<(typeof alertRules)[number] | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<(typeof channels)[number] | null>(null)
  const [selectedCategorySummary, setSelectedCategorySummary] = useState<(typeof categorySummary)[number] | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ message: string; action: () => void } | null>(null)
  const [showNewRule, setShowNewRule] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newRuleSeverity, setNewRuleSeverity] = useState<Severity>('高')

  // Live KPI updates
  useEffect(() => {
    const iv = setInterval(() => {
      setActiveCount(c => c + Math.floor(Math.random() * 3) - 1)
      setResolvedToday(c => c + Math.floor(Math.random() * 4))
      setAutoResolveRate(r => Math.min(99, Math.max(60, r + (Math.random() - 0.5) * 0.5)))
    }, 3500)
    return () => clearInterval(iv)
  }, [])

  // Live alert ticker
  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
      const template = newAlertPool[tickerRef.current % newAlertPool.length]
      tickerRef.current++
      const newAlert: Alert = {
        ...template,
        id: `ALT-${280000 + Math.floor(Math.random() * 9999)}`,
        timestamp: timeStr,
        age: '刚刚'
      }
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)])
      setActiveCount(c => c + 1)
    }, 8000)
    return () => clearInterval(iv)
  }, [])

  const handleResolve = (id: string) => {
    setConfirmAction({
      message: `确认将告警 ${id} 标记为已解决吗？`,
      action: () => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: '已解决' as AlertStatus } : a))
        setResolvedToday(c => c + 1)
        setActiveCount(c => Math.max(0, c - 1))
        addToast(`告警 ${id} 已标记为已解决`, 'success')
        setConfirmAction(null)
        setSelectedAlert(null)
      }
    })
  }
  const handleEscalate = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: '处理中' as AlertStatus } : a))
    addToast(`告警 ${id} 已升级至人工工作台`, 'warning')
  }

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter !== '全部' && a.severity !== severityFilter) return false
    if (categoryFilter !== '全部' && a.category !== categoryFilter) return false
    if (statusFilter !== '全部' && a.status !== statusFilter) return false
    return true
  })

  const tabItems = [
    { key: 'realtime' as const, label: '实时告警' },
    { key: 'analysis' as const, label: '告警分析' },
    { key: 'escalation' as const, label: '升级记录' },
    { key: 'rules' as const, label: '告警规则' },
    { key: 'channels' as const, label: '通知渠道' },
  ]

  // ── AI Config for 告警中心 ──
  const alertAIConfigGroups: AIConfigGroup[] = [
    {
      title: '告警智能分级',
      icon: <AlertTriangle size={18} />,
      params: [
        createParam('alert_p0_threshold', 'P0自动升级阈值', 95, '%置信度', 'P0级告警(资损/服务宕机)自动升级所需的AI置信度, 低于阈值进入人工复核', 92, 93, { min: 80, max: 99, step: 1, autoTuneEnabled: false, learningDataPoints: 8900, adjustHistory: [
          { time: '昨日 03:00', from: '90', to: '95', reason: '凌晨误升级P0告警3次, 手动提高阈值减少误报' },
          { time: '1周前', from: '95', to: '90', reason: 'ROI暴跌事件未及时升级, 临时降低阈值' },
        ] }),
        createParam('alert_p1_threshold', 'P1自动升级阈值', 85, '%置信度', 'P1级告警(素材违规/预算超支)自动升级的置信度阈值', 88, 90, { min: 70, max: 95, step: 1, autoTuneEnabled: false, learningDataPoints: 12400, adjustHistory: [
          { time: '3天前', from: '80', to: '85', reason: 'P1告警量过大导致值班人员疲劳, 手动上调阈值' },
        ] }),
        createParam('alert_aggregate_window', '告警聚合窗口', 5, '分钟', '相同类型告警在此窗口内聚合为一条, 避免告警风暴', 3, 86, { min: 1, max: 30, step: 1, learningDataPoints: 34500, adjustHistory: [
          { time: '2小时前', from: '3', to: '5', reason: '抖音巨量API波动触发告警风暴(200+条/分钟), AI拉长聚合窗口' },
          { time: '昨日', from: '5', to: '3', reason: '告警聚合窗口过长导致P0延迟, AI缩短窗口' },
        ] }),
        createParam('alert_false_positive_limit', '误报率容忍上限', 5, '%', '告警系统整体误报率红线, 超过触发模型重新校准', 3, 88, { min: 1, max: 15, step: 1, learningDataPoints: 41200, adjustHistory: [
          { time: '昨日', from: '8', to: '5', reason: '上周误报率达7.2%, AI收紧误报率上限并重训模型' },
          { time: '1周前', from: '5', to: '8', reason: '新告警规则上线初期, 临时放宽误报容忍度' },
        ] }),
        createParam('alert_dedup_sensitivity', '告警去重灵敏度', 80, '%相似度', '告警文本相似度超过此值判定为重复告警并合并', 85, 84, { min: 50, max: 95, step: 5, learningDataPoints: 28700, adjustHistory: [
          { time: '2天前', from: '75', to: '80', reason: '去重过于激进遗漏部分有效告警, AI微调灵敏度' },
          { time: '5天前', from: '85', to: '75', reason: '重复告警过多, AI降低阈值加强去重' },
        ] }),
      ],
    },
    {
      title: '自动处置',
      icon: <Bot size={18} />,
      params: [
        createParam('auto_handle_confidence', 'AI自动处置置信度阈值', 90, '%', 'AI自动执行告警处置(暂停投放/扩容/回滚)所需的最低置信度', 88, 91, { min: 75, max: 99, step: 1, learningDataPoints: 45600, adjustHistory: [
          { time: '4小时前', from: '85', to: '90', reason: 'AI误处置一起素材违规告警, 自动提高处置阈值' },
          { time: '2天前', from: '92', to: '85', reason: '人工处置积压严重, AI降低阈值提升自动化率' },
          { time: '1周前', from: '88', to: '92', reason: '月度复盘发现3起错误处置, 手动收紧阈值' },
        ] }),
        createParam('auto_pause_threshold', '自动暂停投放阈值', -30, '%ROI偏差', 'ROI偏离基线超过此值时自动暂停对应投放计划, 防止持续亏损', -25, 87, { min: -50, max: -10, step: 5, autoTuneEnabled: false, learningDataPoints: 22300, adjustHistory: [
          { time: '3天前', from: '-20', to: '-30', reason: '正常波动频繁触发暂停, 手动放宽至-30%' },
          { time: '2周前', from: '-30', to: '-20', reason: '某计划持续亏损未被及时暂停, 手动收紧阈值' },
        ] }),
        createParam('auto_scale_threshold', '自动扩容触发阈值', 85, '%利用率', 'DQN推理服务GPU利用率超过此值自动触发扩容, 防止推理延迟', 80, 85, { min: 60, max: 95, step: 5, learningDataPoints: 19800, adjustHistory: [
          { time: '昨日', from: '80', to: '85', reason: '云服务成本超预算, AI上调扩容阈值减少资源浪费' },
          { time: '4天前', from: '90', to: '80', reason: '高峰期推理延迟飙升至500ms, AI降低阈值提前扩容' },
        ] }),
        createParam('manual_escalation_wait', '人工升级等待时间', 15, '分钟', '告警分配给值班人员后等待此时间无响应则自动升级', 10, 82, { min: 5, max: 60, step: 5, learningDataPoints: 16400, adjustHistory: [
          { time: '2天前', from: '10', to: '15', reason: '夜间值班响应较慢, AI延长等待时间避免频繁升级' },
        ] }),
      ],
    },
    {
      title: 'DQN模型监控',
      icon: <Brain size={18} />,
      params: [
        createParam('model_drift_threshold', '模型漂移检测阈值', 20, '%偏差', 'DQN出价模型输出分布与基线偏差超过此值触发漂移告警', 15, 89, { min: 5, max: 40, step: 5, learningDataPoints: 38200, adjustHistory: [
          { time: '6小时前', from: '15', to: '20', reason: '节假日流量模式变化导致频繁误报漂移, AI放宽阈值' },
          { time: '3天前', from: '25', to: '15', reason: '模型漂移导致CPA上涨18%但未告警, AI收紧阈值' },
        ] }),
        createParam('reward_anomaly_threshold', '奖励函数异常检测', 30, '%偏差', 'DQN奖励函数(ROI)偏离历史均值超过此值触发异常检测', 25, 86, { min: 10, max: 50, step: 5, learningDataPoints: 31500, adjustHistory: [
          { time: '昨日', from: '25', to: '30', reason: '新渠道数据波动大, AI放宽异常阈值适应数据分布' },
          { time: '5天前', from: '35', to: '25', reason: '奖励函数异常未被检测, AI收紧阈值' },
        ] }),
        createParam('model_rollback_trigger', '模型自动回滚触发', 40, '%偏差', '模型效果持续恶化超过此阈值自动回滚至上一个稳定版本', 35, 84, { min: 20, max: 60, step: 5, autoTuneEnabled: false, learningDataPoints: 9600, adjustHistory: [
          { time: '2周前', from: '50', to: '40', reason: '模型大幅恶化但未触发回滚, 手动降低阈值' },
        ] }),
        createParam('model_health_check_freq', '模型健康检查频率', 30, '分钟', 'DQN模型健康检查(推理延迟/准确率/漂移度)的执行间隔', 15, 81, { min: 5, max: 120, step: 5, learningDataPoints: 14200, adjustHistory: [
          { time: '3天前', from: '15', to: '30', reason: '健康检查过于频繁占用计算资源, AI降低频率' },
          { time: '1周前', from: '60', to: '15', reason: '模型故障30分钟后才被检测到, AI提高检查频率' },
        ] }),
      ],
    },
    {
      title: '通知与升级',
      icon: <Bell size={18} />,
      params: [
        createParam('slack_notify_delay', 'Slack通知延迟上限', 30, '秒', 'P0/P1告警Slack通知的最大允许延迟, 超时触发备用通知渠道', 15, 90, { min: 5, max: 120, step: 5, learningDataPoints: 52300, adjustHistory: [
          { time: '昨日', from: '15', to: '30', reason: 'Slack API限流导致通知延迟, AI放宽延迟上限' },
          { time: '3天前', from: '60', to: '15', reason: 'P0告警延迟通知导致资损¥2000, 手动收紧至15秒' },
        ] }),
        createParam('auto_assign_handler', '自动分配处理人', '轮询分配', '', '根据告警类型和值班表自动分配处理人, AI智能分配考虑历史处理效率', 'AI智能分配', 87, { type: 'select', options: ['关闭', '轮询分配', '负载均衡', 'AI智能分配'], learningDataPoints: 33400, adjustHistory: [
          { time: '2天前', from: '负载均衡', to: 'AI智能分配', reason: 'AI发现按专长分配处理效率提升30%, 自动切换' },
        ] }),
        createParam('cross_tz_scheduling', '跨时区值班自动调度', '固定时区', '', '全球团队跨时区值班排班策略, AI优化考虑各时区告警密度', 'AI优化', 83, { type: 'select', options: ['关闭', '固定时区', '自动轮转', 'AI优化'], autoTuneEnabled: false, learningDataPoints: 8700, adjustHistory: [
          { time: '1周前', from: '自动轮转', to: '固定时区', reason: '团队反馈自动轮转影响作息, 手动切回固定时区' },
        ] }),
        createParam('alert_convergence', '告警收敛策略', '时间窗口', '', '多条关联告警的收敛合并策略, AI自适应根据告警上下文智能聚合', 'AI自适应', 88, { type: 'select', options: ['不收敛', '时间窗口', '智能聚合', 'AI自适应'], learningDataPoints: 29100, adjustHistory: [
          { time: '昨日', from: '智能聚合', to: 'AI自适应', reason: 'AI检测到关联告警模式, 自动切换自适应收敛策略' },
          { time: '4天前', from: '时间窗口', to: '智能聚合', reason: '单一时间窗口无法处理跨类型关联告警, AI升级策略' },
        ] }),
      ],
    },
  ]

  const alertAILearningStatus: AILearningStatus = {
    modelVersion: 'v3.0.2-alert',
    lastTraining: '1小时前',
    totalDataPoints: 234000,
    avgConfidence: 87,
    autoAdjustCount24h: 198,
    learningRate: '0.0005 (AdamW)',
    nextTraining: '3小时后',
    improvementRate: '+13.1%',
  }

  useRegisterAIConfig(alertAIConfigGroups, alertAILearningStatus, '告警中心')

  const [alertSidePanel, setAlertSidePanel] = useState<Alert | null>(null)

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Alert Side Panel */}
      {alertSidePanel && (() => {
        const a = alertSidePanel
        const meta = severityMeta[a.severity]
        const history7d = Array.from({ length: 7 }, (_, i) => ({
          day: ['3/28','3/29','3/30','3/31','4/1','4/2','4/3'][i],
          value: parseFloat((4.2 + Math.sin(i * 0.9) * 1.2).toFixed(2)),
        }))
        const threshold = a.category === '预算' ? '¥10,000/日' : a.category === 'API' ? '10,000次/小时' : a.category === '反欺诈' ? '欺诈率 > 5%' : '3%阈值'
        const actual = a.category === '预算' ? '¥9,620 (96.2%)' : a.category === 'API' ? '9,847次 (98.5%)' : a.category === '反欺诈' ? '18.7%' : '超基线 32%'
        return (
          <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1499 }} onClick={() => setAlertSidePanel(null)} />
            <div style={{ position: 'fixed', top: 0, right: 0, width: 500, height: '100vh', background: 'var(--bg-secondary, #1a1a2e)', borderLeft: '1px solid var(--border)', zIndex: 1500, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '-8px 0 32px rgba(232,54,93,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#ff9eb5', marginBottom: 4 }}>{a.id}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{a.title}</div>
                </div>
                <button onClick={() => setAlertSidePanel(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem', flexShrink: 0 }}>× 关闭</button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <SeverityBadge severity={a.severity} />
                <CategoryBadge category={a.category} />
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12, background: 'rgba(232,54,93,0.12)', color: '#e8365d', fontWeight: 600 }}>{a.status}</span>
              </div>
              <div style={{ padding: 14, background: `${meta.color}12`, borderRadius: 10, border: `1px solid ${meta.color}30` }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: meta.color, marginBottom: 8 }}>触发阈值 vs 实际值</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>阈值</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ff9eb5' }}>{threshold}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>实际值</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: meta.color }}>{actual}</div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>近7日指标趋势</div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={history7d}>
                    <defs>
                      <linearGradient id="ap7grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={meta.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#ff9eb5' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#ff9eb5' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="value" stroke={meta.color} fill="url(#ap7grad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: 12, background: 'rgba(0,0,0,0.15)', borderRadius: 8, fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>相关广告计划 & 素材</div>
                {[`${a.component} 相关计划 #1`, `${a.component} 相关计划 #2`, '备用素材池 SP-2401'].map((c, i) => (
                  <div key={i} style={{ padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c}</div>
                ))}
              </div>
              <div style={{ padding: 12, background: 'rgba(232,54,93,0.08)', borderRadius: 8, border: '1px solid rgba(232,54,93,0.2)' }}>
                <div style={{ fontWeight: 600, color: '#ff9eb5', marginBottom: 6, fontSize: '0.82rem' }}>AI推荐处理方案</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {a.autoHandled
                    ? `AI已自动介入并处理。建议监控接下来2小时的${a.category}指标变化，若指标恢复正常则无需人工操作。`
                    : `建议立即人工处理。根据历史模式，此类告警若超过30分钟未处理，平均损失将增加¥8,000~¥15,000。优先检查 ${a.component} 的当前状态。`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: '立即处理', color: '#e8365d' },
                  { label: '静默此预警', color: '#6b7280' },
                  { label: '调整阈值', color: '#f97316' },
                  { label: '查看相关计划', color: '#3b82f6' },
                ].map(btn => (
                  <button key={btn.label} onClick={() => { addToast(`${btn.label}: ${a.id}`, 'info'); setAlertSidePanel(null) }} style={{
                    padding: '8px 14px', borderRadius: 8, border: `1px solid ${btn.color}`,
                    background: `${btn.color}20`, color: btn.color, fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
                  }}>{btn.label}</button>
                ))}
              </div>
            </div>
          </>
        )
      })()}

      {confirmAction && (
        <ConfirmDialog message={confirmAction.message} onConfirm={confirmAction.action} onCancel={() => setConfirmAction(null)} />
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <ModalOverlay title={`告警详情: ${selectedAlert.id}`} onClose={() => setSelectedAlert(null)} width={800}>
          {(() => {
            const [aTab, setATab] = useState(0)
            const meta = severityMeta[selectedAlert.severity]
            const trendData = Array.from({ length: 24 }, (_, i) => ({
              h: `${String(i).padStart(2, '0')}:00`,
              count: Math.round(3 + Math.random() * 8),
              impact: Math.round(1000 + Math.random() * 5000),
            }))
            return (
              <div>
                <div className="tabs" style={{ marginBottom: 16 }}>
                  {['概览', '影响分析', '处理历史', '关联告警'].map((t, i) => (
                    <button key={i} className={`tab${aTab === i ? ' active' : ''}`} onClick={() => setATab(i)}>{t}</button>
                  ))}
                </div>
                {aTab === 0 && (
                  <div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                      <SeverityBadge severity={selectedAlert.severity} />
                      <CategoryBadge category={selectedAlert.category} />
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, background: 'rgba(232,54,93,0.1)', color: '#e8365d', fontWeight: 600 }}>{selectedAlert.status}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{selectedAlert.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.7, marginBottom: 16 }}>{selectedAlert.description}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      {[
                        { label: '影响组件', value: selectedAlert.component },
                        { label: '触发时间', value: selectedAlert.timestamp },
                        { label: '处理方式', value: selectedAlert.autoHandled ? 'AI自动处理' : '需人工介入' },
                        { label: '持续时间', value: selectedAlert.age },
                      ].map((item, i) => (
                        <div key={i} style={{ background: `${meta.color}10`, borderRadius: 8, padding: 12 }}>
                          <div style={{ fontSize: '0.65rem', color: '#ff9eb5', marginBottom: 4 }}>{item.label}</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    {selectedAlert.status !== '已解决' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleResolve(selectedAlert.id)} style={{
                          flex: 1, padding: '10px', borderRadius: 8, border: 'none',
                          background: 'linear-gradient(135deg, #e8365d, #ff7a95)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}><CheckCircle size={14} /> 标记已解决</button>
                        <button onClick={() => { handleEscalate(selectedAlert.id); setSelectedAlert(null) }} style={{
                          flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #f97316',
                          background: 'rgba(249,115,22,0.08)', color: '#f97316', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}><ArrowUpRight size={14} /> 升级至工作台</button>
                      </div>
                    )}
                  </div>
                )}
                {aTab === 1 && (
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>同类告警趋势 (24h)</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={meta.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="h" tick={{ fontSize: 9, fill: '#ff9eb5' }} interval={3} />
                        <YAxis tick={{ fontSize: 9, fill: '#ff9eb5' }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="count" stroke={meta.color} fill="url(#alertGrad)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                      {[
                        { label: '预估损失', value: '¥12,340' },
                        { label: '影响用户', value: '23,000+' },
                        { label: '关联服务', value: '3个' },
                      ].map((p, i) => (
                        <div key={i} style={{ textAlign: 'center', background: 'rgba(232,54,93,0.1)', borderRadius: 8, padding: 10 }}>
                          <div style={{ fontSize: '0.65rem', color: '#ff9eb5' }}>{p.label}</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {aTab === 2 && (
                  <div>
                    {[
                      { time: selectedAlert.timestamp, action: '告警触发', detail: selectedAlert.title },
                      { time: selectedAlert.timestamp, action: selectedAlert.autoHandled ? 'AI自动分析' : '等待人工', detail: '根因分析完成' },
                      { time: selectedAlert.timestamp, action: '通知发送', detail: '系统通知 + 邮件已发送' },
                    ].map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(76,29,149,0.3)' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(232,54,93,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff9eb5', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0 }}>{i + 1}</div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#ff9eb5' }}>{step.time} -- {step.action}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginTop: 2 }}>{step.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {aTab === 3 && (
                  <div>
                    {alerts.filter(a => a.category === selectedAlert.category && a.id !== selectedAlert.id).slice(0, 4).map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(76,29,149,0.3)', cursor: 'pointer' }}
                        onClick={() => setSelectedAlert(a)}
                      >
                        <SeverityBadge severity={a.severity} />
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', flex: 1 }}>{a.title.slice(0, 50)}...</span>
                        <span style={{ fontSize: '0.72rem', color: '#ff9eb5' }}>{a.age}</span>
                      </div>
                    ))}
                    {alerts.filter(a => a.category === selectedAlert.category && a.id !== selectedAlert.id).length === 0 && (
                      <div style={{ color: '#ff9eb5', fontSize: '0.82rem', padding: 20, textAlign: 'center' }}>无同类关联告警</div>
                    )}
                  </div>
                )}
              </div>
            )
          })()}
        </ModalOverlay>
      )}

      {/* KPI Detail Modal */}
      {kpiModal && (
        <ModalOverlay title={kpiModal} onClose={() => setKpiModal(null)} width={600}>
          {kpiModal === '活跃告警数' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {(['紧急', '高', '中', '低'] as Severity[]).map(s => (
                  <div key={s} style={{ background: `${severityMeta[s].color}10`, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: '0.68rem', color: '#ff9eb5' }}>{s}级别</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: severityMeta[s].color }}>{alerts.filter(a => a.severity === s && a.status !== '已解决').length}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {kpiModal === '今日已解决' && (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyAlertData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#ff9eb5' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#ff9eb5' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="紧急" fill="#e8365d" stackId="a" />
                  <Bar dataKey="高" fill="#f97316" stackId="a" />
                  <Bar dataKey="中" fill="#eab308" stackId="a" />
                  <Bar dataKey="低" fill="#9b8cb8" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {kpiModal === '平均响应时间' && (
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={responseTimeData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#ff9eb5' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#ff9eb5' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                  <Line type="monotone" dataKey="自动" stroke="#e8365d" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="人工" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="综合" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {kpiModal === '自动解决率' && (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#e8365d' }}>{autoResolveRate.toFixed(1)}%</div>
              <div style={{ fontSize: '0.85rem', color: '#ff9eb5', marginTop: 8 }}>AI自动处理率持续提升中</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                {[
                  { label: '自动处理', value: Math.round(resolvedToday * autoResolveRate / 100) },
                  { label: '人工处理', value: Math.round(resolvedToday * (100 - autoResolveRate) / 100) },
                ].map((p, i) => (
                  <div key={i} style={{ background: 'rgba(232,54,93,0.1)', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: '0.65rem', color: '#ff9eb5' }}>{p.label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalOverlay>
      )}

      {/* Escalation Detail Modal */}
      {selectedEscalation && (
        <ModalOverlay title={`升级记录: ${selectedEscalation.alertId}`} onClose={() => setSelectedEscalation(null)} width={550}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: '告警ID', value: selectedEscalation.alertId },
              { label: '升级时间', value: selectedEscalation.escalatedAt },
              { label: '工作台任务', value: selectedEscalation.taskId },
              { label: '处理人', value: selectedEscalation.handler },
              { label: '处理时长', value: selectedEscalation.duration },
              { label: '处理结果', value: selectedEscalation.result },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(232,54,93,0.08)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '0.65rem', color: '#ff9eb5', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>升级原因</div>
          <div style={{ padding: 12, borderRadius: 8, background: '#0f172a', border: '1px solid #1e293b', fontSize: '0.82rem', color: '#e2e8f0' }}>
            {selectedEscalation.reason}
          </div>
        </ModalOverlay>
      )}

      {/* Rule Detail Modal */}
      {selectedRule && (
        <ModalOverlay title={`规则: ${selectedRule.name}`} onClose={() => setSelectedRule(null)} width={600}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: '规则ID', value: selectedRule.id },
              { label: '名称', value: selectedRule.name },
              { label: '触发条件', value: selectedRule.condition },
              { label: '严重程度', value: selectedRule.severity },
              { label: '通知渠道', value: selectedRule.channels.join(', ') },
              { label: '状态', value: selectedRule.enabled ? '已启用' : '已禁用' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(232,54,93,0.08)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '0.65rem', color: '#ff9eb5', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { addToast(`规则 "${selectedRule.name}" 配置已更新`, 'success'); setSelectedRule(null) }} style={{
              flex: 1, padding: '10px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #e8365d, #ff7a95)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            }}>保存修改</button>
            <button onClick={() => {
              setConfirmAction({
                message: `确认删除规则 "${selectedRule.name}" 吗？`,
                action: () => {
                  setRules(prev => prev.filter(r => r.id !== selectedRule.id))
                  addToast(`规则 "${selectedRule.name}" 已删除`, 'success')
                  setConfirmAction(null)
                  setSelectedRule(null)
                }
              })
            }} style={{
              flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}><Trash2 size={14} /> 删除规则</button>
          </div>
        </ModalOverlay>
      )}

      {/* Channel Detail Modal */}
      {selectedChannel && (
        <ModalOverlay title={`通知渠道: ${selectedChannel.name}`} onClose={() => setSelectedChannel(null)} width={550}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: '类型', value: selectedChannel.type },
              { label: '状态', value: selectedChannel.status },
              { label: '描述', value: selectedChannel.desc },
              { label: '配置', value: selectedChannel.config },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(232,54,93,0.08)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '0.65rem', color: '#ff9eb5', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <button onClick={() => {
            setLoading(true)
            setTimeout(() => {
              setLoading(false)
              addToast(`${selectedChannel.name} 测试消息发送成功`, 'success')
              setSelectedChannel(null)
            }, 1200)
          }} style={{
            width: '100%', padding: '10px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #e8365d, #ff7a95)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}><Play size={14} /> 发送测试消息</button>
        </ModalOverlay>
      )}

      {/* Category Summary Modal */}
      {selectedCategorySummary && (
        <ModalOverlay title={`分类详情: ${selectedCategorySummary.category}`} onClose={() => setSelectedCategorySummary(null)} width={550}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: '本月告警数', value: String(selectedCategorySummary.count) },
              { label: '本月总数', value: String(selectedCategorySummary.total) },
              { label: '平均解决时间', value: selectedCategorySummary.avgTime },
              { label: '自动解决率', value: selectedCategorySummary.autoRate },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(232,54,93,0.08)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '0.65rem', color: '#ff9eb5', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </ModalOverlay>
      )}

      {/* New Rule Modal */}
      {showNewRule && (
        <ModalOverlay title="新建告警规则" onClose={() => setShowNewRule(false)} width={600}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: '规则名称', placeholder: '输入告警规则名称...' },
              { label: '触发条件', placeholder: '例如: 预算消耗 >= 85%' },
            ].map((field, i) => (
              <div key={i}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ff9eb5', marginBottom: 6 }}>{field.label}</div>
                <input placeholder={field.placeholder} style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'rgba(232,54,93,0.06)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
                }} />
              </div>
            ))}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ff9eb5', marginBottom: 6 }}>严重程度</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['紧急', '高', '中', '低'] as Severity[]).map(s => (
                  <button key={s} onClick={() => setNewRuleSeverity(s)} style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: `1px solid ${newRuleSeverity === s ? severityMeta[s].color : `${severityMeta[s].color}40`}`,
                    background: newRuleSeverity === s ? `${severityMeta[s].color}22` : `${severityMeta[s].color}10`,
                    color: severityMeta[s].color,
                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                    boxShadow: newRuleSeverity === s ? `0 0 0 2px ${severityMeta[s].color}30` : 'none',
                    transition: 'all 0.15s',
                  }}>{s}</button>
                ))}
              </div>
            </div>
            <button onClick={() => {
              setLoading(true)
              setTimeout(() => {
                setLoading(false)
                addToast('新告警规则已创建', 'success')
                setShowNewRule(false)
              }, 1200)
            }} style={{
              padding: '10px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #e8365d, #ff7a95)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', marginTop: 8,
            }}>创建规则</button>
          </div>
        </ModalOverlay>
      )}

      {loading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ padding: '20px 32px', borderRadius: 12, background: '#1e1b4b', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
            <RefreshCw size={16} color="#ff9eb5" style={{ animation: 'spin 1s linear infinite' }} /> 执行中...
          </div>
        </div>
      )}

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <h2 style={{ margin: 0 }}>全局告警中心</h2>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 20,
            background: 'rgba(232,54,93,0.12)', color: '#e8365d',
            fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(232,54,93,0.3)'
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e8365d', animation: 'pulse 1.5s ease-in-out infinite', display: 'inline-block' }} />
            未解决: {activeCount.toLocaleString()}
          </span>
        </div>
        <p>AI智能告警 -- 自动根因分析 -- 一键升级工作台 -- 多通道告警通知</p>
      </div>

      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="AnomalyDetector-LSTM" color="#f59e0b" />
          <ModelBadge name="FraudDetector-XGB" color="#f59e0b" />
          <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
          <ModelBadge name="CVR-Predictor-ESMM" color="#e8365d" />
          <ModelBadge name="BidOptimizer-DQN" color="#e8365d" />
        </div>

        {/* ── AI决策中心 · 预警触发决策联动 ── */}
        {(() => {
          const alertDecisions = [
            { alertId: 'ALT-892', alertTitle: 'CPA异常飙升42%', trigger: 'AnomalyDetector-LSTM', decisionId: 'DC-001', decisionTitle: '出价策略调整 -15%', status: '执行中', impact: '节省¥3,200/日', time: '11:45' },
            { alertId: 'ALT-891', alertTitle: '小红书素材CTR骤降72%', trigger: 'CreativeFatigue-MAB', decisionId: 'DC-002', decisionTitle: '素材疲劳自动轮换', status: '执行中', impact: 'CTR恢复+18%', time: '11:30' },
            { alertId: 'ALT-887', alertTitle: '无效流量占比超阈值', trigger: 'FraudDetector-XGB', decisionId: 'DC-F01', decisionTitle: '触发反欺诈拦截规则', status: '已完成', impact: '拦截¥8,500无效消耗', time: '11:10' },
            { alertId: 'ALT-884', alertTitle: '竞品暂停投放窗口期', trigger: 'CompetitorIntel-NLP', decisionId: 'DC-009', decisionTitle: '小红书抢量加价8%', status: '已完成', impact: '流量+2,800/日', time: '10:50' },
          ]
          const statusStyle: Record<string, { bg: string; color: string }> = {
            '执行中': { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
            '已完成': { bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
            '待确认': { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
          }
          return (
            <div style={{ marginBottom: 20, padding: '14px 16px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px #6366f1' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>AI决策中心 · 预警已触发决策</span>
                  <span style={{ fontSize: '0.62rem', padding: '1px 8px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>模型驱动 · 自动联动</span>
                </div>
                <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.68rem', color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部决策 →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {alertDecisions.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace', width: 34, flexShrink: 0 }}>{d.time}</span>
                    <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#f87171', flexShrink: 0 }}>{d.alertId}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{d.alertTitle}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>→</span>
                    <ModelBadge name={d.trigger} color="#f59e0b" />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>→ 触发</span>
                    <span style={{ fontSize: '0.7rem', flex: 1, fontWeight: 500 }}>{d.decisionTitle}</span>
                    <span style={{ fontSize: '0.62rem', color: '#34d399', flexShrink: 0 }}>{d.impact}</span>
                    <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 5, flexShrink: 0, ...(statusStyle[d.status] || {}) }}>{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* KPI Cards */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div className="card" style={{ borderTop: '3px solid #e8365d', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setKpiModal('活跃告警数')}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(232,54,93,0.15)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
          >
            <div className="card-title">活跃告警数</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#e8365d' }}>{activeCount.toLocaleString()}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8365d', animation: 'pulse 1.5s ease-in-out infinite', display: 'inline-block' }} />
              实时更新中 | <Eye size={10} /> 点击详情
            </div>
          </div>
          <div className="card" style={{ borderTop: '3px solid #e8365d', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setKpiModal('今日已解决')}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(232,54,93,0.15)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
          >
            <div className="card-title">今日已解决</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{resolvedToday.toLocaleString()}</div>
            <div className="card-change positive" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={12} /> 较昨日 +12.3%
            </div>
          </div>
          <div className="card" style={{ borderTop: '3px solid #ff7a95', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setKpiModal('平均响应时间')}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(232,54,93,0.15)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
          >
            <div className="card-title">平均响应时间</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{avgResponseTime}</div>
            <div className="card-change positive" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <TrendingDown size={12} /> 较上周 -18%
            </div>
          </div>
          <div className="card" style={{ borderTop: '3px solid #6366f1', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setKpiModal('自动解决率')}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(232,54,93,0.15)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
          >
            <div className="card-title">自动解决率</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{autoResolveRate.toFixed(1)}%</div>
            <div style={{ marginTop: 6 }}>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${autoResolveRate}%`, background: 'var(--gradient-1)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabItems.map(t => (
            <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: 实时告警 */}
        {tab === 'realtime' && (
          <>
            <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Filter size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>严重程度:</span>
                {['全部', '紧急', '高', '中', '低'].map(s => (
                  <button key={s} onClick={() => setSeverityFilter(s)} style={{
                    padding: '4px 12px', borderRadius: 16, fontSize: '0.78rem', fontWeight: 500,
                    border: severityFilter === s ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                    background: severityFilter === s ? 'rgba(232,54,93,0.08)' : 'white',
                    color: severityFilter === s ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}>{s}</button>
                ))}
                <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>类别:</span>
                {['全部', '预算', 'API', '智能体', '反欺诈', '内容', '平台'].map(c => (
                  <button key={c} onClick={() => setCategoryFilter(c)} style={{
                    padding: '4px 12px', borderRadius: 16, fontSize: '0.78rem', fontWeight: 500,
                    border: categoryFilter === c ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                    background: categoryFilter === c ? 'rgba(232,54,93,0.08)' : 'white',
                    color: categoryFilter === c ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}>{c}</button>
                ))}
                <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>状态:</span>
                {['全部', '活跃', '处理中', '已解决'].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{
                    padding: '4px 12px', borderRadius: 16, fontSize: '0.78rem', fontWeight: 500,
                    border: statusFilter === s ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                    background: statusFilter === s ? 'rgba(232,54,93,0.08)' : 'white',
                    color: statusFilter === s ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}>{s}</button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  显示 {filteredAlerts.length} / {alerts.length} 条告警
                </span>
              </div>
            </div>

            <div>
              {filteredAlerts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <CheckCircle size={40} color="rgba(232,54,93,0.3)" style={{ marginBottom: 12 }} />
                  <p>当前筛选条件下没有告警</p>
                </div>
              ) : (
                filteredAlerts.map(a => (
                  <AlertCard key={a.id} alert={a} onResolve={handleResolve} onEscalate={handleEscalate} onViewDetail={setAlertSidePanel} />
                ))
              )}
            </div>
          </>
        )}

        {/* Tab: 告警分析 */}
        {tab === 'analysis' && (
          <>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="card-title">过去7天告警数量(按严重程度)</div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={weeklyAlertData}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Bar dataKey="紧急" fill="#e8365d" radius={[2,2,0,0]} stackId="a" />
                    <Bar dataKey="高" fill="#f97316" radius={[0,0,0,0]} stackId="a" />
                    <Bar dataKey="中" fill="#eab308" radius={[0,0,0,0]} stackId="a" />
                    <Bar dataKey="低" fill="#9b8cb8" radius={[2,2,0,0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="card-title">告警类型分布</div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={categoryDistData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      dataKey="value" nameKey="name" paddingAngle={3}
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {categoryDistData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">平均响应时间趋势(分钟)</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={responseTimeData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Line type="monotone" dataKey="自动" stroke="#e8365d" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="人工" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="综合" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-title">告警分类汇总</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>告警类别</th>
                    <th>本月告警数</th>
                    <th>本月总数</th>
                    <th>平均解决时间</th>
                    <th>自动解决率</th>
                    <th>趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {categorySummary.map((row, i) => (
                    <tr key={i} style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => setSelectedCategorySummary(row)}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(232,54,93,0.06)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.category}</td>
                      <td>{row.count}</td>
                      <td>{row.total}</td>
                      <td>{row.avgTime}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-bar-fill" style={{ width: row.autoRate, background: 'var(--gradient-1)' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{row.autoRate}</span>
                        </div>
                      </td>
                      <td>
                        {i % 2 === 0
                          ? <span style={{ color: '#e8365d', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 3 }}><TrendingUp size={12} /> +8%</span>
                          : <span style={{ color: '#e8365d', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 3 }}><TrendingDown size={12} /> -5%</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab: 升级记录 */}
        {tab === 'escalation' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="card-title" style={{ margin: 0 }}>告警升级至人工工作台记录</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { exportObjectsCsv('升级记录', escalationRecords, { alertId: '告警ID', reason: '升级原因', escalatedAt: '升级时间', taskId: '工单ID', handler: '处理人', duration: '处理时长', result: '处理结果' }); addToast('升级记录已导出', 'success') }} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 6,
                  border: '1px solid rgba(232,54,93,0.3)', background: 'rgba(232,54,93,0.08)', color: '#ff9eb5',
                  cursor: 'pointer', fontSize: '0.75rem',
                }}><Download size={12} /> 导出</button>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>今日共升级 {escalationRecords.length} 条</span>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>告警ID</th>
                  <th>升级原因</th>
                  <th>升级时间</th>
                  <th>工作台任务ID</th>
                  <th>处理人</th>
                  <th>处理时长</th>
                  <th>处理结果</th>
                </tr>
              </thead>
              <tbody>
                {escalationRecords.map((r, i) => (
                  <tr key={i} style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => setSelectedEscalation(r)}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(232,54,93,0.06)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}
                  >
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: 'rgba(232,54,93,0.06)', padding: '2px 6px', borderRadius: 4, color: 'var(--accent-primary)' }}>
                        {r.alertId}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200 }}>{r.reason}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{r.escalatedAt}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        {r.taskId}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.handler}</td>
                    <td>{r.duration}</td>
                    <td>
                      <span style={{ fontSize: '0.78rem', padding: '3px 8px', borderRadius: 12, background: 'rgba(232,54,93,0.1)', color: '#e8365d', fontWeight: 600 }}>
                        {r.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: 告警规则 */}
        {tab === 'rules' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => setShowNewRule(true)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: 'var(--gradient-1)', color: 'white',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}>
                <Plus size={14} /> 新建规则
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rules.map((rule, i) => {
                const Icon = rule.icon
                return (
                  <div key={rule.id} className="card" style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => setSelectedRule(rule)}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(232,54,93,0.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(232,54,93,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Icon size={18} color="var(--accent-primary)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{rule.name}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{rule.id}</span>
                          <SeverityBadge severity={rule.severity} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            触发条件: <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{rule.condition}</strong>
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {rule.channels.map((ch, ci) => (
                              <span key={ci} style={{
                                fontSize: '0.7rem', padding: '2px 7px', borderRadius: 12,
                                background: 'rgba(232,54,93,0.06)', color: 'var(--accent-primary)', border: '1px solid var(--rose-200)'
                              }}>{ch}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedRule(rule)} style={{ padding: '6px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => {
                          setConfirmAction({
                            message: `确认删除规则 "${rule.name}" 吗？`,
                            action: () => {
                              setRules(prev => prev.filter(r => r.id !== rule.id))
                              addToast(`规则 "${rule.name}" 已删除`, 'success')
                              setConfirmAction(null)
                            }
                          })
                        }} style={{ padding: '6px', border: 'none', background: 'none', cursor: 'pointer', color: '#e8365d' }}>
                          <Trash2 size={14} />
                        </button>
                        <div
                          onClick={() => {
                            if (rule.enabled) {
                              setConfirmAction({
                                message: `确认禁用规则 "${rule.name}" 吗？`,
                                action: () => {
                                  setRules(prev => prev.map((r, ri) => ri === i ? { ...r, enabled: false } : r))
                                  addToast(`规则 "${rule.name}" 已禁用`, 'warning')
                                  setConfirmAction(null)
                                }
                              })
                            } else {
                              setRules(prev => prev.map((r, ri) => ri === i ? { ...r, enabled: true } : r))
                              addToast(`规则 "${rule.name}" 已启用`, 'success')
                            }
                          }}
                          style={{
                            width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                            background: rule.enabled ? 'var(--accent-primary)' : '#d1d5db',
                            position: 'relative', transition: 'background 0.2s'
                          }}
                        >
                          <div style={{
                            position: 'absolute', top: 3, left: rule.enabled ? 23 : 3,
                            width: 18, height: 18, borderRadius: '50%',
                            background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: rule.enabled ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 600, minWidth: 36 }}>
                          {rule.enabled ? '启用' : '禁用'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Tab: 通知渠道 */}
        {tab === 'channels' && (
          <>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              {channelList.map((ch, i) => {
                const Icon = ch.icon
                return (
                  <div key={i} className="card" style={{ borderLeft: `4px solid #e8365d`, cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => setSelectedChannel(ch)}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(232,54,93,0.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(232,54,93,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Icon size={20} color="var(--accent-primary)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{ch.name}</span>
                          <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: 12, background: 'rgba(232,54,93,0.06)', color: 'var(--accent-primary)', border: '1px solid var(--rose-200)' }}>{ch.type}</span>
                          <span style={{
                            fontSize: '0.7rem', padding: '2px 7px', borderRadius: 12, fontWeight: 600,
                            background: 'rgba(232,54,93,0.1)', color: '#e8365d'
                          }}>{ch.status}</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{ch.desc}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ch.config}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => {
                        setLoading(true)
                        setTimeout(() => {
                          setLoading(false)
                          addToast(`${ch.name} 测试消息发送成功`, 'success')
                        }, 1200)
                      }} style={{
                        flex: 1, padding: '7px', borderRadius: 8,
                        border: '1px solid var(--border)', background: 'white',
                        color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}>
                        <Play size={12} />测试
                      </button>
                      <button onClick={() => setSelectedChannel(ch)} style={{
                        flex: 1, padding: '7px', borderRadius: 8,
                        border: '1px solid rgba(232,54,93,0.3)', background: 'rgba(232,54,93,0.06)',
                        color: 'var(--accent-primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}>
                        <Edit2 size={12} />编辑
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>发送测试通知</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>选择通知渠道</label>
                  <select style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'white',
                    fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none'
                  }}>
                    <option>系统通知 (内置)</option>
                    <option>邮件 (SMTP)</option>
                    <option>Slack Webhook</option>
                    <option>企业微信</option>
                  </select>
                </div>
                <div style={{ flex: 2, minWidth: 200 }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>测试消息内容</label>
                  <input
                    type="text"
                    value={testMsg}
                    onChange={e => setTestMsg(e.target.value)}
                    placeholder="输入测试告警消息内容..."
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 8,
                      border: '1px solid var(--border)', background: 'white',
                      fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none'
                    }}
                  />
                </div>
                <button onClick={() => {
                  setLoading(true)
                  setTimeout(() => {
                    setLoading(false)
                    addToast('测试通知已发送成功!', 'success')
                    setTestMsg('')
                  }, 1500)
                }} style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: 'var(--gradient-1)', color: 'white',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                }}>
                  发送测试
                </button>
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(232,54,93,0.06)', border: '1px solid var(--rose-200)' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>
                  <strong>上次测试: </strong>2026-04-03 14:15:02 -- 系统通知 -- <span style={{ color: '#e8365d' }}>发送成功，响应时间 0.12s</span>
                </p>
              </div>
            </div>
          </>
        )}

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}

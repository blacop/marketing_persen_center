import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { Shield, AlertTriangle, Bot, Activity, Target, Eye, Lock, TrendingUp, Users, Brain, BarChart3, UserCheck, X } from 'lucide-react'
import { createParam, AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

const fraudTypeData = [
  { name: '机器人点击', value: 38, color: '#ef4444' },
  { name: '虚假安装', value: 25, color: '#f59e0b' },
  { name: '点击注入', value: 18, color: '#ff7a95' },
  { name: '设备农场', value: 12, color: '#3b82f6' },
  { name: '其他', value: 7, color: '#6b7280' },
]

const platformFraud = [
  { name: '抖音巨量', fraudRate: 3.8, blocked: 312, color: '#4f7df9', status: '正常' },
  { name: '小红书', fraudRate: 4.2, blocked: 289, color: '#ff2d55', status: '偏高' },
  { name: '快手磁力', fraudRate: 2.9, blocked: 198, color: '#34a853', status: '正常' },
  { name: '微信广告', fraudRate: 4.5, blocked: 156, color: '#07c160', status: '偏高' },
  { name: '天猫品销宝', fraudRate: 1.8, blocked: 114, color: '#ff6200', status: '良好' },
  { name: '联盟渠道', fraudRate: 6.2, blocked: 178, color: '#f59e0b', status: '警告' },
  { name: 'Meta Ads', fraudRate: 3.1, blocked: 224, color: '#1877f2', status: '正常' },
  { name: 'TikTok Global', fraudRate: 4.8, blocked: 312, color: '#8b5cf6', status: '偏高' },
  { name: 'Google Ads', fraudRate: 2.2, blocked: 98, color: '#22c55e', status: '良好' },
]

const recentEvents = [
  { time: '14:32', type: '机器人点击', platform: '抖音', detail: '检测到批量点击模式，同一设备ID 5分钟内点击47次', action: '已拦截' },
  { time: '14:18', type: '虚假安装', platform: '快手', detail: '安装后无任何事件触发，设备指纹匹配已知农场库', action: '已拦截' },
  { time: '14:05', type: '点击注入', platform: '小红书', detail: '点击到安装时间<2秒，判定为点击注入攻击', action: '已拦截' },
  { time: '13:51', type: '设备农场', platform: '抖音', detail: '同一IP段30分钟内出现89个新设备，地理位置广州', action: '已标记' },
  { time: '13:40', type: '机器人点击', platform: '微信广告', detail: 'CTR异常偏高(38%)，用户行为模式高度一致', action: '已拦截' },
  { time: '13:28', type: '点击注入', platform: 'TikTok Global', detail: '东南亚流量来源点击→安装时间<1.5秒，判定为跨境点击注入攻击，IP段归属印尼代理商', action: '已拦截' },
  { time: '13:15', type: '虚假安装', platform: 'Meta Ads', detail: 'EU区iOS广告系列检测到批量App安装后无任何事件触发，设备IDFA全为000，确认为设备农场流量', action: '已拦截' },
  { time: '12:52', type: '设备农场', platform: 'Google Ads', detail: '美区Google UAC广告检测到同一ASN下15分钟出现142个新激活设备，地理位置聚集于德克萨斯州某数据中心', action: '已标记' },
]

const suspiciousUsers = [
  { id: 'USR-88421', deposit: '¥82,500', behavior: '注册后2小时内下单¥82,500，IP地址与已知欺诈网络重合', risk: 95, tag: '虚假订单' },
  { id: 'USR-77130', deposit: '¥21,600', behavior: '3个账号使用同一设备指纹，交替下单套取新人优惠券', risk: 91, tag: '多账号关联' },
  { id: 'USR-66294', deposit: '¥58,400', behavior: '批量下单后集中退款，疑似恶意刷单套取优惠', risk: 87, tag: '奖金套利' },
  { id: 'USR-55018', deposit: '¥34,200', behavior: '收货地址与下单IP地理位置不符，多次小额拆单', risk: 83, tag: '自刷单' },
  { id: 'USR-44302', deposit: '¥105,000', behavior: '使用虚拟支付账户下单，设备为模拟器环境', risk: 89, tag: '虚假订单' },
]

const whaleVerification = [
  { id: 'VIP-0012', deposit: '¥1,220,000', sessions: 847, avgBet: '¥1,440', verdict: '真实用户', score: 98 },
  { id: 'VIP-0034', deposit: '¥635,000', sessions: 12, avgBet: '¥52,916', verdict: '待验证', score: 45 },
  { id: 'VIP-0051', deposit: '¥452,000', sessions: 423, avgBet: '¥1,069', verdict: '真实用户', score: 94 },
]

const mmpComparison = [
  { platform: '抖音巨量', reported: 12450, mmp: 10830, diff: 13.0 },
  { platform: '小红书聚光', reported: 8920, mmp: 7180, diff: 19.5 },
  { platform: '快手磁力', reported: 6780, mmp: 6320, diff: 6.8 },
  { platform: '微信广告', reported: 4560, mmp: 3210, diff: 29.6 },
]

const abnormalChannels = [
  { name: 'KS-AFF-0892', installs: 3420, day1Retention: '8.2%', day7Retention: '1.1%', avgSession: '0.3min', flag: '极度异常' },
  { name: 'DY-DSP-1204', installs: 2890, day1Retention: '12.5%', day7Retention: '2.8%', avgSession: '0.8min', flag: '高度异常' },
  { name: 'XHS-AFF-0341', installs: 1950, day1Retention: '15.1%', day7Retention: '3.2%', avgSession: '1.2min', flag: '异常' },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

// ─── Fraud Drill Panels ───────────────────────────────────────────────────────
type FraudDrillTarget =
  | { kind: 'event'; data: typeof recentEvents[0] }
  | { kind: 'user'; data: typeof suspiciousUsers[0] }

function FraudDrillPanel({ target, onClose }: { target: FraudDrillTarget; onClose: () => void }) {
  const panelStyle: React.CSSProperties = {
    position: 'fixed', top: 0, right: 0, width: 500, height: '100vh',
    background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
    zIndex: 900, overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
    padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16,
  }
  const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 899 }
  const row = (label: string, value: React.ReactNode) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
  const btn = (label: string, color = '#ef4444') => (
    <button key={label} onClick={onClose} style={{
      padding: '8px 14px', borderRadius: 8, border: `1px solid ${color}`,
      background: `${color}20`, color, fontSize: '0.77rem', fontWeight: 600, cursor: 'pointer',
    }}>{label}</button>
  )
  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {target.kind === 'event' ? `欺诈事件详情 · ${target.data.type}` : `可疑用户 · ${(target.data as typeof suspiciousUsers[0]).id}`}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>× 关闭</button>
        </div>

        {target.kind === 'event' && (() => {
          const d = target.data as typeof recentEvents[0]
          const impact = d.type === '机器人点击' ? '¥54,800' : d.type === '虚假安装' ? '¥97,200' : d.type === '点击注入' ? '¥38,900' : '¥82,400'
          return (
            <>
              <div style={{ padding: 12, background: 'rgba(239,68,68,0.06)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>欺诈类型: {d.type} · 严重程度: 高</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>状态: {d.action}</div>
              </div>
              {row('检测时间', d.time)}
              {row('平台', d.platform)}
              {row('检测方法', d.type === '机器人点击' ? 'ML模型 (行为分析)' : 'Rule-based + ML混合')}
              {row('财务影响', <span style={{ color: '#ef4444', fontWeight: 700 }}>{impact}</span>)}
              {row('受影响账户', '3个广告账户')}
              {row('受影响广告计划', '7个计划')}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>证据链</div>
                <div style={{ padding: 12, background: 'var(--bg-primary, rgba(0,0,0,0.04))', borderRadius: 8, fontSize: '0.75rem', fontFamily: 'monospace', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                  {d.detail}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>处理历史</div>
                {[
                  { time: d.time, action: `检测到${d.type}`, status: '自动' },
                  { time: d.time, action: '触发拦截规则', status: '系统' },
                  { time: d.time, action: d.action, status: '已完成' },
                ].map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: '0.75rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{h.time}</span>
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{h.action}</span>
                    <span style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(34,211,153,0.15)', color: '#34d399', fontSize: '0.68rem', fontWeight: 600 }}>{h.status}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {btn('立即封禁', '#ef4444')}
                {btn('暂停账户', '#f97316')}
                {btn('标记误报', '#6b7280')}
                {btn('生成报告', '#3b82f6')}
              </div>
            </>
          )
        })()}

        {target.kind === 'user' && (() => {
          const d = target.data as typeof suspiciousUsers[0]
          return (
            <>
              <div style={{ padding: 12, background: `rgba(239,68,68,${d.risk >= 90 ? 0.1 : 0.06})`, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>风险评分: {d.risk}% · {d.tag}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>高风险用户 · 建议立即处理</div>
              </div>
              {row('用户ID', d.id)}
              {row('消费金额', <span style={{ color: '#fbbf24' }}>{d.deposit}</span>)}
              {row('风险标签', d.tag)}
              {row('检测方法', 'GNN + Rule-based混合')}
              {row('风险评分', <span style={{ color: d.risk >= 90 ? '#ef4444' : '#f59e0b' }}>{d.risk}%</span>)}
              {row('财务影响', d.deposit)}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>行为证据</div>
                <div style={{ padding: 12, background: 'var(--bg-primary, rgba(0,0,0,0.04))', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                  {d.behavior}
                </div>
              </div>
              {row('受影响账户', d.id)}
              {row('关联设备数', '3')}
              {row('关联IP数', '5')}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 8 }}>处理历史</div>
                {[
                  { time: '今日 09:12', action: 'GNN模型标记高风险', status: '自动' },
                  { time: '今日 09:15', action: '风险评分计算完成', status: '系统' },
                  { time: '今日 09:18', action: '进入人工审核队列', status: '待处理' },
                ].map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: '0.75rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{h.time}</span>
                    <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{h.action}</span>
                    <span style={{ padding: '1px 6px', borderRadius: 4, background: h.status === '自动' ? 'rgba(34,211,153,0.15)' : h.status === '系统' ? 'rgba(99,102,241,0.15)' : 'rgba(245,158,11,0.15)', color: h.status === '自动' ? '#34d399' : h.status === '系统' ? '#818cf8' : '#fbbf24', fontSize: '0.68rem', fontWeight: 600 }}>{h.status}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {btn('立即封禁', '#ef4444')}
                {btn('暂停账户', '#f97316')}
                {btn('标记误报', '#6b7280')}
                {btn('生成报告', '#3b82f6')}
              </div>
            </>
          )
        })()}
      </div>
    </>
  )
}

const tabs = ['实时反欺诈看板', 'KOL粉丝检测', '归因反作弊'] as const

const kolData = [
  { id: 'KOL-抖音-周美妆', platform: '抖音', followers: '128万', fakeRate: '12.3%', fakeCount: '15.7万', engagementRate: '3.2%', verdict: '风险较高', score: 42 },
  { id: 'KOL-小红书-晴天美肌', platform: '小红书', followers: '56万', fakeRate: '6.8%', fakeCount: '3.8万', engagementRate: '5.1%', verdict: '轻微风险', score: 74 },
  { id: 'KOL-快手-美妆姐姐', platform: '快手', followers: '89万', fakeRate: '4.1%', fakeCount: '3.6万', engagementRate: '6.8%', verdict: '真实达人', score: 91 },
  { id: 'KOL-抖音-颜究所', platform: '抖音', followers: '32万', fakeRate: '18.5%', fakeCount: '5.9万', engagementRate: '1.8%', verdict: '高风险', score: 28 },
  { id: 'KOL-小红书-护肤实验室', platform: '小红书', followers: '21万', fakeRate: '3.2%', fakeCount: '0.7万', engagementRate: '7.4%', verdict: '真实达人', score: 94 },
]

export default function AntiFraudCenter() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)
  const [fraudDrill, setFraudDrill] = useState<FraudDrillTarget | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)

  // ── Anti-fraud AI config groups ──
  const antiFraudConfigGroups: AIConfigGroup[] = [
    {
      title: 'GNN欺诈检测模型',
      icon: <Brain size={15} />,
      params: [
        createParam('gnn_confidence', '欺诈检测置信度阈值', 85, '%', 'GNN模型判定点击/安装/交易欺诈的最低置信度, 低于阈值进入人工复核', 88, 93, { min: 70, max: 99, step: 1, autoTuneEnabled: false, learningDataPoints: 89200, adjustHistory: [
          { time: '1小时前', from: '80', to: '85', reason: '误拦截合法高价值用户消费, 手动上调置信度减少误判' },
          { time: '3天前', from: '88', to: '80', reason: '检测到新型虚假流量攻击, 临时降低阈值扩大拦截范围' },
          { time: '1周前', from: '85', to: '88', reason: '模型Precision提升至96%, 上调阈值减少人工复核量' },
        ] }),
        createParam('gnn_depth', '图网络传播深度', 3, '层', '图神经网络消息传播层数, 越深可发现更远关联但计算成本越高', 4, 86, { min: 1, max: 6, step: 1, learningDataPoints: 45600, adjustHistory: [
          { time: '2天前', from: '2', to: '3', reason: 'AI检测到跨3层设备关联的欺诈网络, 增加传播深度' },
          { time: '1周前', from: '4', to: '2', reason: '推理延迟超过200ms, AI减少层数优化性能' },
        ] }),
        createParam('gnn_embedding', '节点嵌入维度', 128, 'dim', '设备/用户/IP节点的特征嵌入维度, 影响欺诈模式表征能力', 256, 81, { min: 32, max: 512, step: 32, autoTuneEnabled: false, learningDataPoints: 23400, adjustHistory: [
          { time: '2周前', from: '64', to: '128', reason: '新增消费行为特征后维度不足, 手动扩展嵌入维度' },
        ] }),
        createParam('gnn_time_window', '异常行为时间窗口', 24, '小时', '回溯分析用户行为的时间窗口, 用于检测跨天欺诈模式', 48, 84, { min: 1, max: 72, step: 1, learningDataPoints: 38700, adjustHistory: [
          { time: '昨日', from: '12', to: '24', reason: 'AI发现跨天分散交易欺诈模式, 扩大时间窗口' },
          { time: '4天前', from: '48', to: '12', reason: '计算资源告警, AI临时缩小窗口降低负载' },
        ] }),
        createParam('gnn_update_freq', '模型更新频率', 6, '小时', 'GNN模型增量训练间隔, 频率越高适应新欺诈手法越快', 4, 88, { min: 1, max: 24, step: 1, learningDataPoints: 52100, adjustHistory: [
          { time: '3小时前', from: '4', to: '6', reason: '训练资源与推理服务争抢GPU, AI拉长训练间隔' },
          { time: '2天前', from: '12', to: '4', reason: '新型Bot攻击频繁, AI加快模型更新节奏' },
        ] }),
      ],
    },
    {
      title: 'Bot检测',
      icon: <Shield size={15} />,
      params: [
        createParam('bot_click_freq', '点击频率异常阈值', 50, '次/分钟', '单设备每分钟点击数超过此值判定为Bot虚假点击, 自动拦截', 40, 92, { min: 10, max: 200, step: 5, learningDataPoints: 72800, adjustHistory: [
          { time: '30分钟前', from: '40', to: '50', reason: '新上线的互动广告正常点击频率较高, AI上调阈值避免误拦' },
          { time: '昨日', from: '60', to: '40', reason: '检测到低频Bot模拟人类行为, AI降低阈值' },
          { time: '3天前', from: '50', to: '60', reason: '美妆直播互动点击被误判, AI放宽阈值' },
        ] }),
        createParam('bot_fingerprint', '设备指纹相似度阈值', 0.85, '分', '设备指纹(Canvas/WebGL/字体)相似度超过此值判定为同设备多账号', 0.9, 89, { min: 0.5, max: 0.99, step: 0.01, learningDataPoints: 56300, adjustHistory: [
          { time: '昨日', from: '0.9', to: '0.85', reason: 'AI发现新型指纹伪装工具, 降低阈值增强检测' },
          { time: '5天前', from: '0.8', to: '0.9', reason: '同型号手机指纹过于相似导致误判, AI上调阈值' },
        ] }),
        createParam('bot_ip_concentration', 'IP集中度预警阈值', 100, '次/IP/时', '单IP每小时请求超过此值触发机房IP/代理IP预警', 80, 90, { min: 20, max: 500, step: 10, learningDataPoints: 63400, adjustHistory: [
          { time: '2小时前', from: '80', to: '100', reason: '运营商NAT导致合法用户共享IP, AI上调阈值' },
          { time: '3天前', from: '150', to: '80', reason: '检测到代理池攻击, AI收紧IP集中度阈值' },
        ] }),
        createParam('bot_pattern_window', '行为模式检测窗口', 10, '分钟', '分析用户点击/浏览行为模式的时间窗口, 检测规律性Bot行为', 15, 83, { min: 3, max: 60, step: 1, learningDataPoints: 34500, adjustHistory: [
          { time: '昨日', from: '5', to: '10', reason: 'AI发现新型慢速Bot, 5分钟窗口无法检出, 扩大窗口' },
          { time: '4天前', from: '15', to: '5', reason: '检测延迟影响实时拦截, AI缩短窗口' },
        ] }),
      ],
    },
    {
      title: '平台欺诈率控制',
      icon: <BarChart3 size={15} />,
      params: [
        createParam('fraud_douyin', '抖音巨量欺诈率上限', 5, '%', '抖音巨量引擎广告欺诈点击/安装占比红线, 超过触发渠道审查', 3, 91, { min: 1, max: 15, step: 1, autoTuneEnabled: false, learningDataPoints: 58400, adjustHistory: [
          { time: '昨日', from: '3', to: '5', reason: '抖音信息流欺诈率攀升, 临时放宽上限同时加强监控' },
          { time: '1周前', from: '5', to: '3', reason: '抖音渠道欺诈率降至2.1%, 手动收紧红线' },
        ] }),
        createParam('fraud_xiaohongshu', '小红书欺诈率上限', 3, '%', '小红书聚光广告欺诈率红线, 小红书渠道整体质量较高', 2, 93, { min: 1, max: 10, step: 1, autoTuneEnabled: false, learningDataPoints: 62100, adjustHistory: [
          { time: '3天前', from: '2', to: '3', reason: '小红书信息流欺诈率波动, 手动微调上限' },
        ] }),
        createParam('fraud_kuaishou', '快手磁力欺诈率上限', 8, '%', '快手磁力引擎广告欺诈率红线, 快手渠道欺诈风险相对较高', 5, 87, { min: 2, max: 20, step: 1, learningDataPoints: 41200, adjustHistory: [
          { time: '2天前', from: '10', to: '8', reason: '快手反欺诈SDK升级后欺诈率下降, AI收紧红线' },
          { time: '1周前', from: '5', to: '10', reason: '快手下沉市场欺诈率偏高, AI临时放宽' },
        ] }),
        createParam('fraud_affiliate', '联盟渠道欺诈率上限', 15, '%', '第三方联盟渠道欺诈率红线, 联盟渠道欺诈风险最高', 10, 85, { min: 5, max: 30, step: 1, learningDataPoints: 28900, adjustHistory: [
          { time: '昨日', from: '20', to: '15', reason: '清退3家高欺诈联盟后整体欺诈率下降, AI收紧红线' },
          { time: '5天前', from: '10', to: '20', reason: '联盟渠道扩量期, 临时放宽容忍度' },
          { time: '2周前', from: '15', to: '10', reason: '联盟渠道欺诈率连续3日低于8%, 手动收紧' },
        ] }),
      ],
    },
    {
      title: '高价值用户验证',
      icon: <UserCheck size={15} />,
      params: [
        createParam('whale_deposit', '大额下单验证阈值', 3000, '¥', '单笔订单超过此金额触发身份验证(实名认证), 防止盗刷和恶意刷单', 2000, 88, { min: 500, max: 20000, step: 500, autoTuneEnabled: false, learningDataPoints: 19800, adjustHistory: [
          { time: '3天前', from: '2000', to: '3000', reason: '过度验证影响高价值用户体验, 手动上调阈值' },
          { time: '2周前', from: '3000', to: '2000', reason: '发现¥2500盗刷案例, 手动降低验证阈值' },
        ] }),
        createParam('whale_verify', '身份验证严格度', '标准', '', '高价值用户KYC验证级别: 宽松(短信), 标准(身份证), 严格(视频), AI动态按风险调整', 'AI动态', 90, { type: 'select', options: ['宽松', '标准', '严格', 'AI动态'], learningDataPoints: 25600, adjustHistory: [
          { time: '昨日', from: '严格', to: '标准', reason: '严格验证导致高价值用户流失率上升8%, AI降低验证强度' },
          { time: '5天前', from: '标准', to: '严格', reason: '检测到大额盗刷事件, AI临时提升验证级别' },
        ] }),
        createParam('whale_pattern', '异常交易模式检测', '仅告警', '', '检测异常交易模式(快速连续交易/异常时段/异地IP), 自动拦截或告警', 'AI全自动', 86, { type: 'select', options: ['关闭', '仅告警', '自动拦截', 'AI全自动'], learningDataPoints: 31200, adjustHistory: [
          { time: '2天前', from: '自动拦截', to: '仅告警', reason: '自动拦截误伤正常高价值用户, AI降级为告警模式' },
          { time: '1周前', from: '仅告警', to: '自动拦截', reason: '恶意刷单事件造成¥35000损失, AI升级为自动拦截' },
        ] }),
        createParam('whale_credit', '信用评分最低要求', 60, '分', '用户信用评分(基于历史消费/行为/设备)低于此值禁止大额消费', 65, 82, { min: 30, max: 90, step: 5, learningDataPoints: 16700, adjustHistory: [
          { time: '4天前', from: '50', to: '60', reason: 'AI分析发现50-60分段用户欺诈率偏高, 上调最低要求' },
          { time: '2周前', from: '70', to: '50', reason: '新用户无信用记录被过度限制, AI降低阈值' },
        ] }),
      ],
    },
  ]

  const antiFraudLearningStatus: AILearningStatus = {
    modelVersion: 'v4.1.0-antifraud',
    lastTraining: '20分钟前',
    totalDataPoints: 890000,
    avgConfidence: 89,
    autoAdjustCount24h: 534,
    learningRate: '0.0002 (AdamW)',
    nextTraining: '40分钟后',
    improvementRate: '+23.4%',
  }

  useRegisterAIConfig(antiFraudConfigGroups, antiFraudLearningStatus, '反欺诈中心')

  return (
    <>
      {fraudDrill && <FraudDrillPanel target={fraudDrill} onClose={() => setFraudDrill(null)} />}
      <div className="page-header">
        <h2><Shield size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />反欺诈情报中心</h2>
        <p>AI自动检测并拦截欺诈流量 · 虚假安装 · 机器人点击 · 全平台实时防护</p>
      </div>
      <div className="page-content">
        {/* ── AI模型支撑 ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.15)' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
          <ModelBadge name="FraudDetector-XGB" color="#f59e0b" />
          <ModelBadge name="FanFraud-GNN" color="#f59e0b" />
          <ModelBadge name="AnomalyDetector-LSTM" color="#f59e0b" />
          <ModelBadge name="ComplianceNLP" color="#f59e0b" />
          <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
        </div>

        {/* ── AI决策中心 · 反欺诈决策联动 ── */}
        {(() => {
          const fraudDecisions = [
            { eventId: 'FR-2841', eventTitle: '刷单团伙识别，虚假转化率18.6%', trigger: 'FraudDetector-XGB', decision: '暂停受污染计划 + 退还无效消耗', status: '已完成', impact: '止损¥12,400', time: '11:52' },
            { eventId: 'FR-2839', eventTitle: '虚假互动账号集群(1,247个)', trigger: 'FanFraud-GNN', decision: '封禁账号 + 预算重分配保护', status: '执行中', impact: '减少预算损耗¥6,800', time: '11:35' },
            { eventId: 'FR-2835', eventTitle: '异常消耗曲线，凌晨2点爆量', trigger: 'AnomalyDetector-LSTM', decision: '触发DC-001 出价策略调整', status: '已完成', impact: '异常消耗归零', time: '11:18' },
            { eventId: 'FR-2830', eventTitle: '竞品恶意点击消耗检测', trigger: 'CTR-Predictor-DeepFM', decision: '设置IP黑名单 + 反点击保护', status: '待确认', impact: '预防损耗¥4,200', time: '10:55' },
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
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>AI决策中心 · 反欺诈决策联动</span>
                  <span style={{ fontSize: '0.62rem', padding: '1px 8px', borderRadius: 8, background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}>实时风控闭环</span>
                </div>
                <button onClick={() => navigate('/ai-decisions')} style={{ fontSize: '0.68rem', color: '#6366f1', background: 'transparent', border: 'none', cursor: 'pointer' }}>查看全部决策 →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {fraudDecisions.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace', width: 34, flexShrink: 0 }}>{d.time}</span>
                    <span style={{ fontSize: '0.62rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: '#fbbf24', flexShrink: 0 }}>{d.eventId}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', flexShrink: 0, maxWidth: 160 }}>{d.eventTitle}</span>
                    <ModelBadge name={d.trigger} color="#f59e0b" />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: '0.72rem', flex: 1, fontWeight: 500 }}>{d.decision}</span>
                    <span style={{ fontSize: '0.62rem', color: '#34d399', flexShrink: 0 }}>{d.impact}</span>
                    <span style={{ fontSize: '0.6rem', padding: '1px 7px', borderRadius: 5, flexShrink: 0, ...(statusStyle[d.status] || {}) }}>{d.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)} style={{
              padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer',
              background: activeTab === i ? '#3b82f6' : 'var(--surface)',
              color: activeTab === i ? '#fff' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>{tab}</button>
          ))}
        </div>

        {/* Tab 1: Real-time Dashboard */}
        {activeTab === 0 && <>
          {/* AI Status Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
            borderRadius: 12, padding: '16px 24px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: '1px solid #1e40af40',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', background: '#34d399',
                boxShadow: '0 0 8px #34d39980', animation: 'pulse 2s infinite',
              }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI反欺诈引擎运行中</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                模型版本 v4.2.1 · 规则库 42,891条 · 最近更新 12分钟前
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>今日扫描: <span style={{ color: '#60a5fa', fontWeight: 600 }}>3.2M</span> 次请求</span>
              <span>平均延迟: <span style={{ color: '#34d399', fontWeight: 600 }}>8ms</span></span>
            </div>
          </div>

          <div className="grid-4" style={{ marginBottom: 20 }}>
            {[
              { icon: <Shield size={14} />, label: '今日拦截', value: '1,247次', color: '#ef4444', sub: '较昨日 +12%' },
              { icon: <Target size={14} />, label: '拦截率', value: '4.2%', color: '#f59e0b', sub: '正常范围 3-6%' },
              { icon: <Lock size={14} />, label: '节省金额', value: '¥351,200', color: '#34d399', sub: '本月累计 ¥803万' },
              { icon: <Activity size={14} />, label: '误判率', value: '0.3%', color: '#ff7a95', sub: '行业标准 <1%' },
            ].map(c => (
              <div key={c.label} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({ type: 'kpi', data: c })}>
                <div className="card-title">{c.icon} {c.label}</div>
                <div className="card-value" style={{ color: c.color }}>{c.value}</div>
                <div className="card-change">{c.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
                <Bot size={14} style={{ verticalAlign: 'middle' }} /> 欺诈类型分布
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={fraudTypeData} cx="50%" cy="50%" outerRadius={75} dataKey="value">
                    {fraudTypeData.map(e => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 }}>
                {fraudTypeData.map(d => (
                  <span key={d.name} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: d.color, marginRight: 4 }} />
                    {d.name} {d.value}%
                  </span>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
                <Eye size={14} style={{ verticalAlign: 'middle' }} /> 各平台欺诈状态
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {platformFraud.map(p => (
                  <div key={p.name} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedDetail({ type: 'platformFraud', data: p })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: p.color }}>{p.name}</span>
                      <span style={{
                        fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4,
                        background: p.status === '良好' ? '#065f4620' : p.status === '正常' ? '#1e3a5f40' : p.status === '警告' ? '#7c2d1240' : '#78350f30',
                        color: p.status === '良好' ? '#34d399' : p.status === '正常' ? '#60a5fa' : p.status === '警告' ? '#ef4444' : '#fbbf24',
                      }}>{p.status}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>欺诈率 {p.fraudRate}% · 拦截 {p.blocked}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
              <AlertTriangle size={14} style={{ verticalAlign: 'middle' }} /> 最近欺诈检测事件
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentEvents.map((e, i) => (
                <div key={i} onClick={() => setFraudDrill({ kind: 'event', data: e })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.15s' }} onMouseEnter={ev => (ev.currentTarget.style.borderColor = '#ef444460')} onMouseLeave={ev => (ev.currentTarget.style.borderColor = '')}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: 40 }}>{e.time}</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: '#7c2d1240', color: '#fca5a5', minWidth: 70, textAlign: 'center' }}>{e.type}</span>
                  <span style={{ fontSize: '0.72rem', color: '#60a5fa', minWidth: 56 }}>{e.platform}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flex: 1 }}>{e.detail}</span>
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4, background: '#065f4620', color: '#34d399' }}>{e.action}</span>
                </div>
              ))}
            </div>
          </div>
        </>}

        {/* Tab 2: KOL粉丝检测 */}
        {activeTab === 1 && <>
          <div className="grid-4" style={{ marginBottom: 20 }}>
            {[
              { icon: <Users size={14} />, label: '检测达人数', value: '156位', color: '#6366f1', sub: '本月累计' },
              { icon: <Eye size={14} />, label: '检测粉丝量', value: '4,820万', color: '#3b82f6', sub: '涵盖抖音/小红书/快手' },
              { icon: <AlertTriangle size={14} />, label: '虚假粉丝率', value: '9.4%', color: '#ef4444', sub: '行业均值 12%' },
              { icon: <Shield size={14} />, label: '拦截合作数', value: '18位', color: '#f59e0b', sub: '风险过高已暂停' },
            ].map(c => (
              <div key={c.label} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({ type: 'slotsKpi', data: c })}>
                <div className="card-title">{c.icon} {c.label}</div>
                <div className="card-value" style={{ color: c.color }}>{c.value}</div>
                <div className="card-change">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
              <Bot size={14} style={{ verticalAlign: 'middle' }} /> KOL达人粉丝真实性检测 · AI分析
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {kolData.map(k => (
                <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.15s' }} onMouseEnter={ev => (ev.currentTarget.style.borderColor = '#ef444460')} onMouseLeave={ev => (ev.currentTarget.style.borderColor = '')}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: 140 }}>{k.id}</span>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: k.platform === '抖音' ? '#4f7df920' : k.platform === '小红书' ? '#ff2d5520' : '#34a85320', color: k.platform === '抖音' ? '#4f7df9' : k.platform === '小红书' ? '#ff2d55' : '#34a853', minWidth: 56, textAlign: 'center' }}>{k.platform}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 60 }}>粉丝 {k.followers}</span>
                  <span style={{ fontSize: '0.78rem', color: k.fakeRate > '10%' ? '#ef4444' : '#fbbf24', minWidth: 72 }}>虚假率 {k.fakeRate}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flex: 1 }}>互动率 {k.engagementRate} · 虚假粉丝 {k.fakeCount}</span>
                  <div style={{ minWidth: 60, textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: k.score <= 40 ? '#ef4444' : k.score <= 70 ? '#f59e0b' : '#34d399' }}>{k.score}分</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{k.verdict}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
              <Shield size={14} style={{ verticalAlign: 'middle' }} /> 高价值真实达人 · 推荐合作名单
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {kolData.filter(k => k.score >= 80).map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 14px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedDetail({ type: 'whale', data: w })}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: 140 }}>{w.id}</span>
                  <span style={{ fontSize: '0.78rem', color: '#34d399', minWidth: 60 }}>粉丝 {w.followers}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>互动率 {w.engagementRate}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>虚假率 {w.fakeRate}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{
                    fontSize: '0.7rem', padding: '3px 10px', borderRadius: 4,
                    background: w.verdict === '真实达人' ? '#065f4620' : '#78350f30',
                    color: w.verdict === '真实达人' ? '#34d399' : '#fbbf24',
                  }}>{w.verdict}</span>
                  <div style={{ minWidth: 50, textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: w.score >= 80 ? '#34d399' : '#fbbf24' }}>{w.score}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>可信分</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex', gap: 16, marginTop: 12, padding: '10px 14px',
              background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)',
              fontSize: '0.72rem', color: 'var(--text-muted)',
            }}>
              <span>推荐合作达人: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>2位</span></span>
              <span>真实可信: <span style={{ color: '#34d399', fontWeight: 600 }}>2位</span></span>
              <span>待核查: <span style={{ color: '#fbbf24', fontWeight: 600 }}>0位</span></span>
              <span>高风险已拦截: <span style={{ color: '#ef4444', fontWeight: 600 }}>0位</span></span>
            </div>
          </div>
        </>}

        {/* Tab 3: Attribution Anti-Cheat */}
        {activeTab === 2 && <>
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
              <Activity size={14} style={{ verticalAlign: 'middle' }} /> MMP数据对比 · 平台报告 vs AppsFlyer/Adjust归因
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mmpComparison} barGap={4}>
                <XAxis dataKey="platform" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="reported" name="平台报告" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mmp" name="MMP归因" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {mmpComparison.map(m => (
                <div key={m.platform} style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedDetail({ type: 'mmp', data: m })}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.platform} 差异率</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: m.diff > 20 ? '#ef4444' : m.diff > 10 ? '#fbbf24' : '#34d399' }}>{m.diff}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
              <Lock size={14} style={{ verticalAlign: 'middle' }} /> SKAN信号验证
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'SKAN回传接收', value: '4,892', sub: '过去24小时' },
                { label: '验证通过率', value: '91.3%', sub: '正常阈值 >85%' },
                { label: '无效签名', value: '423', sub: '已标记排除' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 8, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
              <AlertTriangle size={14} style={{ verticalAlign: 'middle', color: '#ef4444' }} /> 异常渠道标记 · 高安装低留存
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {abnormalChannels.map(ch => (
                <div key={ch.name} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '12px 14px', background: 'var(--bg)', borderRadius: 8,
                  border: '1px solid var(--border)', cursor: 'pointer',
                }} onClick={() => setSelectedDetail({ type: 'abnormalChannel', data: ch })}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', minWidth: 100 }}>{ch.name}</span>
                  <div style={{ display: 'flex', gap: 16, flex: 1, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      安装 <span style={{ color: '#60a5fa', fontWeight: 600 }}>{ch.installs}</span>
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>D1留存 {ch.day1Retention}</span>
                    <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>D7留存 {ch.day7Retention}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>均时长 {ch.avgSession}</span>
                  </div>
                  <span style={{
                    fontSize: '0.65rem', padding: '2px 10px', borderRadius: 4,
                    background: ch.flag === '极度异常' ? '#7c2d1240' : '#78350f30',
                    color: ch.flag === '极度异常' ? '#ef4444' : '#fbbf24',
                    fontWeight: 600,
                  }}>{ch.flag}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: '#7c2d1215', border: '1px solid #7c2d1230',
              fontSize: '0.72rem', color: '#fca5a5',
            }}>
              <AlertTriangle size={12} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              建议: 以上渠道安装量高但留存极低，疑似存在虚假安装。建议暂停投放并联系渠道方核实流量来源。
            </div>
          </div>
        </>}

      </div>

      {selectedDetail && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(46,16,101,0.18)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
          paddingTop: 80,
        }} onClick={() => setSelectedDetail(null)}>
          <div style={{
            width: 720, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
            background: 'var(--bg-primary)', borderRadius: 16,
            border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(46,16,101,0.15)',
            padding: 24,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>详情</h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'kpi' && (() => {
              const d = selectedDetail.data as { label: string; value: string; color: string; sub: string }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: d.color, marginBottom: 8 }}>{d.label}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: d.color }}>{d.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{d.sub}</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>证据链</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    {d.label === '今日拦截' && '拦截分布: 机器人点击 38% · 虚假安装 25% · 点击注入 18% · 设备农场 12% · 其他 7%。主要拦截来源: 小红书 (289次) · 联盟渠道 (178次) · 抖音巨量 (312次)'}
                    {d.label === '拦截率' && '拦截率24h趋势: 00:00-06:00 2.1% · 06:00-12:00 3.8% · 12:00-18:00 5.1% · 18:00-24:00 4.9%。当前处于正常范围(3-6%)，无需干预'}
                    {d.label === '节省金额' && '节省明细: 机器人点击拦截节省 ¥142,000 · 虚假安装拦截节省 ¥124,000 · 点击注入拦截节省 ¥48,900 · 设备农场拦截节省 ¥35,500'}
                    {d.label === '误判率' && '误判分析: 过去24h共复核 12 例误判，其中高价值用户被误拦 3 例(已自动修复)、新设备首次安装被误标 5 例、VPN用户被误判 4 例'}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>流量来源分析</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[{ name: '抖音巨量', pct: '32%' }, { name: '小红书', pct: '24%' }, { name: '快手磁力', pct: '18%' }, { name: '微信广告', pct: '14%' }, { name: '天猫品销宝', pct: '8%' }, { name: '联盟渠道', pct: '4%' }].map(s => (
                      <div key={s.name} style={{ padding: 8, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.pct}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>IP/设备分析</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    高风险IP段: 103.21.xxx.0/24 (广州机房) · 45.77.xxx.0/24 (深圳IDC) · 192.168.xxx.0/24 (代理池)。可疑设备指纹: 重复Canvas哈希 42组 · 模拟器环境 18台 · 重复IMEI 7组
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>推荐操作</div>
                  <div style={{ padding: 12, background: 'rgba(59,130,246,0.06)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.75rem', color: '#60a5fa', lineHeight: 1.8 }}>
                    1. 建议对广州机房IP段启用增强验证 · 2. 建议调整Bot检测阈值至40次/分钟 · 3. 建议对联盟渠道启动专项审查
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'platformFraud' && (() => {
              const d = selectedDetail.data as typeof platformFraud[0]
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: d.color }}>{d.name} 欺诈状态详情</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>欺诈率 {d.fraudRate}% · 已拦截 {d.blocked} 次 · 状态: {d.status}</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>规则条件</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {['Bot点击频率检测 > 50次/min', '设备指纹相似度 > 0.85', 'IP集中度 > 100次/IP/h', '点击到安装时间 < 2s', '安装后无事件触发(30min内)'].map(rule => (
                      <div key={rule} style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        {rule}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>匹配历史 (近7天)</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[{ day: '今日', matches: d.blocked }, { day: '昨日', matches: Math.round(d.blocked * 0.92) }, { day: '前日', matches: Math.round(d.blocked * 0.88) }, { day: '3天前', matches: Math.round(d.blocked * 1.05) }].map(h => (
                      <div key={h.day} style={{ padding: 8, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{h.day}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{h.matches}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>误报分析</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    误报率: {(d.fraudRate * 0.05).toFixed(2)}% · 近7��误报: {Math.round(d.blocked * 0.003)} 例 · 主要误报原因: VPN用户IP聚集({Math.round(d.blocked * 0.001)}例)、新设备首次安装({Math.round(d.blocked * 0.002)}例)
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'slotsKpi' && (() => {
              const d = selectedDetail.data as { label: string; value: string; color: string; sub: string }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: d.color, marginBottom: 8 }}>{d.label}</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: d.color }}>{d.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{d.sub}</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>证据链</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    {d.label === '检测达人数' && '本月共检测156位KOL达人，覆盖抖音 68位 · 小红书 52位 · 快手 36位。检测维度: 粉丝真实性/互动质量/账号历史/内容原创度'}
                    {d.label === '检测粉丝量' && '检测粉丝总量 4,820万，其中抖音 2,180万 · 小红书 1,540万 · 快手 1,100万。虚假粉丝识别模型精度 94.2%，误判率 1.8%'}
                    {d.label === '虚假粉丝率' && '当前平均虚假粉丝率 9.4%，优于行业均值 12%。高风险达人(>15%虚假率) 18位 · 中风险(10-15%) 32位 · 低风险(<10%) 106位'}
                    {d.label === '拦截合作数' && '本月拦截高风险KOL合作 18位，预计规避品牌风险损失约 ¥420万。主要风险类型: 虚假粉丝互动 12位 · 互动数据造假 4位 · 违规内容历史 2位'}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>推荐操作</div>
                  <div style={{ padding: 12, background: 'rgba(59,130,246,0.06)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.75rem', color: '#60a5fa', lineHeight: 1.8 }}>
                    1. 对虚假粉丝率 &gt;15% 的达人暂停合作谈判 · 2. 要求中风险达人提供第三方数据核验报告 · 3. 优先合作可信分 &gt;80 的真实达人
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'whale' && (() => {
              const d = selectedDetail.data as typeof kolData[0]
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{d.id} · KOL达人详情</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>平台: {d.platform} · 粉丝 {d.followers} · 虚假率 {d.fakeRate} · 可信分 {d.score}</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>粉丝质量分析</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[{ label: '粉丝总量', value: d.followers }, { label: '虚假粉丝数', value: d.fakeCount }, { label: '互动率', value: d.engagementRate }, { label: '判定结果', value: d.verdict }].map(item => (
                      <div key={item.label} style={{ padding: 10, background: 'var(--bg-card)', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.label}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>账号健康分析</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    平台: {d.platform} · 互动率 {d.engagementRate} (行业均值 4.5%) · 虚假粉丝率 {d.fakeRate} · 综合可信评分: {d.score}分 · 合作建议: {d.verdict === '真实达人' ? '推荐合作，品牌安全' : d.verdict === '轻微风险' ? '可合作，建议持续监测' : '暂缓合作，需深入核查'}
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'mmp' && (() => {
              const d = selectedDetail.data as typeof mmpComparison[0]
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{d.platform} · MMP数据对比</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>平台报告 {d.reported.toLocaleString()} · MMP归因 {d.mmp.toLocaleString()} · 差异率 {d.diff}%</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>差异分析</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    差异来源: 归因窗口差异 {Math.round((d.reported - d.mmp) * 0.4)} · 点击归因vs视图归因 {Math.round((d.reported - d.mmp) * 0.35)} · 欺诈流量过滤差异 {Math.round((d.reported - d.mmp) * 0.25)}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>推荐操作</div>
                  <div style={{ padding: 12, background: d.diff > 20 ? 'rgba(239,68,68,0.06)' : 'rgba(59,130,246,0.06)', borderRadius: 8, border: `1px solid ${d.diff > 20 ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`, fontSize: '0.75rem', color: d.diff > 20 ? '#ef4444' : '#60a5fa', lineHeight: 1.8 }}>
                    {d.diff > 20 ? `差异率���过20%，建议立即联系${d.platform}核实数据，暂停高差异子渠道` : `差异率在正常范围内，建议持续监控并定期与${d.platform}对账`}
                  </div>
                </div>
              )
            })()}

            {selectedDetail.type === 'abnormalChannel' && (() => {
              const d = selectedDetail.data as typeof abnormalChannels[0]
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700 }}>{d.name} · 异常渠道详情</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>安装 {d.installs} · D1留存 {d.day1Retention} · D7留存 {d.day7Retention} · 均时长 {d.avgSession}</div>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>规则条件匹配</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[`D1留存 ${d.day1Retention} < 正常阈值 25%`, `D7留存 ${d.day7Retention} < 正常阈值 10%`, `���均会话时长 ${d.avgSession} < 正常阈值 3min`, `安装量 ${d.installs} 但留存极低 → 判定: ${d.flag}`].map(rule => (
                      <div key={rule} style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {rule}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>匹配历史 (近7天)</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    该渠道连续7天留存率低于正常水平。安装来源IP集中在广州/深圳机房IP段，设备指纹重复率 72%，疑似设备农场流量。
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>误报���析</div>
                  <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, fontSize: '0.75rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                    误���可能性: 低 (5%)。正常新市场渠道D1留存通常 &gt; 20%，该渠道 {d.day1Retention} 远低于正常值。
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>推荐操作</div>
                  <div style={{ padding: 12, background: 'rgba(239,68,68,0.06)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.75rem', color: '#ef4444', lineHeight: 1.8 }}>
                    1. 立即暂停该渠道投放 · 2. 联系渠道方核实流量来源 · 3. 申请退款(涉及 {d.installs} 个安装)
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}

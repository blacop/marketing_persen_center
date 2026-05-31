import React, { useState } from 'react'
import {
  BarChart3, TrendingUp, Target, Users,
  Brain, Layers, ArrowUpRight, ArrowDownRight, X
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ComposedChart, Area, Line, PieChart, Pie, Cell
} from 'recharts'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import ModelBadge from '../components/ModelBadge'

/* ═══════════════════════════════════════════════════════════════
   美妆数据分析中心 —— 跨平台归因·GMV预测·种草效率·Cohort复购
   ═══════════════════════════════════════════════════════════════ */

const analyticsAIGroups: AIConfigGroup[] = [
  {
    title: '数据采集与清洗',
    icon: <Layers size={16} />,
    params: [
      createParam('sample_rate', '数据采样率', 95, '%', '原始数据的采样比例，影响分析精度与性能', 95, 93, { min: 1, max: 100, type: 'percentage', autoTuneEnabled: true, learningDataPoints: 48000, lastAdjusted: '2小时前', adjustHistory: [{ time: '3天前', from: '90', to: '92', reason: 'AI根据数据质量评估自动提升' }, { time: '昨日', from: '92', to: '95', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('outlier_threshold', '异常值检测阈值', 2.5, '标准差倍数', '超出此倍数标准差的数据点将被标记为异常', 2.5, 90, { min: 1, max: 5, step: 0.5, autoTuneEnabled: true, learningDataPoints: 52000, lastAdjusted: '4小时前', adjustHistory: [{ time: '5天前', from: '3.0', to: '2.5', reason: 'AI检测到异常值漏检率偏高，降低阈值' }] }),
      createParam('data_latency_tolerance', '数据延迟容忍', 30, '秒', '超过此时长的数据延迟将触发告警', 30, 88, { min: 1, max: 300, autoTuneEnabled: true, learningDataPoints: 35000, lastAdjusted: '1小时前', adjustHistory: [{ time: '2天前', from: '60', to: '45', reason: '数据源响应速度提升' }, { time: '昨日', from: '45', to: '30', reason: 'AI根据近7日数据自动优化' }] }),
    ],
  },
  {
    title: '归因模型',
    icon: <Brain size={16} />,
    params: [
      createParam('attribution_window', '归因窗口', 7, '天', '转化事件回溯的最大天数，美妆用户决策周期通常较短', 7, 92, { min: 1, max: 30, autoTuneEnabled: true, learningDataPoints: 62000, lastAdjusted: '6小时前', adjustHistory: [{ time: '4天前', from: '14', to: '10', reason: '美妆用户种草到下单周期缩短' }, { time: '昨日', from: '10', to: '7', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('mta_decay', '多触点归因衰减系数', 0.7, '', '多触点归因中时间衰减权重，越高越重视近期触点', 0.7, 89, { min: 0.1, max: 1.0, step: 0.05, autoTuneEnabled: true, learningDataPoints: 58000, lastAdjusted: '3小时前', adjustHistory: [{ time: '3天前', from: '0.6', to: '0.65', reason: 'AI发现近期种草触点贡献权重偏低' }, { time: '昨日', from: '0.65', to: '0.7', reason: 'AI根据近7日数据自动优化' }] }),
      createParam('dedup_precision', '跨渠道去重精度', 92, '%', '跨渠道归因去重的目标精度', 92, 91, { min: 0, max: 100, type: 'percentage', autoTuneEnabled: true, learningDataPoints: 45000, lastAdjusted: '5小时前', adjustHistory: [{ time: '5天前', from: '85', to: '88', reason: '去重算法升级' }, { time: '昨日', from: '88', to: '92', reason: 'AI根据近7日数据自动优化' }] }),
    ],
  },
]

const analyticsLearningStatus: AILearningStatus = {
  modelVersion: 'v3.2.0-beauty-analytics',
  lastTraining: '35分钟前',
  totalDataPoints: 520000,
  avgConfidence: 91,
  autoAdjustCount24h: 78,
  learningRate: '0.003',
  nextTraining: '25分钟后',
  improvementRate: '+9.1%',
}

const TABS = ['投放数据总览', '归因分析', 'GMV预测', '复购留存']

// ===== Tab1: 投放数据总览 =====
const overviewKPIs = [
  { label: '总投放消耗(本月)', value: '¥802万', change: '+12%', positive: true, icon: TrendingUp },
  { label: '总GMV', value: '¥2,156万', change: '+28%', positive: true, icon: Target },
  { label: '综合ROI', value: '2.69', change: '+0.32', positive: true, icon: TrendingUp },
  { label: 'CPA均值', value: '¥32.5', change: '-15%', positive: true, icon: Users },
]

const roiByPlatform = [
  { platform: '抖音', lip: 2.85, eye: 2.62, base: 2.48 },
  { platform: '小红书', lip: 2.72, eye: 2.88, base: 2.35 },
  { platform: '快手', lip: 2.58, eye: 2.42, base: 2.65 },
  { platform: '天猫', lip: 3.12, eye: 2.95, base: 2.88 },
  { platform: '京东', lip: 2.68, eye: 2.52, base: 2.72 },
]

const weeklyTrend = [
  { week: 'W1', spend: 1450000, gmv: 3626000, roi: 2.50, conversions: 28000 },
  { week: 'W2', spend: 1780000, gmv: 4672000, roi: 2.62, conversions: 35000 },
  { week: 'W3', spend: 2120000, gmv: 5723000, roi: 2.70, conversions: 43000 },
  { week: 'W4', spend: 2670000, gmv: 7383000, roi: 2.76, conversions: 56000 },
]

const productLineData = [
  { region: '唇釉丝绒', spend: '¥285万', gmv: '¥892万', roi: 3.13, grassIndex: '种草指数 92', growth: 35 },
  { region: '眼影盘星空', spend: '¥165万', gmv: '¥498万', roi: 3.02, grassIndex: '种草指数 88', growth: 28 },
  { region: '粉底液水光', spend: '¥148万', gmv: '¥378万', roi: 2.55, grassIndex: '种草指数 82', growth: 22 },
  { region: '卸妆水温和', spend: '¥95万', gmv: '¥238万', roi: 2.51, grassIndex: '种草指数 78', growth: 18 },
  { region: '睫毛膏纤长', spend: '¥62万', gmv: '¥162万', roi: 2.61, grassIndex: '种草指数 75', growth: 15 },
  { region: '高光修容盘', spend: '¥47万', gmv: '¥108万', roi: 2.30, grassIndex: '种草指数 70', growth: 12 },
]

// ===== Tab2: 归因分析 =====
const attributionModels = [
  { model: '末次点击', lip: 2.85, eye: 2.62, base: 2.48, note: '默认模型' },
  { model: '首次点击', lip: 2.72, eye: 2.52, base: 2.35, note: '新客获取视角' },
  { model: '线性归因', lip: 2.78, eye: 2.58, base: 2.42, note: '均匀分配' },
  { model: '时间衰减', lip: 2.82, eye: 2.60, base: 2.45, note: '推荐使用' },
  { model: 'AI智能归因', lip: 2.95, eye: 2.75, base: 2.62, note: 'Shapley值' },
]

const touchpointPath = [
  { path: '抖音种草 → 小红书搜索 → 天猫下单', pct: 28.5, avgDays: 3.2, conv: 12500 },
  { path: '小红书笔记 → 直接下单', pct: 22.1, avgDays: 0.5, conv: 9800 },
  { path: '搜索词种草 → 详情页 → 下单', pct: 15.8, avgDays: 1.8, conv: 7000 },
  { path: 'KOL推荐 → 抖音直播 → 下单', pct: 12.3, avgDays: 2.1, conv: 5500 },
  { path: '快手视频 → 抖音种草 → 下单', pct: 8.5, avgDays: 4.5, conv: 3800 },
]

const channelContribution = [
  { name: '抖音', value: 38 },
  { name: '小红书', value: 25 },
  { name: '天猫', value: 18 },
  { name: '快手', value: 10 },
  { name: 'KOL', value: 6 },
  { name: '自然搜索', value: 3 },
]
const PIE_COLORS = ['#e8365d', '#ff7a95', '#3b82f6', '#facc15', '#a855f7', '#6b7280']

// ===== Tab3: GMV预测 =====
const ltvPrediction = [
  { segment: '唇釉-成分党-女性25-30', d1: '¥0', d7: '¥156', d30: '¥385', d90: '¥820', d180: '¥1,450', predicted: '¥2,100', confidence: 92 },
  { segment: '眼影-颜值党-女性20-28', d1: '¥0', d7: '¥98', d30: '¥285', d90: '¥620', d180: '¥980', predicted: '¥1,400', confidence: 88 },
  { segment: '底妆-精致妈妈-女性28-38', d1: '¥120', d7: '¥380', d30: '¥960', d90: '¥2,200', d180: '¥3,500', predicted: '¥5,000', confidence: 85 },
  { segment: '唇釉-学生党-女性18-23', d1: '¥0', d7: '¥68', d30: '¥185', d90: '¥380', d180: '¥580', predicted: '¥800', confidence: 90 },
  { segment: '全品类-VIP-女性28-40', d1: '¥280', d7: '¥850', d30: '¥2,200', d90: '¥5,500', d180: '¥8,800', predicted: '¥12,000', confidence: 82 },
  { segment: '卸妆-敏感肌-女性22-35', d1: '¥0', d7: '¥125', d30: '¥320', d90: '¥680', d180: '¥1,050', predicted: '¥1,500', confidence: 87 },
]

const ltvTrend = [
  { month: '10月', lip: 850, eye: 620, base: 960 },
  { month: '11月', lip: 920, eye: 680, base: 1020 },
  { month: '12月', lip: 1050, eye: 780, base: 1150 },
  { month: '1月', lip: 980, eye: 720, base: 1080 },
  { month: '2月', lip: 1120, eye: 850, base: 1250 },
  { month: '3月', lip: 1350, eye: 980, base: 1420 },
]

// ===== Tab4: 复购留存 =====
const cohortData = [
  { cohort: '3月W1', d1: 42, d3: 28, d7: 18, d14: 12, d30: 8.5, d60: 5.2, d90: 3.8 },
  { cohort: '3月W2', d1: 45, d3: 30, d7: 20, d14: 13, d30: 9.2, d60: 5.8, d90: 4.1 },
  { cohort: '3月W3', d1: 43, d3: 29, d7: 19, d14: 12.5, d30: 8.8, d60: '-', d90: '-' },
  { cohort: '3月W4', d1: 46, d3: 31, d7: 21, d14: 14, d30: '-', d60: '-', d90: '-' },
  { cohort: '4月W1', d1: 48, d3: 33, d7: '-', d14: '-', d30: '-', d60: '-', d90: '-' },
]

const retentionByBiz = [
  { day: 'D1', lip: 45, eye: 42, base: 38 },
  { day: 'D7', lip: 30, eye: 28, base: 25 },
  { day: 'D14', lip: 20, eye: 18, base: 16 },
  { day: 'D30', lip: 13, eye: 12, base: 10 },
  { day: 'D60', lip: 8.5, eye: 7.8, base: 6.5 },
  { day: 'D90', lip: 5.2, eye: 4.5, base: 4.0 },
]

const tooltipStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  color: 'var(--text-primary)',
}

// ===== Drill-down panel types =====
type DrillTarget =
  | { kind: 'region'; data: typeof productLineData[0] }
  | { kind: 'attribution'; data: typeof attributionModels[0] }
  | { kind: 'touchpath'; data: typeof touchpointPath[0] }
  | { kind: 'ltv'; data: typeof ltvPrediction[0] }
  | { kind: 'cohort'; data: typeof cohortData[0] }

const roiByDayMock = [
  { day: '周一', roi: 2.62 }, { day: '周二', roi: 2.85 }, { day: '周三', roi: 2.58 },
  { day: '周四', roi: 2.90 }, { day: '周五', roi: 2.72 }, { day: '周六', roi: 3.12 }, { day: '周日', roi: 2.95 },
]

function DrillPanel({ target, onClose }: { target: DrillTarget; onClose: () => void }) {
  const panelStyle: React.CSSProperties = {
    position: 'fixed', top: 0, right: 0, width: 500, height: '100vh',
    background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
    zIndex: 900, overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
    padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16,
  }
  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 899,
  }
  const row = (label: string, value: React.ReactNode) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
  const actionBtn = (label: string, color = '#e8365d') => (
    <button key={label} style={{
      padding: '8px 14px', borderRadius: 8, border: `1px solid ${color}`,
      background: `${color}20`, color, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
    }}>{label}</button>
  )

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {target.kind === 'region' && `产品线详情：${target.data.region}`}
            {target.kind === 'attribution' && `归因模型：${target.data.model}`}
            {target.kind === 'touchpath' && '转化路径详情'}
            {target.kind === 'ltv' && `GMV详情：${target.data.segment}`}
            {target.kind === 'cohort' && `Cohort详情：${target.data.cohort}`}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>× 关闭</button>
        </div>

        {target.kind === 'region' && (() => {
          const d = target.data
          return (
            <>
              <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                {row('产品线', d.region)}
                {row('投放消耗', d.spend)}
                {row('GMV', d.gmv)}
                {row('ROI', <span style={{ color: d.roi >= 2.8 ? '#4ade80' : '#ff7a95' }}>{d.roi}</span>)}
                {row('种草效果', d.grassIndex)}
                {row('增长率', <span style={{ color: '#4ade80' }}>+{d.growth}%</span>)}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>ROI by Day</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={roiByDayMock}>
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} domain={[2.0, 3.5]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="roi" name="ROI" fill="#e8365d" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>平台 ROI 分布</div>
              {[
                { name: '抖音', roi: (d.roi * 1.05).toFixed(2) },
                { name: '小红书', roi: (d.roi * 1.02).toFixed(2) },
                { name: '快手', roi: (d.roi * 0.95).toFixed(2) },
                { name: '天猫', roi: (d.roi * 1.12).toFixed(2) },
              ].map(p => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
                  <span style={{ fontWeight: 700, color: '#ff7a95' }}>ROI {p.roi}</span>
                </div>
              ))}
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>素材类型 ROI</div>
              {[{ type: '试色视频', roi: (d.roi * 1.08).toFixed(2) }, { type: '妆容教程', roi: (d.roi * 0.92).toFixed(2) }, { type: '对比测评', roi: (d.roi * 1.04).toFixed(2) }].map(t => (
                <div key={t.type} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t.type}</span>
                  <span style={{ fontWeight: 700, color: '#4ade80' }}>ROI {t.roi}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {[actionBtn('查看报告'), actionBtn('导出数据', '#3b82f6'), actionBtn('优化建议', '#4ade80')]}
              </div>
            </>
          )
        })()}

        {target.kind === 'attribution' && (() => {
          const d = target.data
          return (
            <>
              <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                {row('模型', d.model)}
                {row('备注', d.note)}
                {row('唇妆 ROI', d.lip)}
                {row('眼妆 ROI', d.eye)}
                {row('底妆 ROI', d.base)}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>各渠道归因贡献</div>
              {['抖音', '小红书', '天猫', '快手', 'KOL'].map((ch, i) => {
                const pct = [38, 25, 18, 12, 7][i]
                return (
                  <div key={ch}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{ch}</span>
                      <span style={{ fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#e8365d', borderRadius: 4 }} />
                    </div>
                  </div>
                )
              })}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {[actionBtn('设为默认模型'), actionBtn('对比分析', '#3b82f6')]}
              </div>
            </>
          )
        })()}

        {target.kind === 'touchpath' && (() => {
          const d = target.data
          return (
            <>
              <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                {d.path}
              </div>
              {row('占比', <span style={{ color: '#ff7a95' }}>{d.pct}%</span>)}
              {row('平均转化天数', `${d.avgDays} 天`)}
              {row('转化量', d.conv.toLocaleString())}
              {row('预估ROI', '2.75')}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {[actionBtn('优化此路径'), actionBtn('查看用户明细', '#3b82f6')]}
              </div>
            </>
          )
        })()}

        {target.kind === 'ltv' && (() => {
          const d = target.data
          const ltvCurveData = [
            { day: 'D1', ltv: parseFloat(d.d1.replace('¥', '').replace(',', '') || '0') },
            { day: 'D7', ltv: parseFloat(d.d7.replace('¥', '').replace(',', '') || '0') },
            { day: 'D30', ltv: parseFloat(d.d30.replace('¥', '').replace(',', '') || '0') },
            { day: 'D90', ltv: parseFloat(d.d90.replace('¥', '').replace(',', '') || '0') },
            { day: 'D180', ltv: parseFloat(d.d180.replace('¥', '').replace(',', '') || '0') },
            { day: '终身', ltv: parseFloat(d.predicted.replace('¥', '').replace(',', '') || '0') },
          ]
          return (
            <>
              <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                {row('用户分群', d.segment)}
                {row('预测终身GMV', <span style={{ color: '#4ade80', fontWeight: 700 }}>{d.predicted}</span>)}
                {row('模型置信度', <span style={{ color: d.confidence >= 90 ? '#4ade80' : '#facc15' }}>{d.confidence}%</span>)}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>GMV 增长曲线</div>
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={ltvCurveData}>
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`¥${v}`, 'GMV']} />
                  <Area type="monotone" dataKey="ltv" name="GMV" fill="#e8365d40" stroke="#e8365d" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>各节点 GMV</div>
              {ltvCurveData.map(p => (
                <div key={p.day} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{p.day}</span>
                  <span style={{ fontWeight: 700, color: '#ff7a95' }}>¥{p.ltv}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {[actionBtn('查看同类分群'), actionBtn('设优化目标', '#3b82f6')]}
              </div>
            </>
          )
        })()}

        {target.kind === 'cohort' && (() => {
          const d = target.data
          const points = [
            { day: 'D1', ret: d.d1 }, { day: 'D3', ret: d.d3 }, { day: 'D7', ret: d.d7 },
            { day: 'D14', ret: d.d14 }, { day: 'D30', ret: d.d30 }, { day: 'D60', ret: d.d60 }, { day: 'D90', ret: d.d90 },
          ].filter(p => p.ret !== '-').map(p => ({ day: p.day, retention: p.ret as number }))
          return (
            <>
              <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                {row('Cohort', d.cohort)}
                {row('D1 留存', <span style={{ color: '#4ade80' }}>{d.d1}%</span>)}
                {row('D7 留存', <span style={{ color: '#facc15' }}>{d.d7}%</span>)}
                {row('D30 留存', typeof d.d30 === 'number' ? `${d.d30}%` : '-')}
                {row('D90 留存', typeof d.d90 === 'number' ? `${d.d90}%` : '-')}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>复购留存曲线</div>
              <ResponsiveContainer width="100%" height={160}>
                <ComposedChart data={points}>
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v}%`, '复购率']} />
                  <Line type="monotone" dataKey="retention" name="复购率" stroke="#4ade80" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {[actionBtn('下载Cohort报告'), actionBtn('AI复购洞察', '#3b82f6')]}
              </div>
            </>
          )
        })()}
      </div>
    </>
  )
}

export default function Analytics() {
  useRegisterAIConfig(analyticsAIGroups, analyticsLearningStatus, '数据分析')
  const [activeTab, setActiveTab] = useState(0)
  const [drillTarget, setDrillTarget] = useState<DrillTarget | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)

  return (
    <>
      {drillTarget && <DrillPanel target={drillTarget} onClose={() => setDrillTarget(null)} />}
      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={28} style={{ color: '#e8365d' }} />
          美妆数据分析中心
        </h2>
        <p>跨平台归因 · GMV预测 · 种草效率分析 · 复购留存 · AI洞察引擎</p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: '#e8365d', backgroundColor: 'rgba(232,54,93,0.08)',
          padding: '8px 16px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500,
          position: 'absolute', right: 24, top: 24,
        }}>
          <Brain size={16} />
          <span>AI分析引擎运行中</span>
        </div>
      </div>

      {/* Model Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: '8px 14px', background: 'rgba(232,54,93,0.06)', borderRadius: 10, border: '1px solid rgba(232,54,93,0.18)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>底层模型：</span>
        <ModelBadge name="CTR-Predictor-DeepFM" color="#e8365d" />
        <ModelBadge name="BudgetMO-Optimizer" color="#e8365d" />
        <ModelBadge name="MultiCurrency-ROAS" color="#e8365d" />
      </div>

      <div className="page-content">
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

        {/* Tab 1: 投放数据总览 */}
        {activeTab === 0 && (
          <>
            <div className="grid-4" style={{ marginBottom: 20 }}>
              {overviewKPIs.map(k => (
                <div className="card" key={k.label} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'overview_kpi', data: k})}>
                  <div className="card-title">
                    <k.icon size={14} style={{ verticalAlign: 'middle' }} /> {k.label}
                  </div>
                  <div className="card-value" style={{ color: '#e8365d' }}>{k.value}</div>
                  <div className="card-change positive">
                    {k.positive
                      ? <ArrowUpRight size={12} />
                      : <ArrowDownRight size={12} />}
                    {k.change}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="card-title">各平台ROI对比 (三大品类)</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={roiByPlatform}>
                    <XAxis dataKey="platform" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="lip" name="唇妆" fill="#e8365d" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="eye" name="眼妆" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="base" name="底妆" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <div className="card-title">周度消耗与ROI趋势</div>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={weeklyTrend}>
                    <XAxis dataKey="week" stroke="#6b7280" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} domain={[2.0, 3.2]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar yAxisId="left" dataKey="spend" name="消耗(¥)" fill="#ff7a95" radius={[2, 2, 0, 0]} />
                    <Bar yAxisId="left" dataKey="gmv" name="GMV(¥)" fill="#ffb3c6" radius={[2, 2, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="roi" name="ROI" stroke="#4ade80" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={16} style={{ color: '#e8365d' }} />产品线投放数据
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>产品线</th>
                    <th>消耗</th>
                    <th>GMV</th>
                    <th>ROI</th>
                    <th>种草效果</th>
                    <th>增长</th>
                  </tr>
                </thead>
                <tbody>
                  {productLineData.map(r => (
                    <tr key={r.region} onClick={() => setDrillTarget({ kind: 'region', data: r })} style={{ cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ fontWeight: 500 }}>{r.region}</td>
                      <td>{r.spend}</td>
                      <td style={{ color: '#4ade80' }}>{r.gmv}</td>
                      <td style={{ fontWeight: 700, color: r.roi >= 3.0 ? '#4ade80' : '#ff7a95' }}>{r.roi}</td>
                      <td>{r.grassIndex}</td>
                      <td style={{ color: '#4ade80' }}>+{r.growth}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab 2: 归因分析 */}
        {activeTab === 1 && (
          <>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={16} style={{ color: '#e8365d' }} />归因模型对比
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>模型</th>
                      <th>唇妆ROI</th>
                      <th>眼妆ROI</th>
                      <th>底妆ROI</th>
                      <th>备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributionModels.map(m => (
                      <tr key={m.model} onClick={() => setDrillTarget({ kind: 'attribution', data: m })} style={{ cursor: 'pointer', backgroundColor: m.model === 'AI智能归因' ? 'rgba(232,54,93,0.04)' : undefined }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = m.model === 'AI智能归因' ? 'rgba(232,54,93,0.04)' : '')}>
                        <td style={m.model === 'AI智能归因' ? { color: '#e8365d', fontWeight: 500 } : undefined}>{m.model}</td>
                        <td>{m.lip}</td>
                        <td>{m.eye}</td>
                        <td>{m.base}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{m.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <div className="card-title">渠道贡献分布 (AI归因)</div>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={channelContribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {channelContribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-title">消费者种草转化路径分析</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>转化路径</th>
                    <th>占比</th>
                    <th>平均天数</th>
                    <th>转化数</th>
                  </tr>
                </thead>
                <tbody>
                  {touchpointPath.map((p, i) => (
                    <tr key={i} onClick={() => setDrillTarget({ kind: 'touchpath', data: p })} style={{ cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.path}</td>
                      <td style={{ color: '#ff7a95', fontWeight: 700 }}>{p.pct}%</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.avgDays}天</td>
                      <td>{p.conv.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Tab 3: GMV预测 */}
        {activeTab === 2 && (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={16} style={{ color: '#e8365d' }} />AI GMV预测模型
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>用户分群</th>
                      <th>D1</th>
                      <th>D7</th>
                      <th>D30</th>
                      <th>D90</th>
                      <th>D180</th>
                      <th>预测终身</th>
                      <th>置信度</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ltvPrediction.map(l => (
                      <tr key={l.segment} onClick={() => setDrillTarget({ kind: 'ltv', data: l })} style={{ cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                        <td style={{ fontWeight: 500 }}>{l.segment}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{l.d1}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{l.d7}</td>
                        <td>{l.d30}</td>
                        <td>{l.d90}</td>
                        <td style={{ color: '#ff7a95' }}>{l.d180}</td>
                        <td style={{ color: '#4ade80', fontWeight: 700 }}>{l.predicted}</td>
                        <td style={{ color: l.confidence >= 90 ? '#4ade80' : '#facc15' }}>{l.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-title">GMV趋势 (6个月, D180)</div>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={ltvTrend}>
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="base" name="底妆GMV" fill="#f59e0b" fillOpacity={0.1} stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="eye" name="眼妆GMV" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="lip" name="唇妆GMV" stroke="#e8365d" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Tab 4: 复购留存 */}
        {activeTab === 3 && (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">复购留存矩阵 (周维度)</div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cohort</th>
                      <th>D1</th>
                      <th>D3</th>
                      <th>D7</th>
                      <th>D14</th>
                      <th>D30</th>
                      <th>D60</th>
                      <th>D90</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map(c => (
                      <tr key={c.cohort} onClick={() => setDrillTarget({ kind: 'cohort', data: c })} style={{ cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.05)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                        <td style={{ fontWeight: 500 }}>{c.cohort}</td>
                        {[c.d1, c.d3, c.d7, c.d14, c.d30, c.d60, c.d90].map((v, i) => (
                          <td key={i}>
                            {v === '-' ? <span style={{ color: 'var(--text-muted)' }}>-</span> : (
                              <span style={{
                                fontWeight: 500,
                                color: (v as number) >= 20 ? '#4ade80' : (v as number) >= 10 ? '#facc15' : 'var(--text-muted)',
                              }}>
                                {v}%
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">复购曲线对比 (三大品类)</div>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={retentionByBiz}>
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="lip" name="唇妆" stroke="#e8365d" strokeWidth={2} />
                  <Line type="monotone" dataKey="eye" name="眼妆" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="base" name="底妆" stroke="#f59e0b" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={16} style={{ color: '#e8365d' }} />AI复购洞察
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  '唇妆D1复购率45%显著高于其他品类，因上妆习惯天然高频；建议加强色号延伸推荐促进系列复购',
                  '底妆D7复购率38%，核心驱动是试色体验；建议EP3推出皮肤定制方案，D7→D14转化可提升3-5pp',
                  '眼妆D14复购率18%偏低，流失集中在初次试色后；建议优化前7天妆容教程和配套工具推荐',
                  '4月W1 Cohort D1复购率48%创新高，归因于AI素材优化+精准种草人群提升了用户购买质量',
                ].map((insight, i) => (
                  <div key={i} style={{
                    fontSize: '0.875rem', color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-primary)', borderRadius: 8,
                    padding: '8px 16px',
                  }}>
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedDetail && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(232,54,93,0.12)', backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
          paddingTop: 80,
        }} onClick={() => setSelectedDetail(null)}>
          <div style={{
            width: 720, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
            background: 'var(--bg-primary)', borderRadius: 16,
            border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(232,54,93,0.12)',
            padding: 24,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {selectedDetail.type === 'overview_kpi' && `KPI详情: ${selectedDetail.data.label}`}
                {selectedDetail.type === 'kpi_breakdown' && `分平台明细: ${selectedDetail.data.label}`}
              </h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'overview_kpi' && (() => {
              const k = selectedDetail.data
              return (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#e8365d' }}>{k.value}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{k.label}</div>
                    <div style={{ fontSize: '0.75rem', color: k.positive ? '#34d399' : '#ef4444', marginTop: 4 }}>{k.change}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>分平台明细</div>
                  <table className="data-table">
                    <thead><tr><th>平台</th><th>值</th><th>变化</th></tr></thead>
                    <tbody>
                      {['抖音', '小红书', '快手', '天猫', '京东'].map((p, i) => (
                        <tr key={p} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'kpi_breakdown', data: {label: k.label, platform: p}})}>
                          <td style={{ fontWeight: 500 }}>{p}</td>
                          <td style={{ color: '#e8365d', fontWeight: 600 }}>{k.value}</td>
                          <td style={{ color: '#34d399' }}>{['+15%', '+22%', '+8%', '+5%', '+18%'][i]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8, marginTop: 16 }}>趋势 (近7天)</div>
                  {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{day}</span>
                      <span style={{ fontWeight: 600, color: '#e8365d' }}>{k.value}</span>
                    </div>
                  ))}
                </>
              )
            })()}

            {selectedDetail.type === 'kpi_breakdown' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                {[
                  { label: '指标', value: selectedDetail.data.label },
                  { label: '平台', value: selectedDetail.data.platform },
                  { label: '日均值', value: '计算中...' },
                  { label: '周环比', value: '+12%' },
                  { label: '月环比', value: '+8%' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

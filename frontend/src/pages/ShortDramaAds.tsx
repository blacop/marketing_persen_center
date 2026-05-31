import { useState } from 'react'
import { Sparkles, TrendingUp, DollarSign, Eye, Play, Bot, Brain, Zap, AlertTriangle, CheckCircle, Clock, Scissors, ShoppingBag } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

// ── 快手美妆智能体状态 ──
const beautyAgents = [
  { name: '快手投放总监', avatar: '💄', status: 'executing', task: '玛丽黛佳唇釉素材轮换（4个素材达疲劳阈值）', confidence: 0.91, autonomy: 93, decisions: 1523 },
  { name: '快手素材轮换', avatar: '🎨', status: 'executing', task: '分析3秒停留率，预测完播率', confidence: 0.82, autonomy: 94, decisions: 1876 },
  { name: '快手出价优化', avatar: '💰', status: 'executing', task: 'CPM/CPC实时优化 · 快手流量波动应对', confidence: 0.85, autonomy: 88, decisions: 23450 },
  { name: '快手受众定向', avatar: '🎯', status: 'thinking', task: '美妆兴趣人群vs电商人群分层测试...', confidence: 0.79, autonomy: 85, decisions: 6780 },
  { name: '快手监控', avatar: '📡', status: 'idle', task: '', confidence: 0.90, autonomy: 87, decisions: 9230 },
]

// ── 美妆思考流 ──
const beautyThoughts = [
  { agent: '💄 快手投放总监', type: 'decision', content: '唇釉试色视频完播率2天内从28%降至14%，达到临界阈值12%。自主决定启动素材轮换（4/10个素材已疲劳）', confidence: 0.91, time: '3分钟前' },
  { agent: '🎨 素材轮换', type: 'analysis', content: '3秒停留率分析：真人试色型停留率42% > 教程型35% > 对比测评型30%。建议新素材优先使用真人试色型', confidence: 0.82, time: '8分钟前' },
  { agent: '💰 出价优化', type: 'action', content: '快手美妆赛道CPM上涨15%，自动下调CPC出价上限10%以维持ROI', confidence: 0.85, time: '15分钟前' },
  { agent: '🎯 受众定向', type: 'observation', content: '18-25岁女性进店率最高(7.8%)，25-35次之(5.2%)。下沉市场(三四线城市)CPC低35%但转化率接近', confidence: 0.79, time: '25分钟前' },
  { agent: '🎨 素材轮换', type: 'escalation', content: '"唇釉试色系列"全部10个素材变体已疲劳，备用素材耗尽。已转人工审核新拍摄方案', confidence: 0.56, time: '2小时前' },
]

// ── 自主决策日志 ──
const autoDecisions = [
  { time: '11:05', decision: '素材轮换', detail: '唇釉试色4个疲劳素材→4个备用素材激活', reason: '完播率<12%（临界阈值），疲劳周期5天到期', status: 'executed' },
  { time: '10:20', decision: '出价调整', detail: '快手CPC上限从¥0.35→¥0.32', reason: 'CPM上涨15%，维持ROI需降低出价', status: 'executed' },
  { time: '09:45', decision: '自动扩量', detail: '"眼影盘教程" 预算+30%', reason: '完播率35%（远超22%阈值），进店率12%', status: 'executed' },
  { time: '08:30', decision: '受众调整', detail: '增加三四线城市+美妆兴趣人群权重', reason: '下沉市场CPC低35%但转化率接近', status: 'executed' },
  { time: '昨日 20:15', decision: '转人工', detail: '"唇釉试色系列"备用素材耗尽', reason: '置信度0.56，AI生成美妆素材质量不确定需人工审核', status: 'escalated' },
]

const videos = [
  { name: '唇釉试色视频', category: '唇部', platform: '快手', dailySpend: 8500, impressions: 1850000, cpm: 18.5, cpc: 0.28, completionRate: 35, threeSecRate: 52, clickRate: 6.2, enterShopRate: 12.5, status: 'active', agentAction: '扩量中 +30%' },
  { name: '眼影盘教程', category: '眼部', platform: '快手', dailySpend: 7200, impressions: 1420000, cpm: 20.1, cpc: 0.32, completionRate: 32, threeSecRate: 48, clickRate: 5.5, enterShopRate: 10.8, status: 'active', agentAction: '素材轮换中' },
  { name: '粉底液测评', category: '底妆', platform: '快手', dailySpend: 6500, impressions: 1180000, cpm: 22.0, cpc: 0.35, completionRate: 28, threeSecRate: 45, clickRate: 4.8, enterShopRate: 9.2, status: 'active', agentAction: '稳定投放' },
  { name: '睫毛膏对比', category: '眼部', platform: '快手', dailySpend: 5000, impressions: 920000, cpm: 21.5, cpc: 0.33, completionRate: 26, threeSecRate: 42, clickRate: 4.2, enterShopRate: 8.5, status: 'active', agentAction: '观察中' },
  { name: '卸妆水实验', category: '护肤', platform: '快手', dailySpend: 4200, impressions: 780000, cpm: 23.8, cpc: 0.38, completionRate: 22, threeSecRate: 38, clickRate: 3.5, enterShopRate: 6.8, status: 'active', agentAction: '出价优化中' },
  { name: '高光修容教程', category: '底妆', platform: '快手', dailySpend: 0, impressions: 0, cpm: 32.0, cpc: 0.55, completionRate: 10, threeSecRate: 22, clickRate: 1.5, enterShopRate: 2.8, status: 'paused', agentAction: '已自动暂停' },
]

const categorySpend = [
  { category: '唇部', spend: 8500, impressions: 1850000 },
  { category: '眼部', spend: 12200, impressions: 2340000 },
  { category: '底妆', spend: 6500, impressions: 1180000 },
  { category: '护肤', spend: 4200, impressions: 780000 },
]

const contentPerformance = [
  { type: '真人试色', completionRate: 42, cpc: 0.25, convRate: 7.2, variants: 35, status: 'top' },
  { type: '教程讲解', completionRate: 35, cpc: 0.30, convRate: 5.8, variants: 28, status: 'top' },
  { type: '对比测评', completionRate: 32, cpc: 0.32, convRate: 5.2, variants: 22, status: 'active' },
  { type: '成分科普', completionRate: 25, cpc: 0.38, convRate: 3.5, variants: 18, status: 'active' },
  { type: '场景种草', completionRate: 28, cpc: 0.35, convRate: 4.0, variants: 15, status: 'active' },
  { type: '纯产品展示', completionRate: 14, cpc: 0.52, convRate: 1.6, variants: 8, status: 'paused' },
]

const funnelData = [
  { stage: '曝光', value: 6200000 },
  { stage: '3秒停留', value: 2790000 },
  { stage: '完播', value: 1178000 },
  { stage: '点击', value: 310000 },
  { stage: '进店', value: 62000 },
  { stage: '下单', value: 21700 },
]

const tooltipStyle = { backgroundColor: '#4a1025', border: '1px solid #9b1339', borderRadius: '8px', fontSize: '0.75rem', color: '#ffe0ea' }
const statusColors: Record<string, string> = { executing: '#22c55e', thinking: '#e8365d', idle: '#6b7280' }
const statusLabels: Record<string, string> = { executing: '执行中', thinking: '思考中', idle: '空闲' }
const typeColors: Record<string, string> = { action: '#22c55e', decision: '#f59e0b', analysis: '#e8365d', observation: '#f4587a', escalation: '#ef4444' }
const typeLabels: Record<string, string> = { action: '执行', decision: '决策', analysis: '分析', observation: '观察', escalation: '转人工' }

export default function ShortDramaAds() {
  const [tab, setTab] = useState<'overview' | 'agents' | 'content' | 'funnel'>('overview')
  const totalSpend = videos.filter(d => d.status === 'active').reduce((s, d) => s + d.dailySpend, 0)
  const totalImpressions = videos.filter(d => d.status === 'active').reduce((s, d) => s + d.impressions, 0)

  return (
    <>
      <div className="page-header">
        <h2>玛丽黛佳 · 快手磁力引擎投放智能体</h2>
        <p>短视频完播率驱动 · 3秒停留决定一切 · 素材疲劳期5天 · 5个专属智能体 · 自治度93%</p>
      </div>
      <div className="page-content">
        <div className="card" style={{ marginBottom: 20, padding: '14px 18px', background: 'rgba(232,54,93,0.08)', borderColor: 'rgba(232,54,93,0.2)' }}>
          <div style={{ fontSize: '0.8rem' }}>
            <strong style={{ color: '#e8365d' }}>AI自治策略</strong>：快手素材轮换智能体是<strong>最活跃</strong>的智能体——聚焦<strong>3秒停留率+完播率</strong>。完播率&gt;22%自动扩量；素材5天疲劳自动轮换；同时维持25+个素材变体在线。CPC&lt;¥0.35为健康区间。
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20, padding: '14px 18px', background: 'rgba(244,88,122,0.08)', borderColor: 'rgba(244,88,122,0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#f4587a' }}>美妆快手投放特点</strong>：
            ① KPI为<strong>CPM/CPC+完播率+3秒停留率</strong> ② 素材疲劳期<strong>5天</strong>（美妆视觉审美疲劳快） ③ 快手磁力引擎为主阵地 ④ 真人试色/教程内容转化最优 ⑤ 进店→下单漏斗 ⑥ 素材变体量大(25+)
          </div>
        </div>

        {/* KPI */}
        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="card-title"><DollarSign size={14} style={{ display: 'inline' }} /> 日投放额</div>
            <div className="card-value">¥{(totalSpend / 10000).toFixed(1)}万</div>
            <div className="card-change positive">{videos.filter(d => d.status === 'active').length} 条视频投放中</div>
          </div>
          <div className="card">
            <div className="card-title"><Eye size={14} style={{ display: 'inline' }} /> 日曝光量</div>
            <div className="card-value">{(totalImpressions / 10000).toFixed(0)}万</div>
            <div className="card-change positive">+22% vs 昨日</div>
          </div>
          <div className="card">
            <div className="card-title"><Play size={14} style={{ display: 'inline' }} /> 平均完播率</div>
            <div className="card-value" style={{ color: '#e8365d' }}>29%</div>
            <div className="card-change positive">3秒停留率 45%</div>
          </div>
          <div className="card">
            <div className="card-title"><Bot size={14} style={{ display: 'inline' }} /> 智能体自治度</div>
            <div className="card-value">93%</div>
            <div className="card-change positive">今日8次自主决策 · 1次转人工</div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>投放总览</button>
          <button className={`tab ${tab === 'agents' ? 'active' : ''}`} onClick={() => setTab('agents')}><Bot size={14} /> 智能体决策</button>
          <button className={`tab ${tab === 'content' ? 'active' : ''}`} onClick={() => setTab('content')}><Scissors size={14} /> 素材分析</button>
          <button className={`tab ${tab === 'funnel' ? 'active' : ''}`} onClick={() => setTab('funnel')}>转化漏斗</button>
        </div>

        {tab === 'overview' && (
          <>
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="section-title"><Sparkles size={16} /> 各品类投放消耗</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categorySpend}>
                    <XAxis dataKey="category" />
                    <YAxis tickFormatter={(v: number) => `¥${(v/1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `¥${v.toLocaleString()}`} />
                    <Bar dataKey="spend" fill="#e8365d" name="消耗" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="section-title"><Eye size={16} /> 各品类曝光量</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categorySpend}>
                    <XAxis dataKey="category" />
                    <YAxis tickFormatter={(v: number) => `${(v/10000).toFixed(0)}万`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${(v/10000).toFixed(0)}万`} />
                    <Bar dataKey="impressions" fill="#f4587a" name="曝光量" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="section-title">美妆短视频投放列表（智能体管理）</div>
              <table className="data-table">
                <thead>
                  <tr><th>视频</th><th>品类</th><th>平台</th><th>日消耗</th><th>曝光</th><th>CPM</th><th>CPC</th><th>3秒停留</th><th>完播率</th><th>进店率</th><th>智能体操作</th></tr>
                </thead>
                <tbody>
                  {videos.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</td>
                      <td><span className="cluster-tag" style={{ background: 'rgba(232,54,93,0.15)', color: '#e8365d' }}>{d.category}</span></td>
                      <td style={{ fontSize: '0.75rem' }}>{d.platform}</td>
                      <td>¥{d.dailySpend.toLocaleString()}</td>
                      <td>{d.impressions > 0 ? `${(d.impressions/10000).toFixed(0)}万` : '-'}</td>
                      <td style={{ color: d.cpm < 20 ? '#22c55e' : d.cpm < 25 ? '#f59e0b' : '#ef4444' }}>¥{d.cpm.toFixed(1)}</td>
                      <td style={{ color: d.cpc < 0.32 ? '#22c55e' : d.cpc < 0.40 ? '#f59e0b' : '#ef4444' }}>¥{d.cpc.toFixed(2)}</td>
                      <td style={{ color: d.threeSecRate > 40 ? '#22c55e' : d.threeSecRate > 30 ? '#f59e0b' : '#ef4444' }}>{d.threeSecRate}%</td>
                      <td style={{ fontWeight: 600, color: d.completionRate > 25 ? '#22c55e' : d.completionRate > 15 ? '#f59e0b' : '#ef4444' }}>{d.completionRate}%</td>
                      <td style={{ color: d.enterShopRate > 10 ? '#e8365d' : '#ff7a95' }}>{d.enterShopRate}%</td>
                      <td>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4, background: d.agentAction.includes('扩量') ? 'rgba(34,197,94,0.15)' : d.agentAction.includes('暂停') ? 'rgba(239,68,68,0.15)' : d.agentAction.includes('轮换') ? 'rgba(232,54,93,0.15)' : 'rgba(244,88,122,0.1)', color: d.agentAction.includes('扩量') ? '#22c55e' : d.agentAction.includes('暂停') ? '#ef4444' : d.agentAction.includes('轮换') ? '#e8365d' : '#f4587a' }}>
                          <Bot size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />{d.agentAction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'agents' && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title"><Bot size={16} /> 快手美妆智能体状态</div>
              {beautyAgents.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${statusColors[a.status]}` }}>
                  <span style={{ fontSize: '1.1rem' }}>{a.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{a.name} <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 4, background: `${statusColors[a.status]}20`, color: statusColors[a.status] }}>{statusLabels[a.status]}</span></div>
                    {a.task && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 2 }}>{a.task}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e8365d' }}>{a.autonomy}%</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>自治度</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <div className="section-title"><Brain size={14} /> 思考流</div>
                {beautyThoughts.map((t, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.agent}</span>
                      <span style={{ fontSize: '0.6rem', padding: '1px 4px', borderRadius: 3, background: `${typeColors[t.type]}20`, color: typeColors[t.type] }}>{typeLabels[t.type]}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{t.time}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.content}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="section-title"><Zap size={16} /> 自主决策日志</div>
              {autoDecisions.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flexShrink: 0, width: 60, fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {d.status === 'executed' ? <CheckCircle size={12} color="#22c55e" /> : <AlertTriangle size={12} color="#f59e0b" />}
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{d.decision}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{d.detail}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>原因：{d.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'content' && (
          <div className="card">
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(232,54,93,0.1)', borderRadius: 8, fontSize: '0.8rem' }}>
              <strong style={{ color: '#e8365d' }}>素材策略智能体</strong>：美妆短视频的前3秒停留率决定成败。素材智能体自动分析各内容类型的完播率与3秒停留率，优先使用高完播率内容类型生成新变体，5天疲劳自动淘汰。
            </div>
            <table className="data-table">
              <thead>
                <tr><th>内容类型</th><th>完播率</th><th>CPC</th><th>进店率</th><th>变体数</th><th>状态</th></tr>
              </thead>
              <tbody>
                {contentPerformance.map((h, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{h.type}</td>
                    <td style={{ fontWeight: 600, color: h.completionRate > 35 ? '#22c55e' : h.completionRate > 22 ? '#f59e0b' : '#ef4444' }}>{h.completionRate}%</td>
                    <td style={{ color: h.cpc < 0.30 ? '#22c55e' : h.cpc < 0.40 ? '#f59e0b' : '#ef4444' }}>¥{h.cpc.toFixed(2)}</td>
                    <td>{h.convRate}%</td>
                    <td>{h.variants}套</td>
                    <td>
                      <span className={`status-badge ${h.status === 'top' ? 'running' : h.status === 'active' ? 'training' : 'error'}`}>
                        {h.status === 'top' ? '高效' : h.status === 'active' ? '测试中' : '已暂停'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'funnel' && (
          <div className="card">
            <div className="section-title">美妆短视频转化漏斗</div>
            <div style={{ marginBottom: 16, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              曝光 → 3秒停留 → 完播 → 点击 → 进店 → 下单
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" tickFormatter={(v: number) => v >= 1000000 ? `${(v/10000).toFixed(0)}万` : `${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="stage" width={80} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${(v/10000).toFixed(1)}万`} />
                <Bar dataKey="value" fill="#e8365d" name="人数" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 16 }}>
              {[
                { label: '3秒停留率', value: '45%' },
                { label: '完播率', value: '19%' },
                { label: '点击率', value: '5%' },
                { label: '进店率', value: '1%' },
                { label: '下单率', value: '0.35%' },
              ].map(m => (
                <div key={m.label} style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e8365d' }}>{m.value}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

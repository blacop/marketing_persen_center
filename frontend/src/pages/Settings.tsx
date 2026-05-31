import { useState } from 'react'
import {
  Settings as SettingsIcon, Shield, Globe, Cpu, Key,
  Bell, Lock, X
} from 'lucide-react'
import { createParam, type AIConfigGroup, type AILearningStatus } from '../components/AIConfigPanel'
import { useRegisterAIConfig } from '../context/AIConfigContext'

const settingsAIGroups: AIConfigGroup[] = [
  {
    title: '全局AI引擎参数',
    icon: <Cpu size={16} />,
    params: [
      createParam('inference_interval', '模型推理频率', 30, 's', 'AI模型执行推理的间隔时间', 25, 92, { min: 5, max: 120, step: 5 }),
      createParam('max_concurrency', '模型并发数上限', 16, '个', '同时运行的AI推理任务数', 14, 88, { min: 4, max: 64, step: 2 }),
      createParam('gpu_usage_cap', 'GPU资源使用上限', 80, '%', 'AI推理占用GPU资源上限', 75, 90, { min: 40, max: 95, step: 5 }),
      createParam('model_cache_ttl', '模型缓存TTL', 300, 's', '模型推理结果缓存过期时间', 240, 85, { min: 60, max: 600, step: 30 }),
    ]
  },
  {
    title: 'API调度与限流',
    icon: <Globe size={16} />,
    params: [
      createParam('douyin_api_rate', '抖音巨量API调用频率', 180, '次/s', '巨量引擎API每秒调用上限', 170, 93, { min: 50, max: 200, step: 10 }),
      createParam('xhs_api_rate', '小红书聚光API调用频率', 90, '次/s', '小红书聚光API每秒调用上限', 85, 91, { min: 30, max: 100, step: 5 }),
      createParam('kuaishou_api_rate', '快手磁力API调用频率', 140, '次/s', '快手磁力引擎API每秒调用上限', 130, 89, { min: 50, max: 150, step: 10 }),
      createParam('api_retry_max', 'API失败重试次数', 3, '次', 'API调用失败后最大重试次数', 3, 95, { min: 1, max: 5, step: 1 }),
      createParam('circuit_break_threshold', 'API熔断阈值', 5, '次', '连续失败达到此值触发熔断', 4, 87, { min: 3, max: 10, step: 1 }),
    ]
  },
  {
    title: '通知策略优化',
    icon: <Bell size={16} />,
    params: [
      createParam('alert_merge_window', '告警合并窗口', 60, 's', '同类告警在窗口内合并为一条', 45, 84, { min: 10, max: 300, step: 10 }),
      createParam('alert_noise_level', '告警降噪等级', 3, '级', '1=全部通知 5=仅关键通知', 2, 81, { min: 1, max: 5, step: 1 }),
      createParam('false_positive_tolerance', '误报率容忍度', 5, '%', 'AI自动判定为误报的容忍上限', 3.5, 86, { min: 1, max: 10, step: 0.5 }),
      createParam('escalation_timeout', '升级超时时间', 300, 's', '告警未响应自动升级的超时时间', 240, 88, { min: 60, max: 600, step: 30 }),
    ]
  },
  {
    title: '安全与合规引擎',
    icon: <Shield size={16} />,
    params: [
      createParam('anomaly_sensitivity', '异常检测灵敏度', 75, '%', '安全异常检测灵敏度，越高误报越多', 80, 89, { min: 50, max: 99, step: 1 }),
      createParam('risk_block_threshold', '风控拦截阈值', 85, '分', '风险评分超过此值自动拦截', 88, 92, { min: 60, max: 99, step: 1 }),
      createParam('compliance_sample_rate', '合规审查采样率', 15, '%', '自动抽取内容进行合规审查的比例', 12, 87, { min: 5, max: 30, step: 1 }),
      createParam('pipl_retention', 'PIPL数据保留', 90, '天', '用户数据最长保留天数(符合个人信息保护法)', 90, 95, { min: 30, max: 180, step: 10 }),
    ]
  },
]

const settingsLearningStatus: AILearningStatus = {
  modelVersion: 'v3.8.0-settings',
  lastTraining: '25分钟前',
  totalDataPoints: 890000,
  avgConfidence: 89,
  autoAdjustCount24h: 45,
  learningRate: '0.0008',
  nextTraining: '35分钟后',
  improvementRate: '+3.1%',
}

/* ═══════════════════════════════════════════════════════════════
   系统设置 —— 平台配置·API密钥·通知·AI参数
   ═══════════════════════════════════════════════════════════════ */

const TABS = ['平台配置', 'API密钥管理', '通知与告警']

// ===== Tab1: 平台配置 =====
const platformConfig = [
  { label: '平台名称', value: '玛丽黛佳美妆智投平台', editable: false },
  { label: '版本', value: 'V1.0 (国内美妆智能投放版)', editable: false },
  { label: '智能体总数', value: '52个', editable: false },
  { label: '替代岗位数', value: '47个', editable: false },
  { label: '业务模式', value: '美妆品牌直投+KOL种草', editable: false },
  { label: '默认时区', value: 'UTC+8 (北京时间)', editable: true },
  { label: '默认货币', value: 'CNY (人民币)', editable: true },
  { label: '数据保留期', value: '90天', editable: true },
]

const securityConfig = [
  { label: '反欺诈检测', value: '实时启用', enabled: true },
  { label: '内容合规审核', value: '自动审核', enabled: true },
  { label: '数据加密', value: 'AES-256', enabled: true },
  { label: 'API认证', value: 'OAuth 2.0 + JWT', enabled: true },
  { label: 'PIPL合规(个人信息保护法)', value: '已启用', enabled: true },
  { label: '2FA认证', value: '强制启用', enabled: true },
  { label: 'IP白名单', value: '已配置 (12个IP)', enabled: true },
]

const deployConfig = [
  { region: '华东主节点 (上海)', endpoint: 'cn-shanghai-1', status: '运行中', latency: '5ms', load: '70%' },
  { region: '华北节点 (北京)', endpoint: 'cn-beijing-1', status: '运行中', latency: '8ms', load: '55%' },
  { region: '华南节点 (广州)', endpoint: 'cn-guangzhou-1', status: '运行中', latency: '12ms', load: '62%' },
  { region: '西南节点 (成都)', endpoint: 'cn-chengdu-1', status: '运行中', latency: '18ms', load: '38%' },
]

// ===== Tab2: API密钥 =====
const apiKeys = [
  { platform: '抖音巨量引擎 API', keyName: 'douyin_prod_key', status: '有效', expires: '2026-12-31', lastUsed: '14:30', callsToday: '45,230', rateLimit: '200/s', health: '正常' },
  { platform: '小红书聚光 API', keyName: 'xhs_prod_key', status: '有效', expires: '2026-09-15', lastUsed: '14:28', callsToday: '38,450', rateLimit: '100/s', health: '正常' },
  { platform: '快手磁力引擎 API', keyName: 'kuaishou_prod_key', status: '有效', expires: '2027-03-01', lastUsed: '14:25', callsToday: '22,180', rateLimit: '150/s', health: '正常' },
  { platform: '天猫品销宝 API', keyName: 'tmall_prod_key', status: '有效', expires: '2026-06-30', lastUsed: '14:20', callsToday: '8,560', rateLimit: '50/s', health: '正常' },
  { platform: '京东京准通 API', keyName: 'jd_prod_key', status: '即将过期', expires: '2026-05-15', lastUsed: '12:00', callsToday: '5,230', rateLimit: '30/s', health: '维护中' },
  { platform: '抖音DOU+ API', keyName: 'douplus_key', status: '有效', expires: '2027-01-20', lastUsed: '14:15', callsToday: '3,120', rateLimit: '50/s', health: '正常' },
  { platform: '巨量云图 DMP', keyName: 'yuntu_prod_key', status: '有效', expires: '2026-11-30', lastUsed: '14:30', callsToday: '25,800', rateLimit: '200/s', health: '正常' },
  { platform: '生意参谋 BI', keyName: 'sycm_prod_key', status: '有效', expires: '2026-10-15', lastUsed: '14:28', callsToday: '18,200', rateLimit: '150/s', health: '正常' },
]

// ===== Tab3: 通知配置 =====
const notificationRules = [
  { name: 'ROI低于阈值', channel: 'Slack + 邮件', threshold: 'ROI < 1.0', frequency: '实时', enabled: true, receivers: '投放组' },
  { name: '预算消耗超80%', channel: 'Slack', threshold: '预算使用 > 80%', frequency: '实时', enabled: true, receivers: '预算组' },
  { name: '素材审核异常', channel: '邮件', threshold: '拒审率 > 15%', frequency: '每小时', enabled: true, receivers: '创意组' },
  { name: 'API连接异常', channel: 'Slack + 短信', threshold: '连续失败 > 3次', frequency: '实时', enabled: true, receivers: '技术组' },
  { name: '反欺诈告警', channel: 'Slack + 短信 + 邮件', threshold: '异常流量 > 5%', frequency: '实时', enabled: true, receivers: '安全组' },
  { name: 'AI模型精度下降', channel: 'Slack', threshold: '准确率下降 > 3%', frequency: '每日', enabled: true, receivers: 'AI组' },
  { name: '日消耗报告', channel: '邮件', threshold: '-', frequency: '每日 09:00', enabled: true, receivers: '管理层' },
  { name: '周度复盘报告', channel: '邮件', threshold: '-', frequency: '每周一 10:00', enabled: true, receivers: '全团队' },
  { name: 'KOL合作到期提醒', channel: 'Slack', threshold: '到期前7天', frequency: '每日', enabled: false, receivers: '运营组' },
]


const roadmap = [
  { version: 'V1.0', time: '4-5个月', ability: '基础智能投放', platforms: '抖音、小红书', status: 'current' },
  { version: 'V2.0', time: '5-6个月', ability: '实时优化、ROI预测', platforms: '+快手、天猫品销宝', status: 'next' },
  { version: 'V3.0', time: '6-12个月', ability: '全渠道GMV协同', platforms: '+京东、DOU+', status: 'planned' },
  { version: 'V4.0', time: '12-18个月', ability: '品效合一自动化', platforms: '+私域直播等', status: 'planned' },
]

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: '1px solid var(--border-light)',
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedDetail, setSelectedDetail] = useState<{type: string; data: any} | null>(null)
  useRegisterAIConfig(settingsAIGroups, settingsLearningStatus, '系统设置')

  return (
    <>
      <div className="page-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingsIcon size={24} style={{ color: 'var(--text-muted)' }} />
          系统设置
        </h2>
        <p>平台配置 · API密钥 · 通知告警</p>
      </div>

      <div className="page-content">
        <div className="tabs">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`tab ${activeTab === i ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: 平台配置 */}
        {activeTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="grid-2">
              <div className="card">
                <div className="section-title">
                  <SettingsIcon size={16} style={{ color: 'var(--text-muted)' }} />
                  平台基础设置
                </div>
                {platformConfig.map(c => (
                  <div key={c.label} style={rowStyle}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.label}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>{c.value}</span>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="section-title">
                  <Shield size={16} style={{ color: 'var(--accent-primary)' }} />
                  安全与合规
                </div>
                {securityConfig.map(c => (
                  <div key={c.label} style={rowStyle}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{c.value}</span>
                      <Lock size={12} style={{ color: 'var(--accent-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="section-title">
                <Globe size={16} style={{ color: 'var(--info)' }} />
                全球部署节点
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>区域</th>
                    <th>端点</th>
                    <th>状态</th>
                    <th>延迟</th>
                    <th>负载</th>
                  </tr>
                </thead>
                <tbody>
                  {deployConfig.map(d => (
                    <tr key={d.region} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'deploy_node', data: d})}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{d.region}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{d.endpoint}</td>
                      <td>
                        <span className="status-badge running">
                          <span className="status-dot running" />
                          {d.status}
                        </span>
                      </td>
                      <td>{d.latency}</td>
                      <td style={{ color: parseInt(d.load) > 70 ? 'var(--warning)' : 'var(--accent-primary)', fontWeight: 600 }}>{d.load}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="section-title">
                <Cpu size={16} style={{ color: 'var(--accent-primary)' }} />
                产品演进路线
              </div>
              {roadmap.map(r => (
                <div key={r.version} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'roadmap', data: r})}>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: r.status === 'current' ? 'var(--accent-primary)' : 'var(--accent-primary)',
                    color: r.status === 'current' ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}>
                    {r.version}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{r.ability}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.platforms} · {r.time}</div>
                  </div>
                  {r.status === 'current' && (
                    <span className="status-badge running">当前</span>
                  )}
                  {r.status === 'next' && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--info)', background: 'var(--accent-primary)', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>下一阶段</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: API密钥管理 */}
        {activeTab === 1 && (
          <div className="card">
            <div className="section-title">
              <Key size={16} style={{ color: 'var(--warning)' }} />
              API密钥状态
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>平台</th>
                    <th>密钥名</th>
                    <th>状态</th>
                    <th>到期日</th>
                    <th>最后使用</th>
                    <th>今日调用</th>
                    <th>限流</th>
                    <th>健康</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map(k => (
                    <tr key={k.platform} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'api_key', data: k})}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{k.platform}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{k.keyName}</td>
                      <td>
                        <span className={`status-badge ${k.status === '有效' ? 'running' : 'idle'}`}>
                          <span className={`status-dot ${k.status === '有效' ? 'running' : 'idle'}`} />
                          {k.status}
                        </span>
                      </td>
                      <td>{k.expires}</td>
                      <td>{k.lastUsed}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{k.callsToday}</td>
                      <td>{k.rateLimit}</td>
                      <td>
                        <span className={`status-badge ${k.health === '正常' ? 'running' : 'idle'}`}>
                          {k.health}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: 通知与告警 */}
        {activeTab === 2 && (
          <div className="card">
            <div className="section-title">
              <Bell size={16} style={{ color: 'var(--warning)' }} />
              通知规则配置
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>规则名称</th>
                  <th>触发条件</th>
                  <th>通知渠道</th>
                  <th>频率</th>
                  <th>接收人</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {notificationRules.map(r => (
                  <tr key={r.name} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'notification_rule', data: r})}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.threshold}</td>
                    <td style={{ fontSize: '0.8rem' }}>{r.channel}</td>
                    <td style={{ fontSize: '0.8rem' }}>{r.frequency}</td>
                    <td style={{ fontSize: '0.8rem' }}>{r.receivers}</td>
                    <td>
                      {r.enabled
                        ? <span className="status-badge running">启用</span>
                        : <span className="status-badge idle">禁用</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {selectedDetail.type === 'deploy_node' && `部署节点详情: ${selectedDetail.data.region}`}
                {selectedDetail.type === 'api_key' && `API密钥详情: ${selectedDetail.data.platform}`}
                {selectedDetail.type === 'notification_rule' && `通知规则详情: ${selectedDetail.data.name}`}
                {selectedDetail.type === 'roadmap' && `产品路线: ${selectedDetail.data.version}`}
                {selectedDetail.type === 'security_detail' && `安全配置详情`}
              </h3>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {selectedDetail.type === 'deploy_node' && (() => {
              const d = selectedDetail.data
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: '状态', value: d.status, color: '#34d399' },
                      { label: '延迟', value: d.latency, color: parseInt(d.latency) > 50 ? '#fbbf24' : '#34d399' },
                      { label: '负载', value: d.load, color: parseInt(d.load) > 70 ? '#fbbf24' : '#a78bfa' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', marginBottom: 16 }}>
                    {[
                      { label: '区域', value: d.region },
                      { label: '端点', value: d.endpoint },
                      { label: '协议', value: 'HTTPS/gRPC' },
                      { label: '证书到期', value: '2027-06-15' },
                      { label: '运行时长', value: '99.98% (30天)' },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                        <span style={{ fontWeight: 600 }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>关联服务</div>
                  <table className="data-table">
                    <thead><tr><th>服务</th><th>状态</th><th>延迟</th></tr></thead>
                    <tbody>
                      {['API Gateway', 'CDN', 'Database Replica'].map((svc, i) => (
                        <tr key={svc} style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail({type: 'security_detail', data: {name: svc, region: d.region}})}>
                          <td style={{ fontWeight: 500 }}>{svc}</td>
                          <td style={{ color: '#34d399' }}>健康</td>
                          <td>{[d.latency, `${parseInt(d.latency) + 5}ms`, `${parseInt(d.latency) + 2}ms`][i]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )
            })()}

            {selectedDetail.type === 'api_key' && (() => {
              const k = selectedDetail.data
              return (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: '状态', value: k.status, color: k.status === '有效' ? '#34d399' : '#fbbf24' },
                      { label: '健康', value: k.health, color: k.health === '正常' ? '#34d399' : '#fbbf24' },
                      { label: '今日调用', value: k.callsToday, color: '#a78bfa' },
                      { label: '限流', value: k.rateLimit, color: 'var(--text-primary)' },
                    ].map(m => (
                      <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)', marginBottom: 16 }}>
                    {[
                      { label: '平台', value: k.platform },
                      { label: '密钥名', value: k.keyName },
                      { label: '到期日', value: k.expires },
                      { label: '最后使用', value: k.lastUsed },
                      { label: '错误率 (24h)', value: '0.02%' },
                      { label: '平均响应时间', value: '45ms' },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                        <span style={{ fontWeight: 600 }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8 }}>近期调用趋势</div>
                  {['08:00 - 12,500次', '10:00 - 15,200次', '12:00 - 18,800次', '14:00 - 16,300次'].map(t => (
                    <div key={t} style={{ padding: '6px 10px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.75rem', marginBottom: 4, color: 'var(--text-secondary)' }}>{t}</div>
                  ))}
                </>
              )
            })()}

            {selectedDetail.type === 'notification_rule' && (() => {
              const r = selectedDetail.data
              return (
                <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                  {[
                    { label: '规则名称', value: r.name },
                    { label: '触发条件', value: r.threshold },
                    { label: '通知渠道', value: r.channel },
                    { label: '频率', value: r.frequency },
                    { label: '接收人', value: r.receivers },
                    { label: '状态', value: r.enabled ? '启用' : '禁用' },
                    { label: '最近触发', value: '2小时前' },
                    { label: '今日触发次数', value: '5次' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                      <span style={{ fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )
            })()}

            {selectedDetail.type === 'roadmap' && (() => {
              const r = selectedDetail.data
              return (
                <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                  {[
                    { label: '版本', value: r.version },
                    { label: '预计周期', value: r.time },
                    { label: '核心能力', value: r.ability },
                    { label: '覆盖平台', value: r.platforms },
                    { label: '状态', value: r.status === 'current' ? '当前版本' : r.status === 'next' ? '下一阶段' : '规划中' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                      <span style={{ fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )
            })()}

            {selectedDetail.type === 'security_detail' && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
                {[
                  { label: '服务名称', value: selectedDetail.data.name },
                  { label: '所属区域', value: selectedDetail.data.region },
                  { label: '状态', value: '健康' },
                  { label: '运行时长', value: '99.95%' },
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

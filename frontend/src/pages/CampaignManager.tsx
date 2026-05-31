import { useState } from 'react'
import { Calendar, TrendingUp, Users, ShoppingBag, Sparkles, Gift, Heart, Sun, Flame, Tag } from 'lucide-react'

const campaignTypes = [
  { key: 'all', label: '全部活动' },
  { key: 'launch', label: '新品首发' },
  { key: 'promo', label: '大促活动' },
  { key: 'festival', label: '节日营销' },
  { key: 'seeding', label: '日常种草' },
]

const campaigns = [
  {
    id: 1, name: '玛丽黛佳小蘑菇气垫 新品首发', type: 'launch', status: 'active',
    platforms: ['抖音', '小红书', '天猫'],
    startDate: '2026-03-20', endDate: '2026-04-20',
    budget: 500000, spent: 328000, roi: 3.2,
    impressions: 12500000, clicks: 375000, conversions: 18200,
    icon: <Sparkles size={16} />, color: '#e8365d',
  },
  {
    id: 2, name: '618年中大促 美妆狂欢', type: 'promo', status: 'scheduled',
    platforms: ['天猫', '京东', '抖音', '快手'],
    startDate: '2026-06-01', endDate: '2026-06-20',
    budget: 1200000, spent: 0, roi: 0,
    impressions: 0, clicks: 0, conversions: 0,
    icon: <Flame size={16} />, color: '#f4587a',
  },
  {
    id: 3, name: '38女神节 宠爱自己', type: 'festival', status: 'completed',
    platforms: ['小红书', '微信朋友圈', '抖音'],
    startDate: '2026-03-01', endDate: '2026-03-10',
    budget: 350000, spent: 342000, roi: 4.1,
    impressions: 8900000, clicks: 267000, conversions: 15800,
    icon: <Heart size={16} />, color: '#ff7a95',
  },
  {
    id: 4, name: '情人节限定礼盒 告白季', type: 'festival', status: 'completed',
    platforms: ['小红书', '抖音', '微信朋友圈'],
    startDate: '2026-02-01', endDate: '2026-02-15',
    budget: 280000, spent: 275000, roi: 3.8,
    impressions: 6200000, clicks: 186000, conversions: 9800,
    icon: <Gift size={16} />, color: '#ffb4c6',
  },
  {
    id: 5, name: '夏日防晒系列 日常种草', type: 'seeding', status: 'active',
    platforms: ['小红书', '抖音'],
    startDate: '2026-04-01', endDate: '2026-05-31',
    budget: 150000, spent: 23000, roi: 2.6,
    impressions: 1800000, clicks: 54000, conversions: 2100,
    icon: <Sun size={16} />, color: '#9b1339',
  },
  {
    id: 6, name: '双11全球狂欢节 美妆盛典', type: 'promo', status: 'scheduled',
    platforms: ['天猫', '京东', '抖音', '快手', '小红书', '微信朋友圈'],
    startDate: '2026-10-20', endDate: '2026-11-12',
    budget: 2000000, spent: 0, roi: 0,
    impressions: 0, clicks: 0, conversions: 0,
    icon: <Tag size={16} />, color: '#4a1025',
  },
]

const statusLabels: Record<string, string> = {
  active: '投放中',
  scheduled: '待上线',
  completed: '已结束',
  paused: '已暂停',
}
const statusColors: Record<string, string> = {
  active: '#22c55e',
  scheduled: '#f59e0b',
  completed: '#6b7280',
  paused: '#ef4444',
}

export default function CampaignManager() {
  const [filterType, setFilterType] = useState('all')

  const filtered = filterType === 'all' ? campaigns : campaigns.filter(c => c.type === filterType)

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0)
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0)
  const avgRoi = campaigns.filter(c => c.roi > 0).reduce((s, c) => s + c.roi, 0) / campaigns.filter(c => c.roi > 0).length
  const totalReach = campaigns.reduce((s, c) => s + c.impressions, 0)

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>美妆营销活动管理</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>玛丽黛佳全平台营销活动管理，从策划、投放到复盘一站式完成</p>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: '进行中活动', value: `${activeCampaigns}`, sub: `共 ${campaigns.length} 个活动`, icon: <Calendar size={14} /> },
          { label: '总预算', value: `¥${(totalBudget / 10000).toFixed(0)}万`, sub: `已消耗 ¥${(totalSpent / 10000).toFixed(0)}万`, icon: <ShoppingBag size={14} /> },
          { label: '平均 ROI', value: `${avgRoi.toFixed(1)}x`, sub: '超目标 18%', icon: <TrendingUp size={14} /> },
          { label: '总曝光量', value: `${(totalReach / 10000).toFixed(0)}万`, sub: '覆盖6大平台', icon: <Users size={14} /> },
        ].map(({ label, value, sub, icon }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              {icon} {label}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {campaignTypes.map(ct => (
          <button
            key={ct.key}
            onClick={() => setFilterType(ct.key)}
            style={{
              padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              border: filterType === ct.key ? '1px solid #e8365d' : '1px solid var(--border)',
              background: filterType === ct.key ? '#e8365d' : 'var(--bg-card)',
              color: filterType === ct.key ? 'white' : 'var(--text-primary)',
            }}
          >
            {ct.label}
          </button>
        ))}
      </div>

      {/* Campaign Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(c => (
          <div key={c.id} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
            padding: 20, borderLeft: `4px solid ${c.color}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: c.color }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {c.startDate} ~ {c.endDate} · {c.platforms.join(' / ')}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '0.7rem', padding: '3px 10px', borderRadius: 6, fontWeight: 600,
                background: `${statusColors[c.status]}18`, color: statusColors[c.status],
              }}>
                {statusLabels[c.status]}
              </span>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>预算</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>¥{(c.budget / 10000).toFixed(0)}万</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>已消耗</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>¥{(c.spent / 10000).toFixed(1)}万</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ROI</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: c.roi >= 3 ? '#22c55e' : c.roi > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                  {c.roi > 0 ? `${c.roi}x` : '-'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>曝光量</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {c.impressions > 0 ? `${(c.impressions / 10000).toFixed(0)}万` : '-'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>转化数</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {c.conversions > 0 ? c.conversions.toLocaleString() : '-'}
                </div>
              </div>
            </div>

            {/* Budget Progress Bar */}
            {c.spent > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>预算消耗进度</span>
                  <span>{Math.round(c.spent / c.budget * 100)}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${Math.min(100, Math.round(c.spent / c.budget * 100))}%`,
                    background: `linear-gradient(90deg, ${c.color}, #ff7a95)`,
                  }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

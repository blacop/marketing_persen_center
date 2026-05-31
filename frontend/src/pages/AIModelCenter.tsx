import { useState } from 'react'
import { Brain, Cpu, TrendingUp, Zap, Activity, Database, RefreshCw, Filter, X, ChevronRight, Shield, Clock, BarChart3 } from 'lucide-react'
import ModelBadge from '../components/ModelBadge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useRegisterAIConfig } from '../context/AIConfigContext'
import type { AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'

const modelCenterAIGroups: AIConfigGroup[] = [
  {
    title: '推理服务配置',
    icon: <Zap size={16} />,
    params: [
      { key: 'inference_timeout', label: '推理超时阈值', value: 500, unit: 'ms', description: '单次推理请求超时后自动降级至规则引擎', aiRecommended: 500, aiConfidence: 95, autoTuneEnabled: true, learningDataPoints: 284000, lastAdjusted: '2小时前', adjustHistory: [{ time: '今日 02:00', from: '600', to: '500', reason: 'P99延迟优化' }] },
      { key: 'batch_size', label: '批推理批次大小', value: 256, unit: '条', description: '每批次处理的请求数，影响吞吐量与延迟的平衡', aiRecommended: 256, aiConfidence: 88, autoTuneEnabled: true, learningDataPoints: 182000, lastAdjusted: '昨日', adjustHistory: [{ time: '昨日 22:00', from: '128', to: '256', reason: 'QPS高峰期吞吐优化' }] },
      { key: 'max_concurrent', label: '最大并发请求数', value: 2000, unit: '个', description: '推理服务同时处理的最大请求并发数', aiRecommended: 2000, aiConfidence: 91, autoTuneEnabled: false, learningDataPoints: 95000, lastAdjusted: '3天前', adjustHistory: [] },
    ],
  },
  {
    title: '自动降级策略',
    icon: <Shield size={16} />,
    params: [
      { key: 'fallback_threshold', label: '降级触发准确率', value: 80, unit: '%', description: '模型准确率低于此值时自动切换至规则引擎', aiRecommended: 80, aiConfidence: 94, autoTuneEnabled: true, learningDataPoints: 36000, lastAdjusted: '5天前', adjustHistory: [] },
      { key: 'degrade_alert_window', label: '异常检测窗口', value: 15, unit: '分钟', description: '计算模型健康状态的滑动时间窗口', aiRecommended: 15, aiConfidence: 87, autoTuneEnabled: true, learningDataPoints: 62000, lastAdjusted: '2天前', adjustHistory: [{ time: '2天前', from: '30', to: '15', reason: '缩短异常响应时间' }] },
    ],
  },
  {
    title: '模型训练调度',
    icon: <Clock size={16} />,
    params: [
      { key: 'retrain_data_threshold', label: '增量训练触发量', value: 5000, unit: '条', description: '积累新数据条数超过此值时触发增量训练', aiRecommended: 5000, aiConfidence: 89, autoTuneEnabled: true, learningDataPoints: 480000, lastAdjusted: '今日 06:00', adjustHistory: [{ time: '今日 06:00', from: '8000', to: '5000', reason: '数据积累速度加快' }] },
      { key: 'full_retrain_cycle', label: '全量重训练周期', value: 7, unit: '天', description: '每隔多少天进行一次全量重训练', aiRecommended: 7, aiConfidence: 85, autoTuneEnabled: false, learningDataPoints: 28000, lastAdjusted: '7天前', adjustHistory: [] },
      { key: 'ab_traffic_split', label: '新版本A/B流量', value: 10, unit: '%', description: '新模型版本灰度上线时分配的流量比例', aiRecommended: 10, aiConfidence: 92, autoTuneEnabled: true, learningDataPoints: 15000, lastAdjusted: '3天前', adjustHistory: [{ time: '3天前', from: '5', to: '10', reason: '灰度效果稳定，扩大验证' }] },
    ],
  },
]

const modelCenterLearning: AILearningStatus = {
  modelVersion: 'v4.5-serving',
  lastTraining: '今日 06:00',
  totalDataPoints: 3840000,
  avgConfidence: 91.2,
  autoAdjustCount24h: 12,
  learningRate: '自适应调度',
  nextTraining: '明日 01:00',
  improvementRate: '+0.8%/周',
}

// 模型分类标签
const MODEL_GROUPS = ['全部', '投放优化', '内容生产', '用户洞察', '达人生态', '风控安全', '归因预测', '全球化'] as const

const models = [
  // ── 投放优化类 ────────────────────────────────────────────────────────────
  { name: 'BidOptimizer-DQN', type: '出价优化', group: '投放优化', framework: 'DQN (深度Q网络)', serving: 'online', latency: '12ms', qps: 45000, accuracy: 94.2, lastTrain: '2小时前', version: 'v3.8.1', agents: '抖音/小红书/快手智能投手、智能出价智能体' },
  { name: 'CreativeFatigue-MAB', type: '素材疲劳检测', group: '投放优化', framework: '多臂老虎机 (Thompson Sampling)', serving: 'online', latency: '3ms', qps: 80000, accuracy: 88.7, lastTrain: '实时更新', version: 'v4.1.2', agents: '素材轮换智能体' },
  { name: 'AudienceCluster-KM', type: '受众分群', group: '投放优化', framework: 'K-Means + Embedding', serving: 'online', latency: '20ms', qps: 8000, accuracy: 85.3, lastTrain: '昨日', version: 'v1.9.3', agents: '人群定向智能体' },
  { name: 'BudgetMO-Optimizer', type: '多目标预算优化', group: '投放优化', framework: '多目标强化学习 (MORL)', serving: 'online', latency: '65ms', qps: 2000, accuracy: 88.3, lastTrain: '每日更新', version: 'v1.8.0', agents: '预算分配智能体、跨平台协同智能体' },
  { name: 'LiveGMV-LSTM', type: '直播GMV预测', group: '投放优化', framework: 'LSTM + Attention Mechanism', serving: 'online', latency: '48ms', qps: 4500, accuracy: 85.6, lastTrain: '实时更新', version: 'v2.3.0', agents: '直播间投流智能体、直播排期智能体' },
  { name: 'LiveEngagement-Predictor', type: '直播互动热度预测', group: '投放优化', framework: '时序卷积网络 (TCN) + 弹幕语义', serving: 'online', latency: '15ms', qps: 9000, accuracy: 82.3, lastTrain: '实时更新', version: 'v1.1.0', agents: '直播运营Hub(弹幕密度/UV互动峰值预测)、直播排期智能体' },
  { name: 'CTR-Predictor-DeepFM', type: '点击率预测', group: '投放优化', framework: 'DeepFM (深度因子分解机)', serving: 'online', latency: '5ms', qps: 120000, accuracy: 92.4, lastTrain: '每小时', version: 'v4.5.0', agents: '抖音/小红书/快手投手、素材评估、创意排序' },
  { name: 'CVR-Predictor-ESMM', type: '转化率预测', group: '投放优化', framework: 'ESMM 多任务学习 (CTR×CVR)', serving: 'online', latency: '6ms', qps: 95000, accuracy: 89.7, lastTrain: '每小时', version: 'v3.2.0', agents: 'oCPM智能出价、BidOptimizer底层特征、ROI预测' },
  { name: 'VideoCompletion-Predictor', type: '完播率预测', group: '投放优化', framework: '多模态Transformer (视频+音频+文本)', serving: 'online', latency: '85ms', qps: 6000, accuracy: 83.8, lastTrain: '每日更新', version: 'v1.9.0', agents: '快手剧情广告智能体、直播切片智能体' },
  { name: 'InventoryAware-Bidder', type: '库存感知投放决策', group: '投放优化', framework: 'XGBoost库存预测 + 规则引擎', serving: 'online', latency: '22ms', qps: 3500, accuracy: 91.3, lastTrain: '每30分钟', version: 'v2.0.0', agents: '库存广告联动模块(低库存降投/高库存加投)' },
  { name: 'TrafficPacing-RL', type: '预算时段节奏控制', group: '投放优化', framework: '在线强化学习 (在线PPO)', serving: 'online', latency: '8ms', qps: 28000, accuracy: 90.1, lastTrain: '实时更新', version: 'v3.1.0', agents: '活动管理(日内节奏)、直播间投流时段峰值控制' },
  { name: 'Lookalike-Expander', type: 'Lookalike受众扩展', group: '投放优化', framework: '双塔神经网络 + 余弦相似度', serving: 'online', latency: '55ms', qps: 5500, accuracy: 86.2, lastTrain: '每日更新', version: 'v1.6.0', agents: '人群定向智能体(种子扩量)、受众洞察AI扩展' },
  { name: 'NewSKU-ColdStart', type: '新品冷启动', group: '投放优化', framework: '元学习 (MAML) + 内容特征迁移', serving: 'online', latency: '32ms', qps: 4200, accuracy: 81.5, lastTrain: '新品上架即触发', version: 'v1.3.0', agents: '新品首发投放(无历史数据CTR/CVR冷启动)、产品图生成智能体' },
  // ── 内容生产类 ────────────────────────────────────────────────────────────
  { name: 'ContentLLM-Finetuned', type: '内容创作LLM', group: '内容生产', framework: 'Fine-tuned Qwen2.5 + LoRA', serving: 'online', latency: '180ms', qps: 8000, accuracy: 86.4, lastTrain: '每周更新', version: 'v1.2.0', agents: '种草文案、短视频脚本、直播话术、教程生成、Brief生成智能体' },
  { name: 'HookQuality-BERT', type: 'Hook质量评估', group: '内容生产', framework: 'BERT + Vision Cross-Attention', serving: 'online', latency: '45ms', qps: 5000, accuracy: 82.1, lastTrain: '3小时前', version: 'v2.1.0', agents: '短视频脚本智能体' },
  { name: 'ImageGen-BeautySDXL', type: '美妆图像生成', group: '内容生产', framework: 'SDXL + 美妆专属LoRA', serving: 'online', latency: '2800ms', qps: 200, accuracy: 91.0, lastTrain: '每月更新', version: 'v2.0.1', agents: '产品图生成智能体' },
  { name: 'VideoHighlight-Detector', type: '视频爆点检测', group: '内容生产', framework: '双流卷积网络 (SlowFast)', serving: 'online', latency: '340ms', qps: 1200, accuracy: 84.2, lastTrain: '昨日', version: 'v1.7.3', agents: '试色视频智能体、直播切片智能体' },
  { name: 'ComplianceNLP', type: '合规文本检测', group: '内容生产', framework: 'Fine-tuned LLM + Rule Engine', serving: 'online', latency: '35ms', qps: 10000, accuracy: 99.2, lastTrain: '昨日', version: 'v3.0.1', agents: '内容合规审核智能体' },
  { name: 'UGCQuality-Ranker', type: 'UGC内容质量评分', group: '内容生产', framework: 'Multi-modal CLIP + Regression', serving: 'online', latency: '28ms', qps: 15000, accuracy: 82.9, lastTrain: '6小时前', version: 'v1.3.2', agents: '用户UGC激励智能体' },
  { name: 'CrossPlatformAdapt-CV', type: '跨平台素材适配', group: '内容生产', framework: '计算机视觉 + 平台规范分类器', serving: 'online', latency: '95ms', qps: 2800, accuracy: 93.8, lastTrain: '每周更新', version: 'v1.0.2', agents: '本地化中心(比例/时长/格式/BGM智能适配推荐)、素材库' },
  // ── 用户洞察类 ────────────────────────────────────────────────────────────
  { name: 'RepurchaseValue-Predictor-90D', type: '复购价值预测', group: '用户洞察', framework: 'Gradient Boosting + NN', serving: 'online', latency: '8ms', qps: 12000, accuracy: 91.5, lastTrain: '今日 00:00', version: 'v2.4.0', agents: '私域运营、复购价值分析' },
  { name: 'LTV-Predictor-DNN', type: '用户LTV预测', group: '用户洞察', framework: 'DNN + Survival Analysis', serving: 'online', latency: '35ms', qps: 9000, accuracy: 83.7, lastTrain: '每日更新', version: 'v2.1.0', agents: '社群运营智能体、会员分层运营' },
  { name: 'SentimentNLP-Analyzer', type: '用户情感分析', group: '用户洞察', framework: 'RoBERTa + 细粒度情感分类', serving: 'online', latency: '42ms', qps: 12000, accuracy: 91.2, lastTrain: '昨日', version: 'v3.0.0', agents: '消费者洞察引擎、舆情监控' },
  { name: 'TrendForecaster', type: '趋势预测', group: '用户洞察', framework: '时序分析 (Prophet + LSTM)', serving: 'online', latency: '25ms', qps: 3000, accuracy: 78.5, lastTrain: '每日更新', version: 'v1.5.0', agents: '爆款预测智能体、实时趋势捕捉引擎' },
  // ── 达人生态类 ────────────────────────────────────────────────────────────
  { name: 'KOLScore-MultiDim', type: 'KOL多维综合评分', group: '达人生态', framework: 'GBM + Graph Features', serving: 'online', latency: '55ms', qps: 3000, accuracy: 89.1, lastTrain: '每日更新', version: 'v2.2.0', agents: 'KOL筛选智能体、达人招募智能体' },
  { name: 'FanFraud-GNN', type: '粉丝虚假识别', group: '达人生态', framework: '图神经网络 (GraphSAGE)', serving: 'online', latency: '38ms', qps: 18000, accuracy: 93.5, lastTrain: '3小时前', version: 'v3.1.0', agents: '粉丝质量检测智能体' },
  // ── 风控安全类 ────────────────────────────────────────────────────────────
  { name: 'FraudDetector-XGB', type: '广告反欺诈检测', group: '风控安全', framework: 'XGBoost + Rules Engine', serving: 'online', latency: '15ms', qps: 30000, accuracy: 96.8, lastTrain: '6小时前', version: 'v5.2.0', agents: '反欺诈中心、渠道质量监控' },
  { name: 'AnomalyDetector-LSTM', type: 'ROI异常检测', group: '风控安全', framework: 'LSTM-Autoencoder + 动态阈值', serving: 'online', latency: '18ms', qps: 25000, accuracy: 95.1, lastTrain: '实时更新', version: 'v4.0.2', agents: 'ROI监控智能体、智能预警引擎' },
  // ── 归因预测类 ────────────────────────────────────────────────────────────
  { name: 'Attribution-Shapley', type: '多触点归因', group: '归因预测', framework: 'Shapley值 + DNN 混合归因', serving: 'online', latency: '22ms', qps: 6000, accuracy: 87.8, lastTrain: '昨日', version: 'v2.5.1', agents: '归因分析智能体、种草→购买归因引擎' },
  { name: 'BayesianAB-Engine', type: '贝叶斯A/B实验引擎', group: '归因预测', framework: '贝叶斯推断 + Thompson Sampling', serving: 'online', latency: '12ms', qps: 4000, accuracy: 93.6, lastTrain: '实时更新', version: 'v2.0.3', agents: '实验中心(统计显著性推断、自动全量推送)' },
  // ── 竞品与搜索类 ────────────────────────────────────────────────────────────
  { name: 'CompetitorIntel-NLP', type: '竞品情报分析', group: '用户洞察', framework: 'RoBERTa + 跨品牌对比检测', serving: 'online', latency: '60ms', qps: 2500, accuracy: 84.5, lastTrain: '每6小时', version: 'v1.4.0', agents: '竞品内容监控智能体、竞品监控中心' },
  { name: 'SearchQuery-Optimizer', type: '搜索词竞价优化', group: '投放优化', framework: '强化学习 + 搜索词意图分类', serving: 'online', latency: '30ms', qps: 16000, accuracy: 88.9, lastTrain: '每小时', version: 'v2.3.1', agents: '小红书聚光搜索广告、天猫品销宝搜索推广' },
  // ── 全球化类 ────────────────────────────────────────────────────────────────
  { name: 'MultiLingual-ContentLLM', type: '多语言内容生成', group: '全球化', framework: 'GPT-4o + 多语言美妆LoRA (EN/FR/ES/JA/KO)', serving: 'online', latency: '320ms', qps: 5000, accuracy: 88.5, lastTrain: '每周更新', version: 'v1.0.0', agents: '国际素材生成、多语言文案、TikTok Global创意' },
  { name: 'CulturalAdapt-Classifier', type: '文化适配检测', group: '全球化', framework: 'CLIP + 跨文化向量分类器', serving: 'online', latency: '45ms', qps: 8000, accuracy: 84.2, lastTrain: '每月更新', version: 'v1.0.0', agents: '国际素材文化审核、禁忌内容过滤' },
  { name: 'MetaCAPI-Attribution', type: 'Meta转化API归因', group: '全球化', framework: '服务端事件匹配 + 概率归因模型', serving: 'online', latency: '38ms', qps: 12000, accuracy: 82.3, lastTrain: '实时更新', version: 'v2.1.0', agents: 'Facebook归因、iOS ATT补偿、隐私合规归因' },
  { name: 'PrivacySafe-Targeting', type: '隐私合规受众定向', group: '全球化', framework: '联邦学习 + 差分隐私 + 同态加密', serving: 'online', latency: '55ms', qps: 6000, accuracy: 79.8, lastTrain: '每日更新', version: 'v1.2.0', agents: 'GDPR受众定向、Cookie-less投放、隐私合规中心' },
  { name: 'CrossBorder-Lookalike', type: '跨市场相似受众', group: '全球化', framework: '双塔神经网络 + 跨市场迁移学习', serving: 'online', latency: '68ms', qps: 3500, accuracy: 81.4, lastTrain: '每日更新', version: 'v1.1.0', agents: '国际Lookalike扩展、出海人群种子匹配' },
  { name: 'MultiCurrency-ROAS', type: '多币种ROAS预测', group: '全球化', framework: 'Gradient Boosting + 实时汇率时序模型', serving: 'online', latency: '22ms', qps: 9000, accuracy: 87.6, lastTrain: '每小时', version: 'v1.3.0', agents: '全球总控台、国际预算分配、多币种ROI核算' },
  { name: 'GlobalTrend-Radar', type: '全球趋势预测', group: '全球化', framework: '时序预测 + 跨平台内容热度聚合', serving: 'online', latency: '120ms', qps: 2000, accuracy: 76.3, lastTrain: '每日更新', version: 'v1.0.0', agents: 'TikTok热点预测、国际趋势洞察、话题追踪' },
  { name: 'IntlCreator-Scorer', type: '国际达人评分', group: '全球化', framework: 'GBM + 跨平台社媒特征工程', serving: 'online', latency: '62ms', qps: 2500, accuracy: 85.1, lastTrain: '每日更新', version: 'v1.0.0', agents: 'TikTok Creator评估、Facebook Influencer筛选' },
  // ── 消费者运营类 ────────────────────────────────────────────────────────────
  { name: 'ChurnPredictor-GBM', type: '用户流失预测', group: '用户洞察', framework: 'Gradient Boosting Machine + SHAP解释', serving: 'online', latency: '22ms', qps: 14000, accuracy: 88.4, lastTrain: '每日更新', version: 'v1.1.0', agents: '消费者运营中心(留存分析)、私域复购激活、流失预警智能体' },
  { name: 'DeepFM-RecSys', type: '深度推荐系统', group: '用户洞察', framework: 'DeepFM协同过滤 + 用户/物品双塔', serving: 'online', latency: '18ms', qps: 52000, accuracy: 87.2, lastTrain: '每小时', version: 'v2.0.0', agents: '个性化推荐智能体、消费者运营中心(商品推荐)、复购激活' },
  { name: 'Item2Vec-EmbedRec', type: '商品嵌入推荐', group: '用户洞察', framework: 'Item2Vec + 序列推荐Transformer', serving: 'online', latency: '12ms', qps: 38000, accuracy: 83.6, lastTrain: '每日更新', version: 'v1.3.0', agents: 'BERT语义推荐场景、浏览历史推荐、搭配推荐智能体' },
  { name: 'RFM-Clustering', type: 'RFM用户分群', group: '用户洞察', framework: 'K-Means + RFM特征工程 + 动态权重', serving: 'online', latency: '8ms', qps: 6000, accuracy: 91.8, lastTrain: '每日更新', version: 'v1.2.0', agents: '私域运营中心(分层运营)、消费者运营复购激活、会员CRM分层' },
  { name: 'CohortAnalyzer', type: '用户队列分析', group: '用户洞察', framework: '队列留存矩阵 + 统计推断引擎', serving: 'online', latency: '45ms', qps: 2000, accuracy: 95.0, lastTrain: '每日更新', version: 'v1.0.0', agents: '消费者运营中心(留存分析)、实验中心队列验证、产品运营分析' },
  { name: 'UserLTV-Predictor', type: '用户全生命期价值预测', group: '用户洞察', framework: 'BG/NBD + Gamma-Gamma + DNN修正', serving: 'online', latency: '32ms', qps: 8500, accuracy: 84.9, lastTrain: '每日更新', version: 'v1.4.0', agents: '消费者运营中心(LTV预测)、会员分层CRM、预算分配模型输入层' },
  { name: 'ViralCoef-Tracker', type: '裂变病毒系数追踪', group: '用户洞察', framework: '时序回归 + K因子滚动估算', serving: 'online', latency: '15ms', qps: 1500, accuracy: 82.3, lastTrain: '每日更新', version: 'v1.0.0', agents: '消费者运营中心(社交裂变)、私域裂变增长、KOL引流分析' },
]

const modelUsage = [
  { name: 'CTR-DeepFM', calls: 120000 },
  { name: 'CVR-ESMM', calls: 95000 },
  { name: 'Creative-MAB', calls: 80000 },
  { name: 'BidOptimizer', calls: 45000 },
  { name: 'FraudDet-XGB', calls: 30000 },
  { name: 'TrafficPacing', calls: 28000 },
  { name: 'FanFraud-GNN', calls: 18000 },
  { name: 'SearchQuery', calls: 16000 },
  { name: 'UGCQuality', calls: 15000 },
  { name: 'Compliance', calls: 10000 },
  { name: 'Lookalike', calls: 5500 },
  { name: 'Inventory', calls: 3500 },
]

const tooltipStyle = { backgroundColor: '#4a1025', border: '1px solid #9b1339', borderRadius: '8px', fontSize: '0.75rem', color: '#fff5f7' }

const GROUP_COLORS: Record<string, string> = {
  '投放优化': '#e8365d',
  '内容生产': '#ec4899',
  '用户洞察': '#8b5cf6',
  '达人生态': '#06b6d4',
  '风控安全': '#f59e0b',
  '归因预测': '#10b981',
  '全球化':   '#0ea5e9',
}

type ModelItem = typeof models[number]

// 按模型类型生成 Top 特征列表
const FEATURE_MAP: Record<string, string[]> = {
  '投放优化': ['用户历史CTR', '广告新鲜度', '时段因子', '设备类型', '地区系数', '创意评分', '受众匹配度', '历史CVR', '竞价压力', '素材质量分'],
  '内容生产': ['文案语义向量', '情感极性', '品类相关度', '热词密度', '画面清晰度', '色调饱和度', '字幕覆盖率', '互动预测分', '违禁词检测', '平台风格匹配'],
  '用户洞察': ['购买频次', '客单价分布', '浏览深度', '加购转化率', '品类偏好', '价格敏感度', '复购周期', '活跃时段', '社交影响力', '品牌忠诚度'],
  '达人生态': ['粉丝真实率', '互动率', '内容垂直度', '种草转化率', '品牌契合度', '历史GMV', '粉丝年龄分布', '平台活跃度', '成长趋势', '风险评分'],
  '风控安全': ['点击频次异常', 'IP聚集度', '设备指纹', '时序模式', '行为熵值', '黑名单命中', '渠道质量分', '转化漏斗异常', '流量来源', 'User-Agent特征'],
  '归因预测': ['触点时间间隔', '渠道权重', '转化路径长度', '首触贡献', '末触贡献', '曝光频次', '跨设备匹配', '自然流量基准', '增量效果', '置信区间'],
  '全球化':   ['语言类型', '文化背景向量', '地区法规标签', '汇率波动率', '平台归因信号', '隐私合规等级', '跨境受众相似度', '内容文化禁忌分', 'KOL跨平台指数', '国际趋势热度'],
}

export default function AIModelCenter() {
  const [activeGroup, setActiveGroup] = useState<string>('全部')
  const [selectedModel, setSelectedModel] = useState<ModelItem | null>(null)
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null)
  const [retraining, setRetraining] = useState(false)
  const [showFeature, setShowFeature] = useState(false)
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false)

  useRegisterAIConfig(modelCenterAIGroups, modelCenterLearning, 'AI模型中心')

  const fireToast = (msg: string, color = '#e8365d') => {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 3500)
  }

  const filtered = activeGroup === '全部' ? models : models.filter(m => m.group === activeGroup)

  return (
    <>
      <div className="page-header">
        <h2>AI 模型中心</h2>
        <p>全平台AI模型管理 · {models.length} 个模型在线服务 · 覆盖 52 个智能体 + 全业务模块完整决策闭环 · 🌍 国际化全球部署 · 🔄 飞轮6阶段全覆盖</p>
      </div>
      <div className="page-content">
        <div className="card" style={{ marginBottom: 20, padding: '14px 18px', background: 'rgba(244,88,122,0.08)', borderColor: 'rgba(244,88,122,0.2)' }}>
          <div style={{ fontSize: '0.8rem' }}>
            <strong style={{ color: '#ffb4c6' }}>模型服务架构</strong>：所有智能体的AI决策能力由底层模型提供。模型中心负责模型训练、版本管理、在线推理、A/B测试。模型异常自动降级至规则引擎，确保业务连续性。共 <strong style={{ color: '#ff7a95' }}>{models.length}</strong> 个模型分 <strong style={{ color: '#ff7a95' }}>7</strong> 大类，实现投放优化、内容生产、用户洞察、达人生态、风控安全、归因预测、<strong style={{ color: '#0ea5e9' }}>🌍 全球化</strong> 全域覆盖。新增 <strong style={{ color: '#a78bfa' }}>7个消费者运营模型</strong>（ChurnPredictor、DeepFM推荐、RFM分群等），打通内容飞轮全链路。
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="card-title"><Brain size={14} style={{ display: 'inline' }} /> 在线模型</div>
            <div className="card-value">{models.length}</div>
            <div className="card-change positive">覆盖52个智能体+全模块</div>
          </div>
          <div className="card">
            <div className="card-title"><Zap size={14} style={{ display: 'inline' }} /> 日推理量</div>
            <div className="card-value">38.6M</div>
            <div className="card-change positive">+8% vs 昨日</div>
          </div>
          <div className="card">
            <div className="card-title"><Activity size={14} style={{ display: 'inline' }} /> 平均延迟</div>
            <div className="card-value">62ms</div>
            <div className="card-change positive">P99 &lt; 500ms</div>
          </div>
          <div className="card">
            <div className="card-title"><TrendingUp size={14} style={{ display: 'inline' }} /> 平均准确率</div>
            <div className="card-value" style={{ color: '#ff7a95' }}>88.8%</div>
            <div className="card-change positive">持续自优化</div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="section-title"><Cpu size={16} /> 模型调用量分布 (QPS)</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={modelUsage}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `${(Number(v)/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v).toLocaleString()} QPS`, 'QPS']} />
                <Bar dataKey="calls" fill="#f4587a" name="QPS" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div className="section-title"><Database size={16} /> 模型训练流水线</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              数据采集 → 特征工程 → 模型训练 → 离线评估 → A/B测试 → 灰度上线 → 全量部署
            </div>
            {[
              { stage: '数据采集', status: '持续运行', color: '#22c55e' },
              { stage: '特征工程', status: '每小时更新', color: '#22c55e' },
              { stage: 'BidOptimizer 重训练', status: '进行中 (67%)', color: '#e8365d' },
              { stage: 'RepurchaseValue-Predictor A/B测试', status: 'v2.4.1 vs v2.4.0', color: '#f59e0b' },
              { stage: 'HookQuality 灰度上线', status: '10% 流量', color: '#f59e0b' },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 6, marginBottom: 6, borderLeft: `3px solid ${p.color}` }}>
                <RefreshCw size={12} color={p.color} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, flex: 1 }}>{p.stage}</span>
                <span style={{ fontSize: '0.7rem', color: p.color }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="section-title" style={{ marginBottom: 0 }}><Filter size={15} /> 模型服务列表</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {MODEL_GROUPS.map(g => (
                <button key={g} onClick={() => setActiveGroup(g)} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                  border: activeGroup === g ? `1px solid ${GROUP_COLORS[g] ?? '#e8365d'}` : '1px solid var(--border)',
                  background: activeGroup === g ? `${GROUP_COLORS[g] ?? '#e8365d'}22` : 'transparent',
                  color: activeGroup === g ? (GROUP_COLORS[g] ?? '#e8365d') : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}>
                  {g} {g !== '全部' ? `(${models.filter(m => m.group === g).length})` : `(${models.length})`}
                </button>
              ))}
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>模型名称</th><th>类型</th><th>框架</th><th>延迟</th><th>QPS</th><th>准确率</th><th>最近训练</th><th>版本</th><th>覆盖智能体</th><th>状态</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={i} onClick={() => setSelectedModel(m)} style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,54,93,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.72rem' }}>{m.name}</td>
                  <td>
                    <span className="cluster-tag" style={{ background: `${GROUP_COLORS[m.group] ?? '#e8365d'}22`, color: GROUP_COLORS[m.group] ?? '#ffb4c6' }}>
                      {m.type}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{m.framework}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{m.latency}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{m.qps.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: m.accuracy > 95 ? '#22c55e' : m.accuracy > 85 ? '#ff7a95' : '#f59e0b' }}>{m.accuracy}%</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.lastTrain}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.version}</td>
                  <td style={{ fontSize: '0.68rem', color: 'var(--text-muted)', maxWidth: 200 }}>{m.agents}</td>
                  <td><span className="status-badge running"><span className="status-dot running" />在线</span></td>
                  <td><ChevronRight size={14} color="var(--text-muted)" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── 🔄 飞轮阶段 × 模型覆盖矩阵 ──────────────────────────── */}
        <div className="card" style={{ marginTop: 24, border: '1px solid rgba(14,165,233,0.2)', background: 'rgba(14,165,233,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: '1.1rem' }}>🔄</span>
            <div>
              <div className="section-title" style={{ marginBottom: 2, color: '#0ea5e9' }}>AI飞轮 × 模型覆盖矩阵</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>每个飞轮阶段由哪些AI模型驱动 · 点击模型名称查看详情</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {[
              { stage: '🎨 内容生产', color: '#ec4899', models: ['ContentLLM-Finetuned', 'ImageGen-BeautySDXL', 'VideoHighlight-Detector', 'HookQuality-BERT', 'ComplianceNLP', 'TrendForecaster', 'UGCQuality-Ranker'] },
              { stage: '🚀 投放分发', color: '#f59e0b', models: ['CTR-Predictor-DeepFM', 'BidOptimizer-DQN', 'TrafficPacing-RL', 'CreativeFatigue-MAB', 'BudgetMO-Optimizer', 'AudienceCluster-KM', 'Lookalike-Expander'] },
              { stage: '📊 效果采集', color: '#10b981', models: ['Attribution-Shapley', 'AnomalyDetector-LSTM', 'BayesianAB-Engine', 'MetaCAPI-Attribution', 'MultiCurrency-ROAS', 'FraudDetector-XGB'] },
              { stage: '👤 用户转化', color: '#6366f1', models: ['CVR-Predictor-ESMM', 'LTV-Predictor-DNN', 'UserLTV-Predictor', 'RepurchaseValue-Predictor-90D', 'NewSKU-ColdStart', 'ChurnPredictor-GBM'] },
              { stage: '🔄 私域沉淀', color: '#e8365d', models: ['DeepFM-RecSys', 'Item2Vec-EmbedRec', 'RFM-Clustering', 'SentimentNLP-Analyzer', 'KOLScore-MultiDim', 'ViralCoef-Tracker', 'CohortAnalyzer'] },
              { stage: '📈 数据反哺', color: '#0ea5e9', models: ['UserLTV-Predictor', 'BayesianAB-Engine', 'TrendForecaster', 'AnomalyDetector-LSTM', 'CohortAnalyzer', 'CompetitorIntel-NLP'] },
            ].map((s, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 10, borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: s.color, marginBottom: 10 }}>{s.stage}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {s.models.map(m => (
                    <button key={m} onClick={() => { const found = models.find(x => x.name === m); if (found) setSelectedModel(found) }} style={{
                      padding: '3px 8px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 600, cursor: 'pointer',
                      background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}30`,
                      fontFamily: 'monospace', transition: 'all 0.12s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${s.color}25` }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${s.color}12` }}
                    >{m}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 🌍 全球化模型专区 ─────────────────────────────────────── */}
        <div className="card" style={{ marginTop: 24, border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: '1.2rem' }}>🌍</span>
            <div>
              <div className="section-title" style={{ marginBottom: 2, color: '#0ea5e9' }}>全球化 AI 模型</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>支持国际市场投放、隐私合规、跨文化内容适配、多币种归因，覆盖 TikTok Global / Meta / Google 全球广告平台</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {models.filter(m => m.group === '全球化').map((m) => (
              <div key={m.name} onClick={() => setSelectedModel(m)} style={{
                background: 'var(--bg-card)', borderRadius: 12, padding: '14px 16px',
                border: '1px solid rgba(14,165,233,0.2)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.5)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(14,165,233,0.12)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.2)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ padding: '1px 7px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(14,165,233,0.15)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.3)' }}>全球化</span>
                      <span style={{ fontSize: '0.62rem', color: '#22c55e', fontWeight: 600 }}>● 在线</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{m.type}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.name}</div>
                  </div>
                  <ModelBadge name={m.name} color="#0ea5e9" />
                </div>

                {/* Metrics row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 10 }}>
                  {[
                    { label: '延迟', value: m.latency, color: '#e8365d' },
                    { label: 'QPS', value: `${(m.qps / 1000).toFixed(1)}K`, color: '#3b82f6' },
                    { label: '准确率', value: `${m.accuracy}%`, color: m.accuracy > 85 ? '#22c55e' : '#f59e0b' },
                  ].map(kpi => (
                    <div key={kpi.label} style={{ background: 'var(--bg-primary)', borderRadius: 7, padding: '7px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: 2 }}>{kpi.label}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: kpi.color, fontFamily: 'monospace' }}>{kpi.value}</div>
                    </div>
                  ))}
                </div>

                {/* Framework & version */}
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'monospace', lineHeight: 1.5, marginBottom: 8, background: 'var(--bg-primary)', borderRadius: 6, padding: '6px 8px' }}>
                  {m.framework}
                </div>

                {/* Version & last train */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <RefreshCw size={10} color="#22c55e" />
                    <span style={{ fontSize: '0.62rem', color: '#22c55e', fontWeight: 600 }}>{m.lastTrain}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Database size={10} color="#0ea5e9" />
                    <span style={{ fontSize: '0.62rem', color: '#0ea5e9', fontFamily: 'monospace', fontWeight: 600 }}>{m.version}</span>
                  </div>
                </div>

                {/* Agent use cases */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {m.agents.split('、').map((agent, i) => (
                    <span key={i} style={{ padding: '2px 7px', borderRadius: 4, fontSize: '0.6rem', fontWeight: 500, background: 'rgba(14,165,233,0.08)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.2)' }}>
                      {agent.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 模型详情侧滑面板 ── */}
      {selectedModel && (
        <>
          <div onClick={() => setSelectedModel(null)} style={{
            position: 'fixed', inset: 0, zIndex: 199,
            background: 'rgba(30,5,15,0.25)', backdropFilter: 'blur(3px)',
          }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 520,
            zIndex: 200, background: 'var(--bg-primary)',
            borderLeft: '1px solid var(--border)',
            boxShadow: '-8px 0 32px rgba(61,10,26,0.14)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.22s ease-out',
            overflowY: 'auto',
          }}>
            {/* 头部 */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', background: `${GROUP_COLORS[selectedModel.group] ?? '#e8365d'}0a`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ padding: '2px 9px', borderRadius: 5, fontSize: '0.68rem', fontWeight: 700,
                      background: `${GROUP_COLORS[selectedModel.group] ?? '#e8365d'}22`,
                      color: GROUP_COLORS[selectedModel.group] ?? '#e8365d',
                      border: `1px solid ${GROUP_COLORS[selectedModel.group] ?? '#e8365d'}44` }}>
                      {selectedModel.group}
                    </span>
                    <span className="status-badge running"><span className="status-dot running" />在线</span>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{selectedModel.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{selectedModel.type}</div>
                </div>
                <button onClick={() => setSelectedModel(null)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={15} color="var(--text-muted)" />
                </button>
              </div>
            </div>

            {/* 核心指标 */}
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, borderBottom: '1px solid var(--border)' }}>
              {[
                { label: '推理延迟', value: selectedModel.latency, icon: <Zap size={14} color="#e8365d" />, color: '#e8365d' },
                { label: '峰值 QPS', value: selectedModel.qps.toLocaleString(), icon: <Activity size={14} color="#3b82f6" />, color: '#3b82f6' },
                { label: '准确率', value: `${selectedModel.accuracy}%`, icon: <TrendingUp size={14} color="#22c55e" />, color: selectedModel.accuracy > 95 ? '#22c55e' : selectedModel.accuracy > 85 ? '#ff7a95' : '#f59e0b' },
              ].map(kpi => (
                <div key={kpi.label} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>{kpi.icon}<span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{kpi.label}</span></div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: kpi.color, fontFamily: 'monospace' }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* 详情内容 */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 框架 */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Brain size={14} color="#8b5cf6" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>模型框架</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontFamily: 'monospace' }}>{selectedModel.framework}</div>
              </div>

              {/* 训练与版本 */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <RefreshCw size={14} color="#06b6d4" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>训练 & 版本</span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>最近训练</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#22c55e' }}>{selectedModel.lastTrain}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>当前版本</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{selectedModel.version}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 2 }}>推理服务</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3b82f6' }}>Triton Server</div>
                  </div>
                </div>
              </div>

              {/* 准确率进度条 */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <BarChart3 size={14} color="#f59e0b" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>性能指标</span>
                </div>
                {[
                  { label: '准确率', val: selectedModel.accuracy, max: 100, color: selectedModel.accuracy > 95 ? '#22c55e' : selectedModel.accuracy > 85 ? '#e8365d' : '#f59e0b' },
                  { label: '服务可用性', val: 99.97, max: 100, color: '#22c55e' },
                  { label: '缓存命中率', val: Math.min(96, selectedModel.accuracy + 8), max: 100, color: '#3b82f6' },
                ].map(bar => (
                  <div key={bar.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{bar.label}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: bar.color }}>{bar.val}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-primary)' }}>
                      <div style={{ height: '100%', width: `${bar.val}%`, borderRadius: 3, background: bar.color, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* A/B 版本对比 */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>A/B 版本对比</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: `当前 ${selectedModel.version}`, val: `AUC ${(selectedModel.accuracy / 100 * 0.85).toFixed(3)}`, color: '#22c55e' },
                    { label: `上一版本`, val: `AUC ${((selectedModel.accuracy - 1.5) / 100 * 0.85).toFixed(3)}`, color: '#94a3b8' },
                  ].map(v => (
                    <div key={v.label} style={{ textAlign: 'center', padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4 }}>{v.label}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: v.color, fontFamily: 'monospace' }}>{v.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 覆盖智能体 */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Database size={14} color="#e8365d" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>覆盖智能体 & 模块</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedModel.agents.split('、').map((agent, i) => (
                    <span key={i} style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 500,
                      background: 'rgba(232,54,93,0.08)', color: '#e8365d', border: '1px solid rgba(232,54,93,0.18)' }}>
                      {agent.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* 特征重要性（可折叠） */}
              {showFeature && (
                <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6366f1', marginBottom: 12 }}>Top 10 特征重要性</div>
                  {(FEATURE_MAP[selectedModel.group] ?? FEATURE_MAP['投放优化']).map((f, i) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', width: 16, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', flex: 1 }}>{f}</span>
                      <div style={{ width: 72, height: 5, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${100 - i * 9}%`, height: '100%', background: '#6366f1', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#6366f1', minWidth: 32, textAlign: 'right', fontFamily: 'monospace' }}>{(10 - i * 0.8).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 回滚确认框 */}
              {showRollbackConfirm && (
                <div style={{ background: 'rgba(249,115,22,0.08)', borderRadius: 10, padding: '14px 16px', border: '1px solid rgba(249,115,22,0.3)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f97316', marginBottom: 6 }}>⚠️ 确认回滚？</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                    将回滚至上一稳定版本，当前 {selectedModel.version} 将停止推理服务，约需 2 分钟。
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setShowRollbackConfirm(false); fireToast('✅ 回滚任务已提交，预计 2 分钟内完成，旧版本将自动恢复服务', '#f97316') }}
                      style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#f97316', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                      确认回滚
                    </button>
                    <button onClick={() => setShowRollbackConfirm(false)}
                      style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}>
                      取消
                    </button>
                  </div>
                </div>
              )}

              {/* 操作按钮组 */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 8 }}>
                {[
                  {
                    label: '部署新版本', color: '#e8365d',
                    onClick: () => fireToast('🚀 部署任务已提交！新版本灰度发布中，预计 5 分钟完成，当前版本继续服务...'),
                  },
                  {
                    label: '回滚', color: '#f97316',
                    onClick: () => { setShowRollbackConfirm(v => !v); setShowFeature(false) },
                  },
                  {
                    label: retraining ? '排队中...' : '触发重训练', color: '#3b82f6',
                    disabled: retraining,
                    onClick: () => {
                      if (retraining) return
                      setRetraining(true)
                      fireToast('🔄 重训练任务已加入队列，位置 #4，预计等待 2.1h，完成后自动通知', '#3b82f6')
                      setTimeout(() => setRetraining(false), 5000)
                    },
                  },
                  {
                    label: '查看特征', color: '#6366f1',
                    active: showFeature,
                    onClick: () => { setShowFeature(v => !v); setShowRollbackConfirm(false) },
                  },
                ].map(btn => (
                  <button key={btn.label}
                    disabled={btn.disabled}
                    onClick={btn.onClick}
                    style={{
                      padding: '8px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: btn.disabled ? 'not-allowed' : 'pointer',
                      border: `1px solid ${btn.color}`,
                      background: btn.active ? btn.color : `${btn.color}18`,
                      color: btn.active ? '#fff' : (btn.disabled ? '#94a3b8' : btn.color),
                      transition: 'all 0.15s',
                    }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast 通知 */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
          background: toast.color, color: '#fff',
          padding: '12px 20px', borderRadius: 12,
          fontSize: '0.82rem', fontWeight: 600,
          boxShadow: `0 8px 24px ${toast.color}55`,
          animation: 'slideInRight 0.25s ease',
          maxWidth: 380,
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}

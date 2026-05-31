import type { PlaygroundAgentType } from './agentPlaygroundApi'

export type NewAgentCatalogItem = {
  key: PlaygroundAgentType
  id: number
  name: string
  description: string
  clusterLabel: string
  subGroup: string
  agentDefId: string
  iconEmoji: string
  capabilityCount: number
  domain: string
  tags: string[]
}

export const RUNNABLE_AGENT_PRESETS: NewAgentCatalogItem[] = [
  {
    key: 'video-deconstruction',
    id: 9001,
    name: '视频拆解 Agent',
    description: '负责视频理解、标签沉淀与知识生产，可直接提交本地视频或 URL 发起异步拆解。',
    clusterLabel: '视频理解 / 知识沉淀',
    subGroup: 'Agent A',
    agentDefId: 'video-deconstruction-runtime',
    iconEmoji: '🎥',
    capabilityCount: 5,
    domain: '视频理解',
    tags: ['异步任务', '知识沉淀', 'OCR', 'ASR', '模式识别'],
  },
  {
    key: 'content-structure-card',
    id: 9002,
    name: '结构卡 Agent',
    description: '负责生成结构卡与逻辑链路，适合作为脚本蓝图前的过渡能力与调试入口。',
    clusterLabel: '内容生产 / 结构卡',
    subGroup: '过渡能力',
    agentDefId: 'content-structure-card-runtime',
    iconEmoji: '🧩',
    capabilityCount: 4,
    domain: '内容生产',
    tags: ['结构卡', '逻辑链路', '过渡能力', '内容分析'],
  },
  {
    key: 'script-blueprint',
    id: 9003,
    name: '脚本蓝图 Agent',
    description: '基于商品信息与知识库模式生成语义蓝图，作为 Agent B 的核心在线生产能力。',
    clusterLabel: '内容生产 / 语义蓝图',
    subGroup: 'Agent B',
    agentDefId: 'script-blueprint-runtime',
    iconEmoji: '⚡',
    capabilityCount: 4,
    domain: '脚本生成',
    tags: ['语义蓝图', '商品输入', '模板推荐', '知识库消费'],
  },
  {
    key: 'video-assembly',
    id: 9004,
    name: '视频装配 Agent',
    description: '基于脚本蓝图进行候选召回、片段匹配与装配方案生成，作为 Agent C 的执行入口。',
    clusterLabel: '内容生产 / 视频装配',
    subGroup: 'Agent C',
    agentDefId: 'video-assembly-runtime',
    iconEmoji: '🎬',
    capabilityCount: 4,
    domain: '视频组装',
    tags: ['片段召回', '相似匹配', '装配方案', '执行产物'],
  },
  {
    key: 'beukay-claw',
    id: 9005,
    name: 'Beukay agent',
    description: '基于 Hermes 的总控智能体，可在对话中自动调度已接入内容能力。',
    clusterLabel: '营销对话',
    subGroup: '实时对话',
    agentDefId: 'beukay-claw-runtime',
    iconEmoji: '💄',
    capabilityCount: 3,
    domain: '营销对话',
    tags: ['问答', '分析', '策略调试'],
  },
  {
    key: 'qianchuan-delivery',
    id: 9006,
    name: '千川投放 Agent',
    description: '负责将视频素材投放至巨量千川（抖音系），可创建广告计划、设置定向人群、管理日预算与出价策略。',
    clusterLabel: '投放管理 / 千川投放',
    subGroup: '千川 Agent',
    agentDefId: 'qianchuan-delivery-v1',
    iconEmoji: '📡',
    capabilityCount: 5,
    domain: '广告投放',
    tags: ['千川', '素材投放', '计划创建', '预算管理', '出价优化'],
  },
  {
    key: 'qianchuan-data',
    id: 9007,
    name: '千川数据 Agent',
    description: '负责从巨量千川获取已投放广告的数据表现，分析 ROI、CTR、GPM 等核心指标，分析结果可回写至视频效果记录。',
    clusterLabel: '数据分析 / 千川数据',
    subGroup: '千川 Agent',
    agentDefId: 'qianchuan-data-v1',
    iconEmoji: '📊',
    capabilityCount: 4,
    domain: '数据分析',
    tags: ['千川', '投放数据', 'ROI分析', '素材报表', '数据回写'],
  },
]

export function findRunnablePreset(agentType: PlaygroundAgentType | null | undefined) {
  if (!agentType) return null
  return RUNNABLE_AGENT_PRESETS.find((preset) => preset.key === agentType) ?? null
}

export type RunnableAgentMetadataInput = {
  name?: string | null
  description?: string | null
  agentDefId?: string | null
  agentUniqueId?: string | null
}

export type RunnableAgentDisplayMetadataInput = RunnableAgentMetadataInput & {
  backendName?: string | null
  backendDescription?: string | null
}

function normalizeText(value?: string | null) {
  return (value ?? '').toLowerCase()
}

function findRunnablePresetByRuntimeId(value?: string | null) {
  if (!value) return null
  return RUNNABLE_AGENT_PRESETS.find((preset) => preset.agentDefId === value || preset.key === value) ?? null
}

export function inferRunnableAgentTypeFromMetadata(input: RunnableAgentMetadataInput): PlaygroundAgentType | null {
  const explicitPreset = findRunnablePresetByRuntimeId(input.agentDefId) ?? findRunnablePresetByRuntimeId(input.agentUniqueId)
  if (explicitPreset) return explicitPreset.key

  const text = [
    input.name,
    input.agentDefId,
    input.description,
    input.agentUniqueId,
  ].map(normalizeText).join(' ')

  if (text.includes('beukay-claw') || text.includes('claw')) return 'beukay-claw'
  if (text.includes('qianchuan-delivery') || text.includes('千川投放')) return 'qianchuan-delivery'
  if (text.includes('qianchuan-data') || text.includes('千川数据')) return 'qianchuan-data'
  if (text.includes('assembly') || text.includes('视频装配') || text.includes('videoassembly')) return 'video-assembly'
  if (text.includes('blueprint') || text.includes('脚本蓝图') || text.includes('script')) return 'script-blueprint'
  if (text.includes('structure') || text.includes('结构卡')) return 'content-structure-card'
  if (text.includes('deconstruction') || text.includes('拆解') || text.includes('video')) return 'video-deconstruction'
  return null
}

export function resolveRunnableAgentDisplayMetadata(input: RunnableAgentDisplayMetadataInput) {
  const agentType = inferRunnableAgentTypeFromMetadata(input)
  const preset = findRunnablePreset(agentType)
  return {
    agentType,
    preset,
    name: preset?.name ?? input.backendName ?? input.name ?? '未命名 Agent',
    description: preset?.description ?? input.backendDescription ?? input.description ?? '暂无描述',
  }
}

export function getNewAgentDetailPath(agentType: PlaygroundAgentType) {
  return `/agent-playground/${agentType}`
}

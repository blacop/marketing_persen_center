/**
 * 视频矩阵 (Cutmatrix) 工具元数据
 * 18 张卡：10 个工作流（端到端编排）+ 8 个小工具（原子能力）
 *
 * 命名空间隔离：所有 key 以 cm- 前缀，与现有 agent-a / agent-b / agent-c 业务体系互不影响
 */

export type CmStatus = '已上线' | '内测中' | '规划中' | '不支持'
export type CmIO = 'audio' | 'video' | 'text' | 'image' | 'subtitle' | 'archive'
export type CmCategory = 'workflow' | 'tool'

export interface CmCard {
  /** 全局唯一 key, 路由参数 */
  key: string
  /** 中文名 */
  name: string
  /** 一句话描述（自写, 不引用 autocut 原文） */
  desc: string
  /** 二级分类标签（业务场景） */
  scenes: string[]
  /** 当前状态 */
  status: CmStatus
  /** 输入类型 */
  inputs: CmIO[]
  /** 输出类型 */
  outputs: CmIO[]
  /** 玛丽黛佳特化标记 */
  highlight?: boolean
  /** 后端 API 路径（暂未实现的留空） */
  backendPath?: string
  /** 端到端流程中的步骤序号 (1-7)，用于"复刻管线"展示 */
  pipelineStep?: number
  /** Step 4/7 这种分支步骤的子标签 */
  pipelineSubStep?: string
}

// ─── 工作流（11 张，端到端编排） ─────────────────────────────────────
// 顺序：提取视频及文案 → 文案裂变 → 语音合成 → 按语义拆解视频 → 按场景拆解视频 → 按章节混剪 → 整段配音驱动混剪 → 其余
export const CM_WORKFLOWS: CmCard[] = [
  {
    key: 'link-ingest',
    name: '提取视频及文案',
    desc: '粘贴 top 视频链接，批量抓取无水印媒体并自动转写口播文案入库。',
    scenes: ['素材采集', '文案灵感'],
    status: '内测中',
    backendPath: '/cm/link-ingest/create',
    inputs: ['text'],
    outputs: ['video', 'text'],
    pipelineStep: 1,
  },
  {
    key: 'script-fission',
    name: '文案裂变',
    desc: '原始文案 → 整片改写 / 分镜级改写 / 多空分镜 三种模式。',
    scenes: ['口播裂变', '短视频脚本'],
    status: '内测中',
    inputs: ['text'],
    outputs: ['text'],
    pipelineStep: 2,
  },
  {
    key: 'tts-batch',
    name: '语音合成',
    desc: '导入裂变后文案 + 选音色和语速 → 批量生成配音素材。',
    scenes: ['口播裂变', '短视频脚本'],
    status: '内测中',
    inputs: ['text'],
    outputs: ['audio'],
    pipelineStep: 3,
  },
  {
    key: 'semantic-split',
    name: '按语义拆解视频',
    desc: '分析口播 → 按语义边界拆 → 自动归类到目标主题。支持直播切片 / 短视频精细化两种模式。',
    scenes: ['直播拆解', '切片制作', '主题归类'],
    status: '内测中',
    inputs: ['video'],
    outputs: ['video'],
    backendPath: '/cm/semantic/split',
    pipelineStep: 6,
    pipelineSubStep: '4b/6',
  },
  {
    key: 'scene-split',
    name: '按场景拆解视频',
    desc: '导入素材 + 目标章节结构，自动识别场景边界并拆成独立镜头，支持手动调整。',
    scenes: ['素材整理', '分镜拆解'],
    status: '内测中',
    inputs: ['video'],
    outputs: ['video'],
    backendPath: '/cm/tool/sceneSplit',
    pipelineStep: 4,
    pipelineSubStep: '4a',
  },
  {
    key: 'zhuge-mode',
    name: '按章节混剪',
    desc: '按章节高质量混剪：每章节独立画面 + 独立配音，颗粒度更细，画面与配音双重变量。',
    scenes: ['多卖点拼接', '电商带货', '种草内容'],
    status: '内测中',
    inputs: ['audio', 'video'],
    outputs: ['video'],
    backendPath: '/cm/compose/zhuge',
    pipelineStep: 7,
    pipelineSubStep: '7a',
  },
  {
    key: 'sunwukong-mode',
    name: '整段配音驱动混剪',
    desc: '整段配音驱动：以完整配音为骨架，从分镜池随机抽取画面填充至音频时长，强调叙事连贯。',
    scenes: ['整段解说', '直播集锦', '信息流'],
    status: '规划中',
    inputs: ['audio', 'video'],
    outputs: ['video'],
    backendPath: '/cm/compose/sunwukong',
    pipelineStep: 7,
    pipelineSubStep: '7b',
  },
  {
    key: 'silence-filter',
    name: '极速过滤',
    desc: '批量识别静音段与停顿，一键剔除无效片段，让镜头库更紧凑。',
    scenes: ['素材清洗', '直播切片', '口播预处理'],
    status: '内测中',
    inputs: ['audio', 'video'],
    outputs: ['video'],
    backendPath: '/cm/tool/silenceFilter',
  },
  {
    key: 'live-loop',
    name: '拆解电商直播话术循环',
    desc: '检测达人开始重复讲解的边界 — 前后两段语义一致才视为新一轮循环；非重复内容全部归一个循环。勾选后批量切片导出。',
    scenes: ['电商直播预处理'],
    status: '内测中',
    inputs: ['video'],
    outputs: ['video'],
    backendPath: '/cm/live-loop/detect',
    pipelineStep: 4,
    pipelineSubStep: '4c',
  },
  {
    key: 'chapter-extract',
    name: '提取章节结构',
    desc: '导入音视频 → 转写口播 → 输出章节文件夹树。先做粗框架拆分，再喂给「按章节混剪」/「整段配音驱动混剪」。',
    scenes: ['脚本整理', '直播拆解', '素材归档'],
    status: '内测中',
    inputs: ['audio', 'video'],
    outputs: ['archive'],
    backendPath: '/cm/chapter-extract/run',
    pipelineStep: 5,
  },
  {
    key: 'compliance-audit',
    name: '话术合规审核',
    desc: '上传或粘贴文案，依据《广告法》扫描违规风险，标记风险句并生成修改建议。',
    scenes: ['投放前审核', '广告合规', '风险拦截'],
    status: '内测中',
    inputs: ['text'],
    outputs: ['text'],
    backendPath: '/cm/compliance/audit',
  },
]

// ─── 小工具（7 张，原子单点能力。skip 浏览器分身） ────────────────────
export const CM_TOOLS: CmCard[] = [
  {
    key: 'subtitle-erase',
    name: '擦除字幕',
    desc: '批量擦除视频中硬编码字幕，可自定义擦除区域。支持本地 AI / 阿里云智能 / FFmpeg 三种擦除方式。',
    scenes: ['素材清洗'],
    status: '内测中',
    inputs: ['video'],
    outputs: ['video'],
  },
  {
    key: 'subtitle-gen',
    name: '生成字幕',
    desc: '批量为视频生成字幕并导出 VTT/SRT，主流剪辑软件可直接导入，可选硬烧字幕到视频。',
    scenes: ['后期处理', '多语言适配'],
    status: '内测中',
    inputs: ['video'],
    outputs: ['subtitle', 'video'],
    backendPath: '/cm/tool/subtitleGen',
  },
  {
    key: 'aspect-convert',
    name: '转换比例',
    desc: '批量转换视频画幅比例或尺寸，适配多平台投放规格。',
    scenes: ['多平台分发'],
    status: '内测中',
    inputs: ['video'],
    outputs: ['video'],
    backendPath: '/cm/tool/aspectConvert',
  },
  {
    key: 'audio-ops',
    name: '操作视频声音',
    desc: '批量去除原声、添加 BGM、调整音量、添加音效。',
    scenes: ['后期处理', '电商视频'],
    status: '内测中',
    inputs: ['audio', 'video'],
    outputs: ['video'],
    backendPath: '/cm/tool/audioOps',
  },
  {
    key: 'uniform-split',
    name: '平均切分',
    desc: '按时长平均切分素材，一次生成多个等长切片。',
    scenes: ['素材切片'],
    status: '内测中',
    inputs: ['audio', 'video'],
    outputs: ['video'],
    backendPath: '/cm/tool/uniformSplit',
  },
  {
    key: 'add-bg',
    name: '添加背景',
    desc: '把视频铺到指定背景上（图片或纯色），输出指定尺寸，电商视频包装首选。',
    scenes: ['电商视频包装'],
    status: '内测中',
    inputs: ['video'],
    outputs: ['video'],
    backendPath: '/cm/tool/addBg',
  },
  {
    key: 'text-style-fission',
    name: '裂变文字样式',
    desc: '在视频上叠加 N 种风格文字版本（震撼/少女/商务），一键产出多版本素材。',
    scenes: ['电商视频包装'],
    status: '内测中',
    inputs: ['video'],
    outputs: ['video'],
    backendPath: '/cm/tool/textStyleFission',
  },
]

export const CM_ALL: CmCard[] = [...CM_WORKFLOWS, ...CM_TOOLS]

export function findCmCard(key: string): CmCard | undefined {
  return CM_ALL.find(c => c.key === key)
}

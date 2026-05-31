import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Upload, Video, Plus, Trash2, X, Loader,
  CheckCircle2, FileText, FolderDown,
  Radio, Monitor, ShoppingBag, RotateCw,
  ChevronDown, ChevronRight, Clock, Layers, Undo2, Redo2,
} from 'lucide-react'
import JSZip from 'jszip'
import { cmRemote, type ChapterExtractChapter } from '../../../lib/cm/cmApi'

// ─── 类型定义 ─────────────────────────────────────────────────────────────────

export type ChapterType =
  | 'live-xiaoa'
  | 'live-ecommerce'
  | 'meeting'
  | 'short-fixed'
  | 'short-ecommerce'

interface TypeInfo {
  key: ChapterType
  category: '直播切片' | '会议切片' | '短视频'
  label: string
  desc: string
  minSec: number
  maxSec: number
  durLabel: string
  disabled?: boolean
}

const TYPE_INFO: Record<ChapterType, TypeInfo> = {
  'live-xiaoa': {
    key: 'live-xiaoa', category: '直播切片',
    label: '小a同学直播切片专属',
    desc: '为小a同学定制的直播切片方案，识别商品话术循环，自动分类章节结构。',
    minSec: 30, maxSec: 5 * 3600, durLabel: '00:30 - 5:00:00',
  },
  'live-ecommerce': {
    key: 'live-ecommerce', category: '直播切片',
    label: '电商直播拆解专家',
    desc: '适合电商直播录像，识别引导/展示/促单话术段落，输出章节文件夹树。',
    minSec: 30, maxSec: 5 * 3600, durLabel: '00:30 - 5:00:00',
  },
  'meeting': {
    key: 'meeting', category: '会议切片',
    label: '会议切片',
    desc: '适合会议/培训录像，按议题或发言人识别段落，生成结构化章节笔记。',
    minSec: 30, maxSec: 5 * 3600, durLabel: '00:30 - 5:00:00',
  },
  'short-fixed': {
    key: 'short-fixed', category: '短视频',
    label: '固定场景文案拆分',
    desc: '按场景模板拆分口播文案：选定场景结构（钩子/痛点/卖点/CTA 等），自动识别并归类各段落。',
    minSec: 30, maxSec: 5 * 3600, durLabel: '00:30 - 5:00:00',
  },
  'short-ecommerce': {
    key: 'short-ecommerce', category: '短视频',
    label: '短视频带货文案拆解专家',
    desc: '识别短视频口播结构（钩子/卖点/转化），精准链接对应视频片段。',
    minSec: 10, maxSec: 3600, durLabel: '00:10 - 1:00:00',
  },
}

const TYPE_GROUPS: { category: TypeInfo['category']; icon: React.ElementType; color: string; types: ChapterType[] }[] = [
  { category: '直播切片', icon: Radio,     color: '#f59e0b', types: ['live-xiaoa', 'live-ecommerce'] },
  { category: '会议切片', icon: Monitor,   color: 'var(--info)', types: ['meeting'] },
  { category: '短视频',   icon: ShoppingBag, color: '#14b8a6', types: ['short-fixed', 'short-ecommerce'] },
]

// ─── 章节数据 ─────────────────────────────────────────────────────────────────

interface Chapter extends ChapterExtractChapter {
  color: string
}

interface TargetFolder {
  id: string
  name: string
  keywords?: string
}

type MatStatus = 'draft' | 'uploading' | 'processing' | 'done' | 'failed'

interface Material {
  id: string
  fileName: string
  size: number
  status: MatStatus
  assetCode?: string
  streamUrl?: string
  durationSec?: number
  chapters?: Chapter[]
  errMsg?: string
}

// ─── 固定场景模板 ─────────────────────────────────────────────────────────────

interface SceneTemplateScene {
  code: string
  name: string
  color: string
  desc: string
}

interface SceneTemplate {
  id: string
  name: string
  desc: string
  scenes: SceneTemplateScene[]
}

const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: 'ecom-standard',
    name: '电商种草标准版',
    desc: '6 段覆盖完整销售链路，适合美妆/食品/消费品种草短视频',
    scenes: [
      { code: 'hook',    name: '钩子开场', color: '#ef4444', desc: '强吸引力开场，引发好奇' },
      { code: 'pain',    name: '痛点引入', color: '#f97316', desc: '点明目标用户的问题/需求' },
      { code: 'product', name: '产品介绍', color: '#f59e0b', desc: '产品亮相、核心成分/功能' },
      { code: 'benefit', name: '卖点展示', color: '#22c55e', desc: '具体卖点演示、数据背书' },
      { code: 'proof',   name: '效果展示', color: '#14b8a6', desc: '使用前后对比、用户反馈' },
      { code: 'cta',     name: '促单 CTA', color: 'var(--accent-primary)', desc: '限时优惠、引导下单/关注' },
    ],
  },
  {
    id: 'short-sell',
    name: '短视频带货精简版',
    desc: '4 段极简结构，适合 15-60 秒带货短视频',
    scenes: [
      { code: 'hook',    name: '钩子开场', color: '#ef4444', desc: '3 秒抓住注意力' },
      { code: 'product', name: '产品亮相', color: '#f59e0b', desc: '产品核心价值一句话' },
      { code: 'demo',    name: '效果演示', color: '#14b8a6', desc: '视觉冲击，快速展示结果' },
      { code: 'cta',     name: '购买引导', color: 'var(--accent-primary)', desc: '优惠/限量/链接引导' },
    ],
  },
  {
    id: 'problem-solution',
    name: '问题解决方案版',
    desc: '5 段经典结构，适合教育/工具/服务类短视频',
    scenes: [
      { code: 'hook',     name: '钩子开场', color: '#ef4444', desc: '反常识观点或惊人数据' },
      { code: 'problem',  name: '问题描述', color: '#f97316', desc: '细化痛点，引发共鸣' },
      { code: 'solution', name: '解决方案', color: '#f59e0b', desc: '逻辑拆解，提供价值' },
      { code: 'product',  name: '产品植入', color: '#22c55e', desc: '自然引出产品或服务' },
      { code: 'cta',      name: '行动引导', color: 'var(--accent-primary)', desc: '关注/评论/购买' },
    ],
  },
  {
    id: 'brand-story',
    name: '品牌故事版',
    desc: '4 段叙事结构，适合品牌宣传/创始人故事',
    scenes: [
      { code: 'story',   name: '品牌故事', color: 'var(--info)', desc: '创始初心或品牌起源' },
      { code: 'product', name: '产品矩阵', color: '#14b8a6', desc: '核心产品线展示' },
      { code: 'proof',   name: '用户口碑', color: '#22c55e', desc: '真实用户声音/数据' },
      { code: 'slogan',  name: '品牌主张', color: '#f59e0b', desc: '品牌价值观收尾' },
    ],
  },
]

const TEMPLATE_STORE_KEY = 'cm_chex_tpl_short-fixed'

// ─── 常量 & 工具 ──────────────────────────────────────────────────────────────

const CHAP_COLORS = [
  '#14b8a6', '#f59e0b', 'var(--accent-primary)', '#ef4444',
  '#3b82f6', '#ec4899', '#22c55e', '#f97316',
  '#0ea5e9', 'var(--accent-light)',
]

const STATUS_COLORS: Record<MatStatus, string> = {
  draft: '#94a3b8', uploading: '#60a5fa', processing: '#f59e0b', done: '#22c55e', failed: '#ef4444',
}
const STATUS_LABELS: Record<MatStatus, string> = {
  draft: '草稿', uploading: '上传中', processing: '处理中', done: '已完成', failed: '失败',
}

function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
function fmtDur(sec: number): string {
  if (!sec || isNaN(sec)) return '--:--'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
function fmtSize(b: number) {
  if (b < 1024) return `${b}B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`
  return `${(b / 1048576).toFixed(1)}MB`
}
// ─── Mock 章节数据（后端未就绪时兜底） ────────────────────────────────────────

interface MockChap { title: string; caption: string; tags: string[]; editingGuide?: string; productName?: string }

const MOCK_CHAPTERS_BY_TYPE: Record<ChapterType, MockChap[]> = {
  'live-xiaoa': [
    {
      title: '传统定妆粉导致皮肤干燥', productName: '气垫底妆',
      caption: '嗯，涂完定妆，你脸上所有的光泽水分全被定妆粉吸走。定妆粉吸走了以后，来，8060708090，90年龄了你，我嗯，你用完定妆粉的脸，你不敢笑。',
      tags: ['痛点', '定妆粉'],
      editingGuide: '特写镜头：主播用粉扑蘸取大量定妆粉按压在脸上，面部瞬间失去光泽、皮肤纹理变明显。节奏：慢放 0.8x，配合"吸走"口播时给特效高光消失的转场。',
    },
    {
      title: '定妆粉加深皱纹与加速衰老', productName: '气垫底妆',
      caption: '就是定妆粉，无论是多大牌的，你是国际大牌也好，你是什么也好，就是它会让你的这张脸细纹变深纹，假性皱纹你就很快变真性皱纹。',
      tags: ['痛点', '皱纹', '衰老'],
      editingGuide: '主播侧脸特写，模拟微笑动作，镜头聚焦于眼周和法令纹处，展示干纹和褶子被定妆粉凸显的效果。配合"皱纹"关键词出现时叠加红色标注框。',
    },
    {
      title: '无定妆气垫上妆全脸效果', productName: '气垫底妆',
      caption: '所以说呢，你用这个气垫哦，一一用一个不吱声。也不用定妆，它也不脱妆，它也不氧化，它也不斑驳，也不暗沉，你下午也用不补妆。',
      tags: ['卖点', '气垫', '持妆'],
      editingGuide: '主播全脸正面镜头，皮肤呈现自然光泽感，妆面服帖，无粉感，强调"一用一个不吱声"。推荐在"不脱妆/不氧化/不斑驳"三个关键词分别切 0.5s 特写。',
    },
    {
      title: '气垫持妆不氧化不斑驳效果', productName: '气垫底妆',
      caption: '你用定妆干什么都是多余的！所以说呢，定妆粉这东西，反正在我这，用不太上。',
      tags: ['持妆', '氧化对比'],
      editingGuide: '分屏对比镜头：左半边是刚上妆状态，右半边是模拟下午的持妆状态，两者妆效几乎无差别。字幕强调"0补妆 8小时"数据。',
    },
    {
      title: '痛点文案 AI 生成演示', productName: '气垫底妆',
      caption: '屏幕录屏：在AI文案工具中输入定妆粉相关关键词，一键生成带情绪节奏的口播文案。',
      tags: ['工作流', 'AI工具'],
      editingGuide: '屏幕录屏操作：将竞品视频链接或文案输入AI工具，一键生成"痛点-成分-效果-手法-价格"的结构化分析。建议录制操作过程 30s，加速 2x 播放。',
    },
    {
      title: '实拍素材筛选优化', productName: '气垫底妆',
      caption: '画面展示剪辑师在时间线上拖动、反复播放、暂停，标记有效片段，过程繁琐。素材来源：官方旗舰店直播录像。',
      tags: ['工作流', '素材筛选'],
      editingGuide: '画面展示剪辑师在时间线上拖动、反复播放，标记有效片段。建议剪切该段 OKE 镜头，用于"工作流 before"对比，后接 AI 工具一键操作的"after"镜头。',
    },
    {
      title: '多角色配音音色克隆', productName: '气垫底妆',
      caption: '录屏操作：导入主播一段10秒净音频，训练AI音色模型，生成多版本语速/情绪变体。',
      tags: ['AI配音', '工作流'],
      editingGuide: '录屏操作，导入主播一段净音频，训练AI音色模型。剪辑关键点：同一段文案展示"普通话标准版""粤语版""情绪激昂版"三种变体，快剪 0.5s 各一句对比。',
    },
  ],
  'live-ecommerce': [
    {
      title: '引流开场', productName: '气垫BB霜',
      caption: '好，直播开始了，今天给大家带来一款已经卖出十万套的爆款气垫，今天直播间有史以来最低价。',
      tags: ['引流', '开场'],
      editingGuide: '强开场：主播直视镜头+手持产品特写，0-3秒内出现"史低价"字幕。建议剪去前摇，从"好，直播开始了"起切，保持节奏紧张。',
    },
    {
      title: '产品色号展示', productName: '气垫BB霜',
      caption: '今天给大家带来C00自然色/C01象牙色/W01小麦色/W02蜜棕色四个色号，每款上脸效果都不一样，我来逐一给大家演示。',
      tags: ['色号', '产品展示'],
      editingGuide: '多色号上脸对比：每个色号 5-8 秒特写，统一打光条件，面颊+手背双重对比。剪辑时用色号字幕标注，节奏控制在每色 6s 以内。',
    },
    {
      title: '持妆水润透亮卖点', productName: '气垫BB霜',
      caption: '16小时持妆水润透亮，我来用实验给你们看，这边是普通粉底，这边是我们的气垫，8小时后你们看，差别一下就出来了。',
      tags: ['持妆', '卖点', '对比'],
      editingGuide: '高清特写镜头，对比未上妆的半脸，展示粉底液的服贴度、光泽感和"妈生好皮"质感。推荐 side-by-side 分屏，左"普通粉底"右"我们家气垫"，字幕标注时长。',
    },
    {
      title: '小球藻成分科学背书', productName: '气垫BB霜',
      caption: '特别喜欢它的原因是里面给大家家添加了针叶樱桃发酵精华，你的皮肤不光是上妆，更有容易氧化。',
      tags: ['成分', '科学背书'],
      editingGuide: '成分动画展示：针叶樱桃发酵精华→补水锁水→0.2微米粒径→钻进毛孔。镜头拉近，聚焦于鼻翼、眼下等部位，展示粉底液填平毛孔、遮盖黑眼圈的效果。建议配字幕弹出动效。',
    },
    {
      title: '活动说明与限时福利', productName: '气垫BB霜',
      caption: '今天直播间里，130块钱，你买回去以后可以跟迪嫣进行美好的一款粉底液！买一发五！正价是655，今天在我们直播间里150，点击领取150消费券。',
      tags: ['活动', '优惠', '促单'],
      editingGuide: '字幕强调"买一发五"+"直播间专属150"。建议全屏弹出优惠券样式，主播手指指向屏幕下方购物车。录制操作过程加速 1.5x 播放，突出紧迫感。',
    },
    {
      title: '产品亮相开场钩子', productName: '粉底液',
      caption: '果然持润粉底液——今天直播间专属，拍一发五！含有丰富的小球藻精华，给你的皮肤做到的就是又润又亮又有光泽感。',
      tags: ['开场', '钩子', '粉底液'],
      editingGuide: '主播站立全身镜头→快速推进至面部特写，配"拍一发五"大字幕炸屏效果。建议3秒内完成从全身到面部的快切，节奏要急，吸引注意力。',
    },
    {
      title: '防晒防蹦效果验证', productName: '粉底液',
      caption: '含有成分是防晒的，宝宝们，它是含有防晒成分的。OK，现在对了，今天在我们直播间里面，你们也会给大家做到我们防蹦效果的测试报告，OK，继续，以后大家也会给大家送到我们防蹦测试。',
      tags: ['防晒', '功效验证'],
      editingGuide: '科学验证场景：实验台+检测仪器道具，主播身穿白大褂演示防晒测试。剪辑建议：将"测试报告"画面全屏展示 2 秒，然后快切回主播表情，增强可信度。',
    },
    {
      title: '促单逼单最终冲刺', productName: '粉底液',
      caption: '一号链接！拍一发五，正价是655，今天在我们直播间里面，你们今天在我们直播间里面，130块钱，点击领取直播间消费券150，告诉我你们多少钱到的？三二一，一号链接。',
      tags: ['促单', '逼单', '秒杀'],
      editingGuide: '倒计时字幕全屏展示，主播语速加快，镜头切换频率提升。建议"三二一"配合快切3个不同角度镜头，制造紧迫感。购物车按钮特效高亮闪烁。',
    },
  ],
  'meeting': [
    { title: '会议开场', caption: '好，大家都到了，今天我们主要讨论三个议题：Q2复盘、Q3规划和人员调整。', tags: ['开场'],
      editingGuide: '建议保留开场 30 秒，剪去等待入会的部分。字幕标注三个议题，方便后期检索。' },
    { title: 'Q2业绩复盘', caption: 'Q2整体GMV达到了目标的108%，其中直播渠道增速最快，同比增长了200%。', tags: ['业绩', '数据'],
      editingGuide: '数据汇报段保留完整。建议叠加数字动画字幕（108%/200%），提升数据可视化效果。' },
    { title: '问题与挑战', caption: '但我们也发现了一些问题，主要是退货率偏高和客服响应速度不够快。', tags: ['问题'],
      editingGuide: '问题讨论段可适当剪辑冗余部分，保留核心数据点（退货率/响应速度具体数字）。' },
    { title: 'Q3目标规划', caption: 'Q3我们的目标是GMV环比增长30%，同时把退货率控制在5%以内。', tags: ['目标', '规划'],
      editingGuide: '目标陈述段建议保留完整，字幕标注关键 KPI 指标，方便录屏分享。' },
    { title: '行动计划', caption: '接下来王经理会分享具体的落地方案，包括人员配置和资源分配。', tags: ['行动'],
      editingGuide: '行动计划段如有 PPT 共享，切换为屏幕共享视角并标注发言人。' },
    { title: '总结与安排', caption: '好，今天的会就到这里，大家的任务我会整理成邮件发给大家，有问题随时来找我。', tags: ['总结'],
      editingGuide: '总结段保留完整，建议叠加"行动项清单"字幕，方便与会者回看确认任务。' },
  ],
  'short-fixed': [
    { title: '钩子开场', caption: '你知道吗？90%的人都用错了护肤步骤，今天教你正确的方法。', tags: ['钩子'],
      editingGuide: '前 3 秒必须强吸引力：数字"90%"大字出现，配合主播直视镜头。建议快节奏剪辑，无废话开场。' },
    { title: '痛点引入', caption: '很多人皮肤暗沉、毛孔粗大，其实不是产品问题，是用法出了错。', tags: ['痛点'],
      editingGuide: '展示痛点时建议配素人皮肤问题素材（脱敏处理），增强共鸣。镜头紧张，不超过 8 秒。' },
    { title: '解决方案', caption: '正确步骤是这样的：先用水溶性洁面，再用化妆水，最后才是精华和面霜。', tags: ['方案'],
      editingGuide: '步骤讲解配分镜字幕（1→2→3），每步 2-3 秒特写，清晰展示动作。' },
    { title: '产品推荐', caption: '我用的是这款，专为敏感肌设计，28天用完皮肤状态完全不一样。', tags: ['产品'],
      editingGuide: '产品展示特写，配合"28天"对比效果图。推荐使用前后对比的 split-screen。' },
    { title: '行动引导', caption: '评论区告诉我你现在的护肤步骤，我帮你看看哪里需要优化！', tags: ['互动', '转化'],
      editingGuide: '互动引导字幕全屏弹出，主播表情轻松友好。配合评论区截图素材增强真实感。' },
  ],
  'short-ecommerce': [
    {
      title: '爆款数据钩子', productName: '气垫BB霜',
      caption: '这款产品上线三天就卖出了10万件，到底有什么魔力？我来拆解一下它的卖点结构。',
      tags: ['钩子', '数据'],
      editingGuide: '开场数字"10万件"大字炸屏，配合销量截图。建议0-3秒完成钩子，直接切产品特写。',
    },
    {
      title: '纳米渗透技术卖点', productName: '气垫BB霜',
      caption: '它最大的亮点是采用了0.2微米纳米粒径技术，能在3秒内让肌肤深层锁住水分，填平毛孔。',
      tags: ['卖点', '技术', '成分'],
      editingGuide: '成分动画：纳米粒径→钻进毛孔→填平→锁水。建议使用产品品牌提供的动画素材，或自制简单字幕动效。关键词"3秒"高亮。',
    },
    {
      title: '上脸效果对比演示', productName: '气垫BB霜',
      caption: '你看，涂上之前皮肤是这样的，涂上之后，立刻就变得饱满有弹性，毛孔几乎不见了。',
      tags: ['效果', '对比演示'],
      editingGuide: '分屏对比：左侧素颜特写，右侧上妆效果。建议在"涂上之后"口播时无缝切换，视觉冲击强烈。特写聚焦鼻翼+法令纹区域。',
    },
    {
      title: '限时优惠转化', productName: '气垫BB霜',
      caption: '今天链接里有专属优惠券，直接叠加立减50，今晚12点截止，点击下方购物车。',
      tags: ['转化', '限时'],
      editingGuide: '全屏弹出倒计时+优惠券样式。主播手指指向购物车位置。建议"今晚12点截止"配合倒计时特效，强化紧迫感。',
    },
    {
      title: '爆款脚本拆解钩子', productName: '爆款脚本拆解',
      caption: '这条视频的脚本结构是这样的：钩子3秒→痛点7秒→方案15秒→产品10秒→CTA5秒，总计40秒完美短视频。',
      tags: ['脚本', '结构分析'],
      editingGuide: '录屏操作：将竞品视频链接输入AI文案工具，一键生成"痛点-成分-效果-手法-价格"结构化分析。建议展示操作界面全程 30 秒，加速 1.5x。',
    },
    {
      title: '爆款卖点文案生成', productName: '爆款脚本拆解',
      caption: '录屏操作：使用AI的"改写"或"润色"功能，将书面化文案改为"宝宝们""来""看到了吗"等直播常用人工语言，并加入人称代入感。',
      tags: ['AI工具', '文案裂变'],
      editingGuide: '录屏操作，输入关键词生成多版本卖点文案。剪辑建议：展示同一卖点"学术版→直播话术版→情绪激昂版"三种风格对比，每版读 1 句，快剪 0.3s 间隔。',
    },
  ],
}

function generateMockChapters(type: ChapterType, totalSec: number, template?: SceneTemplate): Chapter[] {
  if (type === 'short-fixed' && template) {
    // 用模板场景生成 mock 章节：按模板场景数均分时长
    const SCENE_CAPTIONS: Record<string, string> = {
      hook: '你知道吗？90%的人都用错了这款产品的使用方法，今天教你正确打开方式。',
      pain: '皮肤暗沉、毛孔粗大、上妆卡粉……这些问题你是不是每天都在面对？',
      problem: '很多人每天都在遇到这个问题，却不知道根本原因在哪里。',
      product: '这款产品主打成分天然，采用独家配方技术，专为中国人肤质定制研发。',
      benefit: '核心卖点：28天亲测有效，回购率高达76%，买家真实反馈让产品自己说话。',
      demo: '你看，涂上之前皮肤是这样的，涂上15分钟之后，毛孔明显收缩，皮肤变得通透。',
      solution: '正确步骤是：先做好清洁，再用化妆水打底，最后才是功效类精华。顺序不对，效果打折。',
      proof: '已经有超过100万用户选择了它，平均使用满意度高达4.9分，复购用户说再也离不开了。',
      cta: '今天限时专属优惠，点击下方链接，直接叠加立减券，今晚12点截止，先到先得！',
      push: '库存只剩最后200套！点击下方购物车立刻下单，错过今天恢复原价！',
      promo: '直播间专属福利：买一送一 + 免费赠品 + 运费险，满200还有神秘大礼！',
      intro: '今天给大家带来一款爆款好物，已经卖出30万套，今天直播间给大家申请到了最低价！',
      slogan: '我们相信，好产品应该让更多人用得起。这是我们一直在做的事。',
      story: '创始人当年因为自己皮肤问题走上了研发之路，十年磨一剑，这就是这个品牌的起点。',
    }
    const n = template.scenes.length
    const sliceSec = totalSec / n
    return template.scenes.map((scene, i) => ({
      id: uid('ch'),
      title: scene.name,
      startSec: Math.round(i * sliceSec),
      endSec: Math.round((i + 1) * sliceSec),
      caption: SCENE_CAPTIONS[scene.code] ?? `${scene.name} — 对应口播内容段落。`,
      tags: [scene.code],
      folderId: undefined,
      color: scene.color,
    }))
  }
  const templates = MOCK_CHAPTERS_BY_TYPE[type] ?? MOCK_CHAPTERS_BY_TYPE['live-ecommerce']
  const sliceSec = totalSec / templates.length
  // 产品类型：相同 productName 的章节共享颜色
  const productColorMap: Record<string, string> = {}
  let colorIdx = 0
  templates.forEach(t => {
    if (t.productName && !productColorMap[t.productName]) {
      productColorMap[t.productName] = CHAP_COLORS[colorIdx++ % CHAP_COLORS.length]
    }
  })
  return templates.map((t, i) => ({
    id: uid('ch'),
    title: t.title,
    startSec: Math.round(i * sliceSec),
    endSec: Math.round((i + 1) * sliceSec),
    caption: t.caption,
    tags: t.tags,
    editingGuide: t.editingGuide,
    productName: t.productName,
    folderId: undefined,
    color: t.productName ? productColorMap[t.productName] : CHAP_COLORS[i % CHAP_COLORS.length],
  }))
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export default function ChapterExtract() {
  const nav = useNavigate()
  const [type, setType] = useState<ChapterType | null>(null)

  if (!type) return <TypePicker nav={nav} onPick={setType} />
  return <Editor type={type} nav={nav} onChangeType={() => setType(null)} />
}

// ─── 类型选择 ─────────────────────────────────────────────────────────────────

function TypePicker({ nav, onPick }: { nav: ReturnType<typeof useNavigate>; onPick: (t: ChapterType) => void }) {
  return (
    <div style={{ padding: '20px 28px', maxWidth: 1000, margin: '0 auto' }}>
      <button onClick={() => nav('/cutmatrix')} style={S.backBtn}>
        <ArrowLeft size={13} style={{ marginRight: 4 }} />返回工作流目录
      </button>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={20} color="#14b8a6" /> 提取章节结构
        </h2>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.7 }}>
          选择章节提取类型 — 每种类型都有独立任务列表和本地记忆。先选择类型，再导入符合时长要求的音视频素材。
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {TYPE_GROUPS.map(({ category, icon: Icon, color, types }) => (
          <div key={category}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{category}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-light)', marginLeft: 4 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
              {types.map(key => {
                const info = TYPE_INFO[key]
                const disabled = info.disabled
                return (
                  <div
                    key={key}
                    onClick={() => !disabled && onPick(key)}
                    style={{
                      ...S.card,
                      padding: '18px 20px',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.55 : 1,
                      transition: 'border-color 0.15s, background 0.15s, transform 0.12s',
                    }}
                    onMouseEnter={e => {
                      if (disabled) return
                      e.currentTarget.style.borderColor = color
                      e.currentTarget.style.background = `${color}08`
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-light)'
                      e.currentTarget.style.background = 'var(--bg-card)'
                      e.currentTarget.style.transform = ''
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {info.label}
                      </span>
                      {disabled && (
                        <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#94a3b8', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap', marginLeft: 8 }}>
                          维护中
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>
                      {info.desc}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#64748b' }}>
                      <Clock size={12} color={color} />
                      <span>时长要求：{info.durLabel}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 编辑器 ───────────────────────────────────────────────────────────────────

function Editor({ type, nav, onChangeType }: {
  type: ChapterType
  nav: ReturnType<typeof useNavigate>
  onChangeType: () => void
}) {
  const info = TYPE_INFO[type]
  const STORE_KEY = `cm_chex_${type}`
  const FOLDER_KEY = `cm_chex_folders_${type}`

  // ── 素材列表 ───────────────────────────────────────────────────────────────
  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') as Material[]
      return raw.map(m => {
        if (m.status === 'uploading' || m.status === 'processing') {
          return { ...m, status: 'failed' as MatStatus, errMsg: '页面刷新丢失进度，请重新处理' }
        }
        return m
      })
    } catch { return [] }
  })
  const [activeId, setActiveId] = useState<string | null>(() => {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]') as Material[]
    return raw[0]?.id ?? null
  })

  // ── 文件夹 ─────────────────────────────────────────────────────────────────
  const [folders, setFolders] = useState<TargetFolder[]>(() => {
    try { return JSON.parse(localStorage.getItem(FOLDER_KEY) ?? '[]') }
    catch { return [] }
  })
  const [newFolderName, setNewFolderName] = useState('')

  // ── 固定场景模板（仅 short-fixed 类型使用） ──────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState<SceneTemplate | null>(() => {
    if (type !== 'short-fixed') return null
    try { return JSON.parse(localStorage.getItem(TEMPLATE_STORE_KEY) ?? 'null') as SceneTemplate | null }
    catch { return null }
  })
  const handleSelectTemplate = (t: SceneTemplate) => {
    setSelectedTemplate(t)
    localStorage.setItem(TEMPLATE_STORE_KEY, JSON.stringify(t))
  }

  // ── 视图 ──────────────────────────────────────────────────────────────────
  const [activeChapId, setActiveChapId] = useState<string | null>(null)

  // ── 章节编辑 ──────────────────────────────────────────────────────────────
  const updateChapter = (chapId: string, changes: Partial<{ title: string; editingGuide: string }>) => {
    setMaterials(p => p.map(m =>
      m.id === activeId && m.chapters
        ? { ...m, chapters: m.chapters.map(c => c.id === chapId ? { ...c, ...changes } : c) }
        : m
    ))
  }

  // ── 章节删除 ──────────────────────────────────────────────────────────────
  const deleteChapter = (chapId: string) => {
    setMaterials(p => p.map(m =>
      m.id === activeId && m.chapters
        ? { ...m, chapters: m.chapters.filter(c => c.id !== chapId) }
        : m
    ))
  }

  // ── 文件夹创建 UI 状态 ────────────────────────────────────────────────────
  const [showFolderInput, setShowFolderInput] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const activeMat = materials.find(m => m.id === activeId) ?? null

  // ── 持久化 ────────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(materials))
  }, [STORE_KEY, materials])
  useEffect(() => {
    localStorage.setItem(FOLDER_KEY, JSON.stringify(folders))
  }, [FOLDER_KEY, folders])

  // ── 上传 ──────────────────────────────────────────────────────────────────
  const handleFiles = async (files: FileList) => {
    for (const f of Array.from(files)) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
      const isAV = /mp4|mov|avi|mkv|webm|flv|mp3|wav|m4a|aac|flac/.test(ext)
      if (!isAV) continue

      const id = uid('mat')
      const mat: Material = { id, fileName: f.name, size: f.size, status: 'uploading' }
      setMaterials(p => [mat, ...p])
      setActiveId(id)

      try {
        const res = await cmRemote.uploadAsset(f)
        // probe duration
        let dur = 0
        try {
          const url = URL.createObjectURL(f)
          const audio = new Audio()
          dur = await new Promise<number>(resolve => {
            audio.onloadedmetadata = () => { resolve(audio.duration); URL.revokeObjectURL(url); audio.src = '' }
            audio.onerror = () => { resolve(0); URL.revokeObjectURL(url); audio.src = '' }
            audio.src = url
          })
        } catch { /* skip */ }
        setMaterials(p => p.map(m => m.id === id ? {
          ...m, status: 'draft', assetCode: res.assetCode, streamUrl: res.streamUrl, durationSec: dur,
        } : m))
      } catch (e) {
        setMaterials(p => p.map(m => m.id === id ? {
          ...m, status: 'failed', errMsg: e instanceof Error ? e.message : '上传失败',
        } : m))
      }
    }
  }

  // ── 处理（提取章节） ───────────────────────────────────────────────────────
  const handleProcess = async (mat: Material) => {
    if (!mat.assetCode) return
    setMaterials(p => p.map(m => m.id === mat.id ? { ...m, status: 'processing', errMsg: undefined } : m))
    try {
      const res = await cmRemote.chapterExtract({
        inputAssetCode: mat.assetCode,
        type: type === 'short-fixed' && selectedTemplate ? `${type}:${selectedTemplate.id}` : type,
        folders: folders.length > 0 ? folders.map(f => ({ id: f.id, name: f.name, keywords: f.keywords })) : undefined,
      })
      if (res.status === 'SUCCEEDED' && res.chapters && res.chapters.length > 0) {
        const chapters: Chapter[] = res.chapters.map((c, i) => ({
          ...c,
          color: CHAP_COLORS[i % CHAP_COLORS.length],
        }))
        setMaterials(p => p.map(m => m.id === mat.id ? { ...m, status: 'done', chapters } : m))
      } else {
        throw new Error(res.errMsg ?? '后端返回章节为空')
      }
    } catch {
      // 后端未就绪时使用 mock
      const dur = mat.durationSec ?? 300
      const chapters = generateMockChapters(type, dur, selectedTemplate ?? undefined)
      // 自动分配文件夹
      const chaptersWithFolders = folders.length > 0
        ? chapters.map((c, i) => ({ ...c, folderId: folders[i % folders.length].id }))
        : chapters
      setMaterials(p => p.map(m => m.id === mat.id ? { ...m, status: 'done', chapters: chaptersWithFolders } : m))
    }
  }

  // ── 删除素材 ──────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    setMaterials(p => {
      const next = p.filter(m => m.id !== id)
      if (activeId === id) setActiveId(next[0]?.id ?? null)
      return next
    })
  }

  // ── 文件夹管理 ────────────────────────────────────────────────────────────
  const addFolder = () => {
    const name = newFolderName.trim()
    if (!name) return
    setFolders(p => [...p, { id: uid('fld'), name }])
    setNewFolderName('')
  }
  const deleteFolder = (fid: string) => setFolders(p => p.filter(f => f.id !== fid))

  // ── 视频跳转 ──────────────────────────────────────────────────────────────
  const seekTo = (sec: number) => {
    if (videoRef.current) videoRef.current.currentTime = sec
  }

  const chapters = activeMat?.chapters ?? []

  /** 从文件名生成可读标题：003_xxx → 案例3 · 小a同学直播切片专属 */
  const matTitle = activeMat
    ? (() => {
        const m = activeMat.fileName.match(/^0*(\d+)[_\-\s]/)
        const caseNum = m ? `案例${parseInt(m[1], 10)}` : ''
        return caseNum ? `${caseNum} · ${info.label}` : info.label
      })()
    : '未分类'

  const downloadFolders = async () => {
    const zip = new JSZip()
    const safe = (s: string) => s.replace(/[\\/:*?"<>|]/g, '_').trim() || '章节'
    const chapTxt = (c: Chapter, idx: number) =>
      `标题：${c.title}\n时间：${c.startSec.toFixed(1)}s - ${c.endSec.toFixed(1)}s\n\n摘要：\n${c.caption}\n${c.editingGuide ? `\n剪辑指导：\n${c.editingGuide}\n` : ''}`

    // 已分配到文件夹的章节
    for (const f of folders) {
      const dir = zip.folder(safe(f.name))!
      const fChaps = chapters.filter(c => c.folderId === f.id)
      fChaps.forEach((c, i) => {
        dir.file(`${String(i + 1).padStart(2, '0')}_${safe(c.title)}.txt`, chapTxt(c, i + 1))
      })
    }

    // 未分配章节
    const unassigned = chapters.filter(c => !c.folderId)
    if (unassigned.length > 0) {
      const dir = zip.folder(safe(matTitle))!
      unassigned.forEach((c, i) => {
        dir.file(`${String(i + 1).padStart(2, '0')}_${safe(c.title)}.txt`, chapTxt(c, i + 1))
      })
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${safe(matTitle)}_章节结构.zip`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ position: 'fixed', top: 48, left: 'var(--sidebar-width)', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-main)' }}>
      {/* ── Header ── */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: 'var(--bg-card)' }}>
        <button onClick={() => nav('/cutmatrix')} style={S.backBtn}>
          <ArrowLeft size={13} style={{ marginRight: 4 }} />工作流目录
        </button>
        <span style={{ color: 'var(--border-light)' }}>|</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={16} color="#14b8a6" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>提取章节结构</span>
        </div>
        <div style={{ ...S.badge, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
          {info.label}
        </div>
        <button onClick={onChangeType} style={{ ...S.btn, fontSize: '0.72rem', color: 'var(--text-muted)', padding: '3px 8px', marginLeft: 'auto' }}>
          重新选择类型
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minWidth: 0 }}>

        {/* ── 左侧：素材列表 ── */}
        <div style={{ width: 200, borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', flexShrink: 0 }}>
          {/* 场景模板（仅 short-fixed） */}
          {type === 'short-fixed' && (
            <div style={{ borderBottom: '1px solid var(--border-light)' }}>
              <TemplateSelector selected={selectedTemplate} onSelect={handleSelectTemplate} />
            </div>
          )}
          {/* Upload */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-light)' }}>
            <input ref={fileRef} type="file" multiple accept="video/*,audio/*" style={{ display: 'none' }}
              onChange={e => e.target.files && handleFiles(e.target.files)} />
            <button onClick={() => fileRef.current?.click()} style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center' }}>
              <Upload size={13} style={{ marginRight: 5 }} />导入音视频素材
            </button>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: 5, textAlign: 'center' }}>
              时长要求 {info.durLabel}
            </div>
          </div>
          {/* File list */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {materials.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.76rem' }}>暂无素材</div>
            ) : materials.map(m => (
              <div key={m.id} onClick={() => setActiveId(m.id)} style={{
                padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)',
                background: m.id === activeId ? 'rgba(20,184,166,0.07)' : 'transparent',
                borderLeft: m.id === activeId ? '3px solid #14b8a6' : '3px solid transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
                    <Video size={12} color={STATUS_COLORS[m.status]} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.fileName}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(m.id) }} style={S.iconBtn}><X size={11} /></button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.65rem', color: STATUS_COLORS[m.status], fontWeight: 600 }}>
                    {m.status === 'processing' && <Loader size={9} style={{ marginRight: 2, display: 'inline' }} />}
                    {STATUS_LABELS[m.status]}
                  </span>
                  {m.durationSec ? <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{fmtDur(m.durationSec)}</span> : null}
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{fmtSize(m.size)}</span>
                  {m.status === 'done' && m.chapters && <span style={{ fontSize: '0.65rem', color: '#14b8a6' }}>{m.chapters.length} 章节</span>}
                </div>
                {m.errMsg && <div style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: 3, lineHeight: 1.4 }}>{m.errMsg}</div>}
                {(m.status === 'draft' || m.status === 'failed') && m.assetCode && (
                  <button onClick={e => { e.stopPropagation(); handleProcess(m) }}
                    style={{ ...S.btnSm, marginTop: 5, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.7rem' }}>
                    <RotateCw size={10} style={{ marginRight: 3 }} />{m.status === 'failed' ? '重新提取' : '开始提取'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── 中间：视频预览 ── */}
        <div style={{ flex: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-light)', minWidth: 0 }}>
          {!activeMat ? (
            <EmptyState onUpload={() => fileRef.current?.click()} showTemplateTip={type === 'short-fixed' && !selectedTemplate} />
          ) : activeMat.status === 'processing' ? (
            <ProcessingState fileName={activeMat.fileName} />
          ) : activeMat.status !== 'done' || chapters.length === 0 ? (
            <ReadyState mat={activeMat} onProcess={() => handleProcess(activeMat)}
              needsTemplate={type === 'short-fixed' && !selectedTemplate} />
          ) : (
            <ChapterContent
              mat={activeMat}
              chapters={chapters}
              videoRef={videoRef}
              template={type === 'short-fixed' ? selectedTemplate : null}
            />
          )}
        </div>

        {/* ── 文稿转写 ── */}
        <div style={{ flex: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', flexShrink: 0 }}>
            <FileText size={13} color="var(--accent-primary)" />
            <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>文稿转写</span>
            {chapters.length > 0 && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{chapters.length} 段</span>
            )}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
            {chapters.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.8 }}>
                <FileText size={32} color="#cbd5e1" style={{ marginBottom: 10, display: 'block', margin: '0 auto 12px' }} />
                提取章节后将在此显示全文转写
              </div>
            ) : chapters.map(c => (
              <div
                key={c.id}
                onClick={() => { setActiveChapId(c.id); seekTo(c.startSec) }}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${activeChapId === c.id ? c.color : 'transparent'}`,
                  background: activeChapId === c.id ? `${c.color}0d` : 'transparent',
                  transition: 'background 0.1s',
                  marginBottom: 2,
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: c.color, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, background: c.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.62rem', fontWeight: 800, flexShrink: 0 }}>{chapters.indexOf(c) + 1}</span>
                  {c.title}
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  {c.caption}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 右侧：目标文件夹 + 章节树 ── */}
        <div style={{ flex: 3, borderLeft: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', minWidth: 0 }}>
          {/* Header */}
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', flex: 1 }}>
              文件夹 ({chapters.length})
            </span>
            <button disabled title="撤销" style={{ ...S.iconBtn, color: 'var(--text-muted)', opacity: 0.5 }}><Undo2 size={15} /></button>
            <button disabled title="重做" style={{ ...S.iconBtn, color: 'var(--text-muted)', opacity: 0.5 }}><Redo2 size={15} /></button>
            <button
              onClick={() => setShowFolderInput(p => !p)}
              title="新建文件夹"
              style={{ ...S.iconBtn, color: showFolderInput ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Folder tree with chapters + create button */}
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
            {folders.length === 0 && chapters.length === 0 && (
              <div style={{ padding: '20px 18px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                点击下方「创建文件夹」，章节将自动归类到对应文件夹。
              </div>
            )}

            {/* Folders with nested chapters */}
            {folders.map(f => {
              const fChaps = chapters.filter(c => c.folderId === f.id)
              return (
                <div key={f.id} style={{ marginBottom: 4 }}>
                  {/* Folder name block */}
                  <div style={{ padding: '12px 18px 6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)' }}>{f.name}</div>
                        {f.keywords && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{f.keywords}</div>
                        )}
                      </div>
                      <button onClick={() => deleteFolder(f.id)} style={{ ...S.iconBtn, color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} title="删除文件夹">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {/* Chapters inside folder */}
                  <div style={{ padding: '0 0 8px 0' }}>
                    {fChaps.length === 0 ? (
                      <div style={{ padding: '4px 18px', fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>暂无章节</div>
                    ) : fChaps.map(c => (
                      <ChapterRow key={c.id} chapter={c} index={chapters.indexOf(c) + 1}
                        isActive={c.id === activeChapId}
                        onClick={(ch) => { setActiveChapId(ch.id); seekTo(ch.startSec) }}
                        onDelete={() => deleteChapter(c.id)}
                        onUpdate={changes => updateChapter(c.id, changes)} />
                    ))}
                  </div>
                  <div style={{ height: 1, background: 'var(--border-light)', margin: '0 18px' }} />
                </div>
              )
            })}

            {/* Unassigned chapters */}
            {(() => {
              const unassigned = chapters.filter(c => !c.folderId)
              if (unassigned.length === 0) return null
              return (
                <div style={{ marginBottom: 4 }}>
                  <div style={{ padding: '12px 18px 6px' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {matTitle}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{info.category}</div>
                  </div>
                  <div style={{ padding: '0 0 8px 0' }}>
                    {unassigned.map(c => (
                      <ChapterRow key={c.id} chapter={c} index={chapters.indexOf(c) + 1}
                        isActive={c.id === activeChapId}
                        onClick={(ch) => { setActiveChapId(ch.id); seekTo(ch.startSec) }}
                        onDelete={() => deleteChapter(c.id)}
                        onUpdate={changes => updateChapter(c.id, changes)} />
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Create folder — inline after content */}
            <div style={{ padding: '12px 16px 16px' }}>
              {showFolderInput ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { addFolder(); setShowFolderInput(false) } if (e.key === 'Escape') { setNewFolderName(''); setShowFolderInput(false) } }}
                    placeholder="输入文件夹名称…"
                    style={{ ...S.input, width: '100%', boxSizing: 'border-box', fontSize: '0.84rem', padding: '8px 12px' }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { addFolder(); setShowFolderInput(false) }}
                      style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: '#14b8a6', color: '#fff', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}>确认</button>
                    <button onClick={() => { setNewFolderName(''); setShowFolderInput(false) }}
                      style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.84rem', cursor: 'pointer' }}>取消</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => void downloadFolders()}
                  disabled={chapters.length === 0}
                  style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 10, background: chapters.length === 0 ? 'var(--bg-secondary)' : '#14b8a6', color: chapters.length === 0 ? 'var(--text-muted)' : '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: chapters.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <FolderDown size={15} />下载文件夹
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 场景模板选择器（short-fixed 专用） ──────────────────────────────────────

function TemplateSelector({ selected, onSelect }: {
  selected: SceneTemplate | null
  onSelect: (t: SceneTemplate) => void
}) {
  const [expanded, setExpanded] = useState(!selected)
  return (
    <div>
      <div
        onClick={() => setExpanded(p => !p)}
        style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, userSelect: 'none' }}
      >
        <Layers size={13} color="var(--accent-primary)" />
        <span style={{ fontWeight: 700, fontSize: '0.8rem', flex: 1, color: 'var(--text-primary)' }}>场景模板</span>
        {selected && !expanded && (
          <span style={{ fontSize: '0.65rem', background: 'var(--bg-hover)', color: 'var(--accent-dark)', borderRadius: 4, padding: '1px 6px', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected.name}
          </span>
        )}
        {expanded ? <ChevronDown size={12} color="var(--text-muted)" /> : <ChevronRight size={12} color="var(--text-muted)" />}
      </div>
      {expanded && (
        <div style={{ padding: '0 10px 10px' }}>
          {!selected && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.6 }}>
              选择模板后按固定场景结构识别章节
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SCENE_TEMPLATES.map(t => {
              const isActive = selected?.id === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => { onSelect(t); setExpanded(false) }}
                  style={{
                    padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
                    border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                    background: isActive ? 'var(--bg-hover)' : 'var(--bg-main)',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 3, color: isActive ? 'var(--accent-dark)' : 'var(--text-primary)' }}>
                    {t.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {t.scenes.map(s => (
                      <span key={s.code} style={{ fontSize: '0.62rem', background: `${s.color}22`, color: s.color, borderRadius: 3, padding: '1px 5px', fontWeight: 600 }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {/* 已选模板的场景色块摘要（折叠时） */}
      {selected && !expanded && (
        <div style={{ padding: '0 10px 8px', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {selected.scenes.map(s => (
            <span key={s.code} style={{ fontSize: '0.62rem', background: `${s.color}22`, color: s.color, borderRadius: 3, padding: '1px 5px', fontWeight: 600 }}>
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── 空状态 ───────────────────────────────────────────────────────────────────

function EmptyState({ onUpload, showTemplateTip }: { onUpload: () => void; showTemplateTip?: boolean }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text-muted)' }}>
      <FileText size={48} color="#cbd5e1" />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 6 }}>暂无素材</div>
        <div style={{ fontSize: '0.78rem' }}>
          {showTemplateTip ? '← 先在左侧选择场景模板，再导入素材' : '上传音视频文件后自动提取章节结构'}
        </div>
      </div>
      <button onClick={onUpload} style={S.btnPrimary}>
        <Upload size={14} style={{ marginRight: 6 }} />导入素材
      </button>
    </div>
  )
}

function ProcessingState({ fileName }: { fileName: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-muted)' }}>
      <Loader size={40} color="#14b8a6" style={{ animation: 'spin 1s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>正在提取章节结构…</div>
        <div style={{ fontSize: '0.78rem' }}>{fileName}</div>
        <div style={{ fontSize: '0.72rem', marginTop: 8 }}>ASR 转写 → LLM 识别场景边界 → 按模板分类</div>
      </div>
    </div>
  )
}

function ReadyState({ mat, onProcess, needsTemplate }: { mat: Material; onProcess: () => void; needsTemplate?: boolean }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-muted)' }}>
      <CheckCircle2 size={40} color="#94a3b8" />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>{mat.fileName}</div>
        <div style={{ fontSize: '0.78rem' }}>
          {mat.status === 'failed' ? <span style={{ color: '#ef4444' }}>{mat.errMsg ?? '提取失败'}</span>
            : needsTemplate ? <span style={{ color: 'var(--accent-primary)' }}>← 请先在左侧选择场景模板</span>
            : '已上传，点击开始提取章节'}
        </div>
        {mat.durationSec ? <div style={{ fontSize: '0.72rem', marginTop: 4 }}>时长：{fmtDur(mat.durationSec)}</div> : null}
      </div>
      {mat.assetCode && !needsTemplate && (
        <button onClick={onProcess} style={S.btnPrimary}>
          <RotateCw size={14} style={{ marginRight: 6 }} />
          {mat.status === 'failed' ? '重新提取' : '开始提取章节'}
        </button>
      )}
    </div>
  )
}

// ─── 章节内容区（中间列）- 仅视频 + 时间线 ──────────────────────────────────

function ChapterContent({ mat, chapters, videoRef, template }: {
  mat: Material
  chapters: Chapter[]
  videoRef: React.RefObject<HTMLVideoElement | null>
  template: SceneTemplate | null
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: 'var(--bg-card)', flexWrap: 'wrap' }}>
        <Video size={13} color="#14b8a6" />
        <span style={{ fontSize: '0.84rem', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {mat.fileName}
        </span>
        {mat.durationSec ? <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{fmtDur(mat.durationSec)}</span> : null}
        <span style={{ fontSize: '0.7rem', color: '#14b8a6', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 4, padding: '2px 7px' }}>
          {chapters.length} 章节
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 0 20px' }}>
        {/* 模板图例（short-fixed 且有模板时） */}
        {template && (
          <div style={{ padding: '10px 16px 0' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '8px 12px', background: '#faf5ff', borderRadius: 8, border: '1px solid #e9d5ff' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--accent-dark)', fontWeight: 700, marginRight: 4 }}>场景模板：</span>
              {template.scenes.map((s, i) => (
                <span key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.68rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                  <span style={{ color: s.color, fontWeight: 600 }}>{s.name}</span>
                  {i < template.scenes.length - 1 && <span style={{ color: '#d1d5db', marginLeft: 2 }}>→</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Video preview */}
        {mat.streamUrl && (
          <div style={{ padding: '12px 16px 0' }}>
            <video ref={videoRef} src={mat.streamUrl} controls
              style={{ width: '100%', maxHeight: 260, borderRadius: 10, background: '#000', display: 'block' }} />
          </div>
        )}

      </div>
    </div>
  )
}

// ─── 章节行（右侧面板用，标题和剪辑指导可内联编辑） ─────────────────────────

function ChapterRow({ chapter: c, index, isActive, onClick, onDelete, onUpdate }: {
  chapter: Chapter
  index: number
  isActive: boolean
  onClick: (c: Chapter) => void
  onDelete: () => void
  onUpdate: (changes: Partial<{ title: string; editingGuide: string }>) => void
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingGuide, setEditingGuide] = useState(false)
  const [titleVal, setTitleVal] = useState(c.title)
  const [guideVal, setGuideVal] = useState(c.editingGuide ?? '')

  // 外部数据更新时同步
  useEffect(() => setTitleVal(c.title), [c.title])
  useEffect(() => setGuideVal(c.editingGuide ?? ''), [c.editingGuide])

  const saveTitle = () => {
    const v = titleVal.trim()
    if (v && v !== c.title) onUpdate({ title: v })
    else setTitleVal(c.title)
    setEditingTitle(false)
  }
  const saveGuide = () => {
    if (guideVal !== (c.editingGuide ?? '')) onUpdate({ editingGuide: guideVal })
    setEditingGuide(false)
  }

  return (
    <div
      onClick={() => !editingTitle && !editingGuide && onClick(c)}
      style={{
        padding: '10px 18px',
        cursor: editingTitle || editingGuide ? 'default' : 'pointer',
        background: isActive ? 'var(--bg-hover)' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Index */}
        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#14b8a6', minWidth: 20, lineHeight: 1.4, flexShrink: 0 }}>{index}</span>
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Editable title */}
          {editingTitle ? (
            <input
              autoFocus
              value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleVal(c.title); setEditingTitle(false) } }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', border: '1px solid #14b8a6', borderRadius: 5, padding: '3px 7px', background: 'var(--bg-main)', outline: 'none', boxSizing: 'border-box' }}
            />
          ) : (
            <div
              onClick={e => { e.stopPropagation(); setEditingTitle(true) }}
              title="点击编辑标题"
              style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: (c.editingGuide || editingGuide) ? 5 : 0, cursor: 'text', borderRadius: 4, padding: '2px 0' }}
            >
              {c.title}
            </div>
          )}
          {/* Editable guide */}
          {editingGuide ? (
            <textarea
              autoFocus
              value={guideVal}
              onChange={e => setGuideVal(e.target.value)}
              onBlur={saveGuide}
              onClick={e => e.stopPropagation()}
              rows={3}
              style={{ width: '100%', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.7, border: '1px solid #14b8a6', borderRadius: 5, padding: '4px 7px', background: 'var(--bg-main)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          ) : (
            (c.editingGuide) && (
              <p
                onClick={e => { e.stopPropagation(); setGuideVal(c.editingGuide ?? ''); setEditingGuide(true) }}
                title="点击编辑剪辑指导"
                style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.7, cursor: 'text', WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                剪辑指导：{c.editingGuide}
              </p>
            )
          )}
          {/* Add guide if none */}
          {!c.editingGuide && !editingGuide && (
            <div
              onClick={e => { e.stopPropagation(); setGuideVal(''); setEditingGuide(true) }}
              style={{ fontSize: '0.72rem', color: 'var(--text-muted)', opacity: 0.5, cursor: 'text', marginTop: 3 }}
              title="添加剪辑指导"
            >
              + 添加剪辑指导
            </div>
          )}
        </div>
        {/* Delete */}
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          style={{ ...S.iconBtn, color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }}
          title="删除章节"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', fontSize: '0.78rem', padding: '4px 0',
    marginBottom: 14,
  } as React.CSSProperties,
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: 10,
  } as React.CSSProperties,
  badge: {
    display: 'inline-flex', alignItems: 'center',
    fontSize: '0.72rem', fontWeight: 600,
    borderRadius: 5, padding: '2px 8px',
  } as React.CSSProperties,
  btn: {
    display: 'inline-flex', alignItems: 'center',
    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
    borderRadius: 6, cursor: 'pointer', padding: '5px 12px', fontSize: '0.78rem',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center',
    background: '#14b8a6', border: 'none',
    borderRadius: 7, cursor: 'pointer', padding: '7px 16px', fontSize: '0.82rem',
    color: '#fff', fontWeight: 600,
  } as React.CSSProperties,
  btnSm: {
    display: 'inline-flex', alignItems: 'center',
    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
    borderRadius: 5, cursor: 'pointer', padding: '4px 10px', fontSize: '0.74rem',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', padding: 3, borderRadius: 4,
    display: 'inline-flex', alignItems: 'center',
  } as React.CSSProperties,
  tabBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '5px 8px', display: 'inline-flex', alignItems: 'center',
    transition: 'background 0.12s',
  } as React.CSSProperties,
  input: {
    background: 'var(--bg-main)', border: '1px solid var(--border-light)',
    borderRadius: 6, color: 'var(--text-primary)', outline: 'none',
    padding: '6px 10px', fontSize: '0.82rem',
  } as React.CSSProperties,
}

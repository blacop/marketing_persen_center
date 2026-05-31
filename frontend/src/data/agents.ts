// 「玛丽黛佳直播带货&短视频营销」52个智能体完整数据
export interface Agent {
  id: number
  name: string
  role: string
  replacedPosition: string
  description: string
  cluster: 'content' | 'marketing' | 'operations' | 'engine' | 'intl' | 'consumer'
  subGroup: string
  status: 'running' | 'idle' | 'training' | 'error'
  health: number // 0-100
  tasksCompleted: number
  uptime: string
  algorithm: string
}

export const agents: Agent[] = [
  // ===== 第一板块：美妆内容生产集群（12个）=====
  { id: 1, name: '种草文案智能体', role: '种草文案生成', replacedPosition: '内容策划/文案', description: '生成小红书/抖音种草文案，自动提炼唇釉/眼影/粉底液卖点，融入情感共鸣与使用场景', cluster: 'content', subGroup: '文案与脚本', status: 'running', health: 98, tasksCompleted: 15247, uptime: '99.9%', algorithm: '大语言模型、卖点提炼、情感分析' },
  { id: 2, name: '短视频脚本智能体', role: '短视频脚本生成', replacedPosition: '短视频策划', description: '生成15s/30s/60s短视频脚本，包含Hook设计、产品展示节奏、结尾引导购买', cluster: 'content', subGroup: '文案与脚本', status: 'running', health: 96, tasksCompleted: 8932, uptime: '99.8%', algorithm: '结构化生成、Hook模板库、注意力模型' },
  { id: 3, name: '直播话术智能体', role: '直播话术生成', replacedPosition: '直播运营/话术策划', description: '生成直播间带货话术、限时逼单话术、粉丝互动脚本，支持唇釉/眼影/粉底液等SKU定制', cluster: 'content', subGroup: '文案与脚本', status: 'running', health: 97, tasksCompleted: 12456, uptime: '99.9%', algorithm: '对话策略模型、逼单话术库、实时生成' },
  { id: 4, name: '产品图生成智能体', role: '产品图生成', replacedPosition: '平面设计师', description: 'AI生成美妆产品白底图/氛围图/场景图，支持唇釉色号展示、眼影盘平铺、粉底液质地表现', cluster: 'content', subGroup: '视觉生产', status: 'running', health: 94, tasksCompleted: 6781, uptime: '99.6%', algorithm: '图像生成模型（SDXL）、风格迁移' },
  { id: 5, name: '试色视频智能体', role: '试色视频制作', replacedPosition: '美妆视频剪辑师', description: '自动剪辑唇釉/眼影试色视频，支持多色号对比、上妆前后对比、不同肤色适配展示', cluster: 'content', subGroup: '视觉生产', status: 'running', health: 93, tasksCompleted: 4523, uptime: '99.5%', algorithm: '视频剪辑模型、色彩分析、肤色检测' },
  { id: 6, name: '直播切片智能体', role: '直播切片剪辑', replacedPosition: '直播运营/剪辑师', description: '从直播录像自动识别爆点片段（高互动/高转化时刻），切片生成二次传播短视频素材', cluster: 'content', subGroup: '视觉生产', status: 'running', health: 95, tasksCompleted: 3287, uptime: '99.7%', algorithm: '爆点检测、情绪识别、自动裁切' },
  { id: 7, name: '美妆教程生成智能体', role: '美妆教程内容生成', replacedPosition: '美妆内容创作者', description: '生成妆容教程内容（日系/欧美/仿妆），包含文字步骤、产品嵌入、视频分镜脚本', cluster: 'content', subGroup: '教程与科普', status: 'running', health: 96, tasksCompleted: 5134, uptime: '99.7%', algorithm: '多模态生成、妆容风格分类、步骤结构化' },
  { id: 8, name: '成分科普智能体', role: '成分科普内容生成', replacedPosition: '品牌内容专员', description: '生成面向成分党的科普内容，解析玻色因/烟酰胺/水杨酸等原料功效，增强品牌信任背书', cluster: 'content', subGroup: '教程与科普', status: 'running', health: 97, tasksCompleted: 2876, uptime: '99.8%', algorithm: '成分知识图谱、科普文体生成' },
  { id: 9, name: '用户UGC激励智能体', role: 'UGC内容激励', replacedPosition: '用户运营专员', description: '自动识别高质量UGC种草内容，评估互动率/内容质量/达人潜力，触发激励奖励机制', cluster: 'content', subGroup: '内容运营', status: 'running', health: 92, tasksCompleted: 7654, uptime: '99.4%', algorithm: '内容质量评估、激励策略优化' },
  { id: 10, name: '内容合规审核智能体', role: '内容合规审核', replacedPosition: '合规审核专员', description: '自动检测广告法违规内容，识别绝对化用语（最好/第一）、医疗声称（祛痘/抗炎），拦截风险内容', cluster: 'content', subGroup: '内容运营', status: 'running', health: 99, tasksCompleted: 18923, uptime: '99.9%', algorithm: '合规规则引擎、敏感词检测、语义理解' },
  { id: 11, name: '爆款预测智能体', role: '爆款内容预测', replacedPosition: '内容数据分析师', description: '预测哪类美妆内容话题会成为爆款，分析美妆趋势与用户偏好，提前布局内容选题', cluster: 'content', subGroup: '内容运营', status: 'training', health: 89, tasksCompleted: 1543, uptime: '98.7%', algorithm: '趋势预测、时序分析、话题热度模型' },
  { id: 12, name: '竞品内容监控智能体', role: '竞品内容监控', replacedPosition: '竞品分析专员', description: '监控完美日记/花西子/MAC等竞品内容动向，追踪爆款产品/话题/营销策略，输出竞品洞察报告', cluster: 'content', subGroup: '内容运营', status: 'running', health: 95, tasksCompleted: 4321, uptime: '99.6%', algorithm: '竞品追踪、内容比对、市场洞察分析' },

  // ===== 第二板块：投放优化集群（10个）=====
  { id: 13, name: '抖音智能投手智能体', role: '抖音投放优化', replacedPosition: '抖音投手/优化师', description: '对接抖音巨量引擎API，自动建计划/设出价/扩量，实时优化美妆品类广告投放效率', cluster: 'marketing', subGroup: '平台投放', status: 'running', health: 98, tasksCompleted: 89765, uptime: '99.9%', algorithm: '深度强化学习、巨量引擎API、自动化建计划' },
  { id: 14, name: '小红书聚光优化智能体', role: '小红书投放优化', replacedPosition: '小红书投放运营', description: '小红书聚光平台自动化投放优化，提升种草笔记曝光效率，优化搜索广告与发现广告协同', cluster: 'marketing', subGroup: '平台投放', status: 'running', health: 96, tasksCompleted: 45632, uptime: '99.7%', algorithm: '聚光API对接、搜索词优化、出价策略' },
  { id: 15, name: '快手磁力引擎智能体', role: '快手投放优化', replacedPosition: '快手投放运营', description: '快手磁力引擎投放策略优化，结合快手直播间特性动态调整投放，提升直播间UV与GMV', cluster: 'marketing', subGroup: '平台投放', status: 'running', health: 94, tasksCompleted: 32187, uptime: '99.5%', algorithm: '磁力引擎API、直播间优化、UV预测模型' },
  { id: 16, name: '素材轮换智能体', role: '广告素材轮换', replacedPosition: '创意优化师', description: '自动检测各平台素材疲劳度（CTR/CVR下滑趋势），及时替换高CTR新素材，维持投放新鲜度', cluster: 'marketing', subGroup: '素材与出价', status: 'running', health: 95, tasksCompleted: 67843, uptime: '99.6%', algorithm: '多臂老虎机、疲劳度检测、素材自动轮换' },
  { id: 17, name: '智能出价智能体', role: '跨平台智能出价', replacedPosition: '投放优化师', description: '跨平台实时出价策略管理（oCPM/OCPC/智能投放），根据实时ROI动态调整各平台出价', cluster: 'marketing', subGroup: '素材与出价', status: 'running', health: 97, tasksCompleted: 234567, uptime: '99.8%', algorithm: '深度Q网络（DQN）、实时竞价优化、多平台协同' },
  { id: 18, name: '人群定向智能体', role: '美妆人群定向', replacedPosition: '人群运营分析师', description: '构建美妆消费者人群包（成分党/颜值党/学生党/精致妈妈），精准匹配玛丽黛佳产品受众', cluster: 'marketing', subGroup: '素材与出价', status: 'running', health: 96, tasksCompleted: 45678, uptime: '99.7%', algorithm: 'Lookalike扩量、人群聚类、行为特征建模' },
  { id: 19, name: '直播间投流智能体', role: '直播间实时投流', replacedPosition: '直播投流运营', description: '实时监控直播间在线人数/GMV/转化率，动态调整投流力度，在ROI高峰期加大预算投入', cluster: 'marketing', subGroup: '直播投放', status: 'running', health: 98, tasksCompleted: 56789, uptime: '99.9%', algorithm: '实时流处理、GMV预测、动态预算分配' },
  { id: 20, name: 'ROI监控智能体', role: 'ROI实时监控', replacedPosition: '数据分析师', description: '实时监控各平台ROI，低于预设阈值自动触发预警并建议调整策略，保障整体投放效益', cluster: 'marketing', subGroup: '数据监控', status: 'running', health: 99, tasksCompleted: 345678, uptime: '99.9%', algorithm: '异常检测、阈值预警、自动化报警' },
  { id: 21, name: '预算分配智能体', role: '跨平台预算分配', replacedPosition: '投放总监', description: '基于ROI加权算法智能分配抖音/小红书/快手/天猫跨平台预算，最大化整体投放回报', cluster: 'marketing', subGroup: '数据监控', status: 'running', health: 97, tasksCompleted: 12345, uptime: '99.8%', algorithm: '多目标优化、ROI加权分配、动态预算调整' },
  { id: 22, name: '归因分析智能体', role: '多触点归因分析', replacedPosition: '增长分析师', description: '多触点归因分析，打通种草→搜索→加购→下单全链路，识别各渠道真实贡献度', cluster: 'marketing', subGroup: '数据监控', status: 'running', health: 96, tasksCompleted: 23456, uptime: '99.7%', algorithm: '多触点归因模型、链路追踪、Shapley值分配' },

  // ===== 第三板块：达人运营集群（8个）=====
  { id: 23, name: 'KOL筛选智能体', role: 'KOL多维评估筛选', replacedPosition: '达人BD经理', description: '美妆达人多维评估（互动率/虚假粉检测/品牌调性匹配/历史带货能力），精准筛选合作达人', cluster: 'operations', subGroup: '达人筛选与招募', status: 'running', health: 97, tasksCompleted: 8765, uptime: '99.8%', algorithm: '达人评分模型、虚假粉检测、调性匹配算法' },
  { id: 24, name: '达人招募智能体', role: '潜力达人发现与招募', replacedPosition: '达人运营专员', description: '自动发现抖音/小红书/快手潜力美妆达人，分析成长趋势，自动发送个性化合作邀约', cluster: 'operations', subGroup: '达人筛选与招募', status: 'running', health: 94, tasksCompleted: 3456, uptime: '99.5%', algorithm: '达人挖掘算法、成长预测、自动邀约系统' },
  { id: 25, name: 'Brief生成智能体', role: '达人合作Brief生成', replacedPosition: '品牌合作策划', description: '根据产品特性（唇釉/眼影/粉底液）和达人风格自动生成个性化合作brief，提升沟通效率', cluster: 'operations', subGroup: '达人合作管理', status: 'running', health: 95, tasksCompleted: 5678, uptime: '99.6%', algorithm: '产品特征提取、达人风格匹配、Brief模板生成' },
  { id: 26, name: '达人维护智能体', role: '达人关系维护', replacedPosition: '达人运营专员', description: '自动推送新品素材包/带货话术/产品卖点给合作达人，维护长期合作关系，提升内容质量', cluster: 'operations', subGroup: '达人合作管理', status: 'running', health: 96, tasksCompleted: 12345, uptime: '99.7%', algorithm: '对话系统、素材自动推送、关系维护模型' },
  { id: 27, name: '佣金结算智能体', role: '达人佣金自动结算', replacedPosition: '达人结算专员', description: 'T+0自动计算各达人直播/短视频带货佣金，按规则自动发放，减少人工核算误差', cluster: 'operations', subGroup: '达人合作管理', status: 'running', health: 99, tasksCompleted: 23456, uptime: '99.9%', algorithm: '实时计算、佣金规则引擎、自动化结算' },
  { id: 28, name: '直播排期智能体', role: '达人直播排期优化', replacedPosition: '直播运营经理', description: '优化玛丽黛佳合作达人直播排期，避免时间冲突与内部竞争，最大化各时段直播间流量', cluster: 'operations', subGroup: '达人合作管理', status: 'running', health: 93, tasksCompleted: 1876, uptime: '99.4%', algorithm: '排期优化算法、流量预测、冲突检测' },
  { id: 29, name: '粉丝质量检测智能体', role: 'KOL粉丝质量检测', replacedPosition: '达人风控专员', description: '实时检测KOL粉丝中机器账号/僵尸粉比例，评估真实互动率，防止虚假达人骗取合作费用', cluster: 'operations', subGroup: '达人风控', status: 'running', health: 98, tasksCompleted: 9876, uptime: '99.9%', algorithm: '机器账号识别、图神经网络、行为异常检测' },
  { id: 30, name: '社群运营智能体', role: '品牌私域社群运营', replacedPosition: '私域运营专员', description: '品牌微信群/企业微信自动化运营，定期推送美妆干货/新品信息/专属福利，提升用户粘性', cluster: 'operations', subGroup: '私域运营', status: 'running', health: 94, tasksCompleted: 34567, uptime: '99.5%', algorithm: '对话系统、用户分层运营、内容自动化推送' },

  // ===== 第四板块：协同引擎（10个）=====
  { id: 31, name: '种草→购买归因引擎', role: '全链路种草归因', replacedPosition: '链路分析专家', description: '打通小红书种草笔记到天猫旗舰店/抖音小店成交完整链路，量化种草内容的实际转化贡献', cluster: 'engine', subGroup: '协同引擎', status: 'running', health: 97, tasksCompleted: 45678, uptime: '99.8%', algorithm: '跨平台链路追踪、多触点归因、种草价值量化' },
  { id: 32, name: '跨平台协同智能体', role: '跨平台投放协调', replacedPosition: '投放协调总监', description: '协调抖音/小红书/快手各平台投放策略，统一频次控制与受众去重，避免自相竞争浪费预算', cluster: 'engine', subGroup: '协同引擎', status: 'running', health: 98, tasksCompleted: 34567, uptime: '99.9%', algorithm: '跨平台协同优化、频次控制、受众去重算法' },
  { id: 33, name: '实时趋势捕捉引擎', role: '美妆趋势实时监控', replacedPosition: '市场趋势分析师', description: '监控美妆行业趋势（玻璃唇/纯净美妆/成分党/多巴胺妆），识别新兴趋势并触发内容生产响应', cluster: 'engine', subGroup: '协同引擎', status: 'running', health: 96, tasksCompleted: 12345, uptime: '99.7%', algorithm: '实时趋势识别、热词监控、趋势预警系统' },
  { id: 34, name: '消费者洞察引擎', role: '消费者行为洞察', replacedPosition: '用户研究专员', description: '实时分析消费者评论/问答/弹幕/反馈，构建精准美妆消费者画像，输出产品改进与选品建议', cluster: 'engine', subGroup: '协同引擎', status: 'running', health: 95, tasksCompleted: 56789, uptime: '99.6%', algorithm: '情感分析、用户画像构建、NLP评论挖掘' },
  { id: 35, name: '智能预警引擎', role: '多维风险实时预警', replacedPosition: '运营风控专员', description: '异常流量检测/ROI下滑预警/舆情风险监控三位一体，第一时间发现经营风险并推送处置建议', cluster: 'engine', subGroup: '协同引擎', status: 'running', health: 99, tasksCompleted: 78901, uptime: '99.9%', algorithm: '异常检测、舆情监控、多维预警融合' },
  { id: 36, name: '飞轮闭环引擎', role: '业务飞轮闭环驱动', replacedPosition: '增长负责人', description: '驱动内容生产→投放投流→转化成交→数据反馈完整闭环，实现玛丽黛佳直播带货业务自我进化', cluster: 'engine', subGroup: '协同引擎', status: 'running', health: 99, tasksCompleted: 67890, uptime: '99.9%', algorithm: '闭环反馈系统、进化算法、业务飞轮模型' },
  { id: 45, name: 'A/B实验自动化引擎', role: '广告实验设计与统计分析', replacedPosition: '增长实验分析师', description: '自动设计和分析广告创意/出价/人群A/B实验，基于贝叶斯统计快速得出显著结论，压缩实验周期从14天到3天', cluster: 'engine', subGroup: '数据实验引擎', status: 'running', health: 96, tasksCompleted: 18720, uptime: '99.7%', algorithm: '贝叶斯A/B测试、多变量实验设计、置信区间自动计算' },
  { id: 46, name: '反欺诈检测引擎', role: '广告无效流量与欺诈检测', replacedPosition: '广告反作弊专员', description: '实时过滤刷量/点击欺诈/虚假流量，保护广告预算不被恶意消耗，年均拦截无效预算超¥280万', cluster: 'engine', subGroup: '数据实验引擎', status: 'running', health: 98, tasksCompleted: 56340, uptime: '99.9%', algorithm: 'IP指纹识别、行为模式检测、欺诈评分模型、实时流过滤' },
  { id: 47, name: '数仓调度引擎', role: '数据仓库ETL自动化', replacedPosition: '数据工程师', description: '自动调度各平台广告数据ETL任务，统一多平台数据入仓，保障24小时数据完整性与T+0时效性', cluster: 'engine', subGroup: '数据基础设施', status: 'running', health: 97, tasksCompleted: 89450, uptime: '99.8%', algorithm: 'DAG任务调度、数据质量检测、增量同步、异常自动修复' },
  { id: 48, name: '品牌舆情监测引擎', role: '全网品牌舆情实时追踪', replacedPosition: '品牌公关监测专员', description: '7×24小时监控抖音/小红书/微博/Twitter/Instagram品牌相关舆情，识别负面内容并分级预警，自动推送处置建议', cluster: 'engine', subGroup: '数据基础设施', status: 'running', health: 95, tasksCompleted: 34560, uptime: '99.6%', algorithm: '全网爬取、多语言情感分析、舆情分级、负面扩散预测' },

  // ===== 第五板块：国际投放集群（8个）=====
  { id: 37, name: 'Meta广告智能投手', role: 'Meta平台广告自动化投放', replacedPosition: 'Facebook/Instagram投手', description: '对接Meta Marketing API v18，自动创建/优化Facebook与Instagram广告系列，实时调整受众、出价与素材，跨境美妆ROAS稳定在4.0+', cluster: 'intl', subGroup: '国际平台投放', status: 'running', health: 97, tasksCompleted: 38420, uptime: '99.8%', algorithm: 'Meta Advantage+算法对接、自动化素材AB测试、ROAS目标优化' },
  { id: 38, name: 'TikTok全球投流智能体', role: 'TikTok for Business投放优化', replacedPosition: 'TikTok海外投手', description: 'TikTok for Business API全球投放，覆盖美国/日本/东南亚，智能管理Spark Ads与TopView，结合趋势音乐触发种草转化', cluster: 'intl', subGroup: '国际平台投放', status: 'running', health: 95, tasksCompleted: 24180, uptime: '99.6%', algorithm: 'TikTok Business API、趋势音乐追踪、跨市场个性化出价' },
  { id: 39, name: 'Google/YouTube智能体', role: 'Google Ads与YouTube投放优化', replacedPosition: 'Google Ads投手', description: '管理Google搜索广告/购物广告/YouTube视频广告，美妆关键词智能出价，覆盖海外高价值消费触点，购物广告ROAS 3.8+', cluster: 'intl', subGroup: '国际平台投放', status: 'running', health: 96, tasksCompleted: 19860, uptime: '99.7%', algorithm: 'Google Ads API v15、智能出价策略、Shopping Feed优化' },
  { id: 40, name: 'Amazon DSP智能体', role: 'Amazon品牌广告投放', replacedPosition: '亚马逊广告运营', description: '亚马逊DSP展示广告与品牌推广自动化，精准触达高购买意图美妆消费者，联动Amazon Store优化品牌旗舰店转化率', cluster: 'intl', subGroup: '国际平台投放', status: 'running', health: 93, tasksCompleted: 12350, uptime: '99.4%', algorithm: 'Amazon Advertising API v3、Purchase Intent Targeting、品牌展示归因' },
  { id: 41, name: '跨境内容本地化智能体', role: '多语言创意本地化', replacedPosition: '本地化内容运营', description: '将玛丽黛佳美妆内容自动翻译并本地化为英/日/韩/泰/马来语版本，结合当地美妆文化偏好调整文案风格与视觉表达', cluster: 'intl', subGroup: '国际内容运营', status: 'running', health: 94, tasksCompleted: 8740, uptime: '99.5%', algorithm: '多语言NLP翻译、文化适配模型、本地化质量评分' },
  { id: 42, name: '汇率风险管理智能体', role: '跨境广告预算汇率保护', replacedPosition: '跨境财务分析师', description: '实时监控USD/EUR/JPY/GBP汇率波动，超阈值自动触发预算保护，调整各货币区出价锁定实际ROI不受汇率侵蚀', cluster: 'intl', subGroup: '国际内容运营', status: 'running', health: 98, tasksCompleted: 5620, uptime: '99.9%', algorithm: 'LSTM汇率预测、风险对冲策略、动态预算保护规则引擎' },
  { id: 43, name: '全球隐私合规智能体', role: '海外广告法规与隐私合规', replacedPosition: '法务合规专员', description: '自动审核海外投放内容合规性（GDPR/CCPA/日本个人信息保护法），确保像素追踪与受众数据收集完全合法，零罚款记录', cluster: 'intl', subGroup: '国际合规风控', status: 'running', health: 99, tasksCompleted: 7890, uptime: '99.9%', algorithm: '多语言法规知识库、合规规则引擎、隐私风险评分' },
  { id: 44, name: '国际受众建模智能体', role: '全球美妆消费者人群建模', replacedPosition: '海外市场研究员', description: '构建海外分市场消费者画像（北美Z世代/日本成分党/东南亚升级消费），为跨境投放提供精准Lookalike人群定向策略', cluster: 'intl', subGroup: '国际合规风控', status: 'training', health: 88, tasksCompleted: 3210, uptime: '98.5%', algorithm: '跨文化用户聚类、Lookalike建模、海外行为数据融合' },

  // ===== 扩展：达人运营集群新增（2个，共10个）=====
  { id: 49, name: '复购激活智能体', role: '沉睡用户唤醒与复购提升', replacedPosition: '私域复购运营', description: '识别历史购买用户中的沉睡人群，基于RFM模型与生命周期阶段推送个性化新品推荐与专属优惠，品牌复购率提升18%', cluster: 'operations', subGroup: '私域复购运营', status: 'running', health: 93, tasksCompleted: 28760, uptime: '99.4%', algorithm: 'RFM模型、用户生命周期预测、个性化推荐引擎、召回策略优化' },
  { id: 50, name: '库存联动投放智能体', role: '库存状态与广告投放协同', replacedPosition: '供应链广告协调员', description: '实时获取各SKU库存水位，库存充足时自动加大投放力度，库存告警时降低出价保护售罄率，防止超卖与库存积压', cluster: 'operations', subGroup: '私域复购运营', status: 'running', health: 95, tasksCompleted: 15430, uptime: '99.6%', algorithm: '库存感知出价算法、缺货预测模型、投放节奏动态控制' },

  // ===== 扩展：美妆内容生产集群新增（2个，共14个）=====
  { id: 51, name: '搜索内容优化智能体', role: '平台搜索SEO优化', replacedPosition: '搜索运营专员', description: '针对抖音/小红书/淘宝搜索算法实时优化内容标题、标签与关键词布局，提升美妆内容自然搜索曝光量，实测搜索流量提升40%+', cluster: 'content', subGroup: '内容运营', status: 'running', health: 94, tasksCompleted: 21480, uptime: '99.5%', algorithm: '搜索意图分析、关键词竞争度模型、算法适配规则引擎' },
  { id: 52, name: '直播间视觉优化智能体', role: '直播间画面与布局优化', replacedPosition: '直播视觉运营', description: 'AI实时分析直播间构图质量（背景/打光/产品摆位/字幕布局），识别视觉短板并推送优化建议，直播间留存率提升22%', cluster: 'content', subGroup: '视觉生产', status: 'running', health: 92, tasksCompleted: 13560, uptime: '99.3%', algorithm: '计算机视觉构图评分、A/B视觉对照测试、留存率关联分析' },

  // ===== 第六板块：消费者运营集群（12个）— 全渠道C端自主运营 =====
  { id: 53, name: '全渠道旅程编排智能体', role: '全渠道用户旅程自动化编排', replacedPosition: 'CRM运营总监', description: '构建并自动执行企微+App推送+小程序+短信+邮件五端联动用户旅程，根据用户所处生命周期阶段（获客/激活/留存/复购/传播）智能切换触达策略，旅程覆盖率98.3%，平均响应延迟<5分钟', cluster: 'consumer', subGroup: '全渠道触达', status: 'running', health: 97, tasksCompleted: 48230, uptime: '99.8%', algorithm: '马尔科夫决策过程、用户生命周期模型、多臂老虎机渠道选择、实时事件驱动调度' },
  { id: 54, name: '新用户激活智能体', role: '新用户首购激活与引导', replacedPosition: '用户增长运营', description: '首次注册/关注用户自动触发7天激活漏斗：品牌故事推送→成分科普→专属优惠券→购前答疑→首单转化，首单转化率从12%提升至28%', cluster: 'consumer', subGroup: '全渠道触达', status: 'running', health: 95, tasksCompleted: 34610, uptime: '99.6%', algorithm: '激活漏斗建模、首购意图预测、个性化onboarding策略、A/B旅程测试' },
  { id: 55, name: 'AI智能客服智能体', role: '全渠道AI客服与售前咨询', replacedPosition: '客服专员×8人', description: '7×24小时自动回复微信/企微/淘宝/抖音/小红书五端用户咨询，支持色号推荐/成分解答/发货查询/退换货处理，问题解决率91.2%，人工转接率仅8.8%', cluster: 'consumer', subGroup: '客服与口碑', status: 'running', health: 96, tasksCompleted: 186450, uptime: '99.9%', algorithm: '多轮对话模型（Fine-tuned LLM）、FAQ知识库检索、情绪识别、意图分类、人工介入阈值控制' },
  { id: 56, name: '评论口碑运营智能体', role: '全平台评论监控与主动运营', replacedPosition: '口碑运营专员×3人', description: '全量监控淘宝/抖音/小红书/京东评论，自动生成个性化回复，主动邀请好评，差评30分钟内触发处置工单，好评率从86%提升至94%', cluster: 'consumer', subGroup: '客服与口碑', status: 'running', health: 93, tasksCompleted: 62340, uptime: '99.5%', algorithm: '评论情感分析、差评根因分类、回复质量评分模型、平台风险感知' },
  { id: 57, name: '个性化推荐智能体', role: '全场景商品个性化推荐', replacedPosition: '商品运营专员', description: '基于DeepFM协同过滤+用户实时行为序列，在小程序首页/购后页/企微推送/App Banner等全场景实时推荐，推荐点击率18.4%（行业均值7.2%），推荐带来GMV占比31.6%', cluster: 'consumer', subGroup: '个性化运营', status: 'running', health: 98, tasksCompleted: 891230, uptime: '99.9%', algorithm: 'DeepFM协同过滤、Item2Vec商品嵌入、Wide&Deep混合模型、BERT语义召回、实时特征流' },
  { id: 58, name: '会员权益精细化运营智能体', role: '会员分层权益管理与升级促动', replacedPosition: '会员运营专员', description: '实时监控每位会员的积分/消费/成长值，在升级节点前自动推送差距提醒与专属刺激，会员升级转化率提升34%；检测降级风险并触发挽留策略，会员流失率降低21%', cluster: 'consumer', subGroup: '个性化运营', status: 'running', health: 94, tasksCompleted: 29870, uptime: '99.6%', algorithm: '会员生命周期预测、升级概率建模、积分价值评估引擎、个性化权益匹配' },
  { id: 59, name: '用户生命周期预测智能体', role: '用户LTV预测与阶段分类', replacedPosition: '用户数据分析师', description: '基于BG/NBD+Gamma-Gamma+DNN修正模型预测每位用户的12个月LTV，实时判断生命周期阶段（成长期/成熟期/衰退期/流失期），输出分层运营策略，LTV预测准确率84.9%', cluster: 'consumer', subGroup: '个性化运营', status: 'running', health: 91, tasksCompleted: 18920, uptime: '99.3%', algorithm: 'BG/NBD存活模型、Gamma-Gamma消费模型、深度学习修正层、RFM特征工程、SHAP解释输出' },
  { id: 60, name: '裂变增长智能体', role: '社交裂变与口碑传播自动化', replacedPosition: '增长运营专员', description: '自动识别高传播潜力用户（K因子>1.5），触发个性化裂变任务（分享有礼/拼团/邀请好友），实时追踪裂变链路与病毒系数，月均新增裂变用户12,400人，K因子1.8', cluster: 'consumer', subGroup: '增长裂变', status: 'running', health: 92, tasksCompleted: 34560, uptime: '99.4%', algorithm: 'K因子模型、传播链路追踪、高潜用户识别、裂变激励策略强化学习、双边增长建模' },
  { id: 61, name: '社群内容治理智能体', role: '品牌社群内容审核与氛围维护', replacedPosition: '社群运营专员×4人', description: '实时审核品牌企微群/小程序社区的用户发言，自动过滤垃圾广告/竞品引流/负面情绪内容，识别并激励高质量UGC贡献者，群活跃度提升45%，人工干预减少80%', cluster: 'consumer', subGroup: '增长裂变', status: 'running', health: 96, tasksCompleted: 78230, uptime: '99.7%', algorithm: '内容安全多分类模型、意图识别、UGC质量评分、用户影响力排序、自动激励触发引擎' },
  { id: 62, name: '购后体验优化智能体', role: '售后全流程体验优化', replacedPosition: '售后运营专员×2人', description: '订单完成后自动触发物流通知/到货提醒/使用教程推送/使用后测评邀请，识别退换货风险并提前干预（退货率降低14%），NPS自动采集与分析，NPS从42提升至67', cluster: 'consumer', subGroup: '客服与口碑', status: 'running', health: 95, tasksCompleted: 52140, uptime: '99.6%', algorithm: '订单生命周期建模、退货风险预测XGBoost、NPS驱动因素分析、满意度预测模型' },
  { id: 63, name: '消费者情绪洞察智能体', role: '实时消费者情绪与需求挖掘', replacedPosition: '消费者研究员×2人', description: '7×24小时扫描全渠道消费者声音（评论/弹幕/问答/社群/客服对话），实时构建消费者情绪地图，识别新兴需求与产品改进点，每周输出消费者洞察报告，洞察响应速度从2周压缩至48小时', cluster: 'consumer', subGroup: '客服与口碑', status: 'running', health: 94, tasksCompleted: 43280, uptime: '99.5%', algorithm: '细粒度情感分析RoBERTa、需求主题建模LDA、消费者画像实时更新、跨渠道声音聚合引擎' },
  { id: 64, name: '跨渠道频次管控智能体', role: '全渠道触达频次与疲劳管理', replacedPosition: '运营策略专员', description: '统一管控用户在企微/App/短信/邮件/小程序各端收到的推送总频次，AI计算每位用户的最优接触间隔，避免打扰疲劳导致退订，退订率降低38%，推送总ROI提升22%', cluster: 'consumer', subGroup: '全渠道触达', status: 'running', health: 97, tasksCompleted: 67890, uptime: '99.8%', algorithm: '多渠道频次约束优化、疲劳度建模、最优接触时机预测、全局推送调度引擎' },
]

export const clusterInfo = {
  content: { name: '美妆内容生产集群', count: 14, color: '#e8365d', icon: 'Sparkles' },
  marketing: { name: '投放优化集群', count: 10, color: '#f43f6e', icon: 'TrendingUp' },
  operations: { name: '达人运营集群', count: 10, color: '#fb7185', icon: 'Users' },
  engine: { name: '协同引擎', count: 10, color: '#fda4af', icon: 'Cog' },
  intl: { name: '国际投放集群', count: 8, color: '#0ea5e9', icon: 'Globe' },
  consumer: { name: '消费者运营集群', count: 12, color: '#a78bfa', icon: 'Heart' },
}

export const platforms = [
  { name: '抖音巨量引擎', icon: '抖', color: '#e8365d', status: 'active', spend: 312456, impressions: 28765432, ctr: 3.8, cvr: 9.2, roi: 4.1 },
  { name: '小红书聚光', icon: '红', color: '#f43f6e', status: 'active', spend: 178932, impressions: 15234567, ctr: 4.2, cvr: 7.8, roi: 3.6 },
  { name: '快手磁力引擎', icon: '快', color: '#fb7185', status: 'active', spend: 134567, impressions: 12345678, ctr: 3.1, cvr: 8.5, roi: 3.2 },
  { name: '微信广告', icon: '微', color: '#fda4af', status: 'active', spend: 89234, impressions: 6789012, ctr: 2.6, cvr: 6.4, roi: 2.8 },
  { name: '天猫品销宝', icon: '猫', color: '#e8365d', status: 'active', spend: 67890, impressions: 4567890, ctr: 5.1, cvr: 14.3, roi: 5.2 },
  { name: '京东京准通', icon: '京', color: '#f43f6e', status: 'active', spend: 45678, impressions: 2345678, ctr: 3.7, cvr: 11.2, roi: 4.0 },
  { name: '百度信息流', icon: '百', color: '#fb7185', status: 'pending', spend: 0, impressions: 0, ctr: 0, cvr: 0, roi: 0 },
  { name: 'B站花火', icon: 'B', color: '#fda4af', status: 'pending', spend: 0, impressions: 0, ctr: 0, cvr: 0, roi: 0 },
  { name: '微博超级粉丝通', icon: '博', color: '#e8365d', status: 'pending', spend: 0, impressions: 0, ctr: 0, cvr: 0, roi: 0 },
  { name: '拼多多推广', icon: '拼', color: '#f43f6e', status: 'pending', spend: 0, impressions: 0, ctr: 0, cvr: 0, roi: 0 },
  // 🌍 国际平台
  { name: 'Meta Ads', icon: 'M', color: '#1877f2', status: 'active', spend: 89600, impressions: 8450000, ctr: 2.8, cvr: 6.2, roi: 4.04 },
  { name: 'TikTok Global', icon: 'T', color: '#8b5cf6', status: 'active', spend: 64000, impressions: 6200000, ctr: 3.4, cvr: 7.8, roi: 4.65 },
  { name: 'Google Ads', icon: 'G', color: '#22c55e', status: 'active', spend: 46000, impressions: 3800000, ctr: 4.2, cvr: 5.8, roi: 3.19 },
  { name: 'Amazon DSP', icon: 'A', color: '#f59e0b', status: 'active', spend: 28000, impressions: 1850000, ctr: 1.8, cvr: 9.4, roi: 3.45 },
]

export const kafkaEvents = [
  { type: 'content.created', producer: '种草文案智能体', consumer: '内容合规审核智能体', desc: '种草内容生产完成，触发合规审核' },
  { type: 'material.approved', producer: '内容合规审核智能体', consumer: '抖音智能投手智能体', desc: '素材审核通过，加入投放素材池' },
  { type: 'trend.beauty', producer: '实时趋势捕捉引擎', consumer: '种草文案智能体', desc: '美妆趋势发现，触发相关内容生产' },
  { type: 'kol.matched', producer: 'KOL筛选智能体', consumer: 'Brief生成智能体', desc: '达人匹配成功，自动生成合作brief' },
  { type: 'livestream.started', producer: '直播排期智能体', consumer: '直播间投流智能体', desc: '直播开始，自动启动直播间投流' },
  { type: 'roi.alert', producer: 'ROI监控智能体', consumer: '预算分配智能体', desc: 'ROI预警触发，动态调整跨平台预算' },
  { type: 'product.launched', producer: '品牌系统', consumer: '短视频脚本智能体', desc: '新品上市，触发批量脚本与内容生产' },
  { type: 'gmv.milestone', producer: '直播间投流智能体', consumer: '飞轮闭环引擎', desc: 'GMV里程碑达成，反馈优化投放策略' },
  { type: 'audience.insight', producer: '消费者洞察引擎', consumer: '人群定向智能体', desc: '受众洞察更新，优化人群定向包' },
  { type: 'compliance.blocked', producer: '内容合规审核智能体', consumer: '种草文案智能体', desc: '合规拦截，触发文案重新生成' },
  // 🌍 国际投放集群事件 (agents 37-44)
  { type: 'meta.campaign.optimized', producer: 'Meta广告智能投手', consumer: '预算分配智能体', desc: 'Meta广告ROAS优化完成，自动调整Facebook/Instagram出价与人群定向' },
  { type: 'tiktok_global.conversion', producer: 'TikTok全球投流智能体', consumer: '归因分析智能体', desc: 'TikTok Global转化事件归因，JP+US市场共振效果分析完成' },
  { type: 'currency.alert.triggered', producer: '汇率风险管理智能体', consumer: '跨平台协同智能体', desc: 'EUR/CNY汇率波动2.8%超阈值，触发自动对冲预算保护机制' },
  { type: 'content.localized', producer: '跨境内容本地化智能体', consumer: 'Meta广告智能投手', desc: '多语言素材本地化完成，英/日/韩版本推入投放素材池' },
  { type: 'compliance.gdpr.passed', producer: '全球隐私合规智能体', consumer: '国际受众建模智能体', desc: 'GDPR合规审核通过，欧洲市场受众数据处理合规确认' },
  // 扩展协同引擎事件 (agents 45-48)
  { type: 'ab.experiment.concluded', producer: 'A/B实验自动化引擎', consumer: '素材轮换智能体', desc: 'A/B实验置信度达95%，B组素材CTR+28%，触发全量发布' },
  { type: 'fraud.blocked', producer: '反欺诈检测引擎', consumer: 'ROI监控智能体', desc: '检测到156次异常点击注入，已实时拦截并标记无效流量来源' },
  { type: 'warehouse.etl.done', producer: '数仓调度引擎', consumer: '消费者洞察引擎', desc: 'T+0跨平台数据入仓完成，28个数据源同步就绪，数据质量99.2%' },
  { type: 'sentiment.crisis.alert', producer: '品牌舆情监测引擎', consumer: '智能预警引擎', desc: '检测到微博负面舆情扩散，已分级为L2预警并推送公关处置建议' },
  // 达人运营扩展事件 (agents 49-50)
  { type: 'repurchase.wave.initiated', producer: '复购激活智能体', consumer: '社群运营智能体', desc: '沉睡用户唤醒波次启动，8,400名用户触达，个性化推荐推送完成' },
  { type: 'inventory.alert.synced', producer: '库存联动投放智能体', consumer: '预算分配智能体', desc: '唇釉#105库存进入告警线(72件)，自动降低出价23%保护售罄率' },
  // 内容生产扩展事件 (agents 51-52)
  { type: 'seo.content.optimized', producer: '搜索内容优化智能体', consumer: '种草文案智能体', desc: '小红书/抖音搜索关键词优化完成，触发12条文案标题更新' },
  { type: 'livestream.visual.improved', producer: '直播间视觉优化智能体', consumer: '直播排期智能体', desc: 'AI检测LIVE-001打光不足，推送构图优化建议，直播间留存率+8%' },
  // 消费者运营集群事件 (agents 53-64)
  { type: 'journey.stage.transition', producer: '全渠道旅程编排智能体', consumer: '个性化推荐智能体', desc: '用户#U88421进入"复购期"阶段，触发跨渠道复购激活旅程并推送个性化推荐' },
  { type: 'new.user.onboarded', producer: '新用户激活智能体', consumer: '会员权益精细化运营智能体', desc: '新用户完成首单激活，自动开通普通会员权益并推送升级路径说明' },
  { type: 'cs.resolved', producer: 'AI智能客服智能体', consumer: '购后体验优化智能体', desc: '色号咨询已自动解答，触发购后使用教程推送与好评邀请' },
  { type: 'review.negative.detected', producer: '评论口碑运营智能体', consumer: '消费者情绪洞察智能体', desc: '抖音检测到3条差评（色号偏差），已触发处置工单并同步情绪地图更新' },
  { type: 'recommendation.clicked', producer: '个性化推荐智能体', consumer: '全渠道旅程编排智能体', desc: '用户点击推荐商品但未购买，旅程编排智能体触发24小时后续跟进流程' },
  { type: 'member.upgrade.triggered', producer: '会员权益精细化运营智能体', consumer: '裂变增长智能体', desc: '用户距金卡差¥80，已推送"邀友拼单达标"裂变任务完成升级' },
  { type: 'ltv.high.identified', producer: '用户生命周期预测智能体', consumer: '全渠道旅程编排智能体', desc: '识别高LTV用户群(预测¥2800+)，触发VIP专属旅程与专属客服分配' },
  { type: 'viral.wave.launched', producer: '裂变增长智能体', consumer: '社群运营智能体', desc: '本周裂变活动启动，K因子1.8，预计带来12,400新用户，社群同步配合扩散' },
  { type: 'community.ugc.promoted', producer: '社群内容治理智能体', consumer: '用户UGC激励智能体', desc: '识别到高质量UGC帖子(互动率8.4%)，已推入优质内容池并触发激励奖励' },
  { type: 'post.purchase.nps.collected', producer: '购后体验优化智能体', consumer: '消费者情绪洞察智能体', desc: 'NPS调研回收340份，净推荐值67，识别到"快递时效"为主要痛点' },
  { type: 'emotion.insight.report', producer: '消费者情绪洞察智能体', consumer: '消费者洞察引擎', desc: '周度消费者情绪报告生成：成分安全关注度↑18%，色号范围需求↑12%' },
  { type: 'push.frequency.controlled', producer: '跨渠道频次管控智能体', consumer: '全渠道旅程编排智能体', desc: '用户#U12309今日已达3次触达上限，后续推送已延迟至明日9:00优先级队列' },
]

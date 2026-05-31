# 内容拆解 Agent 构造设计

- Date: 2026-04-23
- Status: V1.1 已审定，可进入实施
- Scope: 最小飞轮 — 内容生产内循环第一个 Agent
- 数据来源: [20260416-20260422] 自营非挂车视频详情数据（2930条，实际跨月）
- 同行评审: GPT peer review 已审阅，9点采纳7点，2点推迟至V2

---

## 0. 采纳说明（同行评审结论）

| 评审点 | 采纳情况 | 说明 |
|--------|---------|------|
| 问题1：多目标评分替代单一GMV | ✅ 采纳，写入§3 | 单一GMV受直播承接质量干扰太大 |
| 问题2：商品真相标准化 productTruth | ✅ 采纳，写入§4 | 防止LLM每次对同商品理解漂移 |
| 问题3：referenceContent改为证据集 | ✅ 采纳，写入§4 | 单条参考视频样本不稳定 |
| 问题4：增加storyBeats镜头节拍 | ✅ 采纳，写入§4 | 素材拼接Agent直接依赖此字段 |
| 问题5：内部拆3段（Retriever/Ranker/Composer） | ✅ 采纳，写入§6 | 可调试可反哺，不做黑箱 |
| 建议1：改为检索增强型Agent | ✅ 采纳，写入§6 | RAG > 纯LLM，稳定性更高 |
| 建议2：结构卡服务3个下游 | ✅ 采纳，写入§4 | 脚本/素材/投放三个Agent都要消费 |
| 建议3：增加feedbackHooks回写字段 | ✅ 采纳，写入§4 | 数据反哺Agent需要 |
| 数据时间范围问题 | ✅ 采纳，写入§5 | 数据确认跨月，用全量+时间衰减策略 |

**不采纳 / 推迟的**：
- "目标函数打分公式"中权重数值推迟——V1先用固定排序逻辑，真实数据跑通后再校准权重
- "confidenceScore"字段推迟——V1先做确定性逻辑，V2加贝叶斯置信分

---

## 1. 数据洞察（基于真实历史数据）

### 1.1 账号结构
| 账号 | 视频数 | 定位 |
|------|--------|------|
| 玛丽黛佳MARIE DALGAR | 1765 | 主品牌号，所有内容类型 |
| 玛丽黛佳底妆官方直播间 | 752 | 底妆专线，直播引流 |
| 玛丽黛佳腮红官方直播间 | 413 | 腮红专线，直播引流 |

### 1.2 核心数据结论（影响Agent目标函数）

**结论1：视频直接成交几乎为零**
- 2930条视频中，直接成交订单最高仅1单
- 视频商业价值完全在"引流直播间GMV"

**结论2：完播率极低但分布宽**
- 中位数 1.37%，均值 4.34%
- P90: 10%，P95: 18%
- 高观看（>1w）优质内容集中在 3-7%
- 平均观看时长大量在 2-3 秒 — **前3秒是生死线**

**结论3：引流直播GMV头部集中**
| 排名 | 标题摘要 | 引流GMV | 观看 | 完播率 |
|------|---------|---------|------|--------|
| 1 | 24小时持妆+14小时控油...种籽气垫2.0 | ¥54,182 | 268,690 | 2.52% |
| 2 | 4个100多，有气垫有油霜还能免费试用 | ¥38,948 | 154,090 | 0.47% |
| 3 | 谁懂这个种籽气垫的含金量！我来长白山只用它 | ¥34,366 | 99,453 | 4.92% |

**结论4：高引流GMV内容5种模式**
| 模式 | 代表片段 | 完播率 | 引流GMV特征 |
|------|---------|--------|------------|
| 技术卖点型 | "24小时持妆+14小时控油" "换皮级细腻" | 中等 | 单条最高GMV |
| 场景植入型 | "我来长白山只用它" "蹭不掉" | **最高4-7%** | GMV稳定 |
| 情绪共鸣型 | "谁懂这个...的含金量" "真的服气" | 高，互动强 | GMV中等 |
| 价格机制型 | "买1发13" "4个100多" "拍1发11" | 低 | GMV高但靠流量堆 |
| 明星背书型 | "枫稳同款" "林枫松陈稳" | 中等 | 观看基数大 |

> ⚠️ 同行评审提示：价格机制型GMV高，但**依赖直播承接质量和当日活动力度**，不应成为内容模式主导。Agent需避免过度偏向此类模式。

**结论5：高性能内容结构规律**
```
[前2秒] 情绪钩/场景钩/问句钩 — 决定是否继续看
[3-8秒] 1-2个超级卖点 + 量化指标（持妆X小时 / 控油X小时）
[8-15秒] 使用场景或对比效果
[结尾]   直播间福利CTA（买1发N / 限时活动）
```

**结论6：数据时间范围（重要边界条件）**
- 文件名标注 2026-04-16 至 2026-04-22
- 实际数据跨月，包含 2025-12 至 2026-04 的多月内容
- **Agent历史样本池策略：全量历史 + 时间衰减**（近30天系数×2，近90天×1.5，更早×1）
- 不按文件名边界截断，避免丢失跨月优质样本

### 1.3 高频hashtag（内容分类依据）
```
底妆类: #玛丽黛佳种籽气垫(573)  #底妆(227)  #气垫(215)  #玛丽黛佳900目(178)
腮红类: #腮红(318)  #玛丽黛佳腮红(302)  #挑战一颗腮红画全妆(78)
人群类: #新手化妆(62)  #高级感美女(57)  #显脸小(57)
功能类: #防水防汗不脱妆(61)  #美妆种草(141)  #明星同款(76)
```

---

## 2. Agent 定位

### 2.1 在飞轮中的位置
```
[内容拆解 Agent]   ← 本 Agent
       ↓
[脚本生成 Agent]
       ↓
[素材拼接 Agent]
       ↓
[抖音发布/投放 Agent]
       ↓
[效果采集 Agent]
       ↓
[数据反哺 Agent]  → 更新脚本知识库 → 循环输入本 Agent
```

### 2.2 职责边界
- **做**：商品真相标准化 → 历史内容检索 → 模式识别排序 → 生成内容结构卡
- **不做**：不生成脚本台词，不接触素材，不操作抖音，不做投放决策

### 2.3 目标函数（多目标评分，替代单一GMV）

> 同行评审采纳点：单一引流GMV受主播状态/活动力度/流量分发干扰，需多目标综合评分

**V1 内容评分公式**（权重V1先固定，跑通后再数据校准）：
```
内容结构分 =
  引流直播间GMV       × 40%
  引流直播间次数      × 25%
  完播率              × 15%
  平均观看时长(秒)    × 10%
  看后搜支付金额      × 10%
```

**为什么不只用GMV**：
- GMV离内容本身有2步距离（直播承接质量 + 当日活动力度）
- 完播率是内容质量最直接指标
- 引流次数反映内容"导流能力"而非"变现能力"
- 看后搜支付是品牌记忆力指标，长期价值高

---

## 3. Agent 内部架构（4段式，检索增强型）

> 同行评审采纳：不做黑箱LLM，拆成可调试的3段内部能力 + 1段标准化前处理

```
输入层
  └── 商品真相标准化（ProductTruth Builder）  ← 标准化SKU输入，防LLM漂移

检索层
  └── Pattern Retriever  ← 从历史视频池按多维条件检索Top候选

排序层
  └── Pattern Ranker  ← 对候选模式按多目标评分排序

生成层
  └── Card Composer  ← LLM基于排序结果生成结构化内容结构卡
```

### 3.1 Pattern Retriever（历史检索）
**检索条件**（按优先级）：
1. sku_tag 匹配（同SKU）
2. 目标人群匹配（skinType / ageGroup）
3. 营销节点匹配（大促/日常/新品）
4. 时间衰减系数（近30天权重×2，近90天×1.5，更早×1）
5. 最低观看门槛（>5,000次，过滤噪声数据）

**输出**：最多20条候选视频，含完整指标

### 3.2 Pattern Ranker（模式排序）
**步骤**：
1. 对20条候选视频按§2.3多目标评分公式打分
2. 按钩子类型归组（场景植入/技术卖点/情绪共鸣/价格机制/明星背书）
3. 每组取Top3，输出候选模式排行
4. 当前营销节点加权（如大促期，价格机制型上调权重10%）

**输出**：`patternRanking[]`，含主导模式+备选模式

### 3.3 Card Composer（LLM生成）
**输入给LLM的上下文**：
- 商品真相卡（productTruth）
- 目标人群描述
- 营销节点
- patternRanking Top1-3
- 参考视频证据集（referenceVideos Top3-5条）

**LLM指令方向**：
- 生成符合主导模式的内容结构卡
- openingHook必须在3秒内说完
- coreSellingPoints最多2个，必须来自productTruth.evidencePoints
- storyBeats总时长不超过videoDurationSec
- 不得使用productTruth.forbiddenClaims中的词汇

---

## 4. 内容结构卡 V1.1 JSON Schema

> 升级说明：相比V1新增 productTruth / referenceVideos证据集 / storyBeats / feedbackHooks

```json
{
  "cardId": "csc-20260423-001",
  "cardVersion": "1.1",
  "generatedAt": "2026-04-23T10:00:00",
  "agentDefinitionId": "content-deconstructor-v1",

  "productTruth": {
    "skuId": "种籽气垫2.0",
    "productName": "玛丽黛佳种籽气垫2.0",
    "category": "底妆/气垫",
    "coreBenefits": ["持妆", "控油", "轻薄", "遮瑕"],
    "evidencePoints": ["24小时持妆", "14小时控油", "微米级粉体薄如蝉翼", "遮瑕力强", "养肤成分"],
    "targetSkinType": ["干皮", "混干皮"],
    "forbiddenClaims": ["绝对不脱妆", "医疗功效", "100%适合所有肤质"],
    "promotionMechanisms": ["买1发13", "直播间福利"],
    "preferredScenes": ["早八", "旅游", "约会", "通勤"]
  },

  "contentStrategy": {
    "hookType": "场景植入型",
    "openingHook": "旅游/早八/约会 蹭不掉的底妆，你只要一块气垫就够了",
    "hookDurationSec": 3,
    "coreMessage": "全天不脱妆，干皮/混干皮必备",
    "keySellingPoints": ["24小时持妆", "14小时控油"],
    "conversionMechanism": "直播间买1发13",
    "callToAction": "点进直播间抢先购"
  },

  "targeting": {
    "skinType": "干皮/混干皮",
    "ageGroup": "18-30",
    "lifestyleScene": "职场早八 + 旅游出行",
    "painPoint": "底妆容易脱妆花妆",
    "desiredOutcome": "全天持妆不补妆"
  },

  "storyBeats": [
    {
      "seq": 1,
      "durationSec": 3,
      "purpose": "hook",
      "content": "旅游/早八/约会，蹭不掉的底妆只要一块气垫",
      "visualHint": "户外场景/通勤场景开场，前后对比或运动感画面",
      "audioHint": "强口播+大字标题叠加"
    },
    {
      "seq": 2,
      "durationSec": 5,
      "purpose": "selling-point",
      "content": "24小时持妆+14小时控油，微米级粉体薄如蝉翼",
      "visualHint": "产品特写+妆面近景，放大毛孔遮盖效果",
      "audioHint": "量化数字强调，字幕突出数字"
    },
    {
      "seq": 3,
      "durationSec": 4,
      "purpose": "proof",
      "content": "长时间带妆验证，旅游一整天妆容完整",
      "visualHint": "旅游/运动/出汗场景，全天妆容对比",
      "audioHint": "情绪化语气，'真的服了'"
    },
    {
      "seq": 4,
      "durationSec": 3,
      "purpose": "cta",
      "content": "点进直播间抢买1发13，限时福利",
      "visualHint": "福利信息大字板，直播间入口引导",
      "audioHint": "限时感，语速加快"
    }
  ],

  "contentFormat": {
    "videoType": "产品种草/引流直播间",
    "recommendedDurationSec": 15,
    "recommendedRatio": "9:16",
    "captionHashtags": [
      "#玛丽黛佳种籽气垫",
      "#底妆",
      "#防水防汗不脱妆",
      "#早八必备"
    ]
  },

  "marketingContext": {
    "marketingNode": "日常投放",
    "limitedEdition": null,
    "celebrity": "林枫松/陈稳（可选叠加）",
    "promotionMechanism": "直播间买1发13"
  },

  "referenceContent": {
    "referenceVideos": [
      {
        "videoId": "7623342087932480809",
        "title": "谁懂这个#玛丽黛佳种籽气垫的含金量啊！我来长白山只用它！",
        "patternType": "场景植入型+情绪共鸣型",
        "views": 99453,
        "completionRate": 4.92,
        "liveGmv": 34365.82,
        "compositeScore": 0.91,
        "whySelected": "场景植入+完播率高+引流GMV稳定"
      },
      {
        "videoId": "7622304011953229065",
        "title": "国货彩妆顶流 x「24小时持妆+14小时控油」微米级粉体...",
        "patternType": "技术卖点型",
        "views": 268690,
        "completionRate": 2.52,
        "liveGmv": 54182.14,
        "compositeScore": 0.88,
        "whySelected": "技术卖点型GMV天花板参考"
      }
    ],
    "patternSummary": {
      "dominantPattern": "场景植入型",
      "secondaryPattern": "技术卖点型",
      "promotionPattern": "直播间买1发N",
      "avoidPattern": "价格机制型单独使用（GMV高但依赖直播承接，不稳定）"
    }
  },

  "feedbackHooks": {
    "primaryMetric": "live_gmv",
    "secondaryMetrics": ["live_traffic_count", "completion_rate", "avg_watch_sec", "post_search_gmv"],
    "experimentKey": "hookType:场景植入型__scene:早八旅游__promotion:买1发13",
    "knowledgeBaseWritable": true,
    "feedbackTarget": "content_pattern_library",
    "expectedThreshold": {
      "live_gmv_min": 5000,
      "completion_rate_min": 2.0,
      "avg_watch_sec_min": 4
    }
  }
}
```

---

## 5. 下游接口约定

结构卡设计为**同时服务3个下游Agent**（同行评审采纳）：

| 下游Agent | 消费字段 |
|-----------|---------|
| 脚本生成 Agent | productTruth + contentStrategy + targeting + storyBeats |
| 素材拼接 Agent | storyBeats（visualHint/audioHint） + contentFormat |
| 投放 Agent | targeting + marketingContext + feedbackHooks.expectedThreshold |

**脚本生成Agent必填输入（来自本卡）**：
```
hookType          # 钩子类型
openingHook       # 开场钩子（3秒内）
keySellingPoints  # 核心卖点数组（≤2个）
targetAudience    # 目标人群描述
scene             # 使用场景
conversionCTA     # 转化行动号召
hashtagGroups     # 推荐hashtag
videoDurationSec  # 推荐时长（秒）
storyBeats        # 镜头节拍（含口播方向）
forbiddenClaims   # 禁用词（来自productTruth）
```

---

## 6. Java 后端新增内容

### 6.1 新增聚合：ContentStructureCard

```
marketing-person-client
  └── ContentStructureCardFeign (generate / listPage / get / approve)
  └── ContentStructureCardGenerateCmd
  └── ContentStructureCardDTO

marketing-person-domain
  └── contentStructureCard/model/ContentStructureCard.java
  └── contentStructureCard/ability/ContentDeconstructorDomainService.java

marketing-person-dbsdk
  └── ContentStructureCardDO
  └── ContentStructureCardDOMapper + XML (card_id/sku_id/hook_type/status/card_json)

marketing-person-infrastructure
  └── ContentStructureCardController
  └── ContentStructureCardCmdExecutor (generate/approve)
  └── ContentStructureCardQryExecutor (listPage/get)
  └── ContentStructureCardGatewayImpl
  └── ContentDeconstructorAppService  ← 核心编排服务
  └── ContentPatternMatcher           ← 模式检索+排序
```

### 6.2 新增表：VideoPerformanceRecord（历史数据基础）

```sql
CREATE TABLE video_performance_record (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    nezha_tenant_code VARCHAR(64),
    video_id        VARCHAR(64) NOT NULL,   -- 抖音视频ID
    account_id      VARCHAR(64),            -- 账号抖音号
    title           VARCHAR(500),
    publish_time    DATETIME,
    is_promoted     TINYINT(1),             -- 是否投放
    views           BIGINT,
    likes           INT,
    comments        INT,
    saves           INT,
    shares          INT,
    completion_rate DECIMAL(10,4),          -- 完播率%
    avg_watch_sec   INT,                    -- 平均观看秒数
    live_gmv        DECIMAL(14,2),          -- 引流直播间GMV
    live_traffic    INT,                    -- 引流直播间次数
    direct_orders   INT,
    direct_gmv      DECIMAL(14,2),
    post_search_gmv DECIMAL(14,2),          -- 看后搜支付金额
    composite_score DECIMAL(10,4),          -- 多目标综合评分
    sku_tag         VARCHAR(128),           -- 关联SKU（人工/自动标注）
    hook_type       VARCHAR(64),            -- 内容钩子类型
    content_pattern VARCHAR(128),           -- 内容模式标签
    is_deleted      TINYINT(1) DEFAULT 0,
    create_at       DATETIME,
    create_by       BIGINT,
    update_at       DATETIME,
    update_by       BIGINT
);
```

### 6.3 核心服务伪代码

```java
// ContentDeconstructorAppService
public ContentStructureCardDTO generate(
    String skuId,
    String targetAudience,    // "干皮/混干皮"
    String marketingNode,     // "日常投放"
    String accountId
) {
    // Step 1: 商品真相标准化
    ProductTruth truth = productTruthBuilder.build(skuId);

    // Step 2: Pattern Retriever — 历史检索（时间衰减）
    List<VideoPerformanceRecord> candidates = patternMatcher.retrieve(
        skuId, targetAudience, marketingNode, topN=20
    );

    // Step 3: Pattern Ranker — 多目标评分+模式归组
    PatternRanking ranking = patternMatcher.rank(candidates, marketingNode);

    // Step 4: Card Composer — LLM生成结构卡（via Hermes）
    ContentStructureCard card = cardComposer.compose(
        truth, targetAudience, marketingNode, ranking
    );

    // Step 5: 持久化 + AgentTrace
    save(card);
    traceService.record(card.getCardId(), "content-deconstructor-v1");

    return convertor.toDTO(card);
}
```

---

## 7. Hermes Skill 定义

**Skill ID**: `content-deconstructor`
**存放位置**: `hermes/skills/content-deconstructor/SKILL.md`

```yaml
---
name: content-deconstructor-v1
description: "基于SKU历史视频数据，生成4层内容结构卡（策略/节拍/反馈），供脚本/素材/投放三个下游Agent消费"
version: v1
source: beukay-agent-studio
model: claude-sonnet-4-6

inputs:
  - sku_id: string           # SKU标识
  - target_audience: object  # 目标人群（skinType/ageGroup/scene）
  - marketing_node: string   # 日常投放/大促/新品/节日
  - account_id: string       # 抖音账号ID

outputs:
  - content_structure_card: object  # 完整内容结构卡JSON
  - reasoning: string               # 选择此钩子模式的数据依据

internal_steps:
  1. ProductTruth标准化
  2. 历史视频检索（Pattern Retriever）
  3. 模式排序（Pattern Ranker）
  4. 结构卡生成（Card Composer via LLM）
---
```

---

## 8. V1 MVP 固定参数

| 维度 | V1 固定值 |
|------|-----------|
| SKU | 种籽气垫2.0 |
| 账号 | 玛丽黛佳MARIE DALGAR |
| 内容类型 | 产品种草/引流直播间 |
| 投放目标 | 引流直播间（不做直接购买） |
| 目标人群 | 干皮/混干皮 · 18-30 · 职场场景 |
| 样本池 | 全量历史 + 时间衰减 |
| LLM | claude-sonnet-4-6（via Hermes） |

**V1 不做**（留V2）：
- 多SKU切换 / 多人群并行
- 竞品/飞书top20实时接入
- 置信分（confidenceScore）
- 权重自动校准

---

## 9. 实施顺序

### Phase A：数据基础（1-2天）
1. 将Excel 2930条历史数据批量导入 `video_performance_record`
2. 执行 sku_tag + hook_type 标注（种籽气垫/腮红/粉霜 × 5种模式）
3. 计算每条记录的 `composite_score`（按§2.3公式）
4. 初始化 `product_truth` 表（种籽气垫2.0的卖点卡）

### Phase B：后端服务（2-3天）
1. COLA生成 `ContentStructureCard` 聚合
2. 实现 `ContentPatternMatcher`（Retriever + Ranker）
3. 实现 `ContentDeconstructorAppService`
4. 集成 Hermes LLM 调用（Card Composer）

### Phase C：Hermes Skill（1天）
1. 创建 `hermes/skills/content-deconstructor/SKILL.md`
2. 在 AgentStudio 创建 AgentDefinition，发布到 Hermes

### Phase D：前端入口（1天）
1. `ContentProduction.tsx` 新增内容结构卡工作台
2. 输入区：SKU + 人群 + 节点 → 触发生成
3. 预览区：卡片展示 + storyBeats时间轴
4. 操作：确认下发脚本Agent / 重新生成

---

## 10. 评估指标

| 指标 | V1目标 | 测量方式 |
|------|--------|---------|
| 结构卡生成成功率 | >95% | AgentTrace |
| 钩子类型命中率 | 与人工判断一致>80% | 人工抽样 |
| 结构卡→脚本无修改接受率 | >70% | 脚本Agent记录 |
| 推荐卖点与历史Top视频重叠率 | >60% | 自动比对 |
| 参考视频 composite_score 均值 | >0.7 | 自动计算 |

---

*版本: V1.1 — 最后更新: 2026-04-23*
*同行评审来源: GPT peer review，采纳7/9点*

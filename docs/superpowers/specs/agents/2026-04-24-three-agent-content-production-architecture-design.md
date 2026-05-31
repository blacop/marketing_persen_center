# 三 Agent 内容生产架构设计（A 知识生产 / B 语义蓝图 / C 视频组装）

- 日期：2026-04-24
- 状态：Approved for implementation
- 适用仓库：`/Users/any/Documents/code/beukay/marketing-person-center`

## 1. 背景

现有内容生产链路已经具备以下基础：

1. Agent A 方向已有视频理解、视频拆解、片段标签、知识沉淀能力基础：
   - `video_deconstruction_result`
   - `video_segment`
   - `content_pattern_knowledge`
   - `pattern_reference_video_rel`
2. 当前 Agent B 方向已有 `content_structure_card` 最小闭环，但它更像阶段性过渡对象，不再适合作为最终目标模型。
3. 业务真实目标不是“生成结构卡”，而是：
   - 从视频中沉淀知识
   - 根据产品文本输入生成脚本语义蓝图
   - 按蓝图从素材库召回片段并拼装出完整视频

因此，当前双 Agent 架构需要收敛为更清晰的三 Agent 架构。

## 2. 核心目标

本阶段目标：

1. 将内容生产链路明确收敛为三个独立 Agent：
   - Agent A：视频理解、模式识别、知识沉淀
   - Agent B：模板库选择、推荐、语义蓝图实例化
   - Agent C：向量召回、匹配重排、视频组装
2. 三个 Agent 默认自动流转，但每层中间产物必须透明可见。
3. 三个 Agent 之间不做黑盒直接调用，而通过显式持久化产物衔接。
4. A、B、C 的输出形态尽量统一为：
   - 候选集
   - 推荐项
   - 最终产物
5. 为后续 embedding 语义检索保留灵活性，避免过早将 B 的输出锁死为槽位化/逐镜头脚本。

## 3. 非目标

本阶段不做：

1. 不引入复杂 orchestrator 或多 Agent 编排平台。
2. 不要求第一期完成最终视频渲染全链路。
3. 不大改 Agent OS 控制面底座。
4. 不要求前端先完成完整交互重构。
5. 不把 B 建模为单脚本的线性版本系统。

## 4. 总体架构

采用如下主链路：

`原始视频 -> Agent A -> 知识产物 -> Agent B -> 语义蓝图 -> Agent C -> 装配计划/最终视频`

### 4.1 流转原则

1. 默认自动流转：
   - A 完成后自动触发 B
   - B 完成后自动触发 C
2. 透明可控：
   - 每层必须可查看
   - 每层必须可回放
   - 每层必须可人工打断
   - B 的模板推荐结果必须允许人工改选
3. 产物解耦：
   - Agent 间通过持久化对象连接
   - 禁止黑盒式“上一个 Agent 直接把内部状态塞给下一个 Agent”

### 4.2 三层中间产物

1. Agent A 产物：知识产物
2. Agent B 产物：语义蓝图
3. Agent C 产物：装配结果

## 5. Agent A 设计

### 5.1 定位

Agent A 不再只是“标签抽取器”，而是：

**视频理解 + 模式识别 + 知识沉淀 Agent**

### 5.2 输入

1. 原始视频文件或视频 URL
2. `product_truth`
3. 视频元数据（如 skuId、平台、来源）

### 5.3 输出分层

#### 第一层：候选模式集合

Agent A 应输出 Top N 候选模式，而不是只给单标签。

例如：
- 痛点开场型
- 技术卖点型
- 场景证明型

每个候选模式至少包含：
- 模式编码
- 模式名称
- 匹配分
- 命中依据
- 排名

#### 第二层：推荐模式

Agent A 需要输出当前推荐模式：
- 推荐模式编码
- 推荐理由
- 与其他候选相比为何更优

#### 第三层：知识沉淀产物

用于给 Agent B 消费的知识层，包括：
- 视频级拆解结果
- 片段级标签
- 模式知识原料
- 对应的判断依据

### 5.4 A 的关键设计原则

1. 候选模式必须保留，不只保留最后推荐模式。
2. 片段级标签必须能支撑后续 embedding 检索。
3. 模式识别需要保留“为什么这样判断”的证据链。
4. A 的最终沉淀应建立在“候选 -> 推荐 -> 沉淀”的结构上，而不是单标签直写。

## 6. Agent B 设计

### 6.1 定位

Agent B 不是：
- 固定脚本生成器
- 线性版本器
- 结构卡终态生成器

Agent B 应该是：

**脚本模板库构建与推荐 Agent**

### 6.2 模板库组织

主索引：

**品类 × 营销目标**

例如：
- 粉底液 × 种草
- 粉底液 × 转化
- 散粉 × 转化
- 口红 × 上新

二级标签包括但不限于：
- 人群
- 平台
- hook 类型
- 节奏
- 时长
- 风格
- 场景
- 风险限制

### 6.3 输入

1. 产品文本信息：
   - 产品名称
   - 品类
   - 卖点文本
   - 目标人群
   - 营销目标
   - 平台
2. `product_truth`
3. `content_pattern_knowledge`
4. `pattern_reference_video_rel`
5. 必要时回看 `video_deconstruction_result`

### 6.4 输出分层

#### 第一层：候选模板集合

输出 Top N 候选模板：
- 模板编码
- 模板名称
- 匹配分
- 推荐理由
- 适配条件
- 排名

#### 第二层：推荐模板

输出一个推荐模板：
- 推荐模板编码
- 推荐理由
- 与其他候选相比的优势

#### 第三层：语义蓝图实例

Agent B 最终不输出锁死的槽位清单，而输出：

**模板族约束下动态生成的段落级语义蓝图实例**

### 6.5 语义蓝图原则

1. 蓝图必须是动态的，而不是固定五段模板。
2. 蓝图不应固化为逐镜头/逐槽位结构。
3. 蓝图应为 Agent C 的 embedding 召回保留灵活空间。
4. 蓝图默认自动流转给 Agent C。

### 6.6 蓝图段落结构

每个段落建议包含：
- `stageName`
- `goal`
- `semanticIntent`
- `queryText`
- `mustCover`
- `preferredSignals`
- `avoidSignals`
- `durationRange`
- `narrationHint`

其中：
- `queryText` 用于 Agent C 的主要语义检索
- `mustCover` 表示必须覆盖的卖点/场景/结论
- `preferredSignals` 表示偏好的节奏/情绪/镜头感/风格
- `avoidSignals` 表示不希望召回到的语义或素材特征

## 7. Agent C 设计

### 7.1 定位

Agent C 是：

**视频片段召回与组装 Agent**

它不负责脚本规划，而负责执行层工作。

### 7.2 输入

1. Agent B 的推荐语义蓝图实例
2. 蓝图段落信息：
   - `stageName`
   - `goal`
   - `semanticIntent`
   - `queryText`
   - `mustCover`
   - `preferredSignals`
   - `avoidSignals`
   - `durationRange`
   - `narrationHint`
3. 片段库 / 标签库 / embedding 索引
4. 平台、总时长、合规等附加约束

### 7.3 执行链路

#### 第一步：生成段落级检索请求

针对每个段落，构造：
- 主检索文本
- 过滤条件
- 偏好条件

#### 第二步：向量召回

基于 embedding 从片段库召回候选片段。

#### 第三步：匹配与重排

按以下维度重排：
- 语义相似度
- 必须覆盖点是否满足
- 时长匹配度
- 全片节奏平衡
- 重复素材控制
- 冲突信号过滤

#### 第四步：拼接决策

输出每个段落最终采用的片段组合与顺序。

#### 第五步：产出装配结果

形成装配计划，并在能力可用时输出最终视频。

### 7.4 输出分层

#### 第一层：候选召回结果
- 每个段落 Top K 候选片段
- 相似度
- 命中标签
- 淘汰原因/保留原因

#### 第二层：推荐装配方案
- 当前推荐的片段组合
- 片段顺序
- 选择理由

#### 第三层：最终执行产物
- 装配清单
- 渲染任务或最终视频

## 8. 建议对象模型

### 8.1 Agent A 方向

#### 保留并增强
- `VideoDeconstructionResult`
- `VideoSegment`

#### 新增
- `VideoPatternCandidate`

建议：
- `VideoDeconstructionResult` 记录推荐模式和决策摘要
- `VideoSegment` 承载片段级语义与 embedding 基础字段
- `VideoPatternCandidate` 承载 Top N 候选模式及判断依据

### 8.2 Agent B 方向

#### 新增
- `ScriptTemplate`
- `ScriptTemplateCandidate`
- `ScriptBlueprint`
- `ScriptBlueprintSection`

建议：
- `ScriptTemplate`：模板库资产主对象
- `ScriptTemplateCandidate`：每次运行时的候选模板结果
- `ScriptBlueprint`：语义蓝图实例主对象
- `ScriptBlueprintSection`：语义段落明细

### 8.3 Agent C 方向

#### 新增
- `VideoAssemblyTask`
- `VideoAssemblyCandidate`
- `VideoAssemblyPlan`

建议：
- `VideoAssemblyTask`：一次组装任务主对象
- `VideoAssemblyCandidate`：候选召回结果
- `VideoAssemblyPlan`：最终推荐装配方案

## 9. 与现有实现的关系

### 9.1 建议保留

1. `video_deconstruction_result`
2. `video_segment`
3. `content_pattern_knowledge`
4. `pattern_reference_video_rel`
5. `product_truth`

这些对象仍是三 Agent 架构中的基础资产。

### 9.2 建议降级为过渡对象

`content_structure_card` 不再作为最终目标模型。

它可以短期兼容，但中期应让位于：
- `ScriptBlueprint`
- `ScriptBlueprintSection`

### 9.3 推荐演进顺序

#### Phase 1：升级 Agent A
- 增加候选模式
- 增加推荐模式
- 增加判断依据

#### Phase 2：重构 Agent B
- 新建模板库
- 新建候选模板
- 新建语义蓝图实例

#### Phase 3：新增 Agent C
- 新建组装任务
- 接 embedding 检索
- 输出候选召回、推荐装配和最终产物

#### Phase 4：补最终视频渲染
- 在 C 的基础上补全渲染能力

## 10. 透明性与自动流转要求

系统默认自动流转，但每一层必须具备：

1. 产物可查看
2. 决策可解释
3. 流转可回放
4. 人工可打断
5. 人工可改选（尤其是模板推荐）

这意味着控制面需要展示的不只是 Agent 状态，还包括：
- 候选集
- 推荐项
- 判断依据
- 中间产物
- 自动流转记录
- 人工干预记录

## 11. 实施建议

### 11.1 第一优先级

1. 先升级 Agent A 为“候选模式 + 推荐模式 + 知识沉淀”结构。
2. 先让上游知识结构稳定。

### 11.2 第二优先级

1. 新建 Agent B 的模板库和语义蓝图对象。
2. 逐步让当前 `content_structure_card` 退出核心地位。

### 11.3 第三优先级

1. 新建 Agent C 的检索和组装任务对象。
2. 先跑通“候选召回 + 推荐装配方案”闭环。
3. 最终渲染可晚一步补上。

## 12. 结论

最终架构冻结为：

**严格三 Agent + 显式产物自动流转**

其中：
- Agent A：负责知识生产
- Agent B：负责模板推荐与语义蓝图实例化
- Agent C：负责向量召回、组装和产出视频

三者之间统一采用：

**候选集 -> 推荐项 -> 最终产物**

作为对人透明、对系统可执行的共同数据心智模型。

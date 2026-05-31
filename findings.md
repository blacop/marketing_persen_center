# 发现与决策

## 需求
- 当前阶段目标不是补零散 CRUD，而是把已有 Agent 相关聚合提升为可支撑上层业务的底座。
- 第一阶段必须打通最小闭环：`AgentDefinition -> SKILL.md -> Hermes -> SkillRegistry/AgentRegistry -> AgentTrace`。
- 现有四模块 Maven 结构保持不变：`client / domain / dbsdk / infrastructure`。
- 不做多环境发布、远程 Hermes、Webhook、Cron、深度 OTel、富 Studio UI。

## 研究发现
- 前端已有 AgentStudio / AgentRegistryPage / SkillRegistryPage / AgentIdentityMgmt 四个页面，但原始实现全部是静态 mock。
- `frontend/src/App.tsx` 之前未挂载这些页面路由，Layout 里也没有对应导航入口。
- 当前仓库已有 6 个主要聚合代码骨架：`AgentDefinition`、`AgentIdentity`、`AgentRegistry`、`AgentTrace`、`SkillRegistry`、`KolPerson`。
- 当前公开 API 主要停留在 `create + listPage`，领域服务多为 gateway 透传。
- Hermes 已通过 `/Users/any/Documents/code/beukay/marketing-person-center/hermes/setup.sh` 支持将项目 skill 同步到 `~/.hermes/skills/beukay/`。
- 前端目前更偏演示原型，尚未真实联通后端 API。
- 代码库尚未见到成体系 SQL/Flyway 脚本，因此实现阶段需要自行补上迁移策略。

## 技术决策
| 决策 | 理由 |
|------|------|
| 新增 `AgentPublishRecord` | 发布事实不能混入 `AgentTrace`，否则后续审计与回滚困难 |
| 发布流程由 `AgentPublishAppService` 编排 | 涉及 Definition、Registry、Trace、Artifact、Publisher 多对象协作 |
| 发布目标先只支持本地 Hermes | 与当前 `hermes/setup.sh` 和团队环境最贴近 |
| 保留项目内生成目录 + Hermes 运行目录双写 | 兼顾审计/debug 与运行时可发现性 |
| 测试不使用 `@SpringBootTest` 作为主路径 | 遵循仓库约定，优先直接实例化和 test double |
| 前端通过统一 `agentApi` 封装访问后端 | 降低四个页面重复 fetch 逻辑，便于后续扩展 Trace/PublishRecord 页面 |
| 开发环境用 Vite proxy 转发 `/agent*` 等接口 | 避免浏览器跨域并保持调用路径简单 |
| infrastructure 模块测试依赖改为 `spring-boot-starter-test` | 让 JUnit 5 单测与断言库可直接工作 |

## 遇到的问题
| 问题 | 解决方案 |
|------|---------|
| Agent OS 页面已存在但没有接入任何后端真实数据 | 重写页面为真实 fetch + 状态刷新 + 基本交互动作 |
| 问题 | 解决方案 |
|------|---------|
| brainstorming skill 要求写计划，但 session 中没有 writing-plans skill | 改用 `planning-with-files-zh` 生成 `task_plan.md / findings.md / progress.md` |
| 当前状态字段定义不统一（部分 executor 写死 ACTIVE，部分透传） | 实现阶段统一为显式状态模型，并收口到应用/领域规则 |
| infrastructure 模块原先仅依赖 `spring-boot-test`，不足以支撑新增 JUnit 5 单测 | 调整为 `spring-boot-starter-test`（test scope） |
| `mvn test -pl marketing-person-infrastructure` 未自动联动依赖模块 | 改用 `mvn test -pl marketing-person-infrastructure -am` |

## 资源
- 设计文档：`/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/2026-04-23-agent-metadata-kernel-and-minimal-publish-loop-design.md`
- 项目指引：`/Users/any/Documents/code/beukay/marketing-person-center/AGENTS.md`
- Hermes 本地 skill 同步脚本：`/Users/any/Documents/code/beukay/marketing-person-center/hermes/setup.sh`

## 视觉/浏览器发现
- 本次规划未使用浏览器/视觉流程。

---
*每执行2次查看/浏览器/搜索操作后更新此文件*
*防止视觉信息丢失*

## Layer 2 新发现（AI 内容飞轮引擎）
- Layer 2 的正确主轴应是“飞轮 + 页面”，而不是直接从 Agent Matrix 批量建 Agent。
- 当前前端已具备可承载六阶段飞轮的业务页面原型，可直接作为后续 Agent 落位入口。
- Agent OS 应继续保持为 Control Plane，不应混入业务飞轮页面。
- 当前 Agent Matrix 的 `cluster` 维度与用户给出的六阶段飞轮不完全一致，推荐保留 cluster 并新增 flywheelStage 双视图，而不是立即重写原始矩阵模型。
- 第一条最适合落地的最小业务闭环是：`趋势洞察 -> 内容生成 -> 合规审核 -> 素材入库 -> 投放候选池`。

## 新增设计文档
- `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/2026-04-23-ai-content-flywheel-total-blueprint-design.md`

## Layer 2 新发现（双 Agent + 知识库）
- “视频拆解”和“结构卡生成”不应继续建模为一个单体 Agent，而应拆为离线知识沉淀 Agent 和在线结构卡生成 Agent。
- `content_structure_card` 是运行时产物，不应承担长期知识库职责。
- 内容知识库至少需要三类结构：单视频拆解结果、模式知识条目、知识与参考视频关系。
- 正确的 Phase B 顺序应为：先建知识层与 Agent A，再建 Agent B 和实时结构卡生成。

## 新增设计文档（双 Agent）
- `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/agents/2026-04-23-two-agent-content-knowledge-architecture-design.md`

## 2026-04-24 新发现（Agent 职责纠偏）
- 用户当前真正需要的不是“结构卡生成 Agent”本身，而是“基于产品文本输入 + 知识库匹配的脚本框架组装 Agent”。
- 这个新 Agent 仍应作为下游消费者存在，但消费目标应从“结构卡”进一步推进到“视频脚本生产框架”。
- 其核心输入不是视频文件，而是产品名称、卖点、目标人群、营销节点等文本信息。
- 其核心数据源应优先复用现有知识层：`video_deconstruction_result`、`content_pattern_knowledge`、`pattern_reference_video_rel`、`product_truth`。

## 2026-04-24 新决策（三 Agent 自动流转）
- 架构决策冻结为：**严格三 Agent + 显式产物自动流转**。
- Agent A / B / C 必须独立可见，保证人能审查每一步输入、输出和决策依据。
- Agent 之间禁止黑盒直连；必须通过持久化中间产物衔接，便于审计、回放、评分和人工复核。
- 后续设计重点应转向定义两份关键中间产物：
  1. Agent A → Agent B 的知识产物
  2. Agent B → Agent C 的脚本框架产物

## 2026-04-24 新发现（Agent B 不是版本器，而是模板库/选择库）
- Agent B 的核心不应建模为“单脚本多版本迭代器”，而应建模为“动态脚本框架库 + 推荐/选择器”。
- 不同品类应拥有各自可演化的模板集合，脚本框架更接近“库中的候选策略”而非同一稿件的线性版本。
- 线上数据回流后，优先更新的是模板库中的模式权重、适用品类、适用场景和推荐排序，而不是简单产生 v2/v3/v4。
- Agent B 的结果既要支持人工挑选，也要支持 Agent C 自动消费，因此输出应区分：
  1. 候选模板集合
  2. 推荐模板
  3. 机器可执行的最终脚本框架实例
- 模板库的主索引采用“品类 × 营销目标”；人群、平台、hook 类型、节奏、时长、风格等作为二级标签和过滤维度。
- Agent B 对外默认输出策略采用“Top N 候选模板 + 1 个推荐模板”，兼顾透明度与自动执行。
- Agent B 需要把推荐模板实例化到底，直接生成 Agent C 可执行的蓝图；Agent C 不负责再做脚本规划，只负责执行层的片段召回、匹配和拼接。
- Agent B 的执行蓝图不应过早固化为“槽位/逐镜头清单”模型；后续 Agent C 会基于 embedding 做文本与视频内容的向量相似度匹配，因此 B 更适合输出“段落级语义蓝图 + 检索约束/检索意图”，而不是锁死的操作式编排。
- 三 Agent 的默认流转模式采用“自动流转”，但每一层中间产物必须可查看、可回放、可人工打断，满足透明性要求而不牺牲执行效率。
- Agent A 的输出结构也应向 Agent B 靠拢：不是只给单标签，而是给出 `Top N 候选模式 + 1 个推荐模式 + 判断依据`，使视频拆解阶段本身也具备透明的候选、推荐、沉淀三层结构。
- Agent C 的输出也应采用与 A/B 一致的透明分层：候选召回结果、推荐装配方案、最终执行产物；这样三 Agent 在“候选 → 推荐 → 产物”上形成统一心智模型。

## 2026-04-24 设计文档落盘
- 已形成三 Agent 正式设计文档：`/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/agents/2026-04-24-three-agent-content-production-architecture-design.md`
- 文档中已冻结以下关键原则：
  - 严格三 Agent：A 知识生产 / B 模板推荐与语义蓝图 / C 视频组装
  - 默认自动流转，但中间产物全程透明
  - A/B/C 统一采用“候选集 → 推荐项 → 最终产物”结构
  - B 的终态对象从 `content_structure_card` 迁移到 `ScriptBlueprint`

## 2026-04-24 Agent A 实施计划
- 已新增 Agent A 首阶段实施计划：`/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/plans/2026-04-24-agent-a-pattern-candidates-implementation.md`
- 实施策略先聚焦 Agent A，不并行启动 B/C，以降低耦合风险。
- 本阶段核心对象冻结为：
  - `VideoPatternCandidate`
  - `recommendedPatternCode / recommendedPatternName / recommendedPatternReason / patternDecisionJson`

## 2026-04-24 Agent A 首阶段实现完成
- 已新增 `VideoPatternCandidate` 聚合（domain / dbsdk / infrastructure），并补充 SQL：`V20260427__video_pattern_candidate.sql`
- `RuleBasedVideoDeconstructionEngine` 已从“单结论”升级为“候选模式 + 推荐模式 + 决策JSON”输出
- `video_deconstruction_result` 已增加推荐模式摘要字段：
  - `recommendedPatternCode`
  - `recommendedPatternName`
  - `recommendedPatternReason`
  - `patternDecisionJson`
- `VideoDeconstructionDTO` 已可返回 `patternCandidates`，当前由 `patternDecisionJson` 解析生成；候选表继续用于持久化审计
- 本阶段暂未改造异步 `VideoUnderstandingTaskAppService` 去生成完整 Top N 候选模式，后续可在视频理解链路中按同一模型补齐

## 2026-04-24 Agent B 首阶段实施策略
- Agent B 首阶段先实现 `ScriptBlueprint` 最小闭环，不一次性把完整 `ScriptTemplate` 资产库全部持久化拆完。
- 第一阶段核心输出固定为：
  - 候选模板集合
  - 推荐模板
  - 语义蓝图主对象
  - 语义蓝图段落明细
- 候选模板在本阶段优先保存在 blueprint JSON / DTO 中；独立 `ScriptTemplate` 资产库留到下一阶段抽离。

## 2026-04-24 Agent B 首阶段实现完成
- 已新增 `ScriptBlueprint` / `ScriptBlueprintSection` 纵向切片（client / domain / dbsdk / infrastructure）。
- 已新增 SQL：`/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/resources/sql/V20260428__script_blueprint.sql`
- `ScriptBlueprintGenerateAppService` 已可基于 `product_truth + content_pattern_knowledge + pattern_reference_video_rel` 生成：
  - 候选模板集合
  - 推荐模板
  - 语义蓝图主对象
  - 4 段式语义蓝图段落明细
- `ScriptBlueprint` 当前采用“候选模板 JSON 内嵌”方案，后续再抽离为独立 `ScriptTemplate` 资产库。
- 已新增 `ScriptBlueprint generate/get` API，但目前只做 generate/detail 最小闭环，未补 page/list。

## 2026-04-24 Agent C 首阶段实施策略
- Agent C 首阶段先做“召回与装配计划”最小闭环，不做最终视频渲染。
- 第一阶段将用 `ScriptBlueprintSection + VideoSegment` 做规则式相似度召回，embedding/vector 检索保留为下一阶段实现细节。
- 本阶段核心输出固定为：
  - 候选召回结果
  - 推荐装配方案
  - 装配任务主对象

## 2026-04-24 Agent C 首阶段实现完成
- 已新增 `VideoAssemblyTask` / `VideoAssemblyCandidate` / `VideoAssemblyPlan` 纵向切片（client / domain / dbsdk / infrastructure）。
- 已新增 SQL：`/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/resources/sql/V20260429__video_assembly.sql`
- `VideoAssemblyGenerateAppService` 已可基于 `ScriptBlueprintSection + VideoSegment` 生成：
  - 每个 section 的候选召回结果（Top K）
  - 每个 section 的推荐装配片段
  - 装配任务主对象与 summary
- 当前召回算法为规则式相似度打分，综合 `queryText / mustCover / sellingPoint / scene / script / keyPhrase / structureTag` 的词项重合，并保留 `similarityScore` 泛化字段，以兼容后续 embedding/vector 检索。
- 已新增 `VideoAssembly generate/get` API；当前阶段只覆盖 generate/detail 最小闭环，未补 page/list。
- 已为 `VideoSegmentGateway` 补齐 `listBySkuId`，让 Agent C 能直接拉取 SKU 级片段池。
- 已完成聚焦验证：
  - `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=VideoAssemblyGenerateAppServiceTest,VideoAssemblyDetailQryExecutorTest`
  - `mvn compile -q`
- 下一阶段重点不再是重做对象模型，而是在保持当前契约稳定的前提下，把召回内核替换/升级为 embedding/vector 检索与融合排序。

## 2026-04-24 Agent C 阶段 18 第一子步完成
- 已将 Agent C 的规则召回从“只看 `queryText + mustCover`”升级为正式消费：
  - `preferredSignalsJson`
  - `avoidSignalsJson`
- `VideoAssemblyGenerateAppService` 当前会把 `scene / rhythm / motivation / technique / cameraLanguage / audiencePersona / trending` 等片段信号也并入检索 token 池，使当前规则打分更贴近后续向量检索意图。
- `matchReasonJson / selectionReasonJson` 已新增更透明的检索解释字段：
  - `preferredSignalHits`
  - `avoidSignalHits`
  - `retrievalStrategy=RULE_VECTOR_READY_V1`
- 这一步没有改变 `VideoAssemblyTask / Candidate / Plan` 对外契约，只增强了内部检索排序逻辑，因此后续 embedding/vector 检索可在同一契约下继续替换实现。
- 已新增并验证失败后转绿的测试：
  - `VideoAssemblyGenerateAppServiceTest#shouldPreferSegmentsMatchingPreferredSignalsAndAvoidNegativeSignals`

## 2026-04-24 Agent Playground 结构重构
- `/agent-playground` 页面不再以 “workflow” 为用户心智，而统一改成 “agent”。
- 当前页已从“少量流程卡片实验页”重构为适合后续 50+ Agent 扩展的三层结构：
  1. 左侧 `Agent Catalog` 筛选栏
  2. 中间 `Agent` 列表区
  3. 右侧 `Workbench`（输入 / 输出 / 历史）
- 前端数据模型也同步从 `workflow` 收敛为 `agent`，包括：
  - `PlaygroundWorkflowType -> PlaygroundAgentType`
  - `PlaygroundExecutionResult.workflow -> agent`
  - `PlaygroundHistoryItem.workflow -> agent`
- 为兼容用户本地已有历史缓存，`loadPlaygroundHistory` 已兼容旧字段 `workflow` 自动映射到新字段 `agent`。
- 新页面已支持后续多 Agent 扩展所需的基础能力：
  - 搜索 Agent
  - 按业务域筛选
  - 按在线/规划中筛选
  - 在列表中快速选择 Agent
  - 统一右侧工作台执行与查看结果

## 2026-04-24 新发现（智能体矩阵与 Playground 应合并，而非并列分家）
- 对用户来说，“智能体矩阵”应该是统一目录与入口；Playground 更适合作为详情中的调试能力，而不是单独心智页面。
- 真实已创建 Agent 与历史演示/占位 Agent 可以共存：
  - 真实 Agent 负责承接后端 Definition / Registry / 调试调用
  - 假卡片继续承担矩阵占位、未来扩容预览与业务感知展示
- `/agent-playground` 仍应保留在目录与导航中，但更适合作为矩阵集成页的别名，而不是维护第二套独立页面结构。

## 2026-04-24 新决策（详情抽屉承担“看板 + 调试台”双职责）
- 点击矩阵卡片后，详情抽屉应统一承接两类信息：
  1. 原有运营看板信息：当前任务、可用率、成功率、最近操作、性能、算法、描述
  2. 真实 Agent 的工程信息：Definition / Registry / Skill / businessRules / modelConfig / 调试执行入口
- 这样既满足“人对每个环节保持透明”的业务诉求，也避免把“观察页”和“执行页”拆成多跳流程。

## 2026-04-24 浏览器验收发现
- 构建通过并不代表浏览器运行态无误：本次在浏览器中点击真实 Agent 详情时，发现 `RealAgentWorkbench` 使用了未导入的 `Play` 图标，导致运行时白屏。
- 该问题已修复，并再次通过浏览器验证 `/agents` 与 `/agent-playground`：
  - 真实 Agent 区块可见
  - 真实 Agent 详情抽屉可打开，且含内嵌调试台
  - 占位 Agent 详情仍保留原来的操作与指标面板
  - `/agent-playground` 已复用矩阵集成页

## 2026-04-24 新发现（矩阵状态要区分“真实运行态”和“占位态”）
- 矩阵里真实 Agent 与占位 Agent 不能复用同一套 mock 状态语义。
- 对用户认知更清晰的方式是：
  - 真实已创建 Agent：显示实际运行态（当前收口为“运行”）
  - 未构建的占位 Agent：统一显示“离线”
- 否则会让用户误以为占位卡片也是真实在线服务。

## 2026-04-24 新发现（新智能体不应只依赖后端注册表）
- 当前后端 `AgentDefinition / AgentRegistry` 只返回了已注册的 BeukayClaw，但前端实际上已经具备多个可直接运行的能力型 Agent（A/B/C 及结构卡）。
- 对用户而言，“能直接运行”比“是否已落注册表”更重要，因此矩阵中的“新智能体”应展示两类来源：
  1. 已进入后端元数据体系的 Agent
  2. 已接入运行链路、但暂未沉淀完整注册元数据的运行时 Agent
- 因此矩阵层需要做“后端元数据 + 运行时能力目录”的合并展示，而不是机械等同于 registry 列表。

## 2026-04-24 新发现（新智能体卡片要对脏描述与长文本做防御）
- 后端返回的 description 可能存在乱码或超长文本，直接展示会破坏卡片质量。
- 对已知的新智能体，应优先使用前端标准化描述；同时卡片层必须做两行截断/单行省略，才能保证与现有矩阵卡尺寸一致。

## 2026-04-24 新发现（新智能体卡片文案应进一步去工程味）
- 新智能体卡片首屏更适合只保留：名称、状态、简短描述、关键元数据。
- 像“营销对话 · 实时对话”这类副标题和 `Def` 英文标签会让卡片显得偏工程调试面板，不够像矩阵目录卡。
- 因此卡片层应尽量使用中文短标签，并主动做长文本省略，避免视觉噪音。

## 2026-04-24 新发现（新智能体详情应从矩阵中独立成全页工作台）
- 对新智能体来说，抽屉式详情不足以承载完整调试行为；更合适的是全页工作台形态：左信息、中输入、右结果。
- `/agent-playground` 最适合作为“目录 + 详情”的复合入口：
  - `/agent-playground` = 新智能体矩阵目录
  - `/agent-playground/:agentKey` = 单个新智能体详情工作台
- 这种结构既满足“智能体矩阵”的目录感，也保留了 Playground 作为执行与调试场的定位。

## 2026-04-24 新决策（只有新智能体进入详情页）
- 矩阵中只有新智能体卡片具备详情跳转能力。
- 占位旧卡片继续承担目录占位与规划展示，不进入详情页，避免把未实现能力误导成可执行工作台。

## 2026-04-24 新发现（BeukayClaw 应作为统一调用中枢，而不是单一对话页）
- BeukayClaw 之前虽然是“真实已接入智能体”，但页面能力仍停留在单一聊天模式，无法直接承接 A/B/C 与结构卡等 runtime Agent 的调用。
- 对用户而言，更自然的交互不是跳转多个独立调试页，而是在 BeukayClaw 中切换目标 Agent，再按目标 Agent 暴露对应输入表单并查看返回结果。
- 因此 BeukayClaw 最合适的定位是“统一调用中枢”：
  1. 顶部显示当前选中的 Agent
  2. 中部横向展示全部已接入 Agent
  3. 底部根据 Agent 类型切换成聊天框或结构化表单
  4. 消息流中保留 JSON payload，保证透明性

## 2026-04-24 新发现（runtime API 存在前端路径不一致问题）
- `agentPlaygroundApi` / `productionApi` 原先对脚本蓝图、视频装配、BeukayClaw runtime 调用使用了 `/api/...` 路径，但 `vite.config.ts` 并没有配置对应代理。
- 这会导致浏览器端虽然能切换 Agent，但真正点击运行时会出现前端层面的 JSON 解析错误，而不是业务返回。
- 已修正为：
  - 统一复用 `agentApi / productionApi` 封装
  - `productionApi` 改用真实后端路径：`/scriptBlueprint/*`、`/videoAssembly/*`
  - `vite.config.ts` 新增 `/scriptBlueprint`、`/videoAssembly` 代理
- 修正后浏览器验证显示：脚本蓝图调用已真正命中后端，并返回业务错误“无可用知识模式，请先执行 aggregate”，说明前端调用链已打通，剩余阻塞转为数据准备问题，而不是页面集成问题。

## 2026-04-24 新发现（Vite 代理改动需要重启当前 dev server）
- 页面源码改动可通过 HMR 生效，但 `vite.config.ts` 的代理变更不会被当前运行中的 dev server 自动吸收。
- 本次为验证 BeukayClaw 对脚本蓝图/视频装配的真实调用，已重启 `127.0.0.1:5160` 对应的本地 Vite 服务；重启后浏览器端返回从“前端 JSON 解析失败”变成后端业务错误，证明代理修复已真正生效。

## 2026-04-25 新发现（BeukayClaw live 服务从子模块启动时会找错 Hermes skill 根目录）
- `HermesBeukayClawInvoker` 原先直接以 `user.dir` 作为 workspace 根目录。
- 但本地 Spring Boot 通常从 `marketing-person-infrastructure` 模块目录启动，因此会错误查找：
  - `marketing-person-infrastructure/hermes/skills/beukay-claw-router/SKILL.md`
- 实际 skill 位于仓库根目录：
  - `/Users/any/Documents/code/beukay/marketing-person-center/hermes/skills/beukay-claw-router/SKILL.md`
- 正确做法是：从当前 workspace 逐级向上回溯，找到真实存在的 `hermes/skills/beukay-claw-router/SKILL.md` 后再安装到 `~/.hermes/skills/beukay/`。

## 2026-04-25 新发现（Hermes quiet 输出里的 `session_id:` 可能出现在首行，不只会出现在尾行）
- 之前只剥离尾部 `session_id:` 还不够，live 环境下 Hermes 可能把 `session_id:` 放在回复首行。
- 如果不清洗，前端聊天记录会直接把 `session_id:` 展示给用户，破坏 BeukayClaw 的对话体验。
- 因此当前策略已收口为：统一移除所有 `session_id:` 行，仅保留真实回复正文。

## 2026-04-25 新发现（BeukayClaw 前端已经符合“纯聊天总控入口”目标）
- `/beukay-claw` 页面当前不再暴露已有 agent 切换器或 agent 卡片。
- 页面首屏只保留：
  1. BeukayClaw 标题与在线态
  2. Hermes 自动调度说明
  3. 若干推荐示例语句
  4. 聊天输入框
- 用户感知上已经从“多 Agent 手工选择器”切换成“总控智能体 + 对话式自动路由入口”。

## 2026-04-25 新发现（BeukayClaw -> Hermes -> Agent 工具链已完成实机闭环）
- live API 调用 `beukay-claw` 时，日志已出现 `HermesBeukayClawInvoker.chat`，而不是 `ArkAgentInvoker.chat`。
- 页面端点击脚本蓝图示例后，后端实际发生了：
  1. `/agentRegistry/invoke`
  2. Hermes 调度
  3. `/scriptBlueprint/generate`
  4. 返回格式化后的中文结果给前端
- 这说明当前 BeukayClaw 已经满足：
  - 真 Agent 作为工具调用
  - 基于 Hermes 调度
  - 前端不显式展示这些 Agent，仅在提示词/欢迎语中说明能力范围

## 2026-04-25 新发现（千川双 Agent 已从“规划型 prompt”推进到 mock MCP 执行闭环）
- `qianchuan-delivery-v1` 与 `qianchuan-data-v1` 现在不再只是把工具清单塞进 prompt 后交给 Ark 规划。
- 当前链路已经变为：
  1. `/agentRegistry/invoke`
  2. `AgentInvokeAppService`
  3. `QianchuanMcpInvoker`
  4. `QianchuanMockMcpRuntime`
  5. `QianchuanMockApiClient`
  6. 返回确定性的中文执行结果
- 这使“Agent → MCP → API → Reply”的核心形态先跑通，后续接真实巨量千川时主要替换 mock runtime / mock API client。

## 2026-04-25 新发现（千川 mock 当前刻意不调用真实巨量千川）
- `application-local.yaml` 已将默认 `qianchuan.mcp.base-url` 切到 `mock://qianchuan-api`。
- `server-name` 也切到 `qianchuan-mock-mcp-server`。
- 当前 mock 投放链路覆盖：授权抖音号、可投商品、视频上传、建议预算/出价、广告组创建、效果预估、广告计划创建、计划状态查询。
- 当前 mock 数据链路覆盖：账户报表、计划报表、素材报表、低效计划诊断。

## 2026-04-25 新发现（本地 DB 中千川 Agent 名称存在 mojibake）
- live API 调用两个千川 Agent 时，`reply` 正常，但 `agentName` 字段返回乱码，例如千川投放 Agent / 千川数据 Agent 的名称被错误编码。
- 前端矩阵目前使用 `newAgentCatalog` 的标准中文名称兜底，因此目录展示不受影响。
- 后续若要让 API response 也干净，需要修复本地 seed 数据编码或在应用层对已知 Agent 做展示名兜底。

## 2026-04-25 新发现（千川双 Agent 乱码根因是后端元数据未被识别为新智能体）
- 本地 DB 里 `qianchuan-delivery-v1` / `qianchuan-data-v1` 的 `agent_definition` 与 `agent_registry` 曾经被写入 mojibake 文本。
- 前端矩阵原先只按中文关键词/部分英文关键词推断新智能体类型，没有按 `agentDefId` / `agentUniqueId` 精确识别千川 Agent，因此两个千川后端卡片被当成“自定义 Agent”展示，直接暴露了乱码名称和描述。
- 修复策略分两层：
  1. 前端对已知新智能体按运行时 ID 精确匹配，并优先使用 `newAgentCatalog` 的标准中文名称/描述。
  2. 增加 DB 修复 SQL，并已修复当前本地数据库中的千川双 Agent 展示文本。

## 2026-04-25 新发现（BeukayClaw 上传能力先走“文件上下文透传”更稳）
- 当前 `/agentRegistry/invoke` 是 JSON 对话接口，不是 multipart 文件接口；直接把真实二进制文件传给 Hermes 需要新增文件存储、解析和权限边界，改动范围较大。
- 为了先让产品体验闭环，BeukayClaw 上传能力采用前端文件上下文透传：
  - 文本类文件读取内容预览并拼入用户消息。
  - 视频/图片等二进制文件先透传文件名、类型、大小，提示 Agent 根据元信息判断下一步或追问。
- 这个方案不破坏现有 Hermes 调度契约，后续可以自然升级为“上传到对象存储/本地临时区 → 传 fileId → Agent 工具读取”。

## 2026-04-25 新发现（视频上传拆解写知识层不能复用 record_id=0）
- 端到端测试中，视频理解任务已成功跑到 `ANALYZING` 并返回方舟结构化结果，但写入 `video_deconstruction_result` 时失败。
- 根因：`VideoAnalysisKnowledgeService.persistFromAnalysis()` 对所有上传视频拆解结果固定写 `recordId=0L`，而 `video_deconstruction_result.record_id` 上有唯一索引 `uk_record_id`。
- 修复：上传/视频理解任务使用由 `taskId` 派生的负数 synthetic recordId，避免与历史 `video_performance_record.id` 正数空间冲突，也避免多次上传互相冲突。

## 2026-04-25 新发现（pattern_reference_video_rel 软删除必须显式 set 字段）
- 端到端 aggregate 阶段失败，MyBatis-Plus 生成了 `UPDATE pattern_reference_video_rel WHERE ...`，缺少 `SET` 子句，导致 JSQLParser / BlockAttackInnerInterceptor 报错。
- 根因：`PatternReferenceVideoRelGatewayImpl.softDeleteByKnowledgeId()` 用 update entity 设置 `isDeleted=1`，但在逻辑删除/字段策略下没有形成有效 SET。
- 修复：改为 `LambdaUpdateWrapper.set(PatternReferenceVideoRelDO::getIsDeleted, 1)`，确保 SQL 中有明确 SET 子句。

## 2026-04-25 新发现（BeukayClaw 总控需显式纳入千川双 Agent）
- 内容 A/B/C 与千川投放/数据 API 均可单独跑通，但 BeukayClaw 的 Hermes router 原先只声明视频拆解、结构卡、脚本蓝图、视频装配。
- 如果不把千川投放/数据加入 router，用户在 BeukayClaw 里要求“投放到千川/分析 ROI”时，总控智能体无法稳定调用真实 Agent。
- 已将 `qianchuan-delivery`、`qianchuan-data` 加入 `scripts/beukay_agent_router.py` 与 `hermes/skills/beukay-claw-router/SKILL.md`。

## 2026-04-25 新决策（Beukay agent 改名只改展示标识，不改路由标识）
- 用户希望将 BeukayClaw 改名为 `Beukay agent`，并换成化妆品图标。
- 为避免破坏已经跑通的 Hermes 与 `/agentRegistry/invoke` 调用链，后端稳定标识继续保留：
  - `agentUniqueId=beukay-claw`
  - 前端路由 `/beukay-claw`
  - Hermes skill `beukay-claw-router`
- 用户可见名称、导航、目录卡片、欢迎语、Hermes 身份提示和 DB 展示名称统一为 `Beukay agent`。

## 2026-04-28 新发现（SemanticSplit 本地路径展示受浏览器安全限制）
- 用户希望素材栏展示 `/Users/any/Downloads/video.mp4` 这类本地路径。
- 标准浏览器文件选择器不会暴露真实绝对路径；只有部分桌面壳或目录选择场景可能提供 `File.path / webkitRelativePath`。
- 因此当前实现优先使用可读取的本地路径字段，不存在时按 `/Users/any/Downloads/<fileName>` 生成展示路径，用于贴近本地剪辑软件的工作流视觉；真实导出仍走后端 zip / draft.json。

# 任务计划：Agent 元数据内核与最小发布闭环实施

## 目标
在现有 COLA 四模块结构内，完成 Agent 元数据内核增强，并打通 `AgentDefinition -> SKILL.md -> Hermes -> Registry -> Trace` 的最小可运行闭环。

## 当前阶段
阶段 19 complete：视频矩阵 SemanticSplit 页面按 P0→P1→P2 完成交互对齐；后续可继续 Phase D/E 真语义拆解增强

## 各阶段

### 阶段 1：需求冻结与现状基线
- [x] 结合现有代码与已批准设计，冻结第一阶段范围
- [x] 明确本阶段只做元数据内核 + 本地 Hermes 发布闭环
- [x] 将关键发现记录到 findings.md
- **状态：** complete

### 阶段 2：领域模型与接口扩展设计落地
- [x] 扩展 `AgentDefinition / AgentRegistry / SkillRegistry / AgentTrace` 字段
- [x] 新增 `AgentPublishRecord` 聚合（domain/client/dbsdk/infrastructure）
- [x] 补齐 `update/detail/publish/retry/archive` 等 client API 契约中的首批核心接口（update/detail/publish/retry）
- [x] 统一状态模型：`status / publishStatus / traceType / traceStatus`
- **状态：** complete

### 阶段 3：持久化模型与 SQL 迁移
- [x] 新增/扩展 DO、Mapper、Mapper XML
- [x] 补充表结构迁移脚本或初始化 SQL 草案
- [x] 确保所有自定义查询继续遵守软删约束 `is_deleted = 0`
- **状态：** complete

### 阶段 4：应用层发布链路
- [x] 新增 `AgentPublishAppService`
- [x] 实现 `AgentDefinitionPublishCmdExecutor` / `RetryPublish` / `Detail` / `Update`
- [x] 将发布流程编排集中到 app service，而不是散落在 executor 中
- **状态：** complete

### 阶段 5：产物生成与 Hermes 发布器
- [x] 实现 `SkillArtifactGenerator`
- [x] 实现 `MarkdownSkillArtifactGenerator`
- [x] 实现 `SkillPublisher` 与 `HermesLocalSkillPublisher`
- [x] 产出 `hermes/generated-skills/<skillId>/SKILL.md` 与 `metadata.json`
- [x] 同步到 `~/.hermes/skills/beukay/generated/<skillId>/SKILL.md`（支持测试定向目录）
- **状态：** complete

### 阶段 6：注册与追踪回写
- [x] 发布成功后 upsert `SkillRegistry`
- [x] 发布成功后 upsert `AgentRegistry`
- [x] 写入 `AgentPublishRecord`
- [x] 写入并完成 `AgentTrace(PUBLISH)`
- [x] 定义失败补偿与 retry 语义（失败保留记录、重试创建新记录）
- **状态：** complete

### 阶段 7：测试与验证
- [x] 为 generator/publisher/app service 编写轻量级单测
- [x] 验证 happy path 与失败路径
- [x] 执行 Maven 编译与相关测试
- [x] 将结果记录到 progress.md
- **状态：** complete

### 阶段 8：交付与后续扩展点
- [x] 复核实现是否严格落在第一阶段范围内
- [x] 总结后续扩展点：Gateway、OTel、Webhook、Cron、多环境发布
- [x] 输出交付说明与下一阶段建议
- **状态：** complete

### 阶段 9：前后端对接（Agent OS 页面）
- [x] 为 Agent Studio / Agent Registry / Skill Registry / Agent Identity 页面接入真实后端接口
- [x] 新增 frontend API client 与 Vite 本地代理
- [x] 补充页面路由与侧边导航入口
- [x] 执行前端生产构建验证
- **状态：** complete

### 阶段 10：观测闭环收口（Trace / PublishRecord）
- [x] 扩展 frontend API client，补齐 Trace / PublishRecord 查询
- [x] 用真实接口重写 AIExecutionTracker 页面
- [x] 将 Observability 入口收敛到 Agent OS，并补齐 Studio → Observability 跳转
- [x] 执行前端生产构建验证
- **状态：** complete

### 阶段 11：Agent OS 前端视觉重构
- [x] 基于原版截图语言确定 Agent OS 专属视觉规范
- [x] 为 Agent OS 五页新增统一浅色卡片风样式基座
- [x] 重构 AgentStudio、AgentRegistryPage、SkillRegistryPage、AgentIdentityMgmt、AIExecutionTracker
- [x] 执行前端生产构建验证
- **状态：** complete

## 关键问题
1. 现有 `deployStatus` 已在代码层统一替换为 `publishStatus`，数据库变更需配套迁移。
2. SQL 迁移脚本目前是仓库内草案，落地时需按真实数据库方言和上线流程调整。
3. 运行目录同步当前默认写入 `~/.hermes/skills/beukay/generated/`，生产环境可再配置化。

## 已做决策
| 决策 | 理由 |
|------|------|
| 本阶段不新增 Maven 模块 | 现有四层结构已稳定，增量实现成本最低 |
| 前端通过 Vite proxy 对接本地 Spring Boot | 避免开发阶段跨域，保持调用路径与生产相近 |
| 新增 `AgentPublishRecord` 聚合 | 将发布事实与过程追踪解耦，便于审计、重试与后续回滚 |
| `AgentDefinition` 为源数据，`SKILL.md` 为产物 | 避免运行时文件成为主数据源，支持重建与 diff |
| 本阶段只支持 Hermes 本地发布 | 控制范围，优先打通最小闭环 |
| 通过 app service 编排发布 | 发布横跨多个聚合，不适合散落在单聚合 domain service 中 |
| 为发布器增加可覆盖目录的系统属性 | 保证单测可隔离运行，不污染真实 Hermes 目录 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| 无可用 writing-plans skill | 1 | 使用 `planning-with-files-zh` 在项目根目录落地持久化实施计划 |
| `mvn test -pl marketing-person-infrastructure` 依赖未联动构建 | 1 | 改用 `mvn test -pl marketing-person-infrastructure -am` |

## 备注
- 核心闭环已完成代码落地、前后端接通、观测页收口以及 Agent OS 五页视觉重构。
- 下一步可进入 Gateway 鉴权、OpenTelemetry、Webhook/Cron、业务层深度联调或全站视觉统一。
- 如出现连续两次失败，必须切换方案，不重复执行同样操作。

### 阶段 12：AI 内容飞轮引擎总蓝图设计
- [x] 明确 Layer 2 采用飞轮优先，而不是 AgentMatrix 优先
- [x] 完成现有业务页面到六阶段飞轮的全量分组
- [x] 形成 AI 内容飞轮引擎总蓝图设计文档
- [x] 给出 64 个 Agent 的分阶段装配原则与推荐实施顺序
- **状态：** complete

### 阶段 13：内容生产双 Agent + 知识库架构设计
- [x] 将“内容拆解 + 结构卡生成”从单 Agent 方案调整为双 Agent 方案
- [x] 明确知识层独立于原始事实层与结构卡产物层
- [x] 输出新增知识层表设计与两类 Agent 的职责边界
- [x] 明确 Phase B 顺序：先 Agent A，后 Agent B
- **状态：** complete

### 阶段 14：三 Agent 内容生产架构设计
- [x] 将双 Agent 架构进一步收敛为严格三 Agent：A 知识生产、B 语义蓝图、C 视频组装
- [x] 明确默认自动流转，但通过显式中间产物实现透明可审计
- [x] 统一 A/B/C 的产物模型为“候选集 → 推荐项 → 最终产物”
- [x] 完成三 Agent 架构设计文档并落盘
- **状态：** complete

### 阶段 15：Agent A 候选模式透明化增强
- [x] 输出 Agent A 首阶段实施计划文档
- [x] 为 `video_deconstruction_result` 增加推荐模式摘要字段
- [x] 新增 `video_pattern_candidate` 聚合与 SQL
- [x] 让规则引擎输出 Top N 候选模式 + 1 个推荐模式
- [x] 让 deconstruct/detail DTO 返回候选集与推荐项
- [x] 执行聚焦测试与编译验证
- **状态：** complete

### 阶段 16：Agent B ScriptBlueprint 最小闭环
- [x] 输出 Agent B 首阶段实施计划文档
- [x] 新增 `script_blueprint` / `script_blueprint_section` 对象与 SQL
- [x] 实现候选模板 + 推荐模板 + 语义蓝图生成服务
- [x] 暴露 `ScriptBlueprint generate/get` 接口
- [x] 执行聚焦测试与编译验证
- **状态：** complete

### 阶段 17：Agent C 视频召回与装配最小闭环
- [x] 输出 Agent C 首阶段实施计划文档
- [x] 新增 `video_assembly_task` / `video_assembly_candidate` / `video_assembly_plan` 对象与 SQL
- [x] 实现基于 `ScriptBlueprintSection + VideoSegment` 的候选召回与推荐装配服务
- [x] 暴露 `VideoAssembly generate/get` 接口
- [x] 执行聚焦测试与编译验证
- **状态：** complete

### 阶段 18：Agent C 向量召回升级准备
- [x] 让 Agent C 当前规则召回正式消费 `preferredSignals / avoidSignals`，收敛为更接近语义检索意图的检索器
- [ ] 在保持 `VideoAssemblyTask / Candidate / Plan` 契约稳定的前提下，引入 embedding/vector 检索实现
- [ ] 为 `VideoSegment` 补齐更稳定的语义召回输入与索引准备字段
- [ ] 评估是否需要把规则分召回与向量召回做双通道融合排序
- [ ] 明确 Agent C 结果如何向后续真正的视频拼接/渲染执行器流转
- **状态：** in_progress

### 阶段 19：视频矩阵 SemanticSplit 交互对齐
- [x] P0：补齐片段搜索框、实时字幕、播放指针、底部分页条、底部策略栏与重新归类按钮
- [x] P1：补齐目标文件夹拖拽/手动选择区、缩放控制、裁剪入口、毫秒时间戳和无语音片段标注
- [x] P2：补齐素材栏导入/删除图标、绿色进度条、预览黄字标题和编辑工具栏图标
- [x] 为 SemanticSplit UI 工具函数新增 Vitest 覆盖，并执行前端测试与构建验证
- **状态：** complete

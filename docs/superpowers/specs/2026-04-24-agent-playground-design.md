# Agent Playground 第一版设计（视频拆解 + 结构卡生成）

- 日期：2026-04-24
- 状态：Draft for review
- 适用仓库：`/Users/any/Documents/code/beukay/marketing-person-center`

## 1. 背景

当前前端已有 `ContentFlywheel.tsx`、`ContentProduction.tsx`、`ScriptWorkshop.tsx`、`AssetLibrary.tsx` 等页面，但现状以 mock 展示为主，不适合作为真实联调入口。与此同时，后端已经具备两组可直接调用的真实接口：

1. 视频拆解：
   - `POST /videoDeconstruction/deconstruct`
   - `POST /videoDeconstruction/get`
   - `POST /videoDeconstruction/listPage`
2. 结构卡生成：
   - `POST /contentStructureCard/generate`
   - `POST /contentStructureCard/get`
   - `POST /contentStructureCard/listPage`

为了尽快获得一个可用于联调、验收、演示的真实测试入口，第一版不改造业务页面，而是新增一个独立的 Agent Playground 页面，聚焦“输入 → 执行 → 输出 → 排错”闭环。

## 2. 目标

第一版目标：

1. 提供一个独立、不污染业务页面的调试入口。
2. 支持两条真实 workflow：
   - 视频拆解（REAL）
   - 结构卡生成（REAL）
3. 统一展示：
   - 业务可读结果
   - 原始请求/响应 JSON
   - logic trace 信息
   - 最近执行历史
4. 明确错误，不静默降级，不自动切 mock。
5. 为后续扩展更多 workflow 预留结构，但第一版不实现。

## 3. 非目标

第一版明确不做：

1. 不改 `ContentFlywheel`、`ContentProduction`、`ScriptWorkshop`、`AssetLibrary`。
2. 不实现发布/注册链路 workflow。
3. 不实现通用 Mock Runner workflow。
4. 不接 `AgentTrace` 表或任何新的 trace 后端能力。
5. 不做 websocket、流式日志、长任务轮询。
6. 不做后端持久化历史记录。
7. 不做权限体系、多用户会话、协同调试。

## 4. 信息架构

新增独立页面：

- 页面名称：`Agent Playground`
- 建议路由：`/agent-playground`

页面采用三栏布局：

### 4.1 左栏：Workflow 列表

显示四个入口：

1. 视频拆解（REAL，第一版实现）
2. 结构卡生成（REAL，第一版实现）
3. 发布链路（Reserved / Coming Soon）
4. Mock Runner（Reserved / Coming Soon）

每个入口显示：

- 名称
- 模式标签（REAL 或 Reserved）
- 简短说明
- 当前是否可用

第一版只允许切换到前两个真实 workflow；后两个显示为禁用或“即将支持”。

### 4.2 中栏：输入与执行区

统一包含：

- 表单输入区
- “填充示例数据”按钮
- “清空”按钮
- 请求 JSON 预览
- 执行按钮
- 执行中状态提示

不同 workflow 切换时，中栏表单动态变化。

### 4.3 右栏：结果区

统一为四个 Tab：

1. `Result`
2. `Raw JSON`
3. `Logic Trace`
4. `History`

四个 Tab 的渲染容器保持一致，减少页面切换时的结构抖动。

## 5. Workflow 设计

## 5.1 Workflow A：视频拆解（REAL）

### 输入

- `recordId`（必填，`Long` / 前端 `number`）
- `skuId`（必填）

### 示例数据

- `recordId = 1`
- `skuId = SEED_CUSHION_2`

### 调用接口

- `POST /videoDeconstruction/deconstruct`

### Result Tab 展示

以业务可读方式展示：

- `videoId`
- `skuId`
- `skuTag`
- `hookType`
- `titlePattern`
- `sceneTags`
- `sellingPointTags`
- `ctaTags`
- `emotionTags`
- `targetAudienceTags`
- `actualPerformanceScore`
- `verificationStatus`
- `status`

如果 `deconstructionJson` 为合法 JSON，可增加格式化展示块；否则按原始文本展示。

### Raw JSON Tab

展示：

- 请求 JSON
- 原始响应 JSON

### Logic Trace Tab

第一版不接 `AgentTrace` 表。该 Tab 优先展示：

1. `deconstructionJson` 解析后的结构化内容；
2. 若无法解析，则展示 `deconstructionJson` 原文；
3. 若字段为空，则显示“暂无 logic trace 数据”。

### History Tab

记录最近执行结果摘要，可回看历史请求/响应。

## 5.2 Workflow B：结构卡生成（REAL）

### 输入

- `skuId`（必填）
- `marketingNode`（选填）
- `targetAudience`（选填）
- `accountId`（选填）

### 示例数据

- `skuId = SEED_CUSHION_2`
- `marketingNode = 日常投放`
- `targetAudience = 干皮/混干皮`
- `accountId = account-1`

### 调用接口

- `POST /contentStructureCard/generate`

### Result Tab 展示

展示结构卡摘要与结构化预览：

- `cardId`
- `cardVersion`
- `skuId`
- `hookType`
- `marketingNode`
- `targetAudience`
- `accountId`
- `status`
- `openingHook`
- `videoDurationSec`
- `referenceVideoId`
- `patternRankTop1`

同时对 `cardJson` 做结构化展示。若 `cardJson` 为合法 JSON，则按字段分组渲染；若解析失败，则降级为原始文本展示。

### Raw JSON Tab

展示：

- 请求 JSON
- 原始响应 JSON

### Logic Trace Tab

直接展示 `logicTrace`：

1. 若为合法 JSON，则格式化展示；
2. 若解析失败，则按原始字符串展示；
3. 若为空，则显示“暂无 logic trace 数据”。

### History Tab

同视频拆解 workflow，共享统一的本地历史记录体系。

## 6. 数据接入与前端适配层

为避免页面直接散落调用接口，新增统一前端适配层，建议放在 `frontend/src/lib/` 下，第一版只实现两个入口：

- `runVideoDeconstruction`
- `runContentStructureCard`

同时预留但不实现：

- `runAgentPublishWorkflow`
- `runMockAgent`

统一返回结构建议：

```ts
type PlaygroundExecutionResult = {
  workflow: 'video-deconstruction' | 'content-structure-card'
  mode: 'REAL'
  status: 'success' | 'error'
  startedAt: string
  durationMs: number
  requestPayload: unknown
  responsePayload?: unknown
  tracePayload?: unknown
  errorMessage?: string
}
```

### `tracePayload` 赋值规则

为避免页面层自行分支处理，`tracePayload` 由前端适配层统一填充：

1. 视频拆解 workflow：
   - 优先将 `deconstructionJson` 解析为 JSON 后赋值给 `tracePayload`
   - 若解析失败，则将原始 `deconstructionJson` 字符串赋值给 `tracePayload`
   - 若字段为空，则 `tracePayload = null`
2. 结构卡 workflow：
   - 优先将 `logicTrace` 解析为 JSON 后赋值给 `tracePayload`
   - 若解析失败，则将原始 `logicTrace` 字符串赋值给 `tracePayload`
   - 若字段为空，则 `tracePayload = null`

设计原则：

1. 页面层不关心真实接口差异。
2. 页面层只消费统一执行结果。
3. 后续若补聚合接口，可仅替换适配层实现。

## 7. History 设计

第一版历史记录采用 `localStorage`，不接后端。

### Key

`marketing-person-center.agent-playground.history.v1`

### 上限

- 最多保留 50 条
- 新记录插入头部
- 超出后截断

### 数据结构

```ts
type PlaygroundHistoryItem = {
  id: string
  workflow: 'video-deconstruction' | 'content-structure-card'
  createdAt: string
  status: 'success' | 'error'
  durationMs: number
  requestPayload: unknown
  responsePayload?: unknown
  errorMessage?: string
  tracePayload?: unknown
}
```

### 行为约束

1. 只记录执行后的最终结果，不记录输入过程中的草稿。
2. 历史记录可点击回看，但第一版不支持“从历史一键重跑”。
3. 若本地 JSON 反序列化失败，直接清空并重建，不阻塞页面加载。

## 8. 状态与错误处理

统一状态机：

- `idle`
- `submitting`
- `success`
- `error`

### Idle 态展示

当页面处于 `idle` 且当前 workflow 尚未执行时，右栏不展示空白结果内容，而显示统一空态提示，例如：

- 标题：`执行后结果将在此展示`
- 说明：`你可以先填入示例数据，或手动输入参数后执行。`

Tab 容器可以保留，但默认内容应为空态说明，而不是空白面板或“暂无数据”。

### 错误处理原则

1. 不静默降级。
2. 不自动切 mock。
3. 参数错误直接在表单层展示。
4. 接口错误在结果区清晰展示。
5. JSON 解析失败不应导致页面崩溃，只允许降级显示原始文本。

### 典型错误场景

#### 视频拆解

- `recordId` 缺失
- `skuId` 缺失
- `recordId` 对应视频不存在
- `skuId` 无法识别

#### 结构卡生成

- `skuId` 缺失
- `skuId` 无法识别
- 无可用知识模式，后端返回“请先执行 aggregate”

## 9. UI 细节

### 左栏

- 固定宽度
- 当前 workflow 高亮
- Reserved workflow 使用禁用样式

### 中栏

- 表单按 workflow 分组
- 示例数据按钮应内置一组稳定样例
- 请求 JSON 区可折叠

### 右栏

- Result 优先可读性
- Raw JSON 适合联调
- Logic Trace 专注逻辑依据
- History 专注最近执行回看

### 视觉目标

第一版视觉以清晰、稳定、可读为主，不追求高复杂度特效，不引入与业务无关的视觉噪音。

## 10. 测试策略

第一版优先验证前端适配层与页面状态，不追求完整 UI 自动化覆盖。

### 建议测试点

1. `runVideoDeconstruction`
   - 成功返回
   - 后端报错
2. `runContentStructureCard`
   - 成功返回
   - 后端报错
3. JSON 解析降级逻辑
   - 合法 JSON 正常格式化
   - 非法 JSON 退回纯文本展示
4. History 逻辑
   - 新记录插入
   - 超过 50 条截断
   - 反序列化异常时恢复为空数组

## 11. 实施边界总结

第一版最终边界如下：

```text
Agent Playground
├── workflow 1: 视频拆解（REAL）
├── workflow 2: 结构卡生成（REAL）
├── workflow 3: 发布链路（Reserved，不实现）
└── workflow 4: Mock Runner（Reserved，不实现）

右栏 Tabs
├── Result
├── Raw JSON
├── Logic Trace
└── History（localStorage，max 50）

其他页面
└── 不改
```

## 12. 后续演进（不属于第一版）

若第一版联调顺利，后续可按以下顺序扩展：

1. 将 Reserved workflow 逐步启用。
2. 若发布链路前端编排过重，再补聚合接口。
3. 若历史记录需要跨设备，再迁移到后端持久化。
4. 若 trace 能力成熟，再对接 `AgentTrace` 表。

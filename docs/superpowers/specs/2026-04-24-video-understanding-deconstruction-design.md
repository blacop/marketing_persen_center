# 视频理解拆解异步任务设计（Agent Playground Phase 2）

- 日期：2026-04-24
- 状态：Approved for implementation
- 适用仓库：`/Users/any/Documents/code/beukay/marketing-person-center`

## 1. 背景

当前 `POST /videoDeconstruction/deconstruct` 走的是 `recordId -> VideoPerformanceRecord -> RuleBasedVideoDeconstructionEngine`，核心依据是标题与历史指标，不会真正读取视频画面与音频。

这不满足当前 Playground 的测试目标：用户需要上传一个本地视频或输入一个视频 URL，系统必须通过关键帧、OCR、ASR 与多模态分析，真实理解视频内容并输出拆解结果。

## 2. 目标

本阶段目标：

1. 为 Agent Playground 的“视频拆解”工作流提供真实视频理解能力。
2. 支持两种输入：
   - 本地文件上传（第一优先级）
   - 远程视频 URL
3. 使用异步任务模型，提交后立即开始后台执行。
4. 使用本地临时目录保存源视频、关键帧、音频等中间文件。
5. 输出结构化拆解结果，并支持前端轮询查看任务进度与最终结果。
6. 保持模型提供方可替换，默认优先使用当前环境中最容易接通的 provider。

## 3. 非目标

本阶段不做：

1. 不改造 `ContentFlywheel`、`ContentProduction` 等业务页面。
2. 不把视频导入正式业务库，不创建正式 `VideoPerformanceRecord`。
3. 不做数据库持久化任务表；任务仅存内存，重启丢失可接受。
4. 不做 websocket / SSE；前端用轮询。
5. 不做发布链路或多 agent 编排。
6. 不做复杂权限、配额、审计。
7. 不承诺离线 OCR/ASR，本期 OCR 通过多模态视觉识别完成。

## 4. 总体方案

### 4.1 API 边界

保留旧接口：

- `POST /videoDeconstruction/deconstruct`

新增异步任务接口：

1. `POST /videoDeconstruction/understandingTask/upload`
   - `multipart/form-data`
   - 入参：`file`、`skuId`、`sourceLabel?`
   - 返回：任务快照
2. `POST /videoDeconstruction/understandingTask/url`
   - JSON 入参：`skuId`、`videoUrl`、`sourceLabel?`
   - 返回：任务快照
3. `POST /videoDeconstruction/understandingTask/get`
   - JSON 入参：`taskId`
   - 返回：任务快照

### 4.2 任务状态

任务状态固定为：

- `SUBMITTED`
- `RUNNING`
- `SUCCEEDED`
- `FAILED`

任务快照字段至少包含：

- `taskId`
- `status`
- `sourceType`（`LOCAL_FILE` / `REMOTE_URL`）
- `sourceName`
- `skuId`
- `progressPercent`
- `stage`
- `statusMessage`
- `errorMessage`
- `createdAt`
- `startedAt`
- `completedAt`
- `result`（成功时返回 `VideoDeconstructionDTO`）

### 4.3 执行流水线

异步任务执行流程：

1. 接收输入源。
2. 为任务分配 `taskId`。
3. 若为本地文件：落本地临时目录。
4. 若为 URL：异步下载到本地临时目录。
5. 调用 `ffprobe` 获取时长等元信息。
6. 调用 `ffmpeg` 抽取关键帧（默认 6 帧，按时间均匀采样）。
7. 调用 `ffmpeg` 导出单声道音频。
8. 调用可替换的视频理解分析器：
   - 音频 → ASR transcript
   - 关键帧 + transcript + 商品 truth → 多模态分析
   - 视觉模型同时承担 OCR 提取屏幕文案
9. 组装为 `VideoDeconstructionDTO` 风格结果。
10. 任务置为 `SUCCEEDED` 或 `FAILED`。

## 5. 模型抽象

### 5.1 抽象接口

新增 `VideoUnderstandingAnalyzer` 接口，负责对“已预处理的视频资产”做真实分析。

输入：

- `skuId`
- `sourceName`
- `PreparedVideoAssets`
- `ProductTruth?`

输出：

- transcript
- frame observations
- OCR text collection
- scene / 卖点 / CTA / 情绪 / 人群标签
- `hookType`
- `titlePattern`
- reasoning summary
- 最终结构化 JSON

### 5.2 默认实现

默认提供 `OpenAIVideoUnderstandingAnalyzer`：

- 音频转写：OpenAI transcription endpoint
- 帧理解：OpenAI multimodal responses endpoint
- 模型名通过环境变量覆盖；未配置时使用内置默认值
- 若缺少 API key 或调用失败，任务应明确失败，不允许静默 mock

## 6. 本地文件策略

本期仅做临时测试存储：

- 根目录：`${java.io.tmpdir}/marketing-person-center/video-understanding/`
- 每个任务独立目录：`<taskId>/`
- 目录内包含：
  - `source/`：原视频
  - `frames/`：关键帧图片
  - `audio/`：抽取音频
  - `analysis/`：可选分析产物 JSON

是否清理：

- 第一版不做自动 GC
- 允许人工删除 / 重启丢失

## 7. 结果结构

成功时返回的 `VideoDeconstructionDTO` 采用临时测试语义：

- `videoId`：使用任务派生 ID 或源文件名
- `skuId`：提交值
- `skuTag`：优先商品 truth 的 `productName`，否则回退 `skuId`
- `hookType`
- `titlePattern`
- `sceneTags`
- `sellingPointTags`
- `ctaTags`
- `emotionTags`
- `targetAudienceTags`
- `deconstructionJson`：完整结构化分析 JSON
- `actualPerformanceScore`：固定 `0`
- `verificationStatus`：`TEMP_ANALYZED`
- `status`：`TEMP`

`deconstructionJson` 需要包含：

- `summary`
- `transcript`
- `ocrTexts`
- `frameObservations`
- `reasoning`
- 上述全部标签字段

## 8. 前端改造范围

仅改 `Agent Playground` 的 workflow A。

### 8.1 输入区

工作流 A 改为：

- source mode 切换：`本地文件` / `视频 URL`
- 本地文件模式：
  - `file`（必填）
  - `skuId`（必填）
  - `sourceLabel`（选填）
- URL 模式：
  - `videoUrl`（必填）
  - `skuId`（必填）
  - `sourceLabel`（选填）

### 8.2 交互

1. 点击执行后立即提交任务。
2. 前端每 2 秒轮询一次任务状态。
3. 当状态为 `SUCCEEDED` / `FAILED` 时停止轮询。
4. 中栏显示当前任务状态、阶段、进度。
5. 右栏继续复用：
   - `Result`
   - `Raw JSON`
   - `Logic Trace`
   - `History`

### 8.3 History

继续使用 `localStorage`，结构不变，最多 50 条。

## 9. 错误处理

必须显式报错，不允许静默降级：

- 上传失败
- URL 下载失败
- `ffmpeg` / `ffprobe` 不存在或执行失败
- provider 未配置
- provider 调用失败
- 轮询超时
- JSON 解析失败

前端错误文案要直接显示到结果区与任务状态区。

## 10. 测试策略

### 后端

优先覆盖：

1. 任务提交后进入异步生命周期。
2. 任务成功时返回结构化结果。
3. 任务失败时保留错误信息。
4. 本地文件存储服务能写入上传文件。
5. 分析器抽象可被 fake 实现替换。

测试要求：JUnit 5，直接实例化，不启 Spring。

### 前端

优先覆盖：

1. API 适配层能提交 upload / url 任务。
2. 轮询逻辑能在终态停止。
3. 结果映射仍正确填充 `tracePayload`。

## 11. 成功标准

满足以下条件即视为完成：

1. Agent Playground 可上传本地视频并触发真实异步拆解。
2. 也可提交远程 URL 进行拆解。
3. 页面能显示任务状态、阶段、进度和最终结果。
4. `Logic Trace` tab 能看到完整 `deconstructionJson`。
5. 后端与前端有针对性测试覆盖，且构建通过。

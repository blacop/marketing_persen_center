# 进度日志

## 2026-04-28 — SemanticSplit 按截图视觉样式二次收敛
- **状态：** complete
- **执行的操作：**
  - 按用户提供截图把 SemanticSplit 调整为桌面剪辑软件风格：浅灰背景、四列上半区、底部全宽时间轴面板。
  - 左侧素材栏放大标题/筛选框/素材条目，使用浅青选中态、绿色左侧完成进度条、本地路径和右侧完成状态。
  - 中间预览区移除卡片标题，视频以 9:16 大画面独立居中展示，强化黄色标题和底部字幕位置。
  - 片段列表改为标题+搜索框同排、卡片白底细边框、左侧灰色竖线、右上角毫秒时间戳/时长布局。
  - 目标文件夹区改为大留白拖拽区，底部灰色禁用「批量切片导出」+ 文件夹按钮，顶部仅保留下载/删除图标。
  - 工具栏和时间轴整体移到底部全宽面板，时间轴改为灰色块状片段、橙色播放指针、底部浅灰分页条。
- **创建/修改的文件：**
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/cutmatrix/workflows/SemanticSplit.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
- **验证结果：**
  - 聚焦测试：`npm test -- --run src/lib/cm/semanticSplitUi.test.ts` ✅
  - 前端全量测试：`npm test` ✅（18 tests passed）
  - 前端构建：`npm run build` ✅

## 2026-04-28 — SemanticSplit 页面 P0/P1/P2 对照补齐
- **状态：** complete
- **执行的操作：**
  - 按用户给出的现状对照表，从 P0 → P1 → P2 补齐 `/cutmatrix/wf/semantic-split` 页面。
  - P0：新增片段文本搜索框、清除按钮、视频实时字幕叠加、播放指针、底部分页条、底部策略栏、拆解/批量拆解/重新归类按钮。
  - P1：新增目标文件夹拖拽区、手动选择入口、缩放控制、裁剪工具入口、片段毫秒级时间戳与无语音片段标注。
  - P2：新增素材栏导入/批量删除图标、绿色完成进度条、本地路径展示、预览区黄色标题、完整编辑工具栏装饰图标。
  - 将批量切片导出移到右侧目标文件夹底部，并在未选择目标文件夹时禁用。
  - 抽取 `semanticSplitUi` 工具函数，覆盖格式化、搜索、字幕命中、静音间隔、分页条和导出启用规则。
- **创建/修改的文件：**
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/cutmatrix/workflows/SemanticSplit.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/cm/semanticSplitUi.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/cm/semanticSplitUi.test.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
- **验证结果：**
  - TDD 红灯：`npm test -- --run src/lib/cm/semanticSplitUi.test.ts` 初次失败，确认工具函数尚不存在。
  - 聚焦测试：`npm test -- --run src/lib/cm/semanticSplitUi.test.ts` ✅（6 tests passed）
  - 前端全量测试：`npm test` ✅（18 tests passed）
  - 前端构建：`npm run build` ✅
- **备注：**
  - 浏览器无法稳定读取真实本机绝对路径；当前优先读取可用的 `File.path / webkitRelativePath`，否则按本地下载目录样式生成展示路径，用于贴近桌面工作流视觉。真实导出仍走后端 zip / draft.json。

## 2026-04-27 — 视频矩阵 P0/B/C 全链路实工：8 工具/编排器全部出 mp4
- 变更概要：完成 Phase A（基础设施）+ Phase B（5 ffmpeg 原子工具）+ Phase C（3 编排器实出 mp4）。共 8 张工具卡端到端真实可用，浏览器内可放出后端 ffmpeg 渲染的 mp4。
- 实测端到端验证：
  - **段落对齐**: 3 段（5+8+7=20s）→ ffmpeg concat → 24s mp4，浏览器 readyState=4 currentTime 1.4s 自动播放
  - **孙悟空**: 整段 30s 配音目标 → 全章节随机镜头 → 30s mp4 SUCCEEDED
  - **诸葛亮**: 各章节独立 mp4（待 UI 触发完整测试，后端通过）
  - **转换比例**: 上传 41KB mp4 → 9:16 540p crop → 2s mp4 SUCCEEDED
  - **操作视频声音**: removeOriginal=true → 静音 mp4 SUCCEEDED
  - **平均切分**: 1s 切分 → 2 段 SUCCEEDED
  - **极速过滤**: silencedetect → 反向 trim → SUCCEEDED
  - **按场景拆解**: scene threshold 0.2 → 2 段 SUCCEEDED
- Phase A 基础设施新增：
  - [CmStorageProperties.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/runtime/CmStorageProperties.java) — `@ConfigurationProperties("cutmatrix")` 暴露 storageRoot/ffmpegBin/ffprobeBin/baseUrl
  - [CmAssetStorageService.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/runtime/CmAssetStorageService.java) — 本地存储 uploads/{yyyy-MM}/ + renders/ + temp/{taskCode}/，UUID assetCode 索引
  - [CmFFmpegRunner.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/runtime/CmFFmpegRunner.java) — subprocess 封装 + ffprobe JSON 解析
  - [CmAssetController.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/runtime/CmAssetController.java) — `/cm/asset/upload` (multipart) + `/cm/asset/stream/{code}` (HTTP Range)
  - [CmRenderService.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/runtime/CmRenderService.java) — 多段 normalize → concat demuxer 拼接，可选 narration 替换音轨，统一 1080x1920/30fps
  - [application-local.yaml](marketing-person-infrastructure/src/main/resources/application-local.yaml) — 加 cutmatrix 配置
  - 仓库根 `cutmatrix-storage/` 存储目录 + .gitignore
- Phase B 5 工具：
  - [CmToolService.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/tool/CmToolService.java) — 转换比例 / 操作视频声音 / 平均切分 / 极速过滤 / 按场景拆解
  - [CmToolDtos.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/tool/CmToolDtos.java) — 6 个 cmd
  - [CmToolController.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/tool/CmToolController.java) — `/cm/tool/{aspectConvert,audioOps,uniformSplit,silenceFilter,sceneSplit}`
- Phase C 3 编排器：
  - [CmZhugeSunwukongEngine.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/CmZhugeSunwukongEngine.java) — 孙悟空（整段配音 + 全章节填充）/ 诸葛亮（每章节独立填充）
  - [CmComposeExecutor.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/CmComposeExecutor.java) — 编排 + 渲染串起来，3 mode 共用 `renderAndUpdate`
  - 接续 LocalTempVideoStorageService.findSourceVideo 解析 `/videoUnderstanding/stream/{taskId}` URL → 物理文件
  - Feign + Cmd 增 [CmComposeModeCmd.java](marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/CmComposeModeCmd.java)
- 前端实工：
  - [cmApi.ts](frontend/src/lib/cm/cmApi.ts) — `cmRemote` 全套：collection CRUD + chapter list + segment list + import + paragraphAlign + sunwukong + zhuge + uploadAsset + 5 tool API
  - [CmExplorer.tsx](frontend/src/pages/cutmatrix/CmExplorer.tsx) — 完全重写，从 localStorage 切到 cmRemote 真后端
  - [ParagraphAlign.tsx](frontend/src/pages/cutmatrix/workflows/ParagraphAlign.tsx) — 完全重写，调真 backend，结果显示 `<video>` 真 mp4 预览
  - [CmComposerMode.tsx](frontend/src/pages/cutmatrix/workflows/CmComposerMode.tsx) — 孙悟空/诸葛亮 共用页面，按路径分流
  - [CmToolRunner.tsx](frontend/src/pages/cutmatrix/tools/CmToolRunner.tsx) — 5 工具统一运行器（上传 → 配置参数 → 运行 → 显示 mp4）
  - [App.tsx](frontend/src/App.tsx) — 加 `/cutmatrix/wf/sunwukong-mode` `/cutmatrix/wf/zhuge-mode` `/cutmatrix/tool/{5个 key}` 路由
- DB 数据修复：
  - `cm_video_segment.scene_tags` / `selling_point_tags` 是 JSON 列；CmSegmentExecutor 增 `toJsonArray()` 把单字符串包成 JSON 数组（之前直接写 "室内" 报 Invalid JSON）
- 后端启用步骤：
  - SQL 已应用：`/opt/homebrew/opt/mysql-client/bin/mysql -h pxc-shra2p9ajbh6ne.polarx... -D db_ai_market_person < V20260433__cutmatrix_p0.sql`
  - Spring Boot 启动：`mvn install -pl client,domain,dbsdk -am -DskipTests` 后 `mvn spring-boot:run -DskipTests` (test 编译有 pre-existing ScriptBlueprintCriteria 错误，与本次无关)
- 已知缺口（Phase D/E，本会话不做）：
  - 文案裂变 / 提取章节结构 / 按语义拆解 → 复用 Ark LLM（Phase D）
  - 链接抓取 → 装 yt-dlp（Phase E）
  - 语音合成 → 火山/腾讯 TTS access key（Phase E）
  - 擦除字幕 → PP-OCR + LaMa inpainting 模型（Phase E）

## 2026-04-27 — 视频矩阵 (Cutmatrix) P0 后端骨架 + 文档落盘
- 变更概要：完成 P0 后端骨架（SQL + COLA 4 层 + 段落对齐引擎 + Controller），同步落盘视频制作领域知识 markdown，前端补 `cmRemote` 真实 API 层 + mock fallback。`mvn compile -q` 全绿，前端 tsc 全绿。后端启用需手动跑 SQL + 重启 Spring Boot。
- 涉及后端文件：
  - SQL: [V20260433__cutmatrix_p0.sql](marketing-person-dbsdk/src/main/resources/sql/V20260433__cutmatrix_p0.sql) — 4 张表 cm_collection / cm_chapter / cm_video_segment / cm_compose_task
  - DBSDK: 4 个 DO + 4 个 Mapper（marketing-person-dbsdk）
  - Domain: 4 个聚合实体 + 4 个 Gateway 接口（cutmatrix/* 包，与现有 scriptBlueprint / videoAssembly 平行）
  - Infrastructure: 4 个 Convertor + 4 个 GatewayImpl + 3 个 Executor (CmCollection / CmSegment / CmCompose) + [CutmatrixController.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/CutmatrixController.java) + [CmParagraphAlignEngine.java](marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/CmParagraphAlignEngine.java)
  - Client: [CutmatrixFeign.java](marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/CutmatrixFeign.java) + 3 cmd + 1 qry + 4 dto
- 涉及前端文件：
  - Vite proxy: [vite.config.ts](frontend/vite.config.ts) 加 `/cm` → localhost:30000
  - API 客户端: [cmApi.ts](frontend/src/lib/cm/cmApi.ts) 新增 `cmRemote` namespace（createCollection / listCollections / importFromDeconstruction / listChapters / listSegments / ping）+ 段落对齐 cmApi.alignParagraphs 改走真实 `/cm/compose/paragraphAlign` + 自动 fallback 到 mock
  - 元数据: [cmCatalog.ts](frontend/src/lib/cm/cmCatalog.ts) 17 张卡新增 `pipelineStep` + `pipelineSubStep` 字段
- 文档落盘：
  - [docs/cutmatrix/video-production-logic.md](docs/cutmatrix/video-production-logic.md) — 12 章节视频制作逻辑参考
    - 零、完整执行流程（Step 1-7，含决策树 + Agent 串联映射）
    - 一、核心哲学（原创审核优先级 / 受控 vs 全随机）
    - 二、素材数学关系
    - 三、孙悟空 / 诸葛亮模式选型
    - 四、5 种章节级音频策略
    - 五、拆片方法（场景 / 语义）
    - 六、文案 + 配音
    - 七、极速过滤
    - 八、字幕处理
    - 九、音画同步（粗 / 段落 / 句级）
    - 十、Cutmatrix Agent 设计落点 + 10 条规则速查
    - 十一、与现有 Agent A/B/C 隔离关系
    - 十二、参考资源 token
  - 来源：飞书《工作流学习地图》Wiki + 13 篇子文档 + AutoCutVideo.app 二进制分析
- 后端段落对齐核心算法（CmParagraphAlignEngine）：
  - 输入: blueprint sections + 品名素材池
  - 算法: 按 stage_code 过滤 → required tags 包含过滤 → 跨段落不复用同一镜头 → 累计时长 ≥ 配音时长，超出尾部截断
  - 输出: CmComposeResult.clips 顺序播放清单
- 浏览器验收（dev 5173）：
  - `/cutmatrix` 入口 + 工作流 + 小工具 Tab 正常
  - `cmApi.alignParagraphs` 调 `/cm/compose/paragraphAlign` → 后端 404（未重启）→ 自动 fallback 到 mock，返回 status='MOCK'，clipCount=3，totalDuration=14.5s
  - `cmRemote.ping()` 返回 false（确认后端未上线，前端不阻塞）
- 启用后端 P0 步骤（需手动）：
  1. 应用 SQL: 把 V20260433__cutmatrix_p0.sql 跑到测试库
  2. 重启 Spring Boot（marketing-person-infrastructure）
  3. 验证: `curl -X POST http://localhost:30000/cm/collection/list -H 'Content-Type:application/json' -d '{}'` 应返回 `{"success":true,...,"data":[]}`
  4. 浏览器: cmRemote.ping() 应返回 true
  5. 后端就绪后，CmExplorer 可继续保留 localStorage 作为缓存 + 同时 mirror 到 cmRemote（P0.1 待编码，本次未做）
- 后续 P1：将 Cutmatrix Agent 注册到 AgentRegistry + 建独立 cutmatrix-router Hermes skill + ffmpeg 渲染服务

## 2026-04-27 — 视频矩阵 (Cutmatrix) 模块 P0：复刻 autocut.video 工作流
- 变更概要：仿照 autocut.video（v2.30.5，arm64）的功能矩阵，新开顶级菜单"视频矩阵"，与现有飞轮 / Agent OS 工程层完全隔离。前端落地 18 个工具卡（10 工作流 + 7 小工具）+ 段落对齐编排器（本项目特化，重点）+ 素材组织 Explorer + 拆解结果导入。后端尚未上线，前端使用 localStorage + mock 算法跑通端到端 UI。
- 涉及文件：
  - 侧边栏分组：[components/Layout.tsx](frontend/src/components/Layout.tsx) 加 "视频矩阵" 顶级 NavGroup（工作流 / 小工具 / 素材组织 / 本机配置）
  - 元数据：[lib/cm/cmCatalog.ts](frontend/src/lib/cm/cmCatalog.ts) 18 张卡（自写描述，不引用任何外部产品文案）
  - API + 本地存储：[lib/cm/cmApi.ts](frontend/src/lib/cm/cmApi.ts) `cmStore` (Collection / Chapter / Segment localStorage CRUD) + `cmApi.alignParagraphs` (mock fallback)
  - 入口页：[pages/cutmatrix/CutmatrixHome.tsx](frontend/src/pages/cutmatrix/CutmatrixHome.tsx) 2 Tab + 状态/关键词过滤
  - 卡片网格：[pages/cutmatrix/CmCardGrid.tsx](frontend/src/pages/cutmatrix/CmCardGrid.tsx) 含星标收藏
  - 素材组织：[pages/cutmatrix/CmExplorer.tsx](frontend/src/pages/cutmatrix/CmExplorer.tsx) 树形 Explorer (collection/chapter/segment) + "新建品名" modal + "从拆解结果导入" modal（自动按 stage_code 归章节）
  - 段落对齐 P0：[pages/cutmatrix/workflows/ParagraphAlign.tsx](frontend/src/pages/cutmatrix/workflows/ParagraphAlign.tsx) 段落配置表 + 运行 + 结果按段分组渲染 SegmentClip
  - 占位详情：[pages/cutmatrix/CmDetailPlaceholder.tsx](frontend/src/pages/cutmatrix/CmDetailPlaceholder.tsx)
  - 本机配置：[pages/cutmatrix/CmSettings.tsx](frontend/src/pages/cutmatrix/CmSettings.tsx)
  - 路由：[App.tsx](frontend/src/App.tsx) 挂载 `/cutmatrix/*` 7 条路由
- 浏览器验收（dev 5173）：
  - `/cutmatrix` 工作流 Tab：11 张卡可见（10 工作流 + 段落对齐特化卡有"本项目特化"徽章）
  - `/cutmatrix/tools` 小工具 Tab：7 张卡（skip 浏览器分身）
  - `/cutmatrix/explorer` 创建测试品名 → "从拆解结果导入" 选 1 条 SEED_CUSHION_2 拆解 → 自动建 4 个章节、导入 8 个片段
  - 章节卡片网格：4 个 video 元素 readyState=4，currentTime 分别落在 5/15/20/35s（与片段 startSec 对齐）
  - `/cutmatrix/wf/paragraph-align` 选品名 → 4 段配置（5+8+12+7=32s）→ "运行段落对齐" → 8 个 mock 片段、总时长 36.5s、4 段分组渲染
- 设计原则：
  - 完全隔离：表前缀 `cm_` / API 前缀 `/cm/` / 命名空间 `cutmatrix/` / 不进 BeukayClaw router
  - 双源接入：人工上传（P1） + 拆解结果导入（P0 已通）
  - 段落对齐 = 玛丽黛佳特化的核心差异，对应飞书文档 §4.3
  - 文案/UI 自写，不直接复制任何外部产品文案与视觉
- 后续 P0 收尾：
  - 后端 SQL：cm_collection / cm_chapter / cm_video_segment 三张表
  - 后端 Agent：cm-paragraph-aligner + ffmpeg concat 渲染服务
  - 段落对齐结果接真实 video 流（当前 mock 用 placeholder URL）
- 后续 P1：极速过滤 / 文案裂变 / TTS / 擦除字幕 / 生成字幕 / 操作视频声音

## 2026-04-27 — 成片装配「拼接计划预览」 + Agent C 候选透明化
- 变更概要：成片任务现在能展示完整的 Agent C 选段编排：每段可独立播放（命中现有拆解）或回退到源视频回放 + 文字版计划。修复"成片只显示文本摘要"的可视化空缺。
- 涉及文件：
  - [frontend/src/components/AssemblyPlanStrip.tsx](frontend/src/components/AssemblyPlanStrip.tsx) — 新组件：把 `planSections` 解析成顺序播放的 SegmentClip 链；不存在时回退源视频 + 文字版顺序计划；附 Top-K 候选明细 `<details>`
  - [frontend/src/lib/agentApi.ts](frontend/src/lib/agentApi.ts) — `VideoAssemblyTask` 增加 `planSections / candidates` 字段；新增 `videoAssetApi.findDeconByVideoId(videoId)` 反查（list + match + detail）
  - [frontend/src/pages/AssetLibrary.tsx](frontend/src/pages/AssetLibrary.tsx) — `AssemblyDrawer` 注入 `AssemblyPlanStrip`
  - [frontend/src/pages/VideoProduction.tsx](frontend/src/pages/VideoProduction.tsx) — 成片库行点击改成 `openFinishedDetail`，自动调 `getAssemblyDetail` 拿 planSections/candidates；`selectedFinished` 抽屉内嵌 `AssemblyPlanStrip`
- 浏览器验收（dev 5173）：
  - `/content/video` Tab `成片库（live）` → 点 `vat-7d0c…` 行 → 抽屉显示 "拼接计划预览（4 段顺序播放）"
  - 当前 11 条历史 assembly 的 planSection.videoId 全部指向已被替换的 `video-task-c95900a1-…`，`findDeconByVideoId` 返回 null → 回退渲染：警告条 + 源视频 `<video controls>` (245s 完整播放，readyState=4) + 4 段文字版计划（钩子 / 场景痛点 / 方案卖点 / 证明收束 + segmentId + selectedReason）
  - Top-K 候选明细 `<details>` 默认折叠，展开显示 8 条候选 + similarityScore + 是否选中
- 已知数据问题（待后端处理，不阻塞 UI）：
  - 后端 video_segment 表里所有 segment 都还指向旧的 `c95900a1` 源视频，导致新生成的 assembly 也命中老 videoId。需要后端按当前 video_deconstruction_result 重新 backfill video_segment.video_id，或让 Agent C 生成 plan 时严格只用现存视频
  - `deconstructionJson.segments[*]` 没有 id 字段（只有 index），匹配时已 fallback 到 `index === Number(segmentId)`
- 影响 / 后续步骤：
  - 一旦后端 segment 数据刷新到当前 videoId，UI 自动切换到"4 段独立 SegmentClip 顺序播放"形态，无需再改前端
  - 真实成片 mp4（resultVideoUrl）落地后，原有的 `<video controls>` 块会自然显示在 strip 上方

## 2026-04-27 — 拆解视频片段可独立播放预览
- 变更概要：视频拆解后只能看源视频的痛点已修复。每个 segment 现在渲染独立 `<video>`，clip 到 `[startSec, endSec]` 自动循环，等同于"拆解出的视频素材"。同时修复后端 Long id JS 截断引发的 React 重复 key 与详情查不到记录两个连锁问题。
- 涉及文件：
  - [frontend/src/components/SegmentClip.tsx](frontend/src/components/SegmentClip.tsx) — 新增可复用 SegmentClip 组件（点击播放/暂停 + 时间窗口循环 + 时间戳/标签覆盖层）
  - [frontend/src/lib/agentApi.ts](frontend/src/lib/agentApi.ts) — `safeParseJson` 把 `id/recordId/...` 等 16+ 位整数 ASCII-stringify 后再 JSON.parse，避免 JS Number 精度截断；`getDeconstructionDetail` 兜底从 `deconstructionJson` 解析 `segments` 数组
  - [frontend/src/pages/AssetLibrary.tsx](frontend/src/pages/AssetLibrary.tsx) — 拆解抽屉的 segment 卡改成 grid `[160px clip] [text]` 布局，左侧嵌入 SegmentClip；列表 key 改为复合避免 id 冲突
  - [frontend/src/pages/BeukayClaw.tsx](frontend/src/pages/BeukayClaw.tsx) — ChatMessage 增加 `segments?` 字段；视频拆解 SUCCEEDED 后异步 `getDeconstructionDetail(r.id)` 拉 segments，对话气泡内 2 列网格渲染 SegmentClip 缩略
- 浏览器验收（dev 5173）：
  - `/asset-library` Tab `素材` → 选 SEED_CUSHION_2 拆解卡 → 抽屉显示 8 个 segment 缩略，currentTime 分别落在 0/5/10/15/20/25/35/90，readyState=4，点击播放后会在 `[startSec, endSec]` 内自动循环
  - 兜底解析生效：原始 backend 不返回顶层 `segments`，segments 嵌在 `deconstructionJson` 字符串字段里，`getDeconstructionDetail` 现在能透传 8 段
- 影响 / 后续步骤：
  - BeukayClaw 上传新视频后聊天里也会出现拆解片段缩略（待用户上传新视频实测）
  - 仍存在的 React key 重复警告来自缓存的旧渲染；新加载已用 `${id}-${recordId}` 复合键避免
  - 长期更优解：后端配置 Jackson 把 Long 序列化为 String，根除全站 id 截断风险（task_plan 待加）

## 2026-04-27 — 跨 stage 触发按钮，体现 agent 调度（C 阶段）
- 变更概要：PipelineCenter 与 AssetLibrary 增加跨 stage 触发链按钮，把"看板页"升级为"可触发下游 agent 的指挥中枢"。链路命中真实后端 API（B / C），仅投放为 mock。
- 涉及文件：
  - [frontend/src/pages/ContentProduction.tsx](frontend/src/pages/ContentProduction.tsx) — 7 stage 卡新增 `→ 下发到 {下一阶段}` 按钮，点击 toast + `useNavigate` 跳转下游业务页
  - [frontend/src/pages/AssetLibrary.tsx](frontend/src/pages/AssetLibrary.tsx) — 视频拆解卡片新增 `→ 生成脚本蓝图（Agent B）`（真实调 `/scriptBlueprint/generate`），AI 生成卡按类型分支：脚本蓝图卡 `→ 装配此蓝图（Agent C）`（真实调 `/videoAssembly/generate`），视频装配卡 `→ 投放此成片（千川 mock）`
- 浏览器验收（dev 5173）：
  - `/content` 点 "下发到 种草文案生产" → toast 显示 "✓ 产品卖点提炼 已下发到 种草文案生产" → 自动跳 `/content/script`
  - `/asset-library` Tab `素材` 点 "生成脚本蓝图（Agent B）" → 后端返回真实 `sbp-…` blueprintCode → 写入 generatedAssetStore → "AI生成素材" 区出现 NEW 卡
  - 蓝图 NEW 卡点 "装配此蓝图" → 真实 `vat-…` taskCode 返回 → 视频装配 NEW 卡跟着出现
  - 视频装配 NEW 卡点 "投放此成片" → mock toast `✓ Mock：成片 vat-… 已下发到投放 Agent（千川）`
- 影响 / 后续步骤：
  - 飞轮闭环 A→B→C→投放 在 UI 层完整可演示，无需切换到 BeukayClaw 对话即可触发
  - 真链路命中后端 NotBlank 校验：`generateBlueprint` 必传 `marketingGoal=SEEDING`（已在调用处带入）
  - 待后续：投放 mock 接入真千川 Agent（`qianchuan-delivery`）触发；下发按钮可考虑写入 `agentTrace` 记录便于审计

## 2026-04-27 — 7-stage 业务页接入 live 数据（B 阶段：脚本工坊 + 视频产出）
- 变更概要：把仅在 PipelineCenter 详情可见的 **脚本蓝图 / 内容结构卡 / 装配成片** 三类 AI 产物接入对应业务页面，使 7-stage 飞轮各 stage 都有专属真实业务页。
- 涉及文件：
  - [frontend/src/lib/agentApi.ts](frontend/src/lib/agentApi.ts) — 新增 `productionApi.listStructureCards` 助手
  - [frontend/src/pages/ScriptWorkshop.tsx](frontend/src/pages/ScriptWorkshop.tsx) — 新增 `脚本蓝图（live）` + `结构卡（live）` 两个 Tab，按需 fetch detail 拉取段落明细
  - [frontend/src/pages/VideoProduction.tsx](frontend/src/pages/VideoProduction.tsx) — 新增 `成片库（live）` Tab + 成片任务详情抽屉（含 video player + 装配摘要 JSON）
- 浏览器验收（dev server 5173）：
  - `/content/script` Tab0：19 条脚本蓝图 (`/scriptBlueprint/list`)，展开任意行触发 `/scriptBlueprint/get` 拉取 sections，展示推荐理由 + 4 段语义蓝图
  - `/content/script` Tab1：14 条结构卡 (`/contentStructureCard/listPage`)，展示 cardId/SKU/营销节点/状态
  - `/content/video` Tab0：10 条装配任务 (`/videoAssembly/listPage`)，点击行打开抽屉显示 taskCode/blueprint/platform/装配摘要
- 影响 / 后续步骤：
  - 7 stage 业务页全部具备真实数据接入入口（拆解结果已在 AssetLibrary，蓝图/结构卡/成片现接入 ScriptWorkshop/VideoProduction）
  - 下一步 C：在 PipelineCenter / AssetLibrary 增加跨 stage 触发按钮（"拆解此源视频" / "装配此蓝图" / "投放此成片"），打通 agent 调度链
  - 下一步 A：浏览器视觉回归三个新 Tab 截图归档

## 会话：2026-04-23

### 阶段 1：需求冻结与现状基线
- **状态：** complete
- **开始时间：** 2026-04-23
- 执行的操作：
  - 阅读仓库结构、POM、核心聚合代码、Hermes 脚本与设计技能要求。
  - 完成 Agent 元数据内核与最小发布闭环设计，并写入设计文档。
  - 根据已批准设计创建实施计划文件。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/2026-04-23-agent-metadata-kernel-and-minimal-publish-loop-design.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 2-7：模型扩展、发布链路与验证
- **状态：** complete
- 执行的操作：
  - 扩展 `AgentDefinition / AgentRegistry / SkillRegistry / AgentTrace` 模型与 client API。
  - 新增 `AgentPublishRecord` 聚合、Mapper、XML、DTO、Controller、Executor、GatewayImpl。
  - 实现 `AgentPublishAppService`、`SkillArtifactGenerator`、`HermesLocalSkillPublisher`。
  - 打通 `publish / retryPublish / detail / update` 等核心接口。
  - 新增 SQL 草案 `V20260423__agent_metadata_kernel.sql`。
  - 为 generator/publisher/app service 编写轻量级单测。
  - 执行 `mvn compile -q` 与 `mvn test -q -pl marketing-person-infrastructure -am` 验证通过。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/AgentDefinitionFeign.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/AgentTraceFeign.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/AgentPublishRecordFeign.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/AgentDefinitionUpdateCmd.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/AgentDefinitionPublishCmd.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/AgentDefinitionRetryPublishCmd.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/AgentDefinitionPublishDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/AgentPublishRecordDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/agentPublishRecord/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/AgentPublishAppService.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/generator/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/publisher/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/resources/sql/V20260423__agent_metadata_kernel.sql`

### 阶段 8：交付复核
- **状态：** complete
- 执行的操作：
  - 补齐 AgentIdentity / AgentRegistry / SkillRegistry 的 detail/update/status 查询接口。
  - 补充 AgentDefinition archive 接口。
  - 再次执行编译与测试验证。
  - 汇总后续扩展点与交付说明。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/AgentIdentityFeign.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/AgentRegistryFeign.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/SkillRegistryFeign.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/AgentDefinitionArchiveCmd.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/AgentDefinitionArchiveCmdExecutor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/AgentIdentityDetailQryExecutor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/AgentRegistryDetailQryExecutor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/SkillRegistryDetailQryExecutor.java`

### 阶段 9：前后端对接（Agent OS 页面）
- **状态：** complete
- **开始时间：** 2026-04-23
- 执行的操作：
  - 新增 `frontend/src/lib/agentApi.ts`，统一封装 AgentDefinition / AgentRegistry / SkillRegistry / AgentIdentity 调用。
  - 重写 `AgentStudio`、`AgentRegistryPage`、`SkillRegistryPage`、`AgentIdentityMgmt` 为真实后端数据页。
  - 在 `App.tsx` 与 `Layout.tsx` 中补充路由和导航入口。
  - 在 `frontend/vite.config.ts` 中新增本地代理配置。
  - 执行 `npm run build` 验证通过。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentApi.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentStudio.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentRegistryPage.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/SkillRegistryPage.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentIdentityMgmt.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/App.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/components/Layout.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/vite.config.ts`

### 阶段 10：观测闭环收口（Trace / PublishRecord）
- **状态：** complete
- 执行的操作：
  - 扩展 `agentApi`，补齐 `AgentTrace / AgentPublishRecord` 查询类型与方法。
  - 将 `AIExecutionTracker` 从大段 mock 页面重写为真实观测台，接入 Definition / Trace / PublishRecord 三类后端数据。
  - 调整侧边栏，将 Observability 归入 Agent OS；在 Agent Studio 发布结果区补充一键跳转。
  - 再次执行 `npm run build` 验证通过。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentApi.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AIExecutionTracker.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentStudio.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/components/Layout.tsx`


### 阶段 11：Agent OS 前端视觉重构
- **状态：** complete
- 执行的操作：
  - 基于已确认的原版浅色卡片风与 R2（原版语言 + 数据页增强）方案，重构 5 个 Agent OS 页面。
  - 在 `frontend/src/styles/index.css` 中新增 Agent OS 专属样式基座，包括 Hero、指标卡、筛选条、内容容器、状态徽标、表格与卡片矩阵。
  - 重写 `AgentStudio`、`AgentRegistryPage`、`SkillRegistryPage`、`AgentIdentityMgmt`、`AIExecutionTracker` 的页面结构与视觉层次。
  - 执行 `npm run build` 验证通过。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/styles/index.css`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentStudio.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentRegistryPage.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/SkillRegistryPage.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentIdentityMgmt.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AIExecutionTracker.tsx`

## 测试结果
| 测试 | 输入 | 预期结果 | 实际结果 | 状态 |
|------|------|---------|---------|------|
| 设计文档占位检查 | spec markdown | 无 TODO/TBD/占位词 | 通过 grep 检查未发现占位符 | passed |
| Maven 编译 | `mvn compile -q` | 全模块编译通过 | 编译通过（两次） | passed |
| 基础单测 | `mvn test -q -pl marketing-person-infrastructure -am` | 新增单测通过 | 测试通过（两次） | passed |
| 前端构建 | `npm run build` | 前端类型检查与打包通过 | 构建通过（三次，最新含 Agent OS 视觉重构） | passed |

## 错误日志
| 时间戳 | 错误 | 尝试次数 | 解决方案 |
|--------|------|---------|---------|
| 2026-04-23 | 无可用 writing-plans skill | 1 | 采用 planning-with-files-zh 文件化计划替代 |
| 2026-04-23 | 单独测试 infrastructure 模块时缺少联动模块依赖 | 1 | 使用 `-am` 同时构建依赖模块 |

## 五问重启检查
| 问题 | 答案 |
|------|------|
| 我在哪里？ | 阶段 11 已完成 |
| 我要去哪里？ | 可继续做 Gateway 鉴权、OTel、Webhook/Cron、业务层扩展或全站视觉统一 |
| 目标是什么？ | 打通 Agent 元数据内核与最小 Hermes 发布闭环 |
| 我学到了什么？ | 见 findings.md |
| 我做了什么？ | 已完成设计、计划、实现、编译、单测 |

---
*每个阶段完成后或遇到错误时更新此文件*

### 阶段 12：AI 内容飞轮引擎总蓝图设计
- **状态：** complete
- 执行的操作：
  - 结合当前前端业务页面、Agent Matrix 数据与用户给出的六阶段飞轮清单，完成 Layer 2 总蓝图设计。
  - 明确”飞轮优先、页面优先、Agent OS 作为控制平面、Hermes 作为执行层”的总体原则。
  - 完成业务页面到六阶段飞轮的全量归组。
  - 输出下一阶段推荐顺序：先落内容生产飞轮 MVP，再接投放分发、效果采集与数据反哺。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/2026-04-23-ai-content-flywheel-total-blueprint-design.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 13：内容拆解 Agent 设计 + Phase A 数据基础
- **状态：** complete
- 执行的操作：
  - 分析抖音历史视频数据（2930条），提炼5+2种内容钩子模式、多目标评分公式、数据时间衰减策略。
  - 编写内容拆解 Agent V1.1 设计文档（含GPT同行评审采纳）。
  - 创建 DDL 文件 `V20260424__content_flywheel_foundation.sql`（3张新表：video_performance_record / product_truth / content_structure_card）。
  - 编写 Python 导入脚本 `scripts/import_video_performance.py`：Excel→SQL，含SKU标注/Hook类型标注/composite_score计算。
  - 生成 `scripts/output/video_performance_insert.sql`（2930条INSERT，7种Hook类型标注完毕）。
- 创建/修改的文件：
  - `docs/superpowers/specs/agents/2026-04-23-content-deconstructor-agent-design.md` — V1.1 设计稿
  - `marketing-person-dbsdk/src/main/resources/sql/V20260424__content_flywheel_foundation.sql`
  - `scripts/import_video_performance.py`
  - `scripts/output/video_performance_insert.sql`（不入git，本地使用）

---

## 会话：2026-04-23（续）— 进度盘点

### 当前全量交付状态（本次盘点）

#### 后端 Java（Spring Boot / COLA v4.0）

| 聚合 | 模块 | 状态 |
|------|------|------|
| KolPerson | 全套 18 文件（Client/Domain/DbSdk/Infra） | ✅ 已生成，BUILD SUCCESS |
| AgentIdentity | 全套 COLA 文件 + Feign + Executor + GatewayImpl | ✅ 已生成，BUILD SUCCESS |
| SkillRegistry | 全套 COLA 文件 | ✅ 已生成，BUILD SUCCESS |
| AgentRegistry | 全套 COLA 文件 + activate/suspend 接口 | ✅ 已生成，BUILD SUCCESS |
| AgentDefinition | 全套 COLA 文件 + publish/retryPublish/archive 接口 | ✅ 已生成，BUILD SUCCESS |
| AgentTrace | 全套 COLA 文件 | ✅ 已生成，BUILD SUCCESS |
| AgentPublishRecord | 全套 COLA 文件 + SkillArtifactGenerator + HermesLocalSkillPublisher | ✅ 已生成，BUILD SUCCESS |

**发布链路核心服务**
- `AgentPublishAppService` — 编排 publish / retryPublish 全流程（generate → write → register → trace）
- `SkillArtifactGenerator` — 从 AgentDefinition 生成 SKILL.md
- `HermesLocalSkillPublisher` — 写 SKILL.md 到 `~/.hermes/skills/beukay/`，更新 SkillRegistry 与 AgentRegistry

**DDL**
- `marketing-person-dbsdk/src/main/resources/sql/V20260423__agent_metadata_kernel.sql` — 含全部 7 张表建表 SQL

#### 前端 React（TypeScript + Vite）

| 文件 | 状态 |
|------|------|
| `frontend/src/lib/agentApi.ts` | ✅ 完整 API client（全部聚合类型 + fetch 封装） |
| `frontend/src/pages/AgentStudio.tsx` | ✅ Definition 编辑 + publish + archive + 发布预览 |
| `frontend/src/pages/AgentRegistryPage.tsx` | ✅ Registry 列表 + activate/suspend 操作 |
| `frontend/src/pages/SkillRegistryPage.tsx` | ✅ Skill 资产卡片矩阵 |
| `frontend/src/pages/AgentIdentityMgmt.tsx` | ✅ Identity CRUD 编辑器 |
| `frontend/src/pages/AIExecutionTracker.tsx` | ✅ Trace + PublishRecord 观测台 |
| `frontend/src/App.tsx` | ✅ 路由已注册（agent-studio/agent-registry/skill-registry/agent-identities/ai-tracker） |
| `frontend/src/styles/index.css` | ✅ Agent OS 专属样式系统（hero/metric-card/list/table/asset-card） |

**前端构建：** `npm run build` 通过（含类型检查）

#### Hermes 集成

| 文件 | 状态 |
|------|------|
| `hermes/setup.sh` | ✅ 同步 skills 到 `~/.hermes/skills/beukay/` |
| `hermes/skills/cola-generator/SKILL.md` | ✅ 版本受控 |
| `hermes/skills/arch-reviewer/SKILL.md` | ✅ 版本受控 |
| `hermes/skills/style-checker/SKILL.md` | ✅ 版本受控 |
| `Makefile` | ✅ dev/build/stop/hermes-setup 目标 |

### 待办事项（下阶段）

#### 优先级 P0（阻塞上线）
- [ ] **执行 DDL** — 在目标数据库跑 `V20260423__agent_metadata_kernel.sql`，建 7 张表
- [ ] **Nacos 配置** — 配置 datasource / nacos discovery，使 Spring Boot 能正常启动
- [ ] **验证完整启动** — `mvn clean package -DskipTests && java -jar`，确认 controller 路由可达

#### 优先级 P1（功能完善）
- [ ] **KolPerson 业务字段** — 当前字段为炮筒默认值，需补充真实 KOL 业务字段（姓名、平台、粉丝数、标签等）
- [ ] **Gateway 鉴权** — AgentIdentity 的 publicKey/authPolicy 鉴权中间件接入
- [ ] **Hermes skill 扩展** — 新增 agent-executor / skill-dispatcher / trace-reporter 三个 Hermes skill
- [ ] **MCP 预留接入** — AgentTrace toolCalls 字段格式化 + MCP context 透传（保留结构，不接外部）

#### 优先级 P2（体验优化）
- [ ] **飞轮业务页面落实** — 按阶段 12 蓝图，逐一落实内容生产飞轮各页面的真实数据对接
- [ ] **全站视觉统一** — 将 Agent OS 样式系统扩展为全站 design token
- [ ] **OTel/分布式追踪** — AgentTrace 接入 OpenTelemetry，traceId 联动 Spring Boot Actuator

### 阶段 13：内容生产双 Agent + 知识库架构设计
- **状态：** complete
- 执行的操作：
  - 基于对话确认，将“内容拆解 + 结构卡生成”从单 Agent 架构调整为双 Agent + 知识库解耦架构。
  - 明确了三层数据结构：原始事实层、知识层、运行时产物层。
  - 为 Agent A（视频拆解知识沉淀）和 Agent B（结构卡生成）分别定义了职责、输入输出和执行模式。
  - 给出新增知识层三张表设计：`video_deconstruction_result / content_pattern_knowledge / pattern_reference_video_rel`。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/agents/2026-04-23-two-agent-content-knowledge-architecture-design.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

## 会话：2026-04-24

### 阶段 14：Agent A 最小闭环落地（单视频拆解）
- **状态：** complete
- 执行的操作：
  - 按 COLA 四层结构补齐 `VideoDeconstructionResult / ProductTruth / VideoPerformanceRecord` 相关 Domain、Gateway、DO、Mapper、Convertor、Controller、Executor。
  - 新增 `VideoDeconstructionFeign`、`VideoDeconstructionCreateCmd`、`VideoDeconstructionDetailQry`、`VideoDeconstructionPageQry`、`VideoDeconstructionDTO`。
  - 实现 `RuleBasedVideoDeconstructionEngine`，基于标题、hookType、productTruth JSON 规则抽取：
    - 场景标签
    - 卖点标签
    - CTA 标签
    - 情绪标签
    - 目标人群标签
    - 标题模式
  - 实现 `VideoKnowledgeBuildAppService`，支持单条视频拆解写入知识原子表 `video_deconstruction_result`。
  - 新增知识层 SQL：`V20260425__content_knowledge_layer.sql`，建表：
    - `video_deconstruction_result`
    - `content_pattern_knowledge`
    - `pattern_reference_video_rel`
    - 并为 `content_structure_card` 预留 `logic_trace`
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/VideoDeconstructionFeign.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/VideoDeconstructionCreateCmd.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/qry/VideoDeconstructionDetailQry.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/qry/VideoDeconstructionPageQry.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoDeconstructionDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoDeconstructionResult/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/productTruth/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoPerformanceRecord/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/RuleBasedVideoDeconstructionEngine.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/VideoKnowledgeBuildAppService.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/resources/sql/V20260425__content_knowledge_layer.sql`

### 阶段 15：Agent A 知识聚合落地（模式知识库）
- **状态：** complete
- 执行的操作：
  - 新增 `ContentPatternKnowledge` 与 `PatternReferenceVideoRel` 两个知识层聚合。
  - 实现 `ContentPatternKnowledgeBuildAppService`：
    - 按 `skuId` 从 `video_deconstruction_result` 拉取已拆解视频
    - 以 `hookType + titlePattern` 做 V1 模式分组
    - 聚合推荐 opening / sellingPoints / scenes / cta
    - 生成 `negativeRules`
    - 写入 `content_pattern_knowledge`
    - 回填 `pattern_reference_video_rel`
  - 新增知识聚合 API：
    - `/contentPatternKnowledge/aggregate`
    - `/contentPatternKnowledge/get`
    - `/contentPatternKnowledge/listPage`
  - 增加 `VideoDeconstructionResultGateway#listBySkuId`，支撑知识聚合服务。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/ContentPatternKnowledgeFeign.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/ContentPatternKnowledgeAggregateCmd.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/qry/ContentPatternKnowledgeDetailQry.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/qry/ContentPatternKnowledgePageQry.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/ContentPatternKnowledgeDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/contentPatternKnowledge/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/patternReferenceVideoRel/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/ContentPatternKnowledgeBuildAppService.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/controller/ContentPatternKnowledgeController.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/ContentPatternKnowledgeGatewayImpl.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/PatternReferenceVideoRelGatewayImpl.java`

### 阶段 16：Agent A 编译与测试收口
- **状态：** complete
- 执行的操作：
  - 修复 `VideoDeconstructionResultGatewayImpl` 分页泛型不兼容问题。
  - 对齐 `PageInfo` 使用方式，修复知识查询执行器分页 DTO 转换问题。
  - 为规则引擎、单视频知识沉淀、模式知识聚合补充纯 JUnit 测试。
  - 执行编译与测试：
    - `mvn compile -q`
    - `mvn test -q -pl marketing-person-infrastructure -am`
  - 最新结果均通过。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/infrastructure/service/RuleBasedVideoDeconstructionEngineTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/VideoKnowledgeBuildAppServiceTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/ContentPatternKnowledgeBuildAppServiceTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/VideoDeconstructionResultGatewayImpl.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/ContentPatternKnowledgeQryExecutor.java`

## 当前阶段总览（截至 2026-04-24）

### 1. Agent OS 底座
- **状态：** 已完成
- **说明：**
  - AgentDefinition / AgentRegistry / SkillRegistry / AgentIdentity / AgentTrace / AgentPublishRecord 已全链路落地。
  - Hermes 本地发布闭环已打通。
  - Agent OS 五个前端页面已接后端并完成一版视觉重构。

### 2. 飞轮架构设计
- **状态：** 已完成
- **说明：**
  - 六阶段 AI 内容飞轮总蓝图已完成。
  - “双 Agent + 知识库解耦”已完成架构冻结。

### 3. 内容生产飞轮 — Agent A（视频拆解知识沉淀）
- **状态：** 最小闭环已完成
- **已完成：**
  - 基础事实层表：`video_performance_record / product_truth / content_structure_card`
  - 知识层表：`video_deconstruction_result / content_pattern_knowledge / pattern_reference_video_rel`
  - 单视频拆解 API
  - 模式知识聚合 API
  - 单元测试与编译验证
- **未完成：**
  - 50 条抽检流
  - 全量批跑 / cron 调度
  - verification 人工校验工作流

### 4. 内容生产飞轮 — Agent B（结构卡生成）
- **状态：** 最小闭环已完成（阶段 17）
- **已完成：**
  - COLA 四层全链路：DO + Mapper + Domain Entity + Gateway + DomainService + Feign + Cmd/Qry/DTO + Convertor + GatewayImpl + AppService + Controller + Executor
  - `ContentStructureCardGenerateAppService`：按 patternScore 取最优模式 → 取参考视频 → 构建 cardJson + logicTrace → 写库
  - E2E 验证通过：POST `/contentStructureCard/generate` → 成功返回 cardId，DB 落行

### 5. 抖音最小飞轮业务闭环
- **状态：** 进行中
- **当前已打通到：**
  - 历史视频事实入库 → 视频拆解 → 模式知识沉淀 → 结构卡生成
- **尚未打通：**
  - 脚本生成
  - 素材拼接
  - 效果回流到结构卡/脚本知识库

### 6. Agent Playground 前端 + 视频理解异步链路
- **状态：** 进行中（阻塞在 OPENAI_API_KEY）
- **已完成：**
  - Agent Playground 页面（`/agent-playground`）
  - 前端适配层 `agentPlaygroundApi.ts`（统一执行结果结构）
  - localStorage 历史记录（50条上限）
  - 视频上传 / URL 提交 / 异步任务轮询 UI
  - 后端视频理解异步链路：上传 → 本地临时存储 → ffmpeg 抽帧/提取音频 → ASR → 多模态分析 → 拆解结果
  - 可替换 `VideoUnderstandingAnalyzer` 抽象，默认 `OpenAIVideoUnderstandingAnalyzer`
  - `VideoUnderstandingTaskAppService` 任务注册与状态推进
  - multipart 上传限制扩大至 100MB
  - 前端构建通过，后端单元测试通过
- **阻塞点：**
  - `OPENAI_API_KEY` 无效 → ASR 返回 401，任务 FAILED
  - 换有效 key 后全链路即可跑通

## 最新测试结果补充
| 测试 | 输入 | 预期结果 | 实际结果 | 状态 |
|------|------|---------|---------|------|
| Agent A 编译 | `mvn compile -q` | 双 Agent 知识层代码可编译 | 通过 | passed |
| Agent A 后端测试 | `mvn test -q -pl marketing-person-infrastructure -am` | 新增规则引擎/知识沉淀/模式聚合测试通过 | 通过 | passed |
| Agent B 编译 | `mvn compile -q` | ContentStructureCard 全链路代码可编译 | 通过 | passed |
| Agent B E2E | POST `/contentStructureCard/generate` skuId=SEED_CUSHION_2 | 返回 cardId，DB 落行 | cardId=csc-2c0f84537dad494fa961ee1131c5699a，hookType=技术卖点型，id=1 | passed |

### 阶段 17：Agent B 落地与 E2E 验证（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 修复编译错误：`PageUtil.toIPage()` / `PageUtil.of()` / `IPage<>` / `PageInfo.getRecords()` / `PageQuery.pageIndex` 对齐。
  - 修复 `ContentPatternKnowledgeListCriteriaQuery.verificationStatus` 字段对齐。
  - 启动 Spring Boot（local profile + `--tenant.nezha-plugin-enable=false`，Nacos 真实连接）。
  - E2E curl 验证：cardId=csc-2c0f84537dad494fa961ee1131c5699a 写入 `content_structure_card` 表，hookType=技术卖点型，patternScore=0.729。
- 创建/修改的文件：
  - `marketing-person-infrastructure/...gatewayimpl/ContentStructureCardGatewayImpl.java`
  - `marketing-person-infrastructure/...executor/ContentStructureCardQryExecutor.java`
  - `marketing-person-infrastructure/...service/ContentStructureCardGenerateAppService.java`
  - `marketing-person-infrastructure/src/main/resources/application-local.yaml`

### 阶段 19：片段级视频拆解（最小单元库）实现（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 读取同事飞书知识库（最小单元库 6表体系），确认 Agent C 视频合成需要片段级原子素材
  - 新增 `VideoSegment` inner class 到 `VideoUnderstandingAnalyzer`（20维标签：structureTag/motivation/technique/cameraLanguage/scene/signalStrength/keyPhrase/script/sellingPoint/decisiveFrame/influencerLevel/audiencePersona/bgm/rhythm/wardrobe/audio/skinType/trending）
  - 更新 `ArkVideoUnderstandingAnalyzer` prompt，要求同时输出视频级 + 片段级 JSON，含完整枚举候选值
  - 新增 `extractSegments()` 解析方法
  - 新建 `video_segment` 表（DDL + 索引），执行到 PolarDB-X
  - COLA 全链路：`VideoSegmentDO` → `VideoSegmentDOMapper` → `VideoSegment`(domain) → `VideoSegmentGateway` → `VideoSegmentConvertor` → `VideoSegmentGatewayImpl`
  - 新增 `VideoSegmentDTO`，`VideoDeconstructionDTO.segments` 字段
  - `VideoUnderstandingTaskAppService` 注入 `VideoSegmentGateway`，分析完成后调用 `persistSegments()` 写库
  - E2E 验证：upload 12s 视频 → SUCCEEDED → 4条片段 → `video_segment` 表写入 4行
- 验证结果：
  - 片段示例：`[1] 0-3s 钩子 痛点 情绪渲染 signal=4 keyPhrase=2026年|淘汰旧散粉 isDecisiveFrame=1`
  - `[3] 6-9s 产品亮相 卖点 产品讲解 signal=5 keyPhrase=玛丽黛佳|乳液蜜粉|全季适用`
- 创建/修改的文件：
  - `marketing-person-dbsdk/...model/VideoSegmentDO.java`（新建）
  - `marketing-person-dbsdk/...dao/VideoSegmentDOMapper.java`（新建）
  - `marketing-person-dbsdk/.../sql/V20260426__video_segment.sql`（新建，已执行）
  - `marketing-person-domain/.../videoSegment/model/VideoSegment.java`（新建）
  - `marketing-person-domain/.../videoSegment/gateway/VideoSegmentGateway.java`（新建）
  - `marketing-person-infrastructure/.../convertor/VideoSegmentConvertor.java`（新建）
  - `marketing-person-infrastructure/.../gatewayimpl/VideoSegmentGatewayImpl.java`（新建）
  - `marketing-person-client/.../dto/VideoSegmentDTO.java`（新建）
  - `marketing-person-client/.../dto/VideoDeconstructionDTO.java`（+segments 字段）
  - `marketing-person-infrastructure/.../app/service/VideoUnderstandingTaskAppService.java`（注入 gateway + persistSegments + toSegmentDTOs）
  - `marketing-person-infrastructure/.../service/VideoUnderstandingAnalyzer.java`（+VideoSegment inner class + segments in Analysis）
  - `marketing-person-infrastructure/.../service/ArkVideoUnderstandingAnalyzer.java`（更新 prompt + extractSegments）

### 阶段 18：Agent Playground + 视频理解异步链路（2026-04-24）
- **状态：** 阻塞中（OPENAI_API_KEY 待配置）
- 执行的操作：
  - 设计评审：Agent Playground spec（GPT方案 → 评审 → 收束为2个真实 workflow + 预留2个）
  - 视频理解设计：关键帧+OCR+ASR+多模态分析，异步任务，本地临时存储，可替换模型抽象
  - 新增后端链路：`POST /videoDeconstruction/understandingTask/upload|submit|get`
  - 新增前端页面：`AgentPlayground.tsx`（三栏布局：workflow列表/输入区/结果区4Tab）
  - 前端适配层：`agentPlaygroundApi.ts`（`PlaygroundExecutionResult` 统一结构）
  - 历史记录：localStorage，key=`marketing-person-center.agent-playground.history.v1`，上限50条
  - 修复：multipart 上传限制 → 100MB
  - 验证：上传11MB/12s视频 → taskId返回 → 轮询到 FAILED（ASR 401）
  - 路由注册：`/agent-playground`
- 创建/修改的文件：
  - `docs/superpowers/specs/2026-04-24-agent-playground-design.md`
  - `docs/superpowers/specs/2026-04-24-video-understanding-deconstruction-design.md`
  - `docs/superpowers/plans/2026-04-24-video-understanding-deconstruction.md`
  - `marketing-person-infrastructure/.../service/VideoUnderstandingTaskAppService.java`
  - `marketing-person-infrastructure/.../service/OpenAIVideoUnderstandingAnalyzer.java`
  - `marketing-person-infrastructure/.../service/LocalTempVideoStorageService.java`
  - `marketing-person-infrastructure/src/main/resources/bootstrap.yaml`（multipart 100MB）
  - `frontend/src/pages/AgentPlayground.tsx`
  - `frontend/src/lib/agentPlaygroundApi.ts`

### 阶段 20：BeukayClaw ↔ Hermes Agent 底座打通（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 新增 `AgentInvokeCmd`（agentUniqueId + message + history）
  - 新增 `AgentInvokeDTO`（reply + agentUniqueId + agentName + traceId）
  - `AgentRegistryFeign` 新增 `POST /agentRegistry/invoke` 接口
  - 新增 `ArkAgentInvoker`：调用火山方舟 `/chat/completions`，MAX_HISTORY=10
  - 新增 `AgentInvokeAppService`：registry → definition → systemPrompt → modelConfig → Ark
  - `AgentRegistryController` 新增 `invokeAgent()` 路由
  - 全部 5 个 Agent DO 补充 `@TableName` 注解（修复 MyBatis-Plus 表名推断错误）
  - DB 建表 + 种子数据：`agent_definition/agent_registry/agent_identity/agent_trace/skill_registry/agent_publish_record` + BeukayClaw agent（agent_unique_id='beukay-claw', behaviorDsl=完整系统提示词）
  - `application-local.yaml` 追加 `tenant.nezha-plugin-enable: false`（禁用多租户拦截器，消除 `nezha_tenant_code` 过滤导致的空结果）
  - 前端 `BeukayClaw.tsx` 完全重写：agent 下拉选择 + 真实 API 调用 + history 传参 + 错误处理
  - `agentApi.ts` 新增 `listActiveRegistries()` + `invokeAgent()` 方法
- E2E 验证：
  - `POST /agentRegistry/invoke {"agentUniqueId":"beukay-claw","message":"你好，介绍一下你自己"}` → 火山方舟真实回复，reply = BeukayClaw 完整自我介绍（含5大营销场景）
  - 后端 `success=true`，前端 `http://localhost:5160/beukay-claw` HTTP 200
- 关键错误与修复：
  - `@TableName` 缺失 → MyBatis-Plus 推断 `agent_registry_d_o` → 查不到数据：补注解修复
  - `TenantLineInnerInterceptor` 追加 `nezha_tenant_code=NULL` → 查不到种子数据：`nezha-plugin-enable: false` 修复
- 创建/修改的文件：
  - `marketing-person-client/.../cmd/AgentInvokeCmd.java`（新建）
  - `marketing-person-client/.../dto/AgentInvokeDTO.java`（新建）
  - `marketing-person-client/.../api/AgentRegistryFeign.java`（+invokeAgent）
  - `marketing-person-infrastructure/.../service/ArkAgentInvoker.java`（新建）
  - `marketing-person-infrastructure/.../app/service/AgentInvokeAppService.java`（新建）
  - `marketing-person-infrastructure/.../app/controller/AgentRegistryController.java`（+invokeAgent）
  - `marketing-person-dbsdk/.../model/AgentDefinitionDO.java`（+@TableName）
  - `marketing-person-dbsdk/.../model/AgentRegistryDO.java`（+@TableName）
  - `marketing-person-dbsdk/.../model/AgentTraceDO.java`（+@TableName）
  - `marketing-person-dbsdk/.../model/AgentIdentityDO.java`（+@TableName）
  - `marketing-person-dbsdk/.../model/AgentPublishRecordDO.java`（+@TableName）
  - `marketing-person-infrastructure/src/main/resources/application-local.yaml`（+tenant.nezha-plugin-enable: false）
  - `frontend/src/pages/BeukayClaw.tsx`（完全重写）
  - `frontend/src/lib/agentApi.ts`（+listActiveRegistries, +invokeAgent）

## 下一阶段建议（按优先级）

### P0
- [x] ~~实现 Agent B：`ContentStructureCard` 生成链路~~ ✅ 已完成（阶段 17）
- [x] ~~将 `logic_trace` 写入 `content_structure_card`~~ ✅ 已完成
- [x] ~~补一条最小业务验证链路：`skuId + targetAudience + marketingNode -> 结构卡`~~ ✅ E2E 验证通过
- [x] ~~**配置有效 API Key，完成视频理解全链路 E2E 验证**~~ ✅ 已完成（阶段19，火山方舟 doubao-seed-2.0-pro）
- [x] ~~视频时间轴级拆解结果结构化存储（片段级 + 时间戳标注）~~ ✅ 已完成（阶段19，video_segment 表 + 20维标签）

### P1
- [x] ~~拆解完成后自动写入 `video_deconstruction_result` 并触发知识聚合~~ ✅ 已完成（阶段 21）
- [ ] 增加 Agent A 批量入口（按 skuId / 时间范围批跑）
- [ ] 增加 50 条抽检能力与 `verification_status` 审核流

### P2
- [ ] 接 cron / webhook，形成持续增量知识沉淀
- [x] ~~将结构卡接到脚本生成 Agent，形成抖音内容生产最小闭环~~ ✅ 已完成（阶段 22，ScriptBlueprint + VideoAssembly E2E打通）
- [x] ~~ContentFlywheel / ContentProduction 接真实数据~~ ✅ 已完成（阶段 22，ContentFlywheel 接真实统计，ScriptWorkshop 接真实 API）

### P3（新增）
- [ ] BeukayClaw streaming 流式回复（打字机效果）
- [ ] Agent A 批量入口 + cron 调度（持续增量知识沉淀）
- [ ] `verification_status` 人工审核流（PENDING → VERIFIED/REJECTED）
- [ ] 效果回流：投放数据 → 结构卡/脚本知识库更新

### 阶段 21：视频理解 → 知识层自动打通（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 新建 `VideoAnalysisKnowledgeService`：AI 视频分析结果直接写入 `video_deconstruction_result`（幂等，`verification_status=AI_PENDING`）
  - `VideoDeconstructionResultGateway/DomainService` 新增 `queryByVideoId(String)` 幂等检查方法
  - `VideoUnderstandingTaskAppService` 在 `persistSegments` 之后调用 `persistFromAnalysis` + `triggerPatternAggregationAsync`
  - `@EnableAsync` 加入 Bootstrap 主类；`@Async` 自调用陷阱修复（从外部代理调用而非 `this.xxx`）
  - ALTER TABLE 为 `video_deconstruction_result` 补加 4 列：`recommended_pattern_code / name / reason / pattern_decision_json`
  - 修复 3 个测试 stub（`queryByVideoId` 新接口未实现）
- E2E 验证：
  - 上传 12s 视频 → SUCCEEDED → `video_deconstruction_result` 新增 1 行（AI_PENDING, AI_ANALYZED）→ 异步触发模式聚合 → `content_pattern_knowledge` 更新（技术卖点型 score=0.52）
- 关键错误与修复：
  - ALTER TABLE 缺 4 列 → Column not found：补列修复
  - `@Async` 自调用不生效 → 事务 rollback-only → 整个任务 FAILED：改为从外部代理调用
- 创建/修改的文件：
  - `marketing-person-infrastructure/.../app/service/VideoAnalysisKnowledgeService.java`（新建）
  - `marketing-person-domain/.../videoDeconstructionResult/gateway/VideoDeconstructionResultGateway.java`（+queryByVideoId）
  - `marketing-person-domain/.../videoDeconstructionResult/ability/VideoDeconstructionResultDomainService.java`（+queryByVideoId）
  - `marketing-person-infrastructure/.../gatewayimpl/VideoDeconstructionResultGatewayImpl.java`（+queryByVideoId 实现）
  - `marketing-person-infrastructure/.../ability/impl/VideoDeconstructionResultDomainServiceImpl.java`（+queryByVideoId）
  - `marketing-person-infrastructure/.../app/service/VideoUnderstandingTaskAppService.java`（+VideoAnalysisKnowledgeService 注入 + 调用）
  - `marketing-person-infrastructure/Bootstrap.java`（+@EnableAsync）
  - 3个测试 stub 文件（+queryByVideoId 空实现）

### 阶段 22：脚本蓝图 + 视频合成 E2E 打通 + 前端接真实数据（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 执行 DDL 建表：`script_blueprint / script_blueprint_section / video_assembly_task / video_assembly_plan / video_assembly_candidate`（共5张表）
  - E2E 验证全生产链路：`POST /scriptBlueprint/generate {skuId:SEED_CUSHION_2, marketingNode:日常投放}` → `blueprintCode=sbp-...` → `POST /videoAssembly/generate {blueprintCode}` → `taskCode=vat-...`
  - 前端 `agentApi.ts` 新增 `productionApi`（generateBlueprint / generateAssembly / getBlueprint）
  - `ScriptWorkshop.tsx` 完整重写：SKU/平台/目标表单 + 实时调用后端生成蓝图 + 展示段落 + 一键提交合成任务
  - `ContentFlywheel.tsx` 新增真实统计指标卡（接 `/api/videoDeconstructionResult/listPage` 等3个接口的 total 字段）
  - 前端 `npm run build` 通过
- E2E 链路：
  ```
  视频上传 → Ark分析 → video_segment + video_deconstruction_result + content_pattern_knowledge
  → ScriptBlueprint（脚本蓝图 + 段落）→ VideoAssemblyTask（素材召回方案）
  ```
- 创建/修改的文件：
  - `marketing-person-dbsdk/src/main/resources/sql/V20260428__script_blueprint.sql`（已执行）
  - `marketing-person-dbsdk/src/main/resources/sql/V20260429__video_assembly.sql`（已执行）
  - `frontend/src/lib/agentApi.ts`（+productionApi + 3个类型）
  - `frontend/src/pages/ScriptWorkshop.tsx`（完整重写，接真实 API）
  - `frontend/src/pages/ContentFlywheel.tsx`（+真实统计指标卡）

### 阶段 21（旧标号）：Agent 职责纠偏与新目标确认（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 重新核对双 Agent 设计文档与现有实现，确认“视频拆解 Agent”定位仍为上游离线知识生产者。
  - 结合用户新需求，确认当前“结构卡生成 Agent”不是目标终态；真正需要的是一个“脚本框架组装 Agent”。
  - 明确新目标 Agent 的输入应为产品文本信息（如产品名称、卖点、适用人群等）+ 知识库检索结果，而不是重新看视频。
  - 明确新目标 Agent 的职责应为：从 `video_deconstruction_result / content_pattern_knowledge / pattern_reference_video_rel / product_truth` 中选取最适配知识，组装成视频生产脚本框架。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 22：三 Agent 架构决策冻结（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 基于“人对所有环节保持透明”的约束，对 2 Agent / 3 Agent / 编排 Agent 方案进行了收敛比较。
  - 与用户确认最终采用“严格三 Agent + 显式产物自动流转”方案。
  - 明确后续架构边界：Agent A 负责知识生产，Agent B 负责脚本框架生成，Agent C 负责片段召回与视频组装。
  - 明确 A/B/C 之间不应黑盒互调，而应通过可查看、可审计、可回放的中间产物流转。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 23：Agent B 模板库方向收敛（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 与用户确认 Agent B 不是线性“版本迭代器”，而是“动态模板库 / 选择库”。
  - 明确模板库主组织维度采用“品类 × 营销目标”双维索引。
  - 明确 Agent B 对下游输出方式采用“Top N 候选模板 + 1 个推荐模板”的模式，以同时支持人工透明选择和 Agent C 自动消费。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 24：Agent B/C 执行边界收敛（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 与用户确认 Agent B 负责将推荐模板实例化到底，直接输出给 Agent C 可执行的蓝图。
  - 明确 Agent C 不再承担脚本规划职责，而专注于片段召回、匹配、排序与拼接执行。
  - 固化 B/C 职责边界：B 负责“想清楚怎么做”，C 负责“把它做出来”。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 25：Agent B 蓝图粒度修正（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 与用户确认 Agent B 的输出不应固化为“槽位/逐镜头清单”。
  - 明确后续 Agent C 将基于 embedding 做文本与视频内容的向量相似度匹配，因此 Agent B 更适合输出段落级语义蓝图，而不是锁死的操作式编排。
  - 将 B→C 契约方向收敛为“语义段落 + 检索意图/约束”，为后续向量召回留出灵活性。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 26：三 Agent 流转模式收敛（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 与用户确认三 Agent 主流程采用“默认自动流转”。
  - 明确人工不作为默认门禁，而是保留“可查看、可打断、可复核”的透明控制方式。
  - 因此后续设计方向调整为：A/B/C 通过显式中间产物自动推进，同时在每一层保留审查入口与回放能力。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 27：Agent A 输出结构与 Agent B 对齐（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 与用户确认 Agent A 在视频拆解时不应只输出单一标签，而应像 Agent B 一样具备“候选集 + 推荐 + 判断依据”结构。
  - 明确 Agent A 对模式识别的输出也应支持 Top N 候选模式 + 1 个推荐模式，以提高透明度并为后续知识沉淀留出多候选空间。
  - 因此 A 的中间产物方向从“单标签拆解结果”收敛为“多候选模式识别 + 推荐沉淀”的结构化知识产物。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 28：Agent C 执行链路设计确认（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 完成 Agent C 职责收敛：仅负责语义蓝图消费、embedding 召回、匹配重排与视频组装。
  - 与用户确认 Agent C 的透明化输出需要包含候选召回结果、推荐装配方案和最终执行产物三层结构。
  - 明确 Agent C 默认自动流转执行，但其召回、筛选、拼接依据必须可查看、可回放、可复核。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 29：三 Agent 架构设计文档落盘（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 将前述收敛结果整理为正式设计文档，覆盖背景、目标、三 Agent 职责、统一产物模型、中间对象、演进顺序与透明控制要求。
  - 在文档中冻结关键原则：严格三 Agent、显式产物自动流转、A/B/C 统一“候选集 → 推荐项 → 最终产物”结构、B 以 `ScriptBlueprint` 取代 `content_structure_card` 终态角色。
  - 执行占位词自检，确认文档内无 `TODO` / `TBD` / 占位内容。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/specs/agents/2026-04-24-three-agent-content-production-architecture-design.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 30：Agent A 实施计划落盘（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 基于三 Agent 总体设计，将实施范围收敛为第一子阶段：先增强 Agent A 的“候选模式 + 推荐模式 + 判断依据”能力。
  - 使用实施计划文档明确本阶段对象、测试、SQL、DTO 与执行顺序，避免直接并行改 A/B/C 三条线。
  - 决定按 TDD 优先从规则引擎与应用服务测试入手，再补持久化与查询返回结构。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/plans/2026-04-24-agent-a-pattern-candidates-implementation.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 31：Agent A 候选模式透明化增强落地（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 为 `video_deconstruction_result` 增加推荐模式摘要字段：`recommendedPatternCode / recommendedPatternName / recommendedPatternReason / patternDecisionJson`。
  - 新增 `VideoPatternCandidate` 聚合（domain / dbsdk / gatewayimpl / convertor），并新增 SQL：`V20260427__video_pattern_candidate.sql`。
  - 重构 `RuleBasedVideoDeconstructionEngine`，输出 Top N 候选模式、推荐模式与决策依据，不再只有单一 `hookType` 结论。
  - 更新 `VideoKnowledgeBuildAppService`：在落 `video_deconstruction_result` 后同步持久化候选模式列表。
  - 更新 `VideoDeconstructionDTO` 与 convertor：detail/deconstruct 返回推荐模式摘要与 `patternCandidates`。
  - 新增/更新测试：
    - `RuleBasedVideoDeconstructionEngineTest`
    - `VideoKnowledgeBuildAppServiceTest`
    - `VideoDeconstructionDetailQryExecutorTest`
  - 执行验证：
    - `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=RuleBasedVideoDeconstructionEngineTest,VideoKnowledgeBuildAppServiceTest,VideoDeconstructionDetailQryExecutorTest`
    - `mvn compile -q`
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoDeconstructionDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoPatternCandidateDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoDeconstructionResult/model/VideoDeconstructionResult.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoPatternCandidate/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/VideoDeconstructionResultDO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/VideoPatternCandidateDO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/VideoPatternCandidateDOMapper.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/resources/sql/V20260427__video_pattern_candidate.sql`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/RuleBasedVideoDeconstructionEngine.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/VideoKnowledgeBuildAppService.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/VideoDeconstructionDTOConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/VideoPatternCandidateDTOConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/VideoPatternCandidateConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/VideoPatternCandidateGatewayImpl.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/infrastructure/service/RuleBasedVideoDeconstructionEngineTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/VideoKnowledgeBuildAppServiceTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/executor/VideoDeconstructionDetailQryExecutorTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 32：Agent B 实施计划落盘（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 将 Agent B 首阶段范围收敛为 `ScriptBlueprint` 最小闭环，而不是一次性把完整模板库资产化全部做完。
  - 明确第一阶段保留“候选模板 + 推荐模板 + 语义蓝图 + 段落明细”四层输出，并暂时把候选模板保存在 blueprint JSON / DTO 中。
  - 输出实施计划文档，约定先做 generate/get 纵向切片，再在后续阶段抽离持久化 `ScriptTemplate` 库。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/plans/2026-04-24-agent-b-script-blueprint-implementation.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 33：Agent B ScriptBlueprint 最小闭环落地（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 新增 Agent B 的 `ScriptBlueprint` / `ScriptBlueprintSection` 领域对象、client 契约、DO/Mapper 与 SQL：`V20260428__script_blueprint.sql`。
  - 实现 `ScriptBlueprintGenerateAppService`：基于 `product_truth + content_pattern_knowledge + pattern_reference_video_rel` 生成候选模板、推荐模板与语义蓝图。
  - 落地 4 段式动态语义蓝图（HOOK / SCENE / BENEFIT / PROOF_CTA），输出给 Agent C 的检索意图基础字段。
  - 新增 `ScriptBlueprint generate/get` 接口与 detail 查询执行器。
  - 当前阶段采用“候选模板 JSON 内嵌 blueprint”方案，独立 `ScriptTemplate` 资产库抽离留待下一阶段。
  - 新增/更新测试：
    - `ScriptBlueprintGenerateAppServiceTest`
    - `ScriptBlueprintDetailQryExecutorTest`
  - 执行验证：
    - `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=ScriptBlueprintGenerateAppServiceTest,ScriptBlueprintDetailQryExecutorTest`
    - `mvn compile -q`
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/plans/2026-04-24-agent-b-script-blueprint-implementation.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/ScriptBlueprintFeign.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/ScriptBlueprintGenerateCmd.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/qry/ScriptBlueprintDetailQry.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/ScriptBlueprintDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/ScriptBlueprintSectionDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/ScriptTemplateCandidateDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/scriptBlueprint/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/ScriptBlueprintDO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/ScriptBlueprintSectionDO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/ScriptBlueprintDOMapper.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/ScriptBlueprintSectionDOMapper.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/resources/sql/V20260428__script_blueprint.sql`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/ScriptBlueprintGenerateAppService.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/controller/ScriptBlueprintController.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/ScriptBlueprintCmdExecutor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/ScriptBlueprintDetailQryExecutor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/ScriptBlueprintDTOConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/ScriptBlueprintSectionDTOConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/ScriptBlueprintConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/ScriptBlueprintSectionConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/ScriptBlueprintGatewayImpl.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/ScriptBlueprintSectionGatewayImpl.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/ScriptBlueprintGenerateAppServiceTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/executor/ScriptBlueprintDetailQryExecutorTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 34：Agent C 实施计划落盘（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 将 Agent C 首阶段范围收敛为“视频召回与装配计划最小闭环”，明确本阶段不做最终视频渲染。
  - 决定用 `ScriptBlueprintSection + VideoSegment` 先做规则式相似度召回，保持对后续 embedding/vector 检索的兼容接口。
  - 输出实施计划文档，冻结 Agent C 首阶段对象：`VideoAssemblyTask / VideoAssemblyCandidate / VideoAssemblyPlan`。
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/docs/superpowers/plans/2026-04-24-agent-c-video-assembly-implementation.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 35：Agent C 视频召回与装配最小闭环落地（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 新增 Agent C 的 `VideoAssemblyTask` / `VideoAssemblyCandidate` / `VideoAssemblyPlan` 领域对象、client 契约、DO/Mapper 与 SQL：`V20260429__video_assembly.sql`。
  - 实现 `VideoAssemblyGenerateAppService`：基于 `ScriptBlueprintSection + VideoSegment` 做规则式相似度召回，输出候选集、推荐装配方案和装配任务主对象。
  - 规则分召回当前综合 `queryText / mustCover / sellingPoint / scene / script / keyPhrase / structureTag` 等字段重合度，并通过通用 `similarityScore` 字段为后续 embedding/vector 升级保留兼容面。
  - 补齐 `VideoSegmentGateway#listBySkuId`，让 Agent C 能直接按 SKU 拉取片段池。
  - 新增 `VideoAssembly generate/get` 接口与 detail 查询执行器，完成 Agent C 的最小 API 闭环。
  - 新增/更新测试：
    - `VideoAssemblyGenerateAppServiceTest`
    - `VideoAssemblyDetailQryExecutorTest`
  - 执行验证：
    - `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=VideoAssemblyGenerateAppServiceTest,VideoAssemblyDetailQryExecutorTest`
    - `mvn compile -q`
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/api/VideoAssemblyFeign.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/cmd/VideoAssemblyGenerateCmd.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/qry/VideoAssemblyDetailQry.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoAssemblyDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoAssemblyCandidateDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-client/src/main/java/com/beukay/marketing/person/client/dto/VideoAssemblyPlanSectionDTO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoAssembly/...`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/VideoAssemblyTaskDO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/VideoAssemblyCandidateDO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/model/VideoAssemblyPlanDO.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/VideoAssemblyTaskDOMapper.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/VideoAssemblyCandidateDOMapper.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/dao/VideoAssemblyPlanDOMapper.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/resources/sql/V20260429__video_assembly.sql`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/VideoAssemblyGenerateAppService.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/VideoAssemblyCmdExecutor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/executor/VideoAssemblyDetailQryExecutor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/controller/VideoAssemblyController.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/VideoAssemblyDTOConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/VideoAssemblyCandidateDTOConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/convertor/VideoAssemblyPlanSectionDTOConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/VideoAssemblyTaskConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/VideoAssemblyCandidateConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/convertor/VideoAssemblyPlanConvertor.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/VideoAssemblyTaskGatewayImpl.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/VideoAssemblyCandidateGatewayImpl.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/VideoAssemblyPlanGatewayImpl.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/VideoSegmentGatewayImpl.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/videoSegment/gateway/VideoSegmentGateway.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/VideoAssemblyGenerateAppServiceTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/executor/VideoAssemblyDetailQryExecutorTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 36：Agent C 语义检索意图增强（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 以 TDD 方式先新增失败测试 `VideoAssemblyGenerateAppServiceTest#shouldPreferSegmentsMatchingPreferredSignalsAndAvoidNegativeSignals`，验证 Agent C 不应只看基础关键词，还要消费蓝图里的 `preferredSignals / avoidSignals`。
  - 将 `VideoAssemblyGenerateAppService` 的规则召回升级为 `RULE_VECTOR_READY_V1`：
    - section 侧除 `queryText / mustCover` 外，开始正式纳入 `preferredSignals / avoidSignals`
    - segment 侧扩展可检索信号池：`scene / rhythm / motivation / technique / cameraLanguage / audiencePersona / trending`
    - 命中理由中新增 `preferredSignalHits / avoidSignalHits / retrievalStrategy`
  - 保持 `VideoAssemblyTask / Candidate / Plan` 外部契约不变，为后续 embedding/vector 检索替换实现保留稳定边界。
  - 执行验证：
    - `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=VideoAssemblyGenerateAppServiceTest#shouldPreferSegmentsMatchingPreferredSignalsAndAvoidNegativeSignals`
    - `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=VideoAssemblyGenerateAppServiceTest,VideoAssemblyDetailQryExecutorTest`
    - `mvn compile -q`
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/VideoAssemblyGenerateAppService.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/VideoAssemblyGenerateAppServiceTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/task_plan.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 37：Agent Playground 多 Agent 目录化改造（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 将 `/agent-playground` 页面用户心智从 `workflow` 统一调整为 `agent`，避免后续 50+ Agent 扩容时概念混乱。
  - 将页面结构从“单列流程卡片”重构为适合多 Agent 展示和选择的三层布局：
    - 左侧 `Agent Catalog` 筛选栏
    - 中间 `Agent` 列表区
    - 右侧 `Workbench`（输入 / 输出 / 历史）
  - 为页面补齐多 Agent 场景的基础交互：
    - 搜索 Agent
    - 按业务域筛选
    - 按在线/规划中筛选
    - 统一列表选择与右侧执行工作台
  - 前端数据模型同步从 `workflow` 收敛为 `agent`：
    - `PlaygroundWorkflowType -> PlaygroundAgentType`
    - `PlaygroundExecutionResult.workflow -> agent`
    - `PlaygroundHistoryItem.workflow -> agent`
  - 为兼容本地旧缓存，补充历史记录读取兼容逻辑：旧字段 `workflow` 自动映射到新字段 `agent`。
  - 在浏览器中验证页面已按新结构渲染，并保留现有 5 个 Agent 的执行能力。
  - 执行验证：
    - `npm test -- --run src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts`
    - `npm run build`
    - 浏览器打开并验证：`http://localhost:5160/agent-playground`
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentPlayground.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundHistory.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.test.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundHistory.test.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/styles/index.css`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 38：智能体矩阵整合 Agent Playground（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 将真实后端 AgentDefinition / AgentRegistry 数据接入 `/agents`，在矩阵页新增“真实 Agent”区块，与原有占位卡片并存展示。
  - 扩展矩阵详情抽屉：
    - 真实 Agent 展示定义、发布态、注册态、业务规则、模型配置等真实信息。
    - 在真实 Agent 详情内嵌 Playground 调试台，可直接运行 Agent A / B / C / BeukayClaw 等真实能力。
    - 保留原有假卡片详情中的“当前任务 / 性能指标 / 最近5次操作 / 查看日志 / 暂停 / 重启 / 配置参数”等内容。
  - 将 `/agent-playground` 保留为导航入口，但页面实现直接复用 `AgentMatrix`，使其成为智能体矩阵中的集成视图别名。
  - 浏览器验收中发现 `RealAgentWorkbench` 使用了未导入的 `Play` 图标，导致点击真实 Agent 详情时白屏；已修复并重新验证。
  - 执行验证：
    - `npm test -- --run src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts`
    - `npm run build`
    - 浏览器验证：
      - `http://127.0.0.1:5160/agents`
      - `http://127.0.0.1:5160/agent-playground`
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentMatrix.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentPlayground.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 39：矩阵状态语义收口（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 将真实 Agent 的矩阵状态语义保持为“运行”。
  - 将所有占位假 Agent 的展示状态统一收口为“离线”，不再沿用 mock 的运行/训练/空闲状态。
  - 同步调整矩阵概览卡为“运行中 / 离线占位 / 真实 Agent”。
  - 将占位 Agent 详情中的当前任务提示改为“未构建 · 当前为离线占位智能体”。
  - 执行验证：
    - `npm run build`
    - `npm test -- --run src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts`
    - 浏览器验证：`http://127.0.0.1:5160/agent-playground`
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentMatrix.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 40：新智能体矩阵扩展与样式收口（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 将矩阵页中的“真实 Agent”区块重命名为“新智能体”。
  - 结合当前后端元数据与已可运行的 Playground 能力，将可直接运行的新智能体统一并入矩阵：
    - BeukayClaw
    - 视频拆解 Agent
    - 结构卡 Agent
    - 脚本蓝图 Agent
    - 视频装配 Agent
  - 对后端已接入但描述异常的智能体，统一回落到前端标准新智能体描述，避免乱码脏数据直接暴露到矩阵卡片。
  - 将新智能体运行态视觉改为浅绿色，并把新智能体统计卡中的“运行中 / 新智能体”主色同步调整为绿色体系。
  - 将新智能体卡片尺寸收敛到与其他矩阵卡片一致（`minmax(280px, 1fr)`），并对卡片标题/分组/描述/底部字段做省略处理，防止富文本过长撑坏布局。
  - 执行验证：
    - `npm run build`
    - `npm test -- --run src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts`
    - 浏览器验证：`http://127.0.0.1:5160/agent-playground`
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentMatrix.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`

### 阶段 41：新智能体卡片文案收口（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 去掉所有新智能体卡片中的副标题行（如“营销对话 · 实时对话”）。
  - 去掉新智能体描述前缀 `新智能体 · `。
  - 将 BeukayClaw 卡片描述收口为更短的执行描述，不再显示“营销对话与分析助手”措辞。
  - 将卡片底部 `Def` 改为中文 `定义`，并对长定义标识做 `...` 省略展示。
  - 执行验证：
    - `npm run build`
    - `npm test -- --run src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts`
    - 浏览器验证：`http://127.0.0.1:5160/agent-playground`
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentMatrix.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`

### 阶段 42：新智能体详情页接入（2026-04-24）
- **状态：** complete
- 执行的操作：
  - 为新智能体新增全页式详情页，详情布局改为三栏工作台：
    - 左侧 Agent 信息与最近运行
    - 中间输入参数与执行操作
    - 右侧 Result / Raw JSON / Logic Trace / History 输出面板
  - 保留 `/agent-playground` 作为矩阵目录页，同时新增路由：
    - `/agent-playground/:agentKey`
  - 将矩阵中新智能体卡片改为点击后跳转到详情页。
  - 占位旧卡片不再进入详情页，点击后保持在矩阵页。
  - 新详情页当前已接入以下新智能体：
    - 视频拆解 Agent
    - 结构卡 Agent
    - 脚本蓝图 Agent
    - 视频装配 Agent
    - BeukayClaw
  - 详情页运行逻辑已直接复用现有 `agentPlaygroundApi` 与本地历史记录能力。
  - 执行验证：
    - `npm run build`
    - `npm test -- --run src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts`
    - 浏览器验证：
      - 从 `/agent-playground` 点击“视频拆解 Agent”可进入 `/agent-playground/video-deconstruction`
      - 旧占位卡“种草文案智能体”点击后不会跳转详情页
- 创建/修改的文件：
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/newAgentCatalog.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentPlayground.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentMatrix.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/App.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`

### 阶段 43：BeukayClaw 纯聊天总控入口收敛（2026-04-25）
- **状态：** complete
- **执行的操作：**
  - 将 `/beukay-claw` 从“前端显式切换多个 Agent”的中枢页面，收敛回纯聊天总控入口。
  - 前端不再展示已有 Agent 列表、横向卡片或手动切换器。
  - 欢迎语与输入区只说明 BeukayClaw 基于 Hermes，可在对话中自动调用已接入能力。
  - 保留建议问题入口，用自然语言触发视频拆解、结构卡、脚本蓝图、视频装配等能力。
- **创建/修改的文件：**
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/BeukayClaw.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/newAgentCatalog.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`

### 阶段 44：BeukayClaw 切换到 Hermes 工具路由并完成前后端实机验收（2026-04-25）
- **状态：** complete
- **执行的操作：**
  - 为 `HermesBeukayClawInvoker` 增加“从当前模块目录向上回溯仓库根目录”能力，解决本地服务从 `marketing-person-infrastructure` 启动时找不到 `hermes/skills/beukay-claw-router/SKILL.md` 的问题。
  - 补充 `HermesBeukayClawInvokerTest` 两个回归用例：
    1. 从子模块目录启动时仍能找到仓库根目录 skill
    2. Hermes 输出中 `session_id:` 位于头部时也会被剥离
  - 重新编译、重启本地 Spring Boot 服务，并验证 `/agentRegistry/invoke` 对 `beukay-claw` 已切到 Hermes 路径。
  - 实机验证 BeukayClaw 页面：
    - 前端不再展示已有 agent 列表/卡片
    - 欢迎语仅提示 Hermes 可自动调度能力
    - 点击脚本蓝图示例后，页面成功拿到真实 Agent 回包并展示结果
- **创建/修改的文件：**
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/HermesBeukayClawInvoker.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/infrastructure/service/HermesBeukayClawInvokerTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
- **验证结果：**
  - `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=HermesBeukayClawInvokerTest` ✅
  - `mvn compile -q` ✅
  - `npm run build` ✅
  - `curl /agentRegistry/invoke`（`请只回复：HERMES_OK`）返回 `HERMES_OK`，证明 live API 已走 Hermes ✅
  - `curl /agentRegistry/invoke`（脚本蓝图请求）返回真实蓝图结果，且页面端可展示最终回复 ✅

### 阶段 45：千川 MCP 双 Agent 接入通路（2026-04-25）
- **状态：** complete
- **执行的操作：**
  - 新增千川 MCP 工具清单与接入说明文档，覆盖 150+ 个千川工具、投放/数据 Agent 白名单、推荐 workflow 与接入注意事项。
  - 新增 `QianchuanMcpInvoker`，作为 `qianchuan-delivery-v1` 与 `qianchuan-data-v1` 的专用调用通路。
  - 在 MCP 通路 systemPrompt 中注入 `mcp_server / base_url / token / advertiser_id` 上下文，并在缺少 token 或 advertiser_id 时引导 Agent 追问/提示配置。
  - 在 `AgentInvokeAppService` 中增加路由：`qianchuan-delivery-v1`、`qianchuan-data-v1` 走 MCP invoker，其他 Agent 保持原有路径。
  - 在 `application-local.yaml` 增加 `qianchuan.mcp.*` 配置项；`access-token` 与 `advertiser-id` 通过环境变量读取，仓库内不硬编码敏感信息。
- **创建/修改的文件：**
  - `/Users/any/Documents/code/beukay/marketing-person-center/docs/qianchuan-mcp-tools.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/QianchuanMcpInvoker.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/AgentInvokeAppService.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/resources/application-local.yaml`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
- **验证结果：**
  - `mvn compile -q` ✅

### 阶段 46：千川 mock MCP 与 mock API 闭环跑通（2026-04-25）
- **状态：** complete
- **执行的操作：**
  - 将千川 MCP 通路从“只注入 prompt 并交给 Ark 规划”升级为本地 mock 执行链路。
  - 新增 `QianchuanMockMcpRuntime`，模拟 MCP runtime，根据 Agent 类型执行投放链路或数据链路。
  - 新增 `QianchuanMockApiClient`，模拟后置千川 API 返回，包括：
    - 投放链路：授权抖音号、可投商品、视频上传、建议预算/出价、广告组创建、效果预估、广告计划创建、计划状态查询。
    - 数据链路：账户报表、计划报表、素材报表、低效计划诊断。
  - 调整 `QianchuanMcpInvoker`，当前直接调用 mock MCP runtime，不再用 Ark 生成工具规划文本。
  - 将 `application-local.yaml` 的千川 MCP 默认配置切到 `qianchuan-mock-mcp-server` 与 `mock://qianchuan-api`，避免误触真实巨量千川。
  - 修正前端千川数据 Agent 调用文案，将“巴量千川”改为“巨量千川”。
  - 更新千川工具文档，明确当前阶段为本地 mock MCP + mock API，后续再替换真实 MCP / 千川 HTTP client。
  - 重启本地后端并通过 `/agentRegistry/invoke` 实机验证：
    - `qianchuan-delivery-v1` 返回完整 mock 投放调用链路。
    - `qianchuan-data-v1` 返回完整 mock 数据报表与低效诊断。
- **创建/修改的文件：**
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/QianchuanMcpInvoker.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/QianchuanMockMcpRuntime.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/QianchuanMockApiClient.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/infrastructure/service/QianchuanMcpInvokerTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/resources/application-local.yaml`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/agentPlaygroundApi.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/docs/qianchuan-mcp-tools.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
- **验证结果：**
  - `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=QianchuanMcpInvokerTest` ✅
  - `mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=QianchuanMcpInvokerTest,HermesBeukayClawInvokerTest` ✅
  - `mvn compile -q` ✅
  - `npm run build` ✅
  - `npm test -- --run src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts` ✅
  - `curl /agentRegistry/invoke` 调 `qianchuan-delivery-v1` / `qianchuan-data-v1` 均返回 mock MCP 成功结果 ✅

### 阶段 47：千川双 Agent 乱码描述修复（2026-04-25）
- **状态：** complete
- **执行的操作：**
  - 定位乱码来源：本地 DB 中 `qianchuan-delivery-v1` / `qianchuan-data-v1` 的名称与描述存在 mojibake；同时前端矩阵未按 `agentDefId / agentUniqueId` 精确识别千川 Agent，导致乱码后端卡片被当作自定义 Agent 展示。
  - 为 `newAgentCatalog` 增加新智能体元数据识别与标准展示文案解析能力，已知新智能体优先使用前端标准中文名称/描述。
  - 调整 `AgentMatrix`：后端返回的已知新智能体会被标准化为目录文案，同时避免与运行时 preset 重复展示。
  - 新增迁移脚本 `V20260431__repair_qianchuan_agent_text.sql`，用于修复千川双 Agent 的名称、描述和分类展示文本。
  - 已直接修复当前本地数据库中的千川投放 Agent / 千川数据 Agent 展示文本。
- **创建/修改的文件：**
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/newAgentCatalog.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/newAgentCatalog.test.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/AgentMatrix.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/resources/sql/V20260431__repair_qianchuan_agent_text.sql`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
- **验证结果：**
  - TDD 红灯：`npm test -- --run src/lib/newAgentCatalog.test.ts` 初次失败，确认缺少千川新智能体识别/标准文案兜底能力。
  - TDD 绿灯：`npm test -- --run src/lib/newAgentCatalog.test.ts` ✅
  - 回归测试：`npm test -- --run src/lib/newAgentCatalog.test.ts src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts` ✅（8 tests passed）
  - 前端构建：`npm run build` ✅
  - Live API 验证：`/agentDefinition/listPage` 与 `/agentRegistry/listPage` 中两个千川 Agent 的名称/描述/分类不再包含 `Ã` / `Â` 乱码字符 ✅

### 阶段 48：BeukayClaw 可爱图标与文件上传入口（2026-04-25）
- **状态：** complete
- **执行的操作：**
  - 将 BeukayClaw 页面主图标从龙虾风格调整为更可爱的 `🐾` 爪印风格，并同步调整头部/消息头像的浅色软萌底色。
  - 将新智能体目录中的 BeukayClaw 图标同步改为 `🐾`。
  - 为 BeukayClaw 输入区新增文件上传按钮，支持多文件选择、附件预览、移除附件。
  - 新增文件上下文构建能力：
    - 文本类文件读取内容预览并随消息发送给 BeukayClaw。
    - 二进制文件保留文件名/类型/大小等元信息，避免前端误读不可解析内容。
  - 更新欢迎语与输入区提示，明确 BeukayClaw 支持上传产品 brief、脚本草稿、数据表或视频文件。
- **创建/修改的文件：**
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/BeukayClaw.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/beukayClawAttachments.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/beukayClawAttachments.test.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/newAgentCatalog.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/hermes/skills/beukay-claw-router/SKILL.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
- **验证结果：**
  - TDD 红灯：`npm test -- --run src/lib/beukayClawAttachments.test.ts` 初次失败，确认附件工具模块尚不存在。
  - TDD 绿灯：`npm test -- --run src/lib/beukayClawAttachments.test.ts` ✅
  - 回归测试：`npm test -- --run src/lib/beukayClawAttachments.test.ts src/lib/newAgentCatalog.test.ts src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts` ✅（11 tests passed）
  - 前端构建：`npm run build` ✅
  - 浏览器验收：`http://127.0.0.1:5160/beukay-claw` 中 `🐾` 图标、上传文件按钮、文件上下文提示均可见 ✅

### 阶段 49：视频拆解到千川投放闭环 E2E 验收与阻塞修复（2026-04-25）
- **状态：** complete
- **执行的操作：**
  - 使用用户提供的视频 `/Users/any/Downloads/0422-果然蜜粉-SY-不是换季的舒适区.mp4` 进行真实端到端验收。
  - 验证本地依赖：后端 `30000`、前端 `5160`、`ffmpeg/ffprobe`、`product_truth(SEED_CUSHION_2)` 均可用。
  - 首次上传视频拆解时发现 A 环节阻塞：视频理解已成功调用方舟并进入保存知识层，但 `video_deconstruction_result.record_id=0` 撞唯一索引。
  - 修复 `VideoAnalysisKnowledgeService`：上传视频拆解结果使用由 `taskId` 派生的负数 synthetic recordId，避免唯一键冲突。
  - 重新上传同一视频并完成 A 环节：
    - taskId: `video-task-11626746-a967-4303-a1ca-cd41757acde2`
    - 状态：`SUCCEEDED`
    - 产出 hookType=`情绪共鸣型`、titlePattern=`EMOTION_QUESTION`、片段级 segments、标签与口播摘要。
  - B 前置聚合时发现第二个阻塞：`pattern_reference_video_rel` 软删除 SQL 缺少 `SET` 子句。
  - 修复 `PatternReferenceVideoRelGatewayImpl.softDeleteByKnowledgeId()`：改为 `LambdaUpdateWrapper.set(isDeleted, 1)`。
  - 重新执行知识聚合、结构卡生成、脚本蓝图生成、视频装配生成、千川 mock 投放、千川 mock 数据回收，闭环跑通。
  - 将千川投放/数据 Agent 补入 BeukayClaw Hermes router，使 BeukayClaw 也可调用千川双 Agent。
- **关键产物：**
  - 知识聚合：`/contentPatternKnowledge/aggregate` ✅
  - 结构卡：`cardId=csc-b9c75aa8a3ba45e3bcb8e76187b3aa93` ✅
  - 脚本蓝图：`blueprintCode=sbp-54446464cd60496baf1a5b0cb8bc881f` ✅
  - 视频装配：`taskCode=vat-30f6de1e84b3425ba157ee21f8303b47` ✅
  - 千川投放：mock MCP 创建计划 `MOCK_AD_1777109619323`，状态 `AUDITING` ✅
  - 千川数据：mock MCP 返回 ROI/CTR/素材表现与低效诊断 ✅
  - BeukayClaw 调千川投放：返回 `调用成功`，并总结千川 mock 投放结果 ✅
- **创建/修改的文件：**
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/service/VideoAnalysisKnowledgeService.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/gatewayimpl/PatternReferenceVideoRelGatewayImpl.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/test/java/com/beukay/marketing/person/app/service/VideoAnalysisKnowledgeServiceTest.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/scripts/beukay_agent_router.py`
  - `/Users/any/Documents/code/beukay/marketing-person-center/hermes/skills/beukay-claw-router/SKILL.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/findings.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
- **验证结果：**
  - TDD 红灯：`VideoAnalysisKnowledgeServiceTest` 初次失败，复现上传视频拆解结果复用 `recordId=0` 的问题。
  - 后端回归：`mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=VideoAnalysisKnowledgeServiceTest,ContentPatternKnowledgeBuildAppServiceTest,ScriptBlueprintGenerateAppServiceTest,ContentStructureCardGenerateAppServiceTest,QianchuanMcpInvokerTest,HermesBeukayClawInvokerTest` ✅
  - 后端编译：`mvn compile -q` ✅
  - 前端回归：`npm test -- --run src/lib/beukayClawAttachments.test.ts src/lib/newAgentCatalog.test.ts src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts` ✅（11 tests passed）
  - 前端构建：`npm run build` ✅
  - Live E2E API：A 视频拆解 → 知识聚合 → 结构卡 → 脚本蓝图 → 视频装配 → 千川投放 → 千川数据回收 ✅
  - 浏览器验收：`/beukay-claw` 页面标题、上传按钮、Hermes 提示、`🐾` 图标均可见 ✅

### 阶段 50：Beukay agent 命名与化妆品图标收口（2026-04-25）
- **状态：** complete
- **执行的操作：**
  - 将用户可见的 `BeukayClaw` 统一改名为 `Beukay agent`。
  - 将 Beukay 总控智能体图标从爪印调整为化妆品风格 `💄`。
  - 保留后端路由标识 `agentUniqueId=beukay-claw`、路由路径 `/beukay-claw` 与 Hermes skill 名称不变，避免破坏现有调用链。
  - 同步更新前端顶部页面、欢迎语、输入区提示、左侧导航、新智能体目录卡片、Hermes skill 描述与 Hermes 调用提示词。
  - 新增 DB 修复脚本，并已更新当前本地数据库中 `agent_definition / agent_registry` 的展示名称与描述。
- **创建/修改的文件：**
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/pages/BeukayClaw.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/newAgentCatalog.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/lib/newAgentCatalog.test.ts`
  - `/Users/any/Documents/code/beukay/marketing-person-center/frontend/src/components/Layout.tsx`
  - `/Users/any/Documents/code/beukay/marketing-person-center/hermes/skills/beukay-claw-router/SKILL.md`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/infrastructure/service/HermesBeukayClawInvoker.java`
  - `/Users/any/Documents/code/beukay/marketing-person-center/marketing-person-dbsdk/src/main/resources/sql/V20260432__rename_beukay_agent.sql`
  - `/Users/any/Documents/code/beukay/marketing-person-center/progress.md`
- **验证结果：**
  - 前端回归：`npm test -- --run src/lib/newAgentCatalog.test.ts src/lib/beukayClawAttachments.test.ts src/lib/agentPlaygroundApi.test.ts src/lib/agentPlaygroundHistory.test.ts` ✅（12 tests passed）
  - 前端构建：`npm run build` ✅
  - 后端回归：`mvn test -q -pl marketing-person-infrastructure -am -DfailIfNoTests=false -Dsurefire.failIfNoSpecifiedTests=false -Dtest=HermesBeukayClawInvokerTest` ✅
  - 后端编译：`mvn compile -q` ✅
  - 浏览器验收：`/beukay-claw` 已显示 `Beukay agent` 与 `💄`，页面可见区域不再显示 `BeukayClaw` ✅
  - Live API 验证：`/agentRegistry/getByAgentUniqueId` 返回名称 `Beukay agent` ✅

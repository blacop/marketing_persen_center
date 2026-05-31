# 诸葛亮模式 (zhuge-mode)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `zhuge-mode` |
| 前端路由 | `/cutmatrix/wf/zhuge-mode` |
| 后端 path | `/cm/compose/zhuge` ✓ |
| catalog 状态 | 内测中（前端 mock 完整 + 4 步导出流程） |

## 2. AutoCut 实现参考

- HTML 路由：`/compose/strict.html` → `/compose/strict/workspace.html` → `/compose/strict/table.html`
- 命名暗示："严格"模式 = 按章节硬编排（即诸葛亮）
- Go 源：`service/client/concat/random/deliver_media.go`（共用）
- 工作文件夹结构（acvtl 文件即 SQLite/JSON 任务表）：

```
<工作文件夹>/
├── 1<章节名>/
│   ├── audio/   ← 配音（mp3/wav）
│   └── video/   ← 视频素材
├── 2<章节名>/
│   └── ...
├── BGM/         ← 背景音乐（可选）
└── *.acvtl      ← 任务表（自动生成）
```

## 3. 数据流

输入：工作文件夹路径 + 各章节配置 + 全局参数（导出比例、镜像概率、随机裁剪）
输出：N 个独立成片 mp4，每个对应 acvtl 中一条任务

## 4. 实现管线

```
工作文件夹扫描
  │
  ▼ 1. 解析章节目录 → Chapter[]
  ▼ 2. 用户在 ZhugeMode 详情/表格视图配置每章节
  │   - chapterMode: oneAudioMultiVideo / fillAudio / loopAudio / noAudioFixed / noAudioMin
  │   - pickVideoCount, videoRepeatRate, audioLongerStrategy, ...
  │
  ▼ 3. 用户点击"导出任务表"
  │   - 配置导出比例 / 镜像概率 / 随机裁剪范围
  │   - 后端生成 acvtl（每条任务记录：章节×版本组合的素材选取）
  │   - 防重复算法：同章节内不重复素材；任务间排列不同
  │
  ▼ 4. 用户在选片导出 modal 勾选条目
  │
  ▼ 5. 配置渲染参数（MP4/MOV、H264/HEVC、1080P/30fps）
  │   - 直接导出视频：服务端 ffmpeg 直接出片
  │   - 预览编辑并导出：导入 DR Lua 时间轴
  │
  ▼ 6. 每条任务：
  │   for each chapter:
  │     pickedVideos = pick(videoCount, videoRepeatRate)
  │     audio = pickAudio(audioRepeat策略)
  │     长度对齐：trim/speed 视频以匹配音频
  │   ffmpeg concat 各章节片段 → 单文件
  │   叠加 BGM、统一比例（scale + crop or pad）、镜像、随机裁剪
```

## 5. 后端 API

```
POST /cm/compose/zhuge/scan-folder
Request: { folderPath }
Response: { chapters: Chapter[], bgmCount }

POST /cm/compose/zhuge/build-acvtl
Request: { collectionCode, chapters: [], exportConfig: {aspect, mirrorProb, cropRange} }
Response: { acvtlPath, taskCount }

POST /cm/compose/zhuge/render
Request: { acvtlPath, taskIds: [], renderConfig: {format, codec, resolution, fps} }
Response: { batchTaskId }

GET /cm/compose/zhuge/progress?batchTaskId  (SSE)
```

底层调 `/cm/compose/zhuge` 已存在（单条合成）。

## 6. 数据库

`cm_zhuge_collection` + `cm_zhuge_chapter` + `cm_zhuge_task`：

```sql
cm_zhuge_collection: id, folder_path, name, chapters_count, bgm_count, baseFields
cm_zhuge_chapter:    id, collection_id, idx, name, video_count, audio_count, config_json, baseFields
cm_zhuge_task:       id, collection_id, idx, materials_json, render_status, output_url, baseFields
```

## 7. 前端页面

文件：[ZhugeMode.tsx](../../../frontend/src/pages/cutmatrix/workflows/ZhugeMode.tsx)

已有：
- 空态 + 工作文件夹选择 + 打开任务表入口
- 3 列：BGM 库 / 章节列表 / 章节详情（章节模式 5 选项 + 视频重复率 + 配音更长时策略）
- 表格视图（13 列批量编辑）
- 4 步导出流程：配置 → 成功提示 → 选片 → 渲染参数

待补：
- 工作文件夹真实扫描（替换 mock chapters 注入）
- 导出任务表写入磁盘 .acvtl 文件
- 导入既有 .acvtl 复用任务表
- 渲染队列与单条 compose 进度桥接

## 8. 风险

- 组合数爆炸：5 章 × 每章 10 视频 × 5 配音 = 25 万种排列。需要"无相同排列"算法（线性同余生成器或拉丁方）防止内存爆
- DR Lua 脚本兼容：DR 18+ vs 19+ API 略有差异

## 9. 优先级

**P3** — 前端完整、后端单条 OK，缺工作文件夹扫描 + 批量调度

# 提取章节结构 (chapter-extract)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `chapter-extract` |
| 前端路由 | `/cutmatrix/wf/chapter-extract`（**待建**） |
| 后端 path | `/cm/chapter/extract`（待建） |
| catalog 状态 | 规划中 |

## 2. AutoCut 实现参考

- HTML 路由：`/extract/chapters.html` + 4 个模板：
  - `/extract/chapters/commerce-short-video.html` — 电商短视频
  - `/extract/chapters/entrepreneur-meeting.html` — 创业者会议
  - `/extract/chapters/video-editing-tutorial.html` — 视频剪辑教程
  - `/extract/chapters/live-commerce.html` — 电商直播
- 流程：导入音视频 → ASR 转写 → LLM 按主题切章节 → 输出文件夹树
- 是 zhuge-mode / sunwukong-mode 的**前置工序**

## 3. 数据流

输入：视频/音频文件 + 模板（4 选 1 或自定义）
输出：章节文件夹树（每章节子目录含 audio/video）

## 4. 实现管线

```
视频/音频
  │
  ▼ 1. ffmpeg 抽出音轨 → wav 16k mono
  ▼ 2. ASR 转写（带词级时间戳）→ List<Word{text, start, end}>
  │
  ▼ 3. LLM 章节划分：
  │   prompt 模板（按 commerce-short-video / entrepreneur-meeting / ...）
  │   "以下口播文本，请按主题切分章节。每章节给出 (start, end, name)
  │    并对每章节生成 4-8 字标题。"
  │   输入：词级文本（带时间）
  │   输出：[{start, end, title, summary}]
  │
  ▼ 4. ffmpeg 切割原视频，每章节一个目录：
  │     <output>/1<title>/video/<title>.mp4
  │     <output>/1<title>/audio/<title>.mp3
  │
  ▼ 5. 写 acvtl 任务表元信息
```

## 5. 后端 API

```
POST /cm/chapter/extract
Request: { inputAssetCode, template, customPrompt? }
Response: { taskId }

GET /cm/chapter/extract/progress?taskId  (SSE)
data: {phase: 'asr'|'llm'|'split', current, total}

GET /cm/chapter/extract/result?taskId
Response: { chapters: [{idx, title, start, end, audioUrl, videoUrl}] }
```

## 6. 数据库

`cm_chapter_extract_task`：

```sql
id, task_id, input_asset_code, template, status,
asr_text, llm_chapters_json, output_root, baseFields...
```

复用 `cm_chapter` 表（已有，加 `extract_task_id` FK）。

## 7. 前端页面

**待建** `ChapterExtract.tsx`：

布局：
- 顶部：视频上传 + 模板选择（4 个 + 自定义 prompt）
- 中部：处理流程进度条（ASR → LLM → 切割）
- 底部：章节预览树状图，每章节可在线试听 + 重命名 + 调时间边界 + 导出

## 8. 风险

- ASR 准确率：商品名 / 行业术语容易错；需要词典加持
- LLM 章节边界：可能切得太细或过粗，要让用户拖拽边界再生成
- 长视频（>30 分钟）成本高：ASR ¥0.05/分钟 + LLM 按 token 计

## 9. 优先级

**P2** — 是 zhuge / sunwukong / paragraph-align 的素材源头之一

# 按语义拆解视频 (semantic-split)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `semantic-split` |
| 前端路由 | `/cutmatrix/wf/semantic-split`（**待建**） |
| 后端 path | `/cm/semantic/split`（待建） |
| catalog 状态 | 规划中 |

## 2. AutoCut 实现参考

- HTML 路由：`/split/narration.html` + `/split/narration-loop.html`
- Lua：`Resources/split_narration.lua`（DR 时间轴端按口播切片）
- 流程：与 chapter-extract 类似，但颗粒度更细 — 不切章节，而是按语义边界（句号、话题转折）切**每个独立卖点片段**

## 3. 与相邻模块差异

| 模块 | 颗粒度 | 输出 |
|------|--------|------|
| `chapter-extract` | 大章节（4-8 字标题）| 章节级文件夹树 |
| `semantic-split` | 卖点级（10-30 秒/段）| 卖点级切片 |
| `live-loop` | 话术循环周期 | 直播段（含话术循环识别）|
| `scene-split` | 视觉场景边界 | 视觉切片 |

## 4. 数据流

输入：视频/音频
输出：N 个卖点切片（带语义标签），存入 `cm_segment` 池供编排器使用

## 5. 实现管线

```
视频
  │
  ▼ 1. ffmpeg 抽音
  ▼ 2. ASR 转写带时间戳
  ▼ 3. LLM 卖点识别：
  │   prompt: "以下口播文本，识别每个独立的卖点/卖点。
  │            每个卖点给出 (start, end, summary, tags[])
  │            tags 来自给定本体（如：'按压式','防烫','可旋转'）"
  │
  ▼ 4. ffmpeg 切片
  ▼ 5. 入库 cm_segment（每条带 tags、source_video_id）
  │
  ▼ 6. 用户可手动重新合并相邻 segment / 调时间边界
```

## 6. 后端 API

```
POST /cm/semantic/split
Request: { inputAssetCode, taxonomy?: string[], llmProvider? }
Response: { taskId }

GET /cm/semantic/split/result?taskId
Response: { segments: [{idx, start, end, text, tags[], assetUrl}] }
```

## 7. 数据库

复用 `cm_segment`（已有），新增 `extract_task_id` FK + `semantic_tags JSON`。

## 8. 前端页面

**待建** `SemanticSplit.tsx`：

布局参考 SceneSplit：
- 左：视频上传
- 中：视频预览 + 当前播放卖点高亮
- 右：卖点列表（时间戳 + 摘要 + 标签 chip）
- 底部时间轴：彩色卖点带，按 tag 颜色编码

## 9. 风险

- LLM 提示工程难度：本体 taxonomy 必须给定，否则标签发散
- 卖点重叠：一个片段可能属于多个卖点，需要支持多 tag

## 10. 优先级

**P2** — chapter-extract 的孪生模块，先做 chapter 再做 semantic 复用 ASR 结果

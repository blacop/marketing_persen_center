# 生成字幕 (subtitle-gen)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `subtitle-gen` |
| 前端路由 | `/cutmatrix/wf/subtitle-gen`（**待建**） |
| 后端 path | `/cm/tool/subtitleGen`（待建） |
| catalog 状态 | 规划中 |

## 2. AutoCut 实现参考

- HTML 路由：`/generate/subtitle.html`
- AutoCut 用远程 ASR + 字幕格式化。本地无 ASR
- 标准输出：VTT / SRT / ASS（剪映 / Premiere / FCP / DaVinci 都能直接导入）

## 3. 数据流

输入：视频或音频
输出：字幕文件（vtt/srt/ass）+ 可选烧字幕版本

## 4. 实现管线

```
视频/音频
  │
  ▼ 1. ffmpeg 抽音轨 → wav 16k mono
  ▼ 2. AsrAdapter.transcribe(wav) → segments[{start, end, text}]
  │   每段建议 ≤ 12 字（口播节奏）
  ▼ 3. 智能断句：合并过短段、按标点切过长段
  ▼ 4. 输出 vtt/srt/ass
  ▼ 5. 可选：ffmpeg subtitles 滤镜烧录字幕
  │   ffmpeg -i x -vf "subtitles=output.srt:force_style='Fontname=...'" out.mp4
```

## 5. 后端 API

```
POST /cm/tool/subtitleGen
Request: {
  inputAssetCode, lang?, format: 'vtt'|'srt'|'ass',
  styleTemplate?: 'douyin'|'xiaohongshu'|'custom',
  burnIn?: boolean
}
Response: { taskId }

GET /cm/tool/subtitleGen/result?taskId
Response: { subtitleAssetCode, burnedAssetCode?, segments }
```

## 6. 数据库

`cm_subtitle_task`：

```sql
id, task_id, input_asset_code, lang, format, subtitle_asset_code,
burned_asset_code, segments_json, baseFields
```

## 7. 前端页面

**待建** `SubtitleGen.tsx`：

布局：
- 上传 + 语言选择 + 格式选择 + 样式模板
- 处理进度（ASR → 格式化 → 烧录可选）
- 段落表格（可编辑文本 + 调整时间）
- 下载按钮 + "烧字幕"按钮

## 8. 风险

- ASR 中文准确率：阿里云 ≈ 95%；whisper-large 92%；whisper-medium 87%
- 字幕样式定制：抖音黄色描边、小红书白底黑字、淘宝 PNG sticker

## 9. 优先级

**P3** — 复用 link-ingest 的 ASR Adapter

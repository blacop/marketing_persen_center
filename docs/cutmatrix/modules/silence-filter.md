# 极速过滤 (silence-filter)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `silence-filter` |
| 前端路由 | `/cutmatrix/wf/silence-filter` |
| 后端 path | `/cm/tool/silenceFilter` ✓ |
| catalog 状态 | 内测中 |

## 2. AutoCut 实现参考

- HTML 路由：`/remove/silence.html`
- Go 源：
  - `service/client/remove/silence/detect_silence.go` — ffmpeg `silencedetect` 解析 stderr
  - `service/client/remove/silence/create_assets.go` — 生成切片任务
  - `service/client/remove/silence/deliver_clips.go` — 切片输出
  - `service/client/remove/silence/deliver_media.go` — 单文件输出（拼接保留段）
- ffmpeg 滤镜：`silencedetect=noise=-30dB:d=0.5` + `aselect`/`atrim` + `concat`

## 3. 数据流

输入：音频或视频文件 + 节奏预设
输出：剔除静音后的同格式文件

## 4. 实现管线

```
输入文件 (mp4/mp3/wav/...)
  │
  ▼ 1. 校验扩展名（拒绝 zip/jpeg/重复项）
  ▼ 2. ffmpeg -i x -af silencedetect=noise=NdB:d=Ts -f null -
  ▼ 3. parseSilences(stderr) → List<[start, end]>
  ▼ 4. invertSilences(silences, totalDur) → keep[]
  ▼ 5. 加 padBefore/padAfter 扩展每段，合并 overlap
  ▼ 6. ffmpeg -filter_complex "[0:v]trim=...,[0:a]atrim=..., concat=n=N:v=1:a=1"
  ▼ 7. 输出 mp4 / m4a
```

节奏预设：
- 慢 (`-40dB / 0.8s / pad 0.30 / 0.20`) — 讲述、教学
- 中 (`-30dB / 0.5s / 0.15 / 0.10`) — 自媒体中视频
- 快 (`-25dB / 0.3s / 0.05 / 0.05`) — 短视频、广告
- 自定义

## 5. 后端 API

已实现：[CmToolService.silenceFilter()](../../../marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/tool/CmToolService.java)

```
POST /cm/tool/silenceFilter
Request: SilenceFilterCmd {
  inputAssetCode, noiseDb?, minSilenceSec?,
  padBeforeSec?, padAfterSec?, headTailOnly?, pacing?
}
Response: ToolResultDto { status, resultAssetCode, streamUrl, durationSec, message }
```

## 6. 数据库

无（沿用 `cm_asset` 即可）

## 7. 前端页面

文件：[SilenceFilter.tsx](../../../frontend/src/pages/cutmatrix/workflows/SilenceFilter.tsx)

已有：3 列布局（素材列表 + 参数面板 + 预览）/ 节奏 radio / dB 阈值 + pad slider / 仅去片头片尾 / 任务队列
待补：
- 波形图实时叠加（用 audiowaveform 二进制生成 PNG / JSON）
- 批量素材并行处理 + 全局进度条

## 8. 风险

- 视频转码耗时：1080p / 60s 视频约 15s（M1 mac）
- 静音误判：背景白噪声偏大时阈值需调高

## 9. 优先级

**P0 完成态** — 后端 + 前端均已联调

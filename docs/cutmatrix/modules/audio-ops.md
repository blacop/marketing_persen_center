# 操作视频声音 (audio-ops)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `audio-ops` |
| 前端路由 | `/cutmatrix/wf/audio-ops`（**待建**） |
| 后端 path | `/cm/tool/audioOps` ✓ |
| catalog 状态 | 规划中（后端已实现，前端缺） |

## 2. AutoCut 实现参考

- HTML 路由：`/mux/soundtrack.html`
- Go 源：
  - `service/client/mux/soundtrack/create_assets.go`
  - `service/client/mux/soundtrack/create_audio_assets.go`
  - `service/client/mux/soundtrack/deliver_media.go`
- 复合滤镜：`amix=inputs=2:duration=first` 混合原声 + BGM

## 3. 数据流

输入：视频 + (BGM | 是否去原声 | 音量 | BGM 音量)
输出：处理后的视频

## 4. 实现管线

```
视频 (+ BGM)
  │
  ▼ 1. 决策分支：
  │   removeOriginal=true & bgm=null:    ffmpeg -an
  │   removeOriginal=true & bgm:          BGM volume only
  │   keep & bgm:                         amix 原声 × volume + BGM × bgmVolume
  │   keep & bgm=null:                    af=volume=N
  │
  ▼ 2. ffmpeg -filter_complex / -af + -c:v copy + -c:a aac
  ▼ 3. 输出 mp4
```

## 5. 后端 API

已实现：[CmToolService.audioOps()](../../../marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/tool/CmToolService.java)

```
POST /cm/tool/audioOps
Request: AudioOpsCmd {
  inputAssetCode, removeOriginal?, bgmAssetCode?, volume?, bgmVolume?
}
Response: ToolResultDto
```

## 6. 数据库

无

## 7. 前端页面

**待建** `AudioOps.tsx`：

布局：
- 上：素材选择
- 中：4 个开关（去原声 / 加 BGM / 调音量 / 加音效）
  - 去原声：toggle
  - 加 BGM：BGM 文件上传 + 是否循环 + 音量 slider
  - 调音量：原声音量 slider 0-200%
  - 音效：预置音效库（开瓶声、笑声、转场音效）+ 在指定时间点插入
- 底：预览 + 提交

## 8. 风险

- BGM 时长 < 视频时长需要 `-stream_loop -1`，已在后端实现
- BGM 版权：建议预置免版权 BGM 库（freesound.org、薛之谦/抖音热曲不能用）

## 9. 优先级

**P0** — 后端完毕，前端缺

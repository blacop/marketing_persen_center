# 平均切分 (uniform-split)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `uniform-split` |
| 前端路由 | `/cutmatrix/wf/uniform-split`（**待建**） |
| 后端 path | `/cm/tool/uniformSplit` ✓ |
| catalog 状态 | 规划中（后端已实现，前端缺） |

## 2. AutoCut 实现参考

- HTML 路由：`/split/duration.html`
- Go 源：
  - `service/client/split/duration/create_assets.go`
  - `service/client/split/duration/deliver_clips.go`
- ffmpeg：`-f segment -segment_time N -reset_timestamps 1 part_%03d.mp4`

## 3. 数据流

输入：视频 + 段长（秒）
输出：N 个等长 mp4

## 4. 实现管线

```
视频
  │
  ▼ 1. ffmpeg -i x -c copy -map 0 -f segment -segment_time T \
  │      -reset_timestamps 1 part_%03d.mp4
  ▼ 2. 扫描输出目录，每段独立 assetCode + streamUrl
  ▼ 3. 返回切片列表
```

`-c copy` 不重新编码，速度快但可能在非关键帧位置切，导致前几帧缺失。需要精确切分则改 `-c:v libx264 -force_key_frames "expr:gte(t,n_forced*T)"`。

## 5. 后端 API

已实现：[CmToolService.uniformSplit()](../../../marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/tool/CmToolService.java)

```
POST /cm/tool/uniformSplit
Request: UniformSplitCmd { inputAssetCode, segmentSec }
Response: ToolResultDto { resultAssetCodes[], streamUrls[] }
```

## 6. 数据库

无

## 7. 前端页面

**待建** `UniformSplit.tsx`：

布局：
- 素材上传
- 参数：段长滑块 (1-60s) + 精确模式 toggle（启用关键帧强制）
- 提交后展示切片网格（每片小预览 + 下载）+ 一键下载全部 zip

## 8. 风险

- 非精确模式下首帧黑：需要在 UI 提示
- 一次输出大量文件：>50 段建议自动打 zip

## 9. 优先级

**P0** — 后端完毕，前端缺

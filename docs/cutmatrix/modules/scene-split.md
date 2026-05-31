# 按场景拆解视频 (scene-split)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `scene-split` |
| 前端路由 | `/cutmatrix/wf/scene-split` |
| 后端 path | `/cm/tool/sceneSplit` ✓ |
| catalog 状态 | 内测中 |

## 2. AutoCut 实现参考

- HTML 路由：`/split/scene.html`
- Rust 源：`src/scene_detect.rs`（acv_client 端，调本地 ffmpeg）
- Lua：`Resources/split_scene.lua`（DR 端导入时间轴）
- ffmpeg 滤镜：`select='gt(scene,0.4)',showinfo` + `pts_time` 解析

## 3. 数据流

输入：视频 + 检测阈值 + 最小片段秒
输出：N 段独立 mp4 + 时间戳列表

## 4. 实现管线

```
视频
  │
  ▼ 1. ffmpeg -i x -vf "select='gt(scene,T)',showinfo" -f null -
  ▼ 2. 正则提取 pts_time → List<切换点>
  ▼ 3. 过滤太短的片段（<minSegmentSec）
  ▼ 4. 对每段：ffmpeg -ss start -i x -t dur -c:v libx264 ... part_N.mp4
  ▼ 5. 返回 streamUrls[] + assetCodes[]
```

前端额外：
- 镜头列表（时间戳 + 时长 + 缩略图）
- 与下一镜头合并（重新拼接）
- 拖拽到目标章节文件夹（来自 chapter-extract / script-fission）
- 导出 DaVinci Resolve Lua 脚本

## 5. 后端 API

已实现：[CmToolService.sceneSplit()](../../../marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/tool/CmToolService.java)

```
POST /cm/tool/sceneSplit
Request: SceneSplitCmd { inputAssetCode, sceneThreshold?, minSegmentSec? }
Response: ToolResultDto { resultAssetCodes[], streamUrls[], message }
```

## 6. 数据库

可选 `cm_scene_split_task` 保存"镜头 → 文件夹"的人工分配关系：

```sql
id, task_id, video_asset_code, segments_json (序号/start/end/folder_id),
baseFields...
```

## 7. 前端页面

文件：[SceneSplit.tsx](../../../frontend/src/pages/cutmatrix/workflows/SceneSplit.tsx)

已有：4 列布局（素材 / 视频 / 镜头列表 / 目标文件夹）/ 时间轴彩色条 / 点击分配 / 导出 Lua
待补：
- 镜头缩略图：第 1 帧 ffmpeg 抽帧 → base64 / oss
- 文件夹拖拽（HTML5 DnD）替代当前点击分配
- 真实 DaVinci 集成测试

## 8. 风险

- 高动态视频（如直播切片）阈值 0.4 可能切太碎，需要参数调优
- ffmpeg scenedetect 速度：1080p / 60s 约 8s

## 9. 优先级

**P0 完成态** — 后端 + 前端均已联调，DaVinci 导出待真实环境验证

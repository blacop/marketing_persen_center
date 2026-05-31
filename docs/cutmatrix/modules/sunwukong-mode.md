# 孙悟空模式 (sunwukong-mode)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `sunwukong-mode` |
| 前端路由 | `/cutmatrix/wf/sunwukong-mode`（**待建**） |
| 后端 path | `/cm/compose/sunwukong` ✓ |
| catalog 状态 | 规划中（前端缺） |

## 2. AutoCut 实现参考

- HTML 路由：`/compose/loose.html` → `/compose/loose/workspace.html` → `/compose/loose/table.html`
- 命名暗示："宽松"模式 = 整段配音驱动 + 随机镜头池（孙悟空 72 变）
- Go 源：`service/client/concat/random/deliver_media.go` — 随机抽取镜头
- 与诸葛亮的差别：
  - 诸葛亮：章节×章节硬绑定（每章节独立画面与配音）
  - 孙悟空：1 整段配音 + 从全局镜头池随机填充画面至音频时长

## 3. 数据流

输入：1 个完整配音 + 镜头池（视频文件夹）+ 时长目标
输出：1 段成片，画面随机但配音固定

## 4. 实现管线

```
配音 + 镜头池
  │
  ▼ 1. probe(配音) → durationSec
  ▼ 2. 用户选定/输入随机种子（可复现）
  ▼ 3. 后端：
  │   while accumulatedSec < audioDur:
  │     videoClip = randomPick(pool, seed)
  │     若 videoClip.dur > 剩余配音时长，trim 到剩余
  │     accumulated += clip.dur
  │   ffmpeg concat clips + 替换 audio track
  │
  ▼ 4. 输出 mp4
```

参数：
- 镜头重复率（同诸葛亮的 videoRepeatRate）
- 是否允许同镜头连续出现
- 单镜头最长 / 最短时长（避免闪现或拖沓）
- 转场（可选，AutoCut 警告 DR 渲染易出错）

## 5. 后端 API

已存在：`/cm/compose/sunwukong`

```
POST /cm/compose/sunwukong
Request: { collectionCode, durationSec, narrationAssetCode, seed? }
Response: CmComposeBackendResult
```

需要补：
- 镜头池来源（按 chapter / 按 tag / 全局）的过滤参数
- 批量种子运行（一次出多版本）

## 6. 数据库

`cm_sunwukong_task`：

```sql
id, narration_asset_code, pool_collection_code, seed, duration_sec,
output_asset_code, status, baseFields...
```

## 7. 前端页面

**待建** `frontend/src/pages/cutmatrix/workflows/SunwukongMode.tsx`：

布局参考诸葛亮 + 简化：
- 左：配音上传 / 选择已有
- 中：镜头池配置（按文件夹 / 按 chapter / 按标签）
- 右：随机参数（seed、最短/最长片段、是否允许重复）
- 底：批量出片（指定生成 N 个不同种子的版本）

## 8. 风险

- 随机性导致质量不稳：需要"重新摇骰子"快速重生成
- 长配音 + 短镜头 = 切片过密，需要镜头最短 secs 约束

## 9. 优先级

**P3** — 与 zhuge-mode 同期，但 UI 简单些

# 拆解电商直播话术循环 (live-loop)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `live-loop` |
| 前端路由 | `/cutmatrix/wf/live-loop`（**待建**） |
| 后端 path | `/cm/live/loop`（待建） |
| catalog 状态 | 规划中 |

## 2. AutoCut 实现参考

- HTML 路由：`/split/narration/live.html` + `/split/narration-loop.html`
- 是 chapter-extract 的特化版：识别**话术循环**（电商主播每隔 3-5 分钟重复推一次相同话术 + 商品段落）

## 3. 数据流

输入：电商直播长视频（1-4 小时）
输出：商品段落 + 话术循环索引（每个商品一个文件夹，每次循环一段切片）

## 4. 实现管线

```
直播长视频
  │
  ▼ 1. ASR 全量转写（带时间戳）
  ▼ 2. LLM 商品识别：
  │   prompt: "以下直播文本，识别正在介绍的商品名 + 起止时间。
  │            一个商品可能被反复介绍，请合并归类。"
  │   输出：[{productName, mentions: [{start, end, text}]}]
  │
  ▼ 3. 话术循环检测：
  │   计算 mentions 间的文本相似度（embedding cosine）
  │   相似度 >0.8 视为同一话术循环的多次重复
  │
  ▼ 4. ffmpeg 切片：每个商品 → 一个目录，每次循环一个 mp4
  │     <output>/<productName>/loop_1.mp4
  │     <output>/<productName>/loop_2.mp4
  │
  ▼ 5. UI 展示商品树状结构，用户勾选导出
```

## 5. 后端 API

```
POST /cm/live/loop
Request: { inputAssetCode, embeddingProvider? }
Response: { taskId }

GET /cm/live/loop/result?taskId
Response: {
  products: [{
    name, mentions: [{idx, start, end, text, loopGroup}]
  }]
}
```

## 6. 数据库

`cm_live_loop_task` + `cm_live_product` + `cm_live_mention`：

```sql
cm_live_product:  id, task_id, name, mention_count, baseFields
cm_live_mention:  id, product_id, start_sec, end_sec, text, loop_group, asset_code, baseFields
```

## 7. 前端页面

**待建** `LiveLoop.tsx`：

布局：
- 上：长视频上传 / 选择
- 中：商品树（商品 → 循环组 → 单次循环 mp4），勾选导出
- 下：选中切片的时间轴 + 试播

## 8. 风险

- 长视频 ASR 成本：4 小时 ≈ ¥10
- Embedding API：阿里 BGE 模型 ¥0.7/百万 token
- 商品识别准确率：依赖 LLM + 后置规则（结合主播话术模板"现在给大家展示的是..."）

## 9. 优先级

**P2** — chapter-extract / semantic-split 的下游特化，可推迟

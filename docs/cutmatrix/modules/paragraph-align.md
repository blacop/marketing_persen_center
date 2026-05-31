# 段落对齐编排器 (paragraph-align)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `paragraph-align` |
| 前端路由 | `/cutmatrix/wf/paragraph-align`（玛丽黛佳特化） |
| 后端 path | `/cm/compose/paragraphAlign` ✓ |
| catalog 状态 | 内测中（玛丽黛佳特化版） |

## 2. 设计来源

**本项目原创**，AutoCut 没有完全对应的功能。最接近的是 `compose/strict`（诸葛亮），但段落对齐的颗粒度更细：

- 诸葛亮：章节级（每章节独立画面 + 配音）
- 段落对齐：**段内**级（按卖点段落切分配音 → 每段匹配标签镜头 → 累计时长达到该段配音时长）

## 3. 数据流

输入：配音（已带 paragraph 时间戳标注） + 镜头库（每条带标签）
输出：段落对齐的成片

## 4. 实现管线

```
配音
  │
  ▼ 1. 配音预处理：按段落标签切片 (Paragraph[] {start,end,tags[]})
  │     来源：人工标注 OR ASR 段落识别
  │
  ▼ 2. 镜头库准备：每条 segment 打 tags
  │     来源：scene-split 结果手动 tag OR 视频内容理解 API
  │
  ▼ 3. 编排算法（段落级匹配）：
  │   for each paragraph p:
  │     candidates = pool.filterByTags(p.tags)
  │     accumulated = 0
  │     while accumulated < p.duration:
  │       clip = candidates.pickWeighted(repeatRate)
  │       若 clip.dur > 剩余, trim 尾部
  │       accumulated += clip.dur
  │     段尾自然截断
  │
  ▼ 4. ffmpeg concat 全部段落 + 配音叠加 + BGM
  │
  ▼ 5. 输出 mp4
```

## 5. 后端 API

已实现：`/cm/compose/paragraphAlign`

```
POST /cm/compose/paragraphAlign
Request: ParagraphAlignCmd {
  collectionCode, narrationAssetCode,
  paragraphs: [{start, end, tags[]}],
  repeatRate, seed?
}
Response: CmComposeBackendResult
```

## 6. 数据库

复用 `cm_collection / cm_chapter / cm_segment / cm_compose_task`（已有）

## 7. 前端页面

**待建** 或集成到现有页面。建议路径：
- 入口：BeukayClaw → 检测产生 paragraph 标注 → "段落对齐编排" 跳转
- 页面：上传配音 + paragraph 标注（或读取 BeukayClaw 输出）+ 选 collection + 重复率 → 一键 compose

## 8. 风险

- 段落标注质量：人工标耗时；ASR 自动断句不准
- 镜头标签覆盖度：标签稀疏会导致候选池为空 → 退化为随机

## 9. 优先级

**P2** — 玛丽黛佳特化，业务方主推

# 添加背景 (add-bg)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `add-bg` |
| 前端路由 | `/cutmatrix/wf/add-bg`（**待建**） |
| 后端 path | `/cm/tool/addBg`（**待建**） |
| catalog 状态 | 规划中 |

## 2. AutoCut 实现参考

- HTML 路由：`/overlay/video_on_image.html`
- Go 源：
  - `service/client/overlay/video_on_image/create_assets.go`
  - `service/client/overlay/video_on_image/deliver_media.go`
- ffmpeg：`overlay` 滤镜叠加 + `scale` 调整前景视频尺寸

## 3. 数据流

输入：前景视频（去原比例） + 背景图（jpg/png）+ 视频在背景中的位置 (x,y) + 缩放
输出：合成视频

## 4. 实现管线

```
前景视频 + 背景图
  │
  ▼ 1. probe 视频尺寸 + 背景图尺寸
  ▼ 2. ffmpeg -loop 1 -i bg.jpg -i fg.mp4 \
  │     -filter_complex "[1:v]scale=W:H[fg];[0:v][fg]overlay=X:Y" \
  │     -shortest output.mp4
  ▼ 3. 音频从前景拷贝
```

预设位置：center / top / bottom / 自定义。
预设缩放：50% / 70% / 80% / 自适应背景中心 inset。

## 5. 后端 API

```
POST /cm/tool/addBg
Request: {
  inputAssetCode, bgAssetCode,
  position?: 'center'|'top'|'bottom'|'custom',
  customX?, customY?, scalePercent?
}
Response: ToolResultDto
```

需要新建 `addBg()` 方法在 `CmToolService.java`。

## 6. 数据库

无

## 7. 前端页面

**待建** `AddBg.tsx`：

布局：
- 上：前景视频 + 背景图上传
- 中：所见即所得编辑器（可拖拽视频在背景中位置 + 角缩放）
- 右：参数面板（位置预设、缩放、不透明度、圆角）
- 底：导出

## 8. 风险

- 背景图分辨率需要 ≥ 输出尺寸（否则模糊）
- 视频在背景中的边缘需要一些圆角 / 阴影才好看（额外 ffmpeg `geq` 滤镜）

## 9. 优先级

**P4** — 装饰性能力，需求不紧

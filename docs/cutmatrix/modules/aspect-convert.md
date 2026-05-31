# 转换比例 (aspect-convert)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `aspect-convert` |
| 前端路由 | `/cutmatrix/wf/aspect-convert`（**待建**） |
| 后端 path | `/cm/tool/aspectConvert` ✓ |
| catalog 状态 | 规划中（后端已实现，前端缺） |

## 2. AutoCut 实现参考

- HTML 路由：`/modify/dimension.html`
- Go 源：
  - `service/client/modify/dimension/create_assets.go`
  - `service/client/modify/dimension/deliver_media.go`
- ffmpeg 滤镜：`scale + pad`（fit 模式）或 `scale + crop`（crop 模式）

## 3. 数据流

输入：视频 + 目标比例 + 短边像素 + 模式
输出：转换后的视频

## 4. 实现管线

```
视频
  │
  ▼ 1. parseAspectToDims(targetAspect, shortEdge) → [W, H]
  ▼ 2. mode=fit:  scale=W:H:force_original_aspect_ratio=decrease,
  │                pad=W:H:(ow-iw)/2:(oh-ih)/2:black,setsar=1
  │   mode=crop: scale=W:H:force_original_aspect_ratio=increase,
  │                crop=W:H,setsar=1
  ▼ 3. ffmpeg -vf "<filter>" -c:v libx264 -preset veryfast -crf 23 -c:a aac
  ▼ 4. 输出 mp4
```

## 5. 后端 API

已实现：[CmToolService.aspectConvert()](../../../marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/tool/CmToolService.java)

```
POST /cm/tool/aspectConvert
Request: AspectConvertCmd {
  inputAssetCode, targetAspect: '9:16'|'16:9'|'1:1'|'4:3'|'3:4',
  shortEdge?: number = 1080, mode?: 'fit'|'crop' = 'crop'
}
Response: ToolResultDto
```

## 6. 数据库

无

## 7. 前端页面

**待建** `AspectConvert.tsx`：

布局：
- 左：素材列表（多文件批量）
- 中：视频预览 + 比例切换实时预览（CSS 模拟）
- 右：参数（5 比例 radio + 短边数字 + fit/crop 切换 + 背景色 picker for fit）
- 底：批量转换按钮 + 进度

## 8. 风险

- crop 会丢画面边缘信息：常见诉求是手动调焦点（中心 / 左 / 右），需扩展参数
- 多文件并行编码：CPU 飙满，需要 worker pool

## 9. 优先级

**P0** — 后端完毕，前端缺，做完即可上线

# 擦除字幕 (subtitle-erase)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `subtitle-erase` |
| 前端路由 | `/cutmatrix/wf/subtitle-erase` |
| 后端 path | `/cm/tool/subtitleErase` ✓ |
| catalog 状态 | 内测中（前后端联调完成） |

## 2. AutoCut 实现参考

- HTML 路由：`/remove/subtitle.html` + `/remove/subtitle/workspace.html` + `/remove/subtitle/jobs.html`
- AutoCut 用远程 OCR 模型（CSP 命中 `*.aliyuncs.com`）。本地无 OCR 二进制
- 我们的方案：用 **ffmpeg `delogo` 滤镜**（周边像素插值），不做 OCR，由用户手动框选擦除区域

## 3. 数据流

输入：视频 + 擦除区域百分比坐标
输出：擦除后的视频

## 4. 实现管线

```
视频
  │
  ▼ 1. probe → 视频 W × H
  ▼ 2. 区域百分比 → 像素坐标，clamp 边界
  ▼ 3. ffmpeg -vf "delogo=x=N:y=N:w=N:h=N:show=0" 或 drawbox
  │   - delogo: 周边像素插值（默认，最自然）
  │   - black: 黑色矩形覆盖（兜底）
  │   多区域用 ',' 串联
  ▼ 4. 输出 mp4，音轨 -c:a copy
```

## 5. 后端 API

已实现：[CmToolService.subtitleErase()](../../../marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/app/cutmatrix/tool/CmToolService.java)

```
POST /cm/tool/subtitleErase
Request: SubtitleEraseCmd {
  inputAssetCode, regions: [{x,y,w,h}],  // 百分比 0-100
  fillMode?: 'delogo'|'black'
}
Response: ToolResultDto
```

## 6. 数据库

无（沿用 `cm_asset`）

## 7. 前端页面

文件：[SubtitleErase.tsx](../../../frontend/src/pages/cutmatrix/workflows/SubtitleErase.tsx)

已有：
- 上传本地视频 → assetCode
- 视频播放器 + 可拖拽区域框（4 角缩放 + 中心移动，百分比坐标）
- 单区域 / 双区域选项
- 提交任务 → 任务队列（无消耗积分列）
- 查看：在平台内播放结果视频

待补：
- 自动 OCR 检测字幕位置（接 PaddleOCR / 阿里 OCR API）→ 一键预填区域
- 模板保存（玛丽黛佳常用底部带状区域）

## 8. 风险

- delogo 在大区域上质量降低（>20% 屏幕面积明显模糊）
- 字幕半透明 / 描边重时仍有残影 → 兜底用 black 覆盖

## 9. 优先级

**P0 完成态** — 已联调

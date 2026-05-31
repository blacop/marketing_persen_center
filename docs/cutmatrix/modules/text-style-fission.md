# 裂变文字样式 (text-style-fission)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `text-style-fission` |
| 前端路由 | `/cutmatrix/wf/text-style-fission`（**待建**） |
| 后端 path | `/cm/tool/textStyleFission`（**待建**） |
| catalog 状态 | 规划中 |

## 2. AutoCut 实现参考

- HTML 路由：`/overlay/text_shape.html`
- Go 源：
  - `service/client/overlay/text_shape/create_assets.go`
  - `service/client/overlay/text_shape/deliver_media.go`
- 字体资源：`Resources/su_cai_ji_shi_kang_kang_ti.ttf`、`SourceHanSansCN-*.otf`、`san_ji_xing_kai_jian_ti_cu.ttf`、`xia_wu_wen_kai_regular.ttf`
- ffmpeg：`drawtext` 滤镜或外部 PNG 合成（`overlay`）

## 3. 数据流

输入：视频 + 文字内容 + N 个样式模板
输出：N 个版本（每个不同字体/颜色/动画）

## 4. 实现管线

```
视频 + 文字
  │
  ▼ 1. 加载 N 个样式模板（TTF + 颜色 + 描边 + 阴影 + 位置）
  ▼ 2. for each style:
  │     ffmpeg -i x -vf "drawtext=fontfile=...:text='...':
  │            fontcolor=...:fontsize=...:bordercolor=...:borderw=...:
  │            x=(w-text_w)/2:y=h-text_h-30" out_N.mp4
  ▼ 3. 复杂动画（淡入淡出、打字机）需要预渲 PNG 序列再 overlay
```

## 5. 后端 API

```
POST /cm/tool/textStyleFission
Request: {
  inputAssetCode, text, position?: 'top'|'middle'|'bottom',
  styleIds: string[]      // 引用预置样式库
}
Response: { resultAssetCodes[], streamUrls[] }
```

需要预置样式库：
```
cm_text_style: id, name, font_file, font_size, color, border_color, border_w,
                shadow_x, shadow_y, animation_type, ...
```

## 6. 数据库

`cm_text_style`（系统预置 + 用户自定义）

## 7. 前端页面

**待建** `TextStyleFission.tsx`：

布局：
- 上：视频上传 + 文字输入
- 中：样式库网格（每个 thumbnail）多选
- 右：预览（实时叠加）
- 底：批量裂变

## 8. 风险

- 字体版权：商用需买授权（思源字体、霞鹜文楷免费）
- drawtext 性能：每帧都要绘制，1080p 30s 视频约 8s

## 9. 优先级

**P4** — 装饰性能力，依赖样式库设计

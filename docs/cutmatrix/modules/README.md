# Cutmatrix 模块复刻规范索引

每个卡片一个 `.md`，按"逆向 AutoCutVideo v2.30.5 → 我们如何复刻"的统一模板撰写。
落地按文件从上到下推进，先做工具类（原子能力）再做工作流（编排）。

## 模板字段（每个模块文件都包含）

1. **模块标识** — `key` / 前端路由 / 后端 `backendPath` / catalog 当前状态
2. **AutoCut 实现参考** — 路由 / Go 源文件 / ffmpeg 滤镜 / 远程 API
3. **数据流** — 输入 → 输出
4. **实现管线** — 端到端步骤
5. **后端 API** — 接口签名 / DTO
6. **数据库表** — 如有
7. **前端页面** — 已有 / 待补
8. **风险** — 反爬 / 性能 / 兼容性
9. **优先级** — P0–P4

## 工作流（10 张，端到端编排）

| Key | 名称 | 文件 | 状态 |
|-----|------|------|------|
| `link-ingest` | 提取视频及文案 | [link-ingest.md](link-ingest.md) | 内测中（前端 mock） |
| `script-fission` | 文案裂变 | [script-fission.md](script-fission.md) | 内测中（前端 mock） |
| `tts-batch` | 语音合成 | [tts-batch.md](tts-batch.md) | 内测中（前端 mock） |
| `silence-filter` | 极速过滤 | [silence-filter.md](silence-filter.md) | 内测中（后端真实） |
| `scene-split` | 按场景拆解视频 | [scene-split.md](scene-split.md) | 内测中（后端真实） |
| `live-loop` | 拆解电商直播话术循环 | [live-loop.md](live-loop.md) | 规划中 |
| `chapter-extract` | 提取章节结构 | [chapter-extract.md](chapter-extract.md) | 规划中 |
| `semantic-split` | 按语义拆解视频 | [semantic-split.md](semantic-split.md) | 规划中 |
| `paragraph-align` | 段落对齐编排器 | [paragraph-align.md](paragraph-align.md) | 内测中（后端真实，玛丽黛佳特化） |
| `zhuge-mode` | 诸葛亮模式 | [zhuge-mode.md](zhuge-mode.md) | 内测中（前端 mock 完整） |
| `sunwukong-mode` | 孙悟空模式 | [sunwukong-mode.md](sunwukong-mode.md) | 规划中 |

## 工具（7 张，原子单点能力）

| Key | 名称 | 文件 | 状态 |
|-----|------|------|------|
| `subtitle-erase` | 擦除字幕 | [subtitle-erase.md](subtitle-erase.md) | 内测中（后端真实，前端联调完成） |
| `subtitle-gen` | 生成字幕 | [subtitle-gen.md](subtitle-gen.md) | 规划中 |
| `aspect-convert` | 转换比例 | [aspect-convert.md](aspect-convert.md) | 规划中（后端已实现，前端缺） |
| `audio-ops` | 操作视频声音 | [audio-ops.md](audio-ops.md) | 规划中（后端已实现，前端缺） |
| `uniform-split` | 平均切分 | [uniform-split.md](uniform-split.md) | 规划中（后端已实现，前端缺） |
| `add-bg` | 添加背景 | [add-bg.md](add-bg.md) | 规划中 |
| `text-style-fission` | 裂变文字样式 | [text-style-fission.md](text-style-fission.md) | 规划中 |

## 落地推荐顺序

工具先于工作流（工作流依赖工具产出物）：

1. **P0**（已完成或差临门一脚）
   - `subtitle-erase` ✓
   - `silence-filter`、`scene-split` 完善前端联调
   - `aspect-convert / audio-ops / uniform-split` 补前端
2. **P1** 文案管线（产生数据驱动后续）
   - `link-ingest`（接入抖音/B 站解析器 + ASR）
   - `script-fission`（接入 LLM 改写）
   - `tts-batch`（接入 ASR 服务）
3. **P2** 章节级
   - `chapter-extract`、`semantic-split`、`live-loop`
4. **P3** 编排
   - `zhuge-mode` / `sunwukong-mode` 接入真实 collection 数据
   - `paragraph-align` 维持现状
5. **P4** 美化
   - `add-bg` / `text-style-fission` / `subtitle-gen`

## 通用基础设施

- **存储**：`CmAssetStorageService`（已有）
- **媒体执行器**：`CmFFmpegRunner`（已有，封装 ProcessBuilder）
- **ASR 接口**：`AsrAdapter`（待建，统一 link-ingest / chapter-extract / subtitle-gen / semantic-split 的转写需求）
- **LLM 接口**：`LlmAdapter`（待建，统一 script-fission / chapter-extract 的语义分析需求）
- **URL 解析器**：`UrlPlatformResolver`（待建，统一 link-ingest / live-loop 的链接解析需求）
- **任务队列**：本地 `cm_*_task` 表 + SSE 进度（每个模块独立表，schema 统一）

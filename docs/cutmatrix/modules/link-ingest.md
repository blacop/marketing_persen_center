# 提取视频及文案 (LinkIngest) — 执行规范

基于对 `/Applications/AutoCutVideo.app` v2.30.5 的逆向分析撰写。我们要在自己的后端复刻这条管线。

## 一、AutoCutVideo 的实际管线（逆向结果）

### 1.1 程序结构

| 位置 | 角色 |
|------|------|
| `Contents/MacOS/acv_client` (8.2 MB, Tauri 2 / Rust + 嵌入式 SvelteKit 前端) | 主进程 / GUI / IPC |
| `Contents/MacOS/auto_cut_video` (19 MB, Go) | 媒体处理 sidecar，仅本地 ffmpeg 编排（拼接、静音剔除、场景拆分、声轨混音、字幕擦除等）— **不**含 URL 解析 / 转写 |
| `Contents/MacOS/ffmpeg`, `ffprobe`, `audiowaveform` | 工具二进制 |
| `Contents/Resources/{split_narration.lua, split_scene.lua, utils.lua}` | DR 端 Lua 脚本（导出阶段调起 DaVinci Resolve） |

### 1.2 acv_client 暴露的 Tauri 命令（部分）

字符串挖掘命中：

```
detect_startup_checklist
run_startup_checklist_action
allow_dir
probe_media
list_direct_files
list_direct_folders
list_split_narration_folders
list_deep_files
build_shared_dub_map
file_exists
write_text_file
create_chapter_folders
create_empty_folders
extract_audio        ← 把已下载的视频抽出 WAV
read_bytes
```

`src/` Rust 模块：`download.rs / extract_audio.rs / scene_detect.rs / chapter_folder_export.rs / media.rs`。**没有**任何转写 / ASR 模块在客户端。

### 1.3 远程依赖（CSP `connect-src` 白名单）

```
https://autocut.video         ← 主 API
https://automake.video        ← 备份域
https://*.aliyuncs.com        ← OSS
https://*.bytednsdoc.com      ← 抖音 CDN（直链下载）
https://xiafeng.co            ← 内部域
*.bilibili.com / *.bilivideo.com  ← B 站 webview iframe
```

也命中常量字符串：
- `autocut.video/media-proxies` — 链接解析端点
- `download_link_fetch_failed` — 解析失败错误码
- `https://autocut.video/api/update/{{target}}/{{arch}}/{{current_version}}` — 自更新

### 1.4 推断的 LinkIngest 时序

```
浏览器粘贴 URL
        │
        ▼
[acv_client]  ───POST───►  https://autocut.video/api/media-proxies/parse
                                │
                                ▼ 服务端解析（抖音/B站/小红书/快手 短链 → 长链 → JSON → 直链）
                                │
        ◄──── { title, mediaType, downloadUrl, durationSec } ────
        │
        ▼ HTTP GET downloadUrl，本地写入 cache（带进度条）
        │
        ▼ Tauri invoke `extract_audio`  → 调本地 ffmpeg 抽出 WAV
        │
        ▼ POST WAV → https://autocut.video/api/transcribe（或 OSS 直传 + 任务回调）
                                │
                                ▼ 返回逐句文本
        ◄──── { transcript, segments[] } ────
        │
        ▼ 写入本地 sqlite（badger DB），UI 列表渲染"查看文案 / 前往裂变"
```

**结论**：
- AutoCutVideo 的链接解析 + 转写都是 **远程付费** API（`autocut.video`）。
- 视频下载是本地 HTTP，但直链来自服务端 unwrap。
- 音频抽帧用本地 ffmpeg。

---

## 二、本项目复刻方案

我们 **不能** 调 `autocut.video/api`（不是我们的服务）。所以三块要自己实现：

| 阶段 | AutoCut 用什么 | 我们用什么 |
|------|---------------|-----------|
| **A. URL → 直链解析** | `autocut.video/api/media-proxies/parse`（黑盒服务端）| **Java 实现：** 内置抖音 / B 站 / 小红书 / 快手解析器（短链 expand + HTML/JSON regex），见 §2.2 |
| **B. 视频下载** | 客户端 reqwest GET | `OkHttp` 流式 GET → `CmAssetStorageService` |
| **C. 音频抽取** | 本地 ffmpeg + Tauri `extract_audio` | `CmFFmpegRunner` 已有 |
| **D. 语音转写 (ASR)** | `autocut.video/api/transcribe`（黑盒，疑似阿里云 ASR） | 三选一：①阿里云 NLS 实时识别 ②本地 whisper.cpp ③Mock（开发期）|

### 2.1 后端 API 形状（要新建）

放在 `marketing-person-infrastructure/.../app/cutmatrix/linkingest/`，COLA 风格：

| 接口 | 用途 | 入参 | 出参 |
|------|------|------|------|
| `POST /cm/link-ingest/parse` | 解析 URL，返回直链元数据。**不下载** | `{ urls: string[] }` | `LinkParseResultDto[]` |
| `POST /cm/link-ingest/download` | 触发后端下载并落到 `cm-storage`。返回 `assetCode` | `{ url, title, quality? }` | `{ taskId, assetCode, streamUrl }`（异步：先返回 taskId，进度走 SSE） |
| `GET /cm/link-ingest/progress?taskId=` | SSE 流：下载进度 + 状态 | `taskId` | `data: {phase:'download', progress, ...}` |
| `POST /cm/link-ingest/transcribe` | 抽音频 + ASR | `{ assetCode }` | `{ taskId }`（异步） |
| `GET /cm/link-ingest/transcribe/result?taskId=` | 拉取转写结果 | `taskId` | `{ status, captionText, segments[] }` |

### 2.2 各平台解析器实现细节

#### 抖音 (`v.douyin.com/<id>`)

1. 短链 GET（手动跟随重定向）→ 抓 `Location: https://www.iesdouyin.com/share/video/<aweme_id>/?...`
2. 提 `aweme_id`
3. GET `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=<aweme_id>`
4. JSON 路径：`item_list[0].video.play_addr.url_list[0]` → 替换 `playwm` 为 `play` 拿无水印
5. 标题：`item_list[0].desc`

注意：抖音风控变化频繁，可能需要带 cookie/User-Agent。生产建议加 ②③ 兜底。

#### 小红书 (`xhslink.com/<id>`)

1. 短链跟随到 `www.xiaohongshu.com/discovery/item/<note_id>`
2. GET 页面 HTML，提取 `<script>window.__INITIAL_STATE__ = {...}</script>`
3. JSON 路径：`note.noteDetailMap.<note_id>.note.video.media.stream.h264[0].masterUrl`

#### B 站 (`b23.tv/<id>` 或 `bilibili.com/video/BV...`)

1. 短链跟随到 `BV<id>`
2. GET `https://api.bilibili.com/x/web-interface/view?bvid=<bvid>` → `cid`
3. GET `https://api.bilibili.com/x/player/playurl?bvid=<bvid>&cid=<cid>&qn=80&fnval=80`
4. JSON 路径：`data.dash.video[0].baseUrl`（dash 流）或 `data.durl[0].url`（普通）
5. 注意：Referer 必须是 `https://www.bilibili.com/`，否则 403

#### 快手 (`v.kuaishou.com/<id>`)

1. 短链跟随 → `www.kuaishou.com/short-video/<photo_id>`
2. HTML 中 `<script>__APOLLO_STATE__ = {...}</script>`
3. JSON 路径：`defaultClient.<key>.photo.manifest.adaptationSet[0].representation[0].url`

#### 通用 fallback

对任意 `http(s)://...mp4` 直链直接走下载分支。

### 2.3 ASR 选型（D 阶段）

短期建议：

**方案 A — 阿里云 NLS (推荐生产)**
- 一句话识别 / 录音文件识别
- 价格：3.5 元/小时
- SDK：`com.alibaba.nls.client`
- 集成点：`marketing-person-infrastructure/.../linkingest/asr/AliyunAsrAdapter.java`

**方案 B — whisper.cpp (本地零成本)**
- 调起本地编译的 `whisper-cli` 二进制
- 模型 `ggml-medium-zh.bin`（约 1.5 GB）
- 集成点：`asr/WhisperAsrAdapter.java`，通过 `ProcessBuilder` 调用
- 速度：M1 Mac 上 1 分钟音频约 30s

**方案 C — Mock（开发期）**
- 直接返回预置文本，便于联调前端
- 集成点：`asr/MockAsrAdapter.java`

抽象接口 `AsrAdapter`，配置 `cm.asr.provider=aliyun|whisper|mock`，初版上 Mock + Whisper 两挡。

### 2.4 数据库结构

新增 `cm_link_ingest_task` 表（COLA dbsdk）：

```sql
CREATE TABLE cm_link_ingest_task (
  id              BIGINT       PRIMARY KEY AUTO_INCREMENT,
  task_id         VARCHAR(40)  NOT NULL UNIQUE,
  source_url      TEXT         NOT NULL,
  platform        VARCHAR(20),         -- douyin / bilibili / xhs / kuaishou / direct
  title           VARCHAR(255),
  media_type      VARCHAR(10),         -- video / audio / image
  asset_code      VARCHAR(40),
  download_status VARCHAR(20),         -- pending / downloading / done / failed
  download_progress TINYINT,
  caption_status  VARCHAR(20),
  caption_progress TINYINT,
  caption_text    LONGTEXT,
  err_msg         TEXT,
  -- 标准 baseFields
  is_deleted      TINYINT      DEFAULT 0,
  create_at       DATETIME,
  create_by       VARCHAR(40),
  create_name     VARCHAR(40),
  update_at       DATETIME,
  update_by       VARCHAR(40),
  update_name     VARCHAR(40),
  nezha_tenant_code VARCHAR(40),
  KEY idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.5 文件落地

```
marketing-person-client/.../linkingest/
  api/CmLinkIngestFeign.java
  cmd/CmLinkIngestParseCmd.java
  cmd/CmLinkIngestDownloadCmd.java
  cmd/CmLinkIngestTranscribeCmd.java
  dto/CmLinkIngestTaskDTO.java
  dto/CmLinkParseResultDTO.java

marketing-person-domain/.../linkingest/
  model/CmLinkIngestTask.java
  ability/CmLinkIngestDomainService.java
  ability/impl/CmLinkIngestDomainServiceImpl.java
  gateway/CmLinkIngestGateway.java

marketing-person-dbsdk/.../linkingest/
  dao/CmLinkIngestTaskDOMapper.java
  model/CmLinkIngestTaskDO.java
  ../resources/.../CmLinkIngestTaskDOMapper.xml

marketing-person-infrastructure/.../app/cutmatrix/linkingest/
  CmLinkIngestController.java
  parser/UrlPlatformResolver.java
  parser/DouyinResolver.java
  parser/BilibiliResolver.java
  parser/XiaohongshuResolver.java
  parser/KuaishouResolver.java
  parser/DirectMediaResolver.java
  download/MediaDownloadService.java   ← OkHttp 流式 + 进度回调
  asr/AsrAdapter.java                  ← interface
  asr/MockAsrAdapter.java
  asr/WhisperAsrAdapter.java
  executor/CmLinkIngestParseExecutor.java
  executor/CmLinkIngestDownloadExecutor.java
  executor/CmLinkIngestTranscribeExecutor.java
  ...gatewayimpl/CmLinkIngestGatewayImpl.java
  ...convertor/CmLinkIngestTaskConvertor.java
  ...convertor/CmLinkIngestTaskDTOConvertor.java
```

### 2.6 前端改动（替换当前 mock）

在 [LinkIngest.tsx](../../../frontend/src/pages/cutmatrix/workflows/LinkIngest.tsx) 中：

1. `apiCreateTasks()` — 现在已有 `/cm/link-ingest/create` fallback，改为先调 `/cm/link-ingest/parse`，按返回的 `LinkParseResultDto[]` 创建任务行（每行 1 个素材，不再硬编码 video/image/audio 三件套）
2. 新增 SSE 监听 `/cm/link-ingest/progress?taskId=...` 替换 `setInterval` 模拟进度
3. `startCaption()` 改为调 `/cm/link-ingest/transcribe`，轮询/SSE 拉转写结果
4. 错误码 `download_link_fetch_failed` 显示为"链接已失效或不支持"
5. `MOCK_CAPTIONS` 数组保留作为 ASR 失败时的最后兜底

---

## 三、实施分期

| 阶段 | 内容 | 工时估计 |
|------|------|---------|
| **P0** | 数据库表 + COLA 骨架 + Parse 接口 + 抖音解析器 | 0.5 天 |
| **P1** | OkHttp 下载 + SSE 进度 + 前端联调 | 0.5 天 |
| **P2** | B站 / 小红书 / 快手解析器 | 0.5 天 |
| **P3** | ASR 接入（先 MockAsr，再 WhisperAsr） | 0.5–1 天 |
| **P4** | 风控对抗、重试、断点续传 | 持续 |

---

## 四、风险点

1. **抖音 / 小红书 反爬**：经常更新签名算法，纯 HTTP 解析失效率约每月一次。生产长期方案是接 [yt-dlp](https://github.com/yt-dlp/yt-dlp)（Python 二进制，社区维护好），通过 `ProcessBuilder` 调起；或买 SaaS 转码（影刀 RPA、灵境）。
2. **B 站 401 / 403**：必须带 `Referer` + 真实 UA + 已登录的 cookies；机房 IP 可能直接被拒。
3. **whisper.cpp 模型许可**：base/medium/large-v3 模型 MIT，可商用。
4. **存储清理**：需要给 `cm-storage` 加 TTL（默认 7 天），避免抖音直链下载堆积。

---

## 五、下一步

待用户确认本方案后，按 P0 → P1 顺序落地。先做 Parse + 单平台（抖音）端到端跑通，再扩展。

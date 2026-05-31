# 语音合成 (tts-batch)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `tts-batch` |
| 前端路由 | `/cutmatrix/wf/tts-batch` |
| 后端 path | `/cm/tts/batch`（待建） |
| catalog 状态 | 内测中（前端 mock） |

## 2. AutoCut 实现参考

- HTML 路由：`/generate/speech.html` → `/generate/speech/workspace.html` → `/generate/speech/jobs.html`
- workspace 选音色 + 语速；jobs 任务队列；输出 zip 包按章节组织
- 后端：远程 TTS（CSP 命中 `autocut.video/api`）。本地无 TTS 模型
- 输出文件组织：`<章节序号><章节名>/<文件序号>-<标题>-版本N.mp3`

## 3. 数据流

输入：`{ shots: [{name, versions: string[]}], voiceId, speed }`
输出：`{ taskId, folderName, files: [{path, audioUrl, durationSec}] }`

## 4. 实现管线

```
ScriptFission 矩阵
  │
  ▼ 用户在 TtsBatch 选版本 + 语速 + 音色
  │
  ▼ POST /cm/tts/batch  （含全部待合成条目）
  │
  ▼ 后端排队：每条调 TtsAdapter.synth(text, voiceId, speed) → mp3
  │   并发 N（推荐 5）控制 QPS
  │
  ▼ 写入 cm-storage，按章节子目录
  │
  ▼ 打 zip 包，URL 落地（保留 24h）
```

## 5. 后端 API

```
POST /cm/tts/batch
Request: { title, voiceId, speed, items: [{shotIdx, versionIdx, name, text}] }
Response: { taskId }

GET /cm/tts/batch/progress?taskId  (SSE)
data: {phase:'synth'|'pack', current, total, file?}

GET /cm/tts/batch/result?taskId
Response: { status, folderName, zipUrl, files: [{path, url, durationSec}] }
```

## 6. TTS 适配层

```
asr/AsrAdapter.java                  ← 复用接口名前缀
tts/TtsAdapter.java
  - synth(text, voiceId, speed) → byte[] mp3
  - listVoices() → List<Voice>
tts/AliyunTtsAdapter.java            阿里云 NLS 语音合成 (~¥3.5/百万字)
tts/VolcTtsAdapter.java              字节火山引擎 TTS (~¥1.5/百万字)
tts/MockTtsAdapter.java              440 Hz beep + tone (开发期)
```

配置：`cm.tts.provider=aliyun|volc|mock` + 密钥

## 7. 数据库

`cm_tts_task`：

```sql
id, task_id, title, voice_id, speed, total_count, done_count, status,
zip_url, expires_at, baseFields...
```

`cm_tts_task_item`：

```sql
id, task_id, shot_idx, version_idx, text, audio_url, duration_sec, status,
err_msg, baseFields...
```

## 8. 前端页面

文件：[TtsBatch.tsx](../../../frontend/src/pages/cutmatrix/workflows/TtsBatch.tsx)

已有：matrix 勾选 + 语速 slider + 音色 grid（22 mock 音色）+ 任务队列 + 查看 modal（按章节文件夹展示）
待补：
- 真实音色列表从 `GET /cm/tts/voices` 拉取
- 试听按钮接 `POST /cm/tts/preview`（短文本即时合成）
- SSE 实时进度替代 mock 即时完成
- 下载 zip 按钮

## 9. 风险

- 阿里云 NLS 默认 5 QPS，批量需走录音文件合成 API（异步）
- 长文本（>1k 字）需切片合成再拼接
- 音色版权：购买商用授权或限定内部使用

## 10. 优先级

**P1** — 与 script-fission 同期，文案产出链下游

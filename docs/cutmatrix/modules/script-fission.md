# 文案裂变 (script-fission)

## 1. 模块标识

| 字段 | 值 |
|------|---|
| key | `script-fission` |
| 前端路由 | `/cutmatrix/wf/script-fission` |
| 后端 path | `/cm/script/fission`（待建） |
| catalog 状态 | 内测中（前端 mock） |

## 2. AutoCut 实现参考

- HTML 路由：`/paraphrase/import.html` → `/paraphrase/split.html` → `/paraphrase/result.html`
- 三步式编辑：导入 → 拆分（按句标点）→ 输出（多版本矩阵）
- 后端：远程 API（CSP 允许 `autocut.video/api`），调 LLM 做改写。本地无 LLM 二进制。
- AutoCut 文案产出格式：每章节文件夹下 `audio/` 配音 + 文本注释；可与 `chapter-extract` 串联。

## 3. 数据流

输入：`{ rawText: string, count: number }` 或 `{ shots: Shot[], count: number }`
输出：`{ matrix: string[][] }`（`shots × versions`）

## 4. 实现管线

```
原始文案
  │
  ▼ Step 1: decomposeText() — 按 [。！？…] 切句
  │
  ▼ Step 2: 用户编辑分镜表（增删改、Enter 拆 / Backspace 合并）
  │
  ▼ Step 3: 用户设置裂变次数 N
  │
  ▼ Step 4: 后端 LLM 调用：每个分镜 × N 次 → 矩阵
  │   prompt: "改写以下口播文案，保持原意，更换措辞。原文：${shot.content}"
  │
  ▼ Step 5: 输出可编辑矩阵 → 保存 / 进 TTS / 保存到 LLM cache
```

## 5. 后端 API

```
POST /cm/script/fission
Request: { title?: string, shots: [{name, content}], count: number }
Response: { matrix: string[][] }   // shape: [shots.length][count]
```

预留 `/cm/script/fission/stream`（SSE，每生成一条版本推一个 chunk）。

## 6. LLM 适配层

新建 `LlmAdapter` 接口，三家实现：

```
infrastructure/.../linkingest/llm/LlmAdapter.java
  - rewrite(String original, int count, String style) → List<String>
infrastructure/.../linkingest/llm/MockLlmAdapter.java   (开发期, 走前置规则)
infrastructure/.../linkingest/llm/QwenLlmAdapter.java   (阿里 DashScope qwen-plus)
infrastructure/.../linkingest/llm/DeepseekLlmAdapter.java
```

配置：`cm.llm.provider=mock|qwen|deepseek` + `cm.llm.api-key=...`

## 7. 数据库

`cm_script_fission_result`：

```sql
id, task_id, title, shots_json, count, matrix_json, llm_provider,
err_msg, baseFields...
```

可选：长期保留供"再裂变""换 LLM 重出"复用。

## 8. 前端页面

文件：[ScriptFission.tsx](../../../frontend/src/pages/cutmatrix/workflows/ScriptFission.tsx)

已有：4 步向导 / 分镜编辑 / 矩阵渲染 / mock LLM (`mockVariant()`)
待补：
- 替换 `apiFission()` mock 为 SSE 拉流
- LLM 失败提示 + 重试按钮
- 风格选项（口播 / 种草 / 电商话术 / 直播话术）

## 9. 风险

- LLM 返回质量参差，需要后置过滤（去重、长度、敏感词）
- 国内 LLM 速率限制：qwen 默认 60 QPS，需要任务队列削峰
- 计费：每个版本 ≈ 200 token，1 次裂变 5 分镜 × 5 版本 = 5000 token ≈ ¥0.05

## 10. 优先级

**P1** — 文案管线核心，下游 TTS/ZhugeMode 都依赖它

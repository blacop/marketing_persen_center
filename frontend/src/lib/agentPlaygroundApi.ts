import {
  agentApi,
  productionApi,
  type AgentInvokeResult,
  type ContentStructureCard,
  type ContentStructureCardGenerateCmd,
  type ScriptBlueprintResult,
  type VideoAssemblyResult,
  type VideoDeconstruction,
  type VideoDeconstructionTask,
  type VideoDeconstructionSubmitUrlCmd,
} from './agentApi'

export type PlaygroundAgentType =
  | 'video-deconstruction'
  | 'content-structure-card'
  | 'script-blueprint'
  | 'video-assembly'
  | 'beukay-claw'
  | 'qianchuan-delivery'
  | 'qianchuan-data'

export type PlaygroundExecutionResult = {
  agent: PlaygroundAgentType
  mode: 'REAL'
  status: 'success' | 'error'
  startedAt: string
  durationMs: number
  requestPayload: unknown
  responsePayload?: unknown
  tracePayload?: unknown
  errorMessage?: string
  taskSnapshot?: VideoDeconstructionTask
  /** 新 workflow 直接返回的业务数据 */
  output?: unknown
  /** 新 workflow 的完整原始响应 */
  rawJson?: unknown
  /** 新 workflow 的 logic trace */
  logicTrace?: unknown
}

type VideoUploadRequest = {
  file: File
  skuId: string
  sourceLabel?: string
  onTaskUpdate?: (task: VideoDeconstructionTask) => void
  pollingIntervalMs?: number
  maxAttempts?: number
}

type VideoUrlRequest = {
  skuId: string
  videoUrl: string
  sourceLabel?: string
  onTaskUpdate?: (task: VideoDeconstructionTask) => void
  pollingIntervalMs?: number
  maxAttempts?: number
}

type PlaygroundApiDeps = {
  submitVideoUnderstandingUpload: (file: File, skuId: string, sourceLabel?: string) => Promise<VideoDeconstructionTask>
  submitVideoUnderstandingUrl: (payload: VideoDeconstructionSubmitUrlCmd) => Promise<VideoDeconstructionTask>
  getVideoUnderstandingTask: (taskId: string) => Promise<VideoDeconstructionTask>
  generateContentStructureCard: (payload: ContentStructureCardGenerateCmd) => Promise<ContentStructureCard>
  generateScriptBlueprint: (payload: {
    skuId: string
    marketingGoal?: string
    marketingNode?: string
    targetAudience?: string
    platform?: string
  }) => Promise<ScriptBlueprintResult>
  generateVideoAssembly: (blueprintCode: string) => Promise<VideoAssemblyResult>
  invokeBeukayClaw: (message: string) => Promise<AgentInvokeResult>
  invokeQianchuanDelivery: (message: string) => Promise<AgentInvokeResult>
  invokeQianchuanData: (message: string) => Promise<AgentInvokeResult>
  sleep: (ms: number) => Promise<void>
}

function nowIso() {
  return new Date().toISOString()
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function isTerminalTask(task: VideoDeconstructionTask) {
  return task.status === 'SUCCEEDED' || task.status === 'FAILED'
}

function formatUploadRequestPayload({ file, skuId, sourceLabel }: VideoUploadRequest) {
  return {
    sourceType: 'LOCAL_FILE',
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    skuId,
    sourceLabel: sourceLabel || undefined,
  }
}

export function extractTracePayload(rawValue?: string | null): unknown | null {
  if (!rawValue || !rawValue.trim()) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return rawValue
  }
}

function mapTaskResult(
  task: VideoDeconstructionTask,
  startedAt: string,
  start: number,
  requestPayload: unknown,
): PlaygroundExecutionResult {
  if (task.status === 'SUCCEEDED' && task.result) {
      return {
      agent: 'video-deconstruction',
      mode: 'REAL',
      status: 'success',
      startedAt,
      durationMs: Date.now() - start,
      requestPayload,
      responsePayload: task.result,
      tracePayload: extractTracePayload(task.result.deconstructionJson),
      taskSnapshot: task,
    }
  }

  return {
    agent: 'video-deconstruction',
    mode: 'REAL',
    status: 'error',
    startedAt,
    durationMs: Date.now() - start,
    requestPayload,
    responsePayload: task,
    tracePayload: extractTracePayload(task.result?.deconstructionJson),
    errorMessage: task.errorMessage ?? task.statusMessage ?? '视频拆解执行失败',
    taskSnapshot: task,
  }
}

export function createPlaygroundApi(
  deps: PlaygroundApiDeps = {
    submitVideoUnderstandingUpload: agentApi.submitVideoUnderstandingUpload,
    submitVideoUnderstandingUrl: agentApi.submitVideoUnderstandingUrl,
    getVideoUnderstandingTask: agentApi.getVideoUnderstandingTask,
    generateContentStructureCard: agentApi.generateContentStructureCard,
    generateScriptBlueprint: productionApi.generateBlueprint,
    generateVideoAssembly: productionApi.generateAssembly,
    invokeBeukayClaw: (message: string) => agentApi.invokeAgent('beukay-claw', message, []),
    invokeQianchuanDelivery: (message: string) => agentApi.invokeAgent('qianchuan-delivery-v1', message, []),
    invokeQianchuanData: (message: string) => agentApi.invokeAgent('qianchuan-data-v1', message, []),
    sleep,
  },
) {
  async function pollTaskUntilTerminal(
    initialTask: VideoDeconstructionTask,
    options: { onTaskUpdate?: (task: VideoDeconstructionTask) => void; pollingIntervalMs?: number; maxAttempts?: number },
  ) {
    const onTaskUpdate = options.onTaskUpdate
    const pollingIntervalMs = options.pollingIntervalMs ?? 2000
    const maxAttempts = options.maxAttempts ?? 60

    let currentTask = initialTask
    onTaskUpdate?.(currentTask)

    if (isTerminalTask(currentTask)) {
      return currentTask
    }

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await deps.sleep(pollingIntervalMs)
      currentTask = await deps.getVideoUnderstandingTask(initialTask.taskId)
      onTaskUpdate?.(currentTask)
      if (isTerminalTask(currentTask)) {
        return currentTask
      }
    }

    throw new Error(`视频拆解轮询超时（taskId=${initialTask.taskId}）`)
  }

  return {
    async runVideoDeconstructionUpload(payload: VideoUploadRequest): Promise<PlaygroundExecutionResult> {
      const startedAt = nowIso()
      const start = Date.now()
      const requestPayload = formatUploadRequestPayload(payload)

      try {
        const submitted = await deps.submitVideoUnderstandingUpload(payload.file, payload.skuId, payload.sourceLabel)
        const task = await pollTaskUntilTerminal(submitted, payload)
        return mapTaskResult(task, startedAt, start, requestPayload)
      } catch (error) {
        return {
          agent: 'video-deconstruction',
          mode: 'REAL',
          status: 'error',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload,
          errorMessage: error instanceof Error ? error.message : '视频拆解执行失败',
          tracePayload: null,
        }
      }
    },

    async runVideoDeconstructionUrl(payload: VideoUrlRequest): Promise<PlaygroundExecutionResult> {
      const startedAt = nowIso()
      const start = Date.now()
      const requestPayload = {
        sourceType: 'REMOTE_URL',
        skuId: payload.skuId,
        videoUrl: payload.videoUrl,
        sourceLabel: payload.sourceLabel || undefined,
      }

      try {
        const submitted = await deps.submitVideoUnderstandingUrl({
          skuId: payload.skuId,
          videoUrl: payload.videoUrl,
          sourceLabel: payload.sourceLabel,
        })
        const task = await pollTaskUntilTerminal(submitted, payload)
        return mapTaskResult(task, startedAt, start, requestPayload)
      } catch (error) {
        return {
          agent: 'video-deconstruction',
          mode: 'REAL',
          status: 'error',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload,
          errorMessage: error instanceof Error ? error.message : '视频拆解执行失败',
          tracePayload: null,
        }
      }
    },

    async runContentStructureCard(payload: ContentStructureCardGenerateCmd): Promise<PlaygroundExecutionResult> {
      const startedAt = nowIso()
      const start = Date.now()

      try {
        const responsePayload = await deps.generateContentStructureCard(payload)
        return {
          agent: 'content-structure-card',
          mode: 'REAL',
          status: 'success',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          responsePayload,
          tracePayload: extractTracePayload(responsePayload.logicTrace),
        }
      } catch (error) {
        return {
          agent: 'content-structure-card',
          mode: 'REAL',
          status: 'error',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          errorMessage: error instanceof Error ? error.message : '结构卡生成执行失败',
          tracePayload: null,
        }
      }
    },

    async runScriptBlueprint(payload: {
      skuId: string
      marketingNode?: string
      targetAudience?: string
      platform?: string
    }): Promise<PlaygroundExecutionResult> {
      const startedAt = nowIso()
      const start = Date.now()
      try {
        const data = await deps.generateScriptBlueprint({ ...payload, marketingGoal: 'SEEDING' })
        return {
          agent: 'script-blueprint',
          mode: 'REAL',
          status: 'success',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          output: data,
          rawJson: data,
          logicTrace: (data as { logicTrace?: unknown } | null)?.logicTrace ?? null,
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '生成失败'
        return {
          agent: 'script-blueprint',
          mode: 'REAL',
          status: 'error',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          output: null,
          rawJson: null,
          logicTrace: null,
          errorMessage: msg,
        }
      }
    },

    async runVideoAssembly(payload: { blueprintCode: string }): Promise<PlaygroundExecutionResult> {
      const startedAt = nowIso()
      const start = Date.now()
      try {
        const data = await deps.generateVideoAssembly(payload.blueprintCode)
        return {
          agent: 'video-assembly',
          mode: 'REAL',
          status: 'success',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          output: data,
          rawJson: data,
          logicTrace: null,
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '生成失败'
        return {
          agent: 'video-assembly',
          mode: 'REAL',
          status: 'error',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          output: null,
          rawJson: null,
          logicTrace: null,
          errorMessage: msg,
        }
      }
    },

    async runBeukayClaw(payload: { message: string }): Promise<PlaygroundExecutionResult> {
      const startedAt = nowIso()
      const start = Date.now()
      try {
        const data = await deps.invokeBeukayClaw(payload.message)
        return {
          agent: 'beukay-claw',
          mode: 'REAL',
          status: 'success',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          output: data,
          rawJson: data,
          logicTrace: null,
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '调用失败'
        return {
          agent: 'beukay-claw',
          mode: 'REAL',
          status: 'error',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          output: null,
          rawJson: null,
          logicTrace: null,
          errorMessage: msg,
        }
      }
    },

    async runQianchuanDelivery(payload: {
      videoUrl: string
      productName: string
      campaignName: string
      dailyBudget: string
      targetAudience: string
    }): Promise<PlaygroundExecutionResult> {
      const startedAt = nowIso()
      const start = Date.now()
      const message = `请帮我将视频素材投放至巨量千川。\n视频URL: ${payload.videoUrl}\n商品名称: ${payload.productName}\n计划名称: ${payload.campaignName}\n日预算: ${payload.dailyBudget}元\n定向人群: ${payload.targetAudience}`
      try {
        const data = await deps.invokeQianchuanDelivery(message)
        return {
          agent: 'qianchuan-delivery',
          mode: 'REAL',
          status: 'success',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          output: data,
          rawJson: data,
          logicTrace: null,
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '投放任务创建失败'
        return {
          agent: 'qianchuan-delivery',
          mode: 'REAL',
          status: 'error',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          output: null,
          rawJson: null,
          logicTrace: null,
          errorMessage: msg,
        }
      }
    },

    async runQianchuanData(payload: {
      advertiserIds: string
      startDate: string
      endDate: string
      dimension: string
    }): Promise<PlaygroundExecutionResult> {
      const startedAt = nowIso()
      const start = Date.now()
      const message = `请获取巨量千川投放数据报表。\n广告主ID: ${payload.advertiserIds}\n时间范围: ${payload.startDate} 至 ${payload.endDate}\n统计维度: ${payload.dimension}`
      try {
        const data = await deps.invokeQianchuanData(message)
        return {
          agent: 'qianchuan-data',
          mode: 'REAL',
          status: 'success',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          output: data,
          rawJson: data,
          logicTrace: null,
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '数据获取失败'
        return {
          agent: 'qianchuan-data',
          mode: 'REAL',
          status: 'error',
          startedAt,
          durationMs: Date.now() - start,
          requestPayload: payload,
          output: null,
          rawJson: null,
          logicTrace: null,
          errorMessage: msg,
        }
      }
    },
  }
}

export const agentPlaygroundApi = createPlaygroundApi()

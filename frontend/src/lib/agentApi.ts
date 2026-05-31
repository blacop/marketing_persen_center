import { apiFetch } from './apiClient'

export type PageQuery = {
  pageIndex: number
  pageSize: number
}

export type PageInfo<T> = {
  records: T[]
  total: number
  pageIndex: number
  pageSize: number
}

type ApiEnvelope<T> = {
  success?: boolean
  code?: number | string
  msg?: string
  message?: string
  data?: T
}

export type AgentDefinition = {
  id: number
  name: string
  description?: string
  status?: string
  agentDefId: string
  behaviorDsl: string
  modelConfig?: string
  businessRules?: string
  skillIds?: string
  version?: string
  publishStatus?: string
  lastPublishAt?: string
  lastPublishBy?: number
  createAt?: string
  createName?: string
}

export type AgentDefinitionPublishResult = {
  publishRecordId: number
  traceId: string
  skillId: string
  agentRegistryId: number
  publishStatus: string
}

export type AgentRegistry = {
  id: number
  name: string
  description?: string
  status?: string
  agentUniqueId?: string
  category?: string
  endpointUrl?: string
  agentType?: string
  version?: string
  ownerId?: string
  definitionId?: number
  definitionVersion?: string
  identityId?: number
  currentSkillId?: string
  endpointType?: string
  createAt?: string
  createName?: string
}

export type SkillRegistry = {
  id: number
  name: string
  description?: string
  status?: string
  skillId: string
  category?: string
  source?: string
  mcpEndpoint?: string
  inputSchema?: string
  trustLevel?: string
  version?: string
  artifactPath?: string
  artifactChecksum?: string
  schemaVersion?: string
  createAt?: string
  createName?: string
}

export type AgentIdentity = {
  id: number
  name: string
  description?: string
  status?: string
  agentUniqueId: string
  publicKey?: string
  authPolicy?: string
  ownerId?: string
  agentType?: string
  createAt?: string
  createName?: string
}

export type AgentTrace = {
  id: number
  traceId: string
  name: string
  description?: string
  status?: string
  agentId?: string
  taskDescription?: string
  traceType?: string
  traceStatus?: string
  definitionId?: number
  registryId?: number
  publishRecordId?: number
  result?: string
  errorMsg?: string
  duration?: number
  startAt?: string
  endAt?: string
  createAt?: string
  createName?: string
}

export type AgentPublishRecord = {
  id: number
  definitionId?: number
  definitionVersion?: string
  skillId?: string
  artifactPath?: string
  artifactChecksum?: string
  publisherType?: string
  publishStatus?: string
  errorMsg?: string
  createAt?: string
  createName?: string
}

export type AgentTraceFilters = {
  name?: string
  status?: string
  agentId?: string
  traceType?: string
  traceStatus?: string
  definitionId?: number
}

export type AgentConversationTurn = {
  role: 'user' | 'assistant'
  content: string
}

export type AgentInvokeResult = {
  reply: string
  agentUniqueId: string
  agentName: string
  traceId: string
}

export type AgentPublishRecordFilters = {
  definitionId?: number
  publishStatus?: string
}

export type VideoDeconstructionCreateCmd = {
  recordId: number
  skuId: string
}

export type VideoDeconstruction = {
  id?: number | string
  recordId?: number | string
  videoId?: string
  skuId?: string
  skuTag?: string
  hookType?: string
  titlePattern?: string
  sceneTags?: string
  sellingPointTags?: string
  ctaTags?: string
  emotionTags?: string
  targetAudienceTags?: string
  deconstructionJson?: string
  actualPerformanceScore?: number
  verificationStatus?: string
  status?: string
  createAt?: string
  createName?: string
}

export type VideoDeconstructionSubmitUrlCmd = {
  skuId: string
  videoUrl: string
  sourceLabel?: string
}

export type VideoDeconstructionTask = {
  taskId: string
  status: string
  sourceType?: string
  sourceName?: string
  skuId?: string
  progressPercent?: number
  stage?: string
  statusMessage?: string
  errorMessage?: string
  createdAt?: string
  startedAt?: string
  completedAt?: string
  result?: VideoDeconstruction
}

export type ContentStructureCardGenerateCmd = {
  skuId: string
  marketingNode?: string
  targetAudience?: string
  accountId?: string
}

export type ContentStructureCard = {
  id?: number
  cardId?: string
  cardVersion?: string
  skuId?: string
  hookType?: string
  targetAudience?: string
  marketingNode?: string
  accountId?: string
  status?: string
  cardJson?: string
  openingHook?: string
  videoDurationSec?: number
  referenceVideoId?: string
  patternRankTop1?: string
  logicTrace?: string
  actualLiveGmv?: number
  actualCompletion?: number
  actualLiveTraffic?: number
  feedbackWrittenAt?: string
  createAt?: string
  createName?: string
}

/**
 * 流式调用 Agent（SSE）。
 * 每收到一行 `data: <text>` 事件就 yield 该行；
 * 收到 `event: done` 或流关闭时停止；收到 `event: error` 时 throw。
 */
export async function* invokeAgentStream(
  agentUniqueId: string,
  message: string,
  history: AgentConversationTurn[] = [],
): AsyncGenerator<string> {
  const response = await apiFetch('/agentRegistry/invokeStream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentUniqueId, message, history }),
  })

  if (!response.ok) throw new Error(`请求失败：${response.status}`)
  if (!response.body) throw new Error('浏览器不支持流式响应')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let lastEventName = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          lastEventName = line.slice(7).trim()
        } else if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (lastEventName === 'done') return
          if (lastEventName === 'error') throw new Error(data || 'Agent 调用失败')
          if (data) yield data
          lastEventName = ''
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * JSON.parse 默认把所有 number 当作 IEEE-754 double，超过 2^53 (16 位) 的 Java Long 会被截断到错误值。
 * 这里把已知 id 类字段(>15 位整数)强制改成字符串，保留全精度，前端在比较 / 透传时统一当 string 处理。
 */
function safeParseJson(raw: string): unknown {
  const fixed = raw.replace(/("(?:id|recordId|definitionId|registryId|publishRecordId|identityId)"\s*:\s*)(-?\d{16,})(?=[,}\]])/g, '$1"$2"')
  return JSON.parse(fixed)
}

async function unwrapResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`)
  }

  const raw = await response.text()
  const payload = safeParseJson(raw) as ApiEnvelope<T>
  const code = payload.code
  const okByCode = code === undefined || code === 0 || code === '0' || code === 200 || code === '200'
  const ok = payload.success === undefined ? okByCode : payload.success

  if (!ok) {
    throw new Error(payload.msg ?? payload.message ?? '请求失败')
  }

  return payload.data as T
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return unwrapResponse<T>(response)
}

async function postForm<T>(path: string, formData: FormData): Promise<T> {
  const response = await apiFetch(path, {
    method: 'POST',
    body: formData,
  })

  return unwrapResponse<T>(response)
}

const defaultPageQuery: PageQuery = { pageIndex: 1, pageSize: 50 }

export const agentApi = {
  listDefinitions: (pageQuery: PageQuery = defaultPageQuery, publishStatus = '') =>
    post<PageInfo<AgentDefinition>>('/agentDefinition/listPage', { pageQuery, publishStatus }),
  getDefinition: (id: number) => post<AgentDefinition>('/agentDefinition/get', { id }),
  createDefinition: (payload: Partial<AgentDefinition> & { name: string; agentDefId: string; behaviorDsl: string }) =>
    post<number>('/agentDefinition/create', payload),
  updateDefinition: (payload: Partial<AgentDefinition> & { id: number; name: string; agentDefId: string; behaviorDsl: string }) =>
    post<boolean>('/agentDefinition/update', payload),
  publishDefinition: (definitionId: number, publishVersion?: string) =>
    post<AgentDefinitionPublishResult>('/agentDefinition/publish', { definitionId, publishVersion }),
  retryPublishDefinition: (definitionId: number) =>
    post<AgentDefinitionPublishResult>('/agentDefinition/retryPublish', { definitionId }),
  archiveDefinition: (definitionId: number) =>
    post<boolean>('/agentDefinition/archive', { definitionId }),

  listRegistries: (pageQuery: PageQuery = defaultPageQuery) =>
    post<PageInfo<AgentRegistry>>('/agentRegistry/listPage', { pageQuery }),
  listActiveRegistries: () =>
    post<PageInfo<AgentRegistry>>('/agentRegistry/listPage', { pageQuery: { pageIndex: 1, pageSize: 50 }, status: 'ACTIVE' }),
  getRegistry: (id: number) => post<AgentRegistry>('/agentRegistry/get', { id }),
  getRegistryByUniqueId: (agentUniqueId: string) =>
    post<AgentRegistry>('/agentRegistry/getByAgentUniqueId', { agentUniqueId }),
  activateRegistry: (id: number) => post<boolean>('/agentRegistry/activate', { id }),
  suspendRegistry: (id: number) => post<boolean>('/agentRegistry/suspend', { id }),
  invokeAgent: (agentUniqueId: string, message: string, history: AgentConversationTurn[] = []) =>
    post<AgentInvokeResult>('/agentRegistry/invoke', { agentUniqueId, message, history }),

  listSkills: (pageQuery: PageQuery = defaultPageQuery) =>
    post<PageInfo<SkillRegistry>>('/skillRegistry/listPage', { pageQuery }),
  getSkill: (id: number) => post<SkillRegistry>('/skillRegistry/get', { id }),
  getSkillBySkillId: (skillId: string) => post<SkillRegistry>('/skillRegistry/getBySkillId', { skillId }),

  listIdentities: (pageQuery: PageQuery = defaultPageQuery) =>
    post<PageInfo<AgentIdentity>>('/agentIdentity/listPage', { pageQuery }),
  getIdentity: (id: number) => post<AgentIdentity>('/agentIdentity/get', { id }),
  createIdentity: (payload: Partial<AgentIdentity> & { name: string; agentUniqueId: string }) =>
    post<number>('/agentIdentity/create', payload),
  updateIdentity: (payload: Partial<AgentIdentity> & { id: number; name: string; agentUniqueId: string }) =>
    post<boolean>('/agentIdentity/update', payload),

  listTraces: (pageQuery: PageQuery = defaultPageQuery, filters: AgentTraceFilters = {}) =>
    post<PageInfo<AgentTrace>>('/agentTrace/listPage', { pageQuery, ...filters }),
  getTrace: (id: number) => post<AgentTrace>('/agentTrace/get', { id }),

  listPublishRecords: (pageQuery: PageQuery = defaultPageQuery, filters: AgentPublishRecordFilters = {}) =>
    post<PageInfo<AgentPublishRecord>>('/agentPublishRecord/listPage', { pageQuery, ...filters }),
  getPublishRecord: (id: number) => post<AgentPublishRecord>('/agentPublishRecord/get', { id }),

  deconstructVideo: (payload: VideoDeconstructionCreateCmd) =>
    post<VideoDeconstruction>('/videoDeconstruction/deconstruct', payload),
  submitVideoUnderstandingUpload: (file: File, skuId: string, sourceLabel?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('skuId', skuId)
    if (sourceLabel) {
      formData.append('sourceLabel', sourceLabel)
    }
    return postForm<VideoDeconstructionTask>('/videoDeconstruction/understandingTask/upload', formData)
  },
  submitVideoUnderstandingUrl: (payload: VideoDeconstructionSubmitUrlCmd) =>
    post<VideoDeconstructionTask>('/videoDeconstruction/understandingTask/url', payload),
  getVideoUnderstandingTask: (taskId: string) =>
    post<VideoDeconstructionTask>('/videoDeconstruction/understandingTask/get', { taskId }),
  generateContentStructureCard: (payload: ContentStructureCardGenerateCmd) =>
    post<ContentStructureCard>('/contentStructureCard/generate', payload),
}

// ============ 生产链路 API ============

export interface ScriptBlueprintSection {
  sectionNo: number
  stageCode: string
  stageName: string
  goal: string
  semanticIntent: string
  narrationHint: string
}

export interface ScriptBlueprintResult {
  blueprintCode: string
  skuId: string
  marketingGoal: string
  marketingNode: string
  platform: string
  recommendedTemplateName: string
  recommendedTemplateReason: string
  blueprintSummary: string
  sections: ScriptBlueprintSection[]
  createAt: string
}

export interface VideoAssemblyResult {
  taskCode: string
  blueprintCode: string
  status: string
  platform: string
  targetDuration: number
}

// ============ 视频素材 API ============

export type VideoSegment = {
  id?: number | string
  index?: number
  startSec?: number
  endSec?: number
  structureTag?: string
  motivation?: string
  technique?: string
  cameraLanguage?: string
  scene?: string
  signalStrength?: number
  keyPhrase?: string
  script?: string
  sellingPoint?: string
  decisiveFrame?: boolean
  decisiveFrameDesc?: string
  influencerLevel?: string
  audiencePersona?: string
  bgm?: string
  rhythm?: string
  wardrobe?: string
  audio?: string
  skinType?: string
  trending?: string
}

export type VideoDeconstructionDetail = VideoDeconstruction & {
  segments?: VideoSegment[]
}

export type VideoAssemblyPlanSection = {
  sectionNo: number
  segmentId?: number | string
  videoId?: string
  selectionReasonJson?: string
}

export type VideoAssemblyCandidate = {
  sectionNo: number
  segmentId?: number | string
  videoId?: string
  similarityScore?: number
  matchReasonJson?: string
  rankNo?: number
  selected?: boolean
}

export type VideoAssemblyTask = {
  id?: number | string
  taskCode?: string
  blueprintCode?: string
  status?: string
  platform?: string
  targetDuration?: number
  resultVideoUrl?: string
  interventionStatus?: string
  summaryJson?: string
  createAt?: string
  createName?: string
  planSections?: VideoAssemblyPlanSection[]
  candidates?: VideoAssemblyCandidate[]
}

/**
 * 根据视频拆解 taskId（= videoId）返回可直接用于 <video src=""> 的流式 URL。
 * 视频文件由后端 LocalTempVideoStorageService 管理，通过 /videoUnderstanding/stream/{taskId} 访问。
 */
export function getVideoStreamUrl(videoId: string | undefined): string | undefined {
  if (!videoId || videoId.startsWith('http://') || videoId.startsWith('https://')) {
    return videoId // 已是完整 URL，直接返回
  }
  return `/videoUnderstanding/stream/${encodeURIComponent(videoId)}`
}

export const videoAssetApi = {
  listDeconstructionResults: (params: { skuId?: string; pageIndex?: number; pageSize?: number } = {}) =>
    post<PageInfo<VideoDeconstructionDetail>>('/videoDeconstruction/listPage', {
      skuId: params.skuId,
      pageQuery: { pageIndex: params.pageIndex ?? 1, pageSize: params.pageSize ?? 20 },
    }),

  getDeconstructionDetail: (id: number | string) =>
    post<VideoDeconstructionDetail>('/videoDeconstruction/get', { id })
      .then(detail => {
        // 后端把 segments 嵌在 deconstructionJson 字符串里，前端兜底解析
        if ((!detail.segments || detail.segments.length === 0) && detail.deconstructionJson) {
          try {
            const parsed = JSON.parse(detail.deconstructionJson)
            if (Array.isArray(parsed?.segments)) {
              detail = { ...detail, segments: parsed.segments as VideoSegment[] }
            }
          } catch { /* ignore parse errors */ }
        }
        return detail
      }),

  listAssemblyTasks: (params: { status?: string; blueprintCode?: string; pageIndex?: number; pageSize?: number } = {}) =>
    post<PageInfo<VideoAssemblyTask>>('/videoAssembly/listPage', {
      status: params.status,
      blueprintCode: params.blueprintCode,
      pageQuery: { pageIndex: params.pageIndex ?? 1, pageSize: params.pageSize ?? 20 },
    }),

  getAssemblyDetail: (taskCode: string) =>
    post<VideoAssemblyTask>('/videoAssembly/get', { taskCode }),

  /**
   * 通过 videoId 反查拆解详情（含 segments 时间轴）。后端 listPage 不支持按 videoId 过滤，
   * 这里先 listPage 再客户端 filter，再调 getDetail 拿 segments。
   */
  findDeconByVideoId: async (videoId: string): Promise<VideoDeconstructionDetail | null> => {
    const list = await post<PageInfo<VideoDeconstructionDetail>>('/videoDeconstruction/listPage', {
      pageQuery: { pageIndex: 1, pageSize: 100 },
    })
    const found = list.records.find(r => r.videoId === videoId)
    if (!found?.id) return null
    return videoAssetApi.getDeconstructionDetail(found.id)
  },
}

export const productionApi = {
  generateBlueprint: (params: {
    skuId: string
    marketingGoal?: string
    marketingNode?: string
    targetAudience?: string
    platform?: string
  }): Promise<ScriptBlueprintResult> =>
    apiFetch('/scriptBlueprint/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }).then(r => r.json()).then(r => {
      if (!r.success) throw new Error(r.errorMessage || '生成失败')
      return r.data
    }),

  generateAssembly: (blueprintCode: string): Promise<VideoAssemblyResult> =>
    apiFetch('/videoAssembly/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blueprintCode }),
    }).then(r => r.json()).then(r => {
      if (!r.success) throw new Error(r.errorMessage || '合成任务创建失败')
      return r.data
    }),

  getBlueprint: (blueprintCode: string): Promise<ScriptBlueprintResult> =>
    apiFetch('/scriptBlueprint/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blueprintCode }),
    }).then(r => r.json()).then(r => {
      if (!r.success) throw new Error(r.errorMessage || '查询失败')
      return r.data
    }),

  listBlueprints: (params: {
    skuId?: string
    marketingGoal?: string
    platform?: string
    status?: string
    pageIndex?: number
    pageSize?: number
  }): Promise<{ records: ScriptBlueprintResult[]; total: number; pageIndex: number; pageSize: number }> =>
    apiFetch('/scriptBlueprint/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skuId: params.skuId,
        marketingGoal: params.marketingGoal,
        platform: params.platform,
        status: params.status,
        pageQuery: { pageIndex: params.pageIndex ?? 1, pageSize: params.pageSize ?? 20 },
      }),
    }).then(r => r.json()).then(r => {
      if (!r.success) throw new Error(r.errorMessage || '查询失败')
      return r.data
    }),

  listStructureCards: (params: {
    skuId?: string
    hookType?: string
    marketingNode?: string
    status?: string
    pageIndex?: number
    pageSize?: number
  } = {}) =>
    post<PageInfo<ContentStructureCard>>('/contentStructureCard/listPage', {
      skuId: params.skuId,
      hookType: params.hookType,
      marketingNode: params.marketingNode,
      status: params.status,
      pageQuery: { pageIndex: params.pageIndex ?? 1, pageSize: params.pageSize ?? 20 },
    }),
}

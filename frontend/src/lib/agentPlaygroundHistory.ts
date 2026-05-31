import type { PlaygroundAgentType, PlaygroundExecutionResult } from './agentPlaygroundApi'

export const AGENT_PLAYGROUND_HISTORY_KEY = 'marketing-person-center.agent-playground.history.v1'
export const AGENT_PLAYGROUND_HISTORY_LIMIT = 50

export type PlaygroundHistoryItem = {
  id: string
  agent: PlaygroundAgentType
  createdAt: string
  status: 'success' | 'error'
  durationMs: number
  requestPayload: unknown
  responsePayload?: unknown
  errorMessage?: string
  tracePayload?: unknown
}

export function createHistoryItem(result: PlaygroundExecutionResult): PlaygroundHistoryItem {
  return {
    id: `${result.agent}-${result.startedAt}-${Math.random().toString(36).slice(2, 8)}`,
    agent: result.agent,
    createdAt: result.startedAt,
    status: result.status,
    durationMs: result.durationMs,
    requestPayload: result.requestPayload,
    responsePayload: result.responsePayload,
    errorMessage: result.errorMessage,
    tracePayload: result.tracePayload,
  }
}

export function appendPlaygroundHistory(
  items: PlaygroundHistoryItem[],
  item: PlaygroundHistoryItem,
): PlaygroundHistoryItem[] {
  return [item, ...items].slice(0, AGENT_PLAYGROUND_HISTORY_LIMIT)
}

export function loadPlaygroundHistory(storage: Storage = window.localStorage): PlaygroundHistoryItem[] {
  const rawValue = storage.getItem(AGENT_PLAYGROUND_HISTORY_KEY)
  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed)
      ? parsed
        .map((item) => {
          const record = item as PlaygroundHistoryItem & { workflow?: PlaygroundAgentType }
          return {
            ...record,
            agent: record.agent ?? record.workflow,
          }
        })
        .filter((item): item is PlaygroundHistoryItem => Boolean(item.agent))
      : []
  } catch {
    storage.removeItem(AGENT_PLAYGROUND_HISTORY_KEY)
    return []
  }
}

export function savePlaygroundHistory(
  items: PlaygroundHistoryItem[],
  storage: Storage = window.localStorage,
) {
  storage.setItem(AGENT_PLAYGROUND_HISTORY_KEY, JSON.stringify(items))
}

export function pushPlaygroundHistory(
  result: PlaygroundExecutionResult,
  storage: Storage = window.localStorage,
) {
  const nextItems = appendPlaygroundHistory(loadPlaygroundHistory(storage), createHistoryItem(result))
  savePlaygroundHistory(nextItems, storage)
  return nextItems
}

import { API_BASE } from '../config/api'

// 拼接后端 API 绝对地址。已经是绝对 URL 的原样返回。
export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const sep = path.startsWith('/') ? '' : '/'
  return `${API_BASE}${sep}${path}`
}

export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(input), init)
}

export function apiEventSource(path: string, init?: EventSourceInit): EventSource {
  return new EventSource(apiUrl(path), init)
}

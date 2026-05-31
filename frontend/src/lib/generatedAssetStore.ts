/**
 * 生成素材本地存储 —— BeukayClaw pipeline 产出写入，AssetLibrary 读取展示
 */

export type GeneratedAssetType = '脚本蓝图' | '视频装配' | '视频拆解' | '结构卡'

export interface GeneratedAsset {
  id: string
  name: string
  type: GeneratedAssetType
  skuId: string
  platforms: string[]
  status: '已生成'
  date: string        // ISO date string
  blueprintCode?: string
  assemblyTaskCode?: string
  sourceCode?: string   // video deconstruction task id
  isNew: true
}

const STORAGE_KEY = 'beukay_generated_assets'

export function saveGeneratedAsset(asset: Omit<GeneratedAsset, 'isNew' | 'date' | 'id'>): GeneratedAsset {
  const full: GeneratedAsset = {
    ...asset,
    id: `GA-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString().slice(0, 10),
    isNew: true,
  }
  const existing = loadGeneratedAssets()
  // cap at 50
  const updated = [full, ...existing].slice(0, 50)
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
  return full
}

export function loadGeneratedAssets(): GeneratedAsset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as GeneratedAsset[]
  } catch {
    return []
  }
}

export function clearGeneratedAssets() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

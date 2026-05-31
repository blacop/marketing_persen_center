import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AIConfigGroup, AILearningStatus } from '../components/AIConfigPanel'

interface AIConfigData {
  groups: AIConfigGroup[]
  learningStatus: AILearningStatus
  moduleName: string
}

interface AIConfigContextType {
  config: AIConfigData | null
  setConfig: (data: AIConfigData | null) => void
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
}

const AIConfigContext = createContext<AIConfigContextType>({
  config: null,
  setConfig: () => {},
  panelOpen: false,
  setPanelOpen: () => {},
})

export function AIConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AIConfigData | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <AIConfigContext.Provider value={{ config, setConfig, panelOpen, setPanelOpen }}>
      {children}
    </AIConfigContext.Provider>
  )
}

/** 页面调用此 hook 注册自己的 AI 配置数据 */
export function useRegisterAIConfig(groups: AIConfigGroup[], learningStatus: AILearningStatus, moduleName: string) {
  const { setConfig } = useContext(AIConfigContext)
  useEffect(() => {
    setConfig({ groups, learningStatus, moduleName })
    return () => setConfig(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleName])
}

export function useAIConfigPanel() {
  const { config, panelOpen, setPanelOpen } = useContext(AIConfigContext)
  return { config, panelOpen, setPanelOpen }
}

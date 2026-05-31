import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 多环境配置入口：frontend/.env.<mode>
//   - development → npm run dev
//   - fat         → npm run build:fat
//   - production  → npm run build
//
// dev 下 VITE_API_BASE 留空：apiClient 出来的相对路径命中 5160，由 vite proxy 转发到本地后端 30000，
// 避开浏览器跨域。fat / prod 构建产物使用绝对 URL 直连后端，需要后端 CORS 放通。
const DEV_BACKEND = 'http://localhost:30000'

const PROXY_PATHS = [
  '/agentDefinition',
  '/agentRegistry',
  '/skillRegistry',
  '/agentIdentity',
  '/agentTrace',
  '/agentPublishRecord',
  '/videoDeconstruction',
  '/contentStructureCard',
  '/scriptBlueprint',
  '/videoAssembly',
  '/videoUnderstanding',
  '/cm',
  '/api',
]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_PUBLIC_PATH || '/'

  const proxy = Object.fromEntries(
    PROXY_PATHS.map((p) => [p, { target: DEV_BACKEND, changeOrigin: true }]),
  )

  return {
    base,
    plugins: [react()],
    server: {
      port: Number(process.env.PORT) || 5160,
      proxy,
    },
  }
})

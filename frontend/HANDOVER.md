# BEA 源码交接说明

## 快速启动

```bash
# 1. 安装依赖（需 Node.js 18+）
npm install

# 2. 本地开发
npm run dev
# → http://localhost:5173

# 3. 生产构建
npm run build

# 4. 部署到 Vercel（需先 npm i -g vercel 并登录自己的账号）
vercel --prod
```

## 项目结构

```
BEA/
├─ src/
│  ├─ pages/             # 55+ 个功能页面（每个即一个智能体/模块）
│  ├─ components/        # 公共组件（Layout、AIConfigPanel 等）
│  ├─ data/              # 模拟数据（agents.ts 含64个智能体定义）
│  ├─ context/           # AIConfigContext 等全局状态
│  ├─ App.tsx            # 路由配置
│  └─ main.tsx           # 入口
├─ public/               # 静态资源
├─ vite.config.ts        # Vite 配置
├─ package.json
└─ LICENSE-REFERENCE.md  # 技术参考授权（必读）
```

## 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 8
- **路由**：react-router-dom v6
- **图表**：Recharts
- **图标**：lucide-react
- **样式**：原生 inline style（无 Tailwind、无 CSS Modules）

## 关键文件速览

| 文件 | 作用 |
|------|------|
| `src/App.tsx` | 全部路由定义（55+ 路由） |
| `src/components/Layout.tsx` | 侧边栏导航 + 顶栏 |
| `src/data/agents.ts` | 64 个智能体数据定义 |
| `src/pages/ContentFlywheel.tsx` | AI 内容飞轮引擎（7 Tab） |
| `src/pages/AgentMatrix.tsx` | 智能体矩阵全景（集群视图/飞轮视图） |
| `src/pages/AIModelCenter.tsx` | 40+ AI 模型中心 |

## 品牌替换清单（使用前必做）

1. `src/components/Layout.tsx` → logo 区域 `玛丽黛佳` / `美妆智能投流中心`
2. `src/data/agents.ts` → 所有示例数据中的"玛丽黛佳"关键词
3. `index.html` → `<title>` 标签
4. 全局搜索并替换品牌关键词：
   ```bash
   grep -rn "玛丽黛佳\|Marie Dalgar\|BEA" src/
   ```
5. 色彩主题：主色位于各页面 inline style 中，搜索 `#e8365d`、`#a78bfa` 批量替换

## 部署注意

- `.vercel/` 目录下的 `project.json` 绑定的是**我的** Vercel 项目，使用前请：
  ```bash
  rm -rf .vercel
  vercel login         # 用你自己的账号登录
  vercel               # 按提示创建新项目
  ```

## 数据说明

- 所有业务数据（ROI、CTR、用户量、GMV 等）均为**模拟数据**
- 所有 AI 模型调用均为**前端模拟**，无真实后端
- 如需对接真实 API，需自行实现后端服务

## 授权须知

⚠️ **使用前请务必阅读 `LICENSE-REFERENCE.md`** — 这是技术参考授权，不得原样商用，必须替换品牌。

如需商业授权，请联系授权方另行洽谈。

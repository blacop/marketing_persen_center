import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AgentMatrix from './pages/AgentMatrix'
import AgentStudio from './pages/AgentStudio'
import AgentPlayground from './pages/AgentPlayground'
import AgentRegistryPage from './pages/AgentRegistryPage'
import SkillRegistryPage from './pages/SkillRegistryPage'
import AgentIdentityMgmt from './pages/AgentIdentityMgmt'
import ContentProduction from './pages/ContentProduction'
import MangaIP from './pages/MangaIP'
import ScriptWorkshop from './pages/ScriptWorkshop'
import VideoProduction from './pages/VideoProduction'
import CreativeStudio from './pages/CreativeStudio'
import AdPlacement from './pages/AdPlacement'
import CampaignManagement from './pages/CampaignManagement'
import DramaAds from './pages/DramaAds'
import GameAds from './pages/GameAds'
import SlotsAds from './pages/SlotsAds'
import GlobalDashboard from './pages/GlobalDashboard'
import FacebookAds from './pages/FacebookAds'
import TikTokGlobal from './pages/TikTokGlobal'
import GoogleAds from './pages/GoogleAds'
import ComplianceHub from './pages/ComplianceHub'
import PlatformManagement from './pages/PlatformManagement'
import BudgetSettlement from './pages/BudgetSettlement'
import Operations from './pages/Operations'
import Analytics from './pages/Analytics'
import SystemMonitor from './pages/SystemMonitor'
import EventBus from './pages/EventBus'
import ContentReview from './pages/ContentReview'
import Settings from './pages/Settings'
import Workbench from './pages/Workbench'
import KOLDiscovery from './pages/KOLDiscovery'
import LocalizationCenter from './pages/LocalizationCenter'
import CompetitiveMonitor from './pages/CompetitiveMonitor'
import AudienceInsights from './pages/AudienceInsights'
import RevenuePortal from './pages/RevenuePortal'
import ExperimentCenter from './pages/ExperimentCenter'
import AntiFraudCenter from './pages/AntiFraudCenter'
import AlertCenter from './pages/AlertCenter'
import AutomationEngine from './pages/AutomationEngine'
import ModelCenter from './pages/AIModelCenter'
import DataHub from './pages/DataHub'
import AttributionCenter from './pages/AttributionCenter'
import LivestreamHub from './pages/LivestreamHub'
import TrendInsights from './pages/TrendInsights'
import PrivateDomain from './pages/PrivateDomain'
import AssetLibrary from './pages/AssetLibrary'
import SentimentCenter from './pages/SentimentCenter'
import InventoryAds from './pages/InventoryAds'
import ReportCenter from './pages/ReportCenter'
import AIDecisionCenter from './pages/AIDecisionCenter'
import AIGuidedLaunch from './pages/AIGuidedLaunch'
import DataWarehouse from './pages/DataWarehouse'
import AIExecutionTracker from './pages/AIExecutionTracker'
import BeukayClaw from './pages/BeukayClaw'
import KnowledgeBase from './pages/KnowledgeBase'
import ConsumerCenter from './pages/ConsumerCenter'
import ContentFlywheel from './pages/ContentFlywheel'
import CutmatrixHome from './pages/cutmatrix/CutmatrixHome'
import CmExplorer from './pages/cutmatrix/CmExplorer'
import CmSettings from './pages/cutmatrix/CmSettings'
import CmDetailPlaceholder from './pages/cutmatrix/CmDetailPlaceholder'
import ParagraphAlign from './pages/cutmatrix/workflows/ParagraphAlign'
import LinkIngest from './pages/cutmatrix/workflows/LinkIngest'
import SubtitleErase from './pages/cutmatrix/workflows/SubtitleErase'
import ScriptFission from './pages/cutmatrix/workflows/ScriptFission'
import TtsBatch from './pages/cutmatrix/workflows/TtsBatch'
import SilenceFilter from './pages/cutmatrix/workflows/SilenceFilter'
import SceneSplit from './pages/cutmatrix/workflows/SceneSplit'
import AspectConvert from './pages/cutmatrix/workflows/AspectConvert'
import AudioOps from './pages/cutmatrix/workflows/AudioOps'
import UniformSplit from './pages/cutmatrix/workflows/UniformSplit'
import ComplianceAudit from './pages/cutmatrix/workflows/ComplianceAudit'
import SemanticSplit from './pages/cutmatrix/workflows/SemanticSplit'
import LiveLoop from './pages/cutmatrix/workflows/LiveLoop'
import CmComposerMode from './pages/cutmatrix/workflows/CmComposerMode'
import ChapterExtract from './pages/cutmatrix/workflows/ChapterExtract'
import CmToolRunner from './pages/cutmatrix/tools/CmToolRunner'
import VideoComposerPage from './pages/composition/VideoComposerPage'
import { AIConfigProvider } from './context/AIConfigContext'

export default function App() {
  return (
    <AIConfigProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="agents" element={<AgentMatrix />} />
          <Route path="agent-studio" element={<AgentStudio />} />
          <Route path="agent-playground" element={<AgentPlayground />} />
          <Route path="agent-playground/:agentKey" element={<AgentPlayground />} />
          <Route path="agent-registry" element={<AgentRegistryPage />} />
          <Route path="skill-registry" element={<SkillRegistryPage />} />
          <Route path="agent-identities" element={<AgentIdentityMgmt />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          {/* 人工工作台 */}
          <Route path="workbench" element={<Workbench />} />
          <Route path="beukay-claw" element={<BeukayClaw />} />
          {/* 生产即投飞轮 */}
          <Route path="content" element={<ContentProduction />} />
          <Route path="content/manga" element={<MangaIP />} />
          <Route path="content/script" element={<ScriptWorkshop />} />
          <Route path="content/video" element={<VideoProduction />} />
          <Route path="content/composer" element={<VideoComposerPage />} />
          {/* AI生产即投 */}
          <Route path="content/creative" element={<CreativeStudio />} />
          <Route path="content/review" element={<ContentReview />} />
          {/* AI投手系统 */}
          <Route path="ads" element={<AdPlacement />} />
          <Route path="ads/campaigns" element={<CampaignManagement />} />
          <Route path="ads/kuaishou" element={<DramaAds />} />
          <Route path="ads/douyin" element={<GameAds />} />
          <Route path="ads/xiaohongshu" element={<SlotsAds />} />
          <Route path="ads/tiktok-global" element={<TikTokGlobal />} />
          <Route path="ads/google" element={<GoogleAds />} />
          <Route path="ads/platforms" element={<PlatformManagement />} />
          {/* 🌍 国际投放 */}
          <Route path="intl/dashboard" element={<GlobalDashboard />} />
          <Route path="intl/facebook" element={<FacebookAds />} />
          <Route path="intl/tiktok" element={<TikTokGlobal />} />
          <Route path="intl/google" element={<GoogleAds />} />
          <Route path="intl/compliance" element={<ComplianceHub />} />
          <Route path="ads/budget" element={<BudgetSettlement />} />
          {/* 运营生态 */}
          <Route path="operations" element={<Operations />} />
          <Route path="kol-discovery" element={<KOLDiscovery />} />
          <Route path="localization" element={<LocalizationCenter />} />
          {/* 情报与受众 */}
          <Route path="competitive" element={<CompetitiveMonitor />} />
          <Route path="audience" element={<AudienceInsights />} />
          <Route path="revenue" element={<RevenuePortal />} />
          {/* AI决策系统 */}
          <Route path="ai-decisions" element={<AIDecisionCenter />} />
          <Route path="ai-launch" element={<AIGuidedLaunch />} />
          <Route path="data-hub" element={<DataHub />} />
          <Route path="data-warehouse" element={<DataWarehouse />} />
          <Route path="ai-tracker" element={<AIExecutionTracker />} />
          <Route path="attribution" element={<AttributionCenter />} />
          <Route path="livestream" element={<LivestreamHub />} />
          <Route path="trends" element={<TrendInsights />} />
          {/* AI内容飞轮引擎 */}
          <Route path="flywheel" element={<ContentFlywheel />} />
          {/* 视频矩阵 (Cutmatrix) — 隔离命名空间 */}
          <Route path="cutmatrix" element={<CutmatrixHome defaultTab="workflow" />} />
          <Route path="cutmatrix/tools" element={<CutmatrixHome defaultTab="tool" />} />
          <Route path="cutmatrix/explorer" element={<CmExplorer />} />
          <Route path="cutmatrix/settings" element={<CmSettings />} />
          <Route path="cutmatrix/wf/link-ingest" element={<LinkIngest />} />
          <Route path="cutmatrix/wf/subtitle-erase" element={<SubtitleErase />} />
          <Route path="cutmatrix/tool/subtitle-erase" element={<SubtitleErase />} />
          <Route path="cutmatrix/wf/script-fission" element={<ScriptFission />} />
          <Route path="cutmatrix/wf/tts-batch" element={<TtsBatch />} />
          <Route path="cutmatrix/wf/silence-filter" element={<SilenceFilter />} />
          <Route path="cutmatrix/wf/scene-split" element={<SceneSplit />} />
          <Route path="cutmatrix/wf/zhuge-mode" element={<VideoComposerPage />} />
          <Route path="cutmatrix/wf/aspect-convert" element={<AspectConvert />} />
          <Route path="cutmatrix/wf/audio-ops" element={<AudioOps />} />
          <Route path="cutmatrix/wf/uniform-split" element={<UniformSplit />} />
          <Route path="cutmatrix/wf/compliance-audit" element={<ComplianceAudit />} />
          <Route path="cutmatrix/wf/semantic-split" element={<SemanticSplit />} />
          <Route path="cutmatrix/wf/live-loop" element={<LiveLoop />} />
          <Route path="cutmatrix/wf/paragraph-align" element={<ParagraphAlign />} />
          <Route path="cutmatrix/wf/sunwukong-mode" element={<CmComposerMode />} />
          <Route path="cutmatrix/wf/chapter-extract" element={<ChapterExtract />} />
          <Route path="cutmatrix/wf/:key" element={<CmDetailPlaceholder category="workflow" />} />
          <Route path="cutmatrix/tool/aspect-convert" element={<CmToolRunner />} />
          <Route path="cutmatrix/tool/audio-ops" element={<CmToolRunner />} />
          <Route path="cutmatrix/tool/uniform-split" element={<CmToolRunner />} />
          <Route path="cutmatrix/tool/silence-filter" element={<CmToolRunner />} />
          <Route path="cutmatrix/tool/scene-split" element={<CmToolRunner />} />
          <Route path="cutmatrix/tool/subtitle-gen" element={<CmToolRunner />} />
          <Route path="cutmatrix/tool/add-bg" element={<CmToolRunner />} />
          <Route path="cutmatrix/tool/text-style-fission" element={<CmToolRunner />} />
          <Route path="cutmatrix/tool/:key" element={<CmDetailPlaceholder category="tool" />} />
          {/* 营销C端运营 */}
          <Route path="consumer" element={<ConsumerCenter />} />
          {/* 私域与资产 */}
          <Route path="private-domain" element={<PrivateDomain />} />
          <Route path="asset-library" element={<AssetLibrary />} />
          <Route path="sentiment" element={<SentimentCenter />} />
          <Route path="inventory" element={<InventoryAds />} />
          <Route path="reports" element={<ReportCenter />} />
          {/* 数据与系统 */}
          <Route path="analytics" element={<Analytics />} />
          <Route path="experiments" element={<ExperimentCenter />} />
          <Route path="anti-fraud" element={<AntiFraudCenter />} />
          <Route path="alerts" element={<AlertCenter />} />
          <Route path="automation" element={<AutomationEngine />} />
          <Route path="system" element={<SystemMonitor />} />
          <Route path="events" element={<EventBus />} />
          <Route path="models" element={<ModelCenter />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AIConfigProvider>
  )
}

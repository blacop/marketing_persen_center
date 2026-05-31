# 全量飞轮组合：业务页面分组图

## 结论
建议采用：**主飞轮 + 支撑平面**。

原因：
- 更适合后续按飞轮逐个搭建 agent
- 不会把 Agent OS / 系统治理类页面硬塞进某条业务飞轮
- 便于后续把 Agent Matrix 变成各飞轮 agent 的能力地图

---

## 飞轮 1：内容生产飞轮
从产品、脚本、素材、审核到内容产出。

关联页面：
- `/flywheel`
- `/content`
- `/content/manga`
- `/content/script`
- `/content/video`
- `/content/creative`
- `/content/review`
- `/asset-library`

---

## 飞轮 2：达人种草飞轮
从达人发现、合作运营、内容适配到种草分发。

关联页面：
- `/operations`
- `/kol-discovery`
- `/localization`
- `/sentiment`

---

## 飞轮 3：投放优化飞轮
从计划、决策、投放、预算到自动化执行。

关联页面：
- `/ads`
- `/ads/campaigns`
- `/ads/kuaishou`
- `/ads/douyin`
- `/ads/xiaohongshu`
- `/ads/tiktok-global`
- `/ads/google`
- `/ads/platforms`
- `/ads/budget`
- `/ai-decisions`
- `/ai-launch`
- `/automation`

---

## 飞轮 4：国际投放飞轮
全球市场投放、合规、渠道与本地化协同。

关联页面：
- `/intl/dashboard`
- `/intl/facebook`
- `/intl/tiktok`
- `/intl/google`
- `/intl/compliance`

---

## 飞轮 5：消费者运营飞轮
从私域触达、复购运营到消费者生命周期管理。

关联页面：
- `/consumer`
- `/private-domain`
- `/inventory`
- `/workbench`

---

## 飞轮 6：数据归因反馈飞轮
采集、建模、归因、实验、追踪、分析、反馈。

关联页面：
- `/data-hub`
- `/data-warehouse`
- `/models`
- `/attribution`
- `/ai-tracker`
- `/experiments`
- `/analytics`
- `/reports`
- `/alerts`
- `/anti-fraud`
- `/events`

---

## 共享支撑平面（不建议硬塞进飞轮）

### Agent OS
- `/agent-studio`
- `/agent-registry`
- `/skill-registry`
- `/agent-identities`

### 平台 / 系统治理
- `/system`
- `/settings`
- `/beukay-claw`

### 公共情报输入
- `/competitive`
- `/audience`
- `/revenue`
- `/livestream`
- `/trends`

---

## 后续实施建议
1. 先完成这份“页面 → 飞轮”全量映射，作为后续 agent 规划的主视图
2. 再从一条飞轮开始，定义该飞轮的核心 agent 集合
3. 将这些 agent 逐步落到底座：`AgentDefinition / AgentIdentity / Skill / Registry / Trace`
4. 最后让 Agent Matrix 成为这些飞轮 agent 的能力地图，而不是先做全量静态矩阵

---

## 当前推荐
优先采用：**主飞轮 + 支撑平面**。

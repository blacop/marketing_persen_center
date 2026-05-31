# 巨量千川 MCP 工具清单

> 来源：https://open.oceanengine.com/labels/12/docs/1847297003631945
>
> 用途：本项目两个千川 Agent（`qianchuan-delivery-v1` 与 `qianchuan-data-v1`）的工具调用清单与接入指引。

---

## 1. 接入概览

- **当前 MCP Server 名称**：`qianchuan-mock-mcp-server`
- **当前基础域名**：`mock://qianchuan-api`
- **当前阶段**：本地 mock MCP + mock 千川 API，先跑通 Agent → MCP → API → Reply 链路
- **真实 MCP Server 名称（后续）**：`qianchuan-mcp-server`
- **认证方式**：OAuth 2.0 + `access_token`（每次调用必传）
- **必传上下文**：`advertiser_id`（广告主 ID），跨账户操作需要逐账户切换 token
- **真实基础域名（后续）**：`https://api.oceanengine.com`
- **接口前缀**：`/open_api/v1.0/qianchuan/...`
- **限流**：单计划预算修改一天最多 20 次；批量启停单次 ≤ 10 个计划
- **行业限制**：短视频投放需校验「短视频带货权限」，直播投放需校验「直播带货权限」

---

## 2. 千川投放 Agent（`qianchuan-delivery-v1`）

### 2.1 标准投放链路

```
1. 取可投资源     → qianchuan_aweme_authorized_get_v1（抖音号）
                   qianchuan_product_available_get_v1（商品）
2. 上传视频素材   → file_video_ad_v2  →  得到 video_id
3. 取建议参数     → qianchuan_suggest_budget_v1
                   qianchuan_suggest_bid_v1 / qianchuan_suggest_roi_goal_v1
4. 创建广告组     → qianchuan_campaign_create_v1（marketing_goal=LIVE_PROM_GOODS）
5. 预估效果       → qianchuan_estimate_effect_v1（用户确认）
6. 创建广告计划   → qianchuan_ad_create_v1（绑定 video_id / 商品 / 抖音号）
7. 验证状态       → qianchuan_ad_get_v1
```

### 2.2 工具白名单（17 个）

| 工具 | 用途 |
|------|------|
| `file_video_ad_v2` | 上传视频素材，返回 video_id |
| `qianchuan_aweme_authorized_get_v1` | 已授权可投抖音号列表 |
| `qianchuan_product_available_get_v1` | 可投商品列表 |
| `qianchuan_campaign_create_v1` | 创建广告组（直播带货） |
| `qianchuan_ad_create_v1` | 创建广告计划 |
| `qianchuan_estimate_effect_v1` | 预估投放效果 |
| `qianchuan_suggest_budget_v1` | 建议日预算 |
| `qianchuan_suggest_bid_v1` | 建议出价 |
| `qianchuan_suggest_roi_goal_v1` | 建议 ROI 目标 |
| `qianchuan_ad_get_v1` | 计划状态查询 |
| `qianchuan_ad_status_update_v1` | 启用/暂停/删除（≤10 条/次） |
| `qianchuan_ad_budget_update_v1` | 修改预算（≤20 次/天） |
| `qianchuan_ad_bid_update_v1` | 修改出价 |
| `qianchuan_roi_goal_update_v1` | 修改 ROI 目标 |
| `qianchuan_tools_smart_boost_ad_boost_set_v1` | 一键起量 |
| `qianchuan_ad_detail_get_v1` | 计划详情 |
| `qianchuan_ad_reject_reason_v1` | 审核拒绝原因 |

---

## 3. 千川数据 Agent（`qianchuan-data-v1`）

### 3.1 分析维度

| 维度 | 主要工具 |
|------|----------|
| 账户/计划 | `qianchuan_report_advertiser_get_v1`、`qianchuan_report_ad_get_v1`、`qianchuan_report_creative_get_v1`、`qianchuan_finance_wallet_get_v1` |
| 素材 | `qianchuan_report_material_get_v1`、`qianchuan_report_ad_material_get_v1`、`qianchuan_material_get_v1`、`qianchuan_file_video_efficiency_get_v1` |
| 直播 | `qianchuan_report_live_get_v1`、`qianchuan_today_live_room_get_v1`、`qianchuan_today_live_room_flow_performance_get_v1`、`qianchuan_today_live_room_detail_get_v1` |
| 异常诊断 | `qianchuan_lq_ad_get_v1`、`qianchuan_ad_learing_status_get_v1`、`qianchuan_ad_compensate_status_get_v1` |
| 搜索词 | `qianchuan_report_search_word_get_v1` |

### 3.2 必传参数

- `advertiser_id`：广告主 ID
- `start_date` / `end_date`：YYYY-MM-DD
- 缺参时主动追问

### 3.3 输出指标

ROI、CTR、GPM、完播率、CPM、CVR、cost、gmv

### 3.4 报告分节

账户概览 / 计划分析 / 素材分析 / 直播分析 / 低效诊断 / 优化建议

---

## 4. 完整工具目录（按模块）

> 本节列出官网公开的 150+ 工具名称，作为后续扩展白名单时的查询索引。

### 4.1 广告主

`qianchuan_advertiser_info_v1`、`qianchuan_advertiser_public_info_v1`、`qianchuan_advertiser_avatar_get_v1`、`qianchuan_advertiser_update_v1`、`qianchuan_advertiser_aweme_bind_v1`、`qianchuan_aweme_authorized_get_v1`

### 4.2 财务

`qianchuan_finance_wallet_get_v1`、`qianchuan_finance_transaction_get_v1`、`qianchuan_finance_invoice_grant_get_v1`

### 4.3 商品

`qianchuan_product_available_get_v1`、`qianchuan_product_promotion_get_v1`、`qianchuan_product_label_get_v1`

### 4.4 素材（上传/查询/低效）

`file_image_ad_v1`、`file_video_ad_v2`、`qianchuan_material_get_v1`、`qianchuan_material_label_v1`、`qianchuan_creative_material_check_v1`、`qianchuan_file_video_efficiency_get_v1`

### 4.5 广告组（Campaign）

`qianchuan_campaign_create_v1`、`qianchuan_campaign_update_v1`、`qianchuan_campaign_status_update_v1`、`qianchuan_campaign_get_v1`、`qianchuan_campaign_detail_get_v1`、`qianchuan_campaign_budget_update_v1`

### 4.6 广告计划（Ad）

`qianchuan_ad_create_v1`、`qianchuan_ad_update_v1`、`qianchuan_ad_get_v1`、`qianchuan_ad_detail_get_v1`、`qianchuan_ad_status_update_v1`、`qianchuan_ad_budget_update_v1`、`qianchuan_ad_bid_update_v1`、`qianchuan_roi_goal_update_v1`、`qianchuan_ad_reject_reason_v1`、`qianchuan_ad_learing_status_get_v1`、`qianchuan_ad_compensate_status_get_v1`、`qianchuan_lq_ad_get_v1`、`qianchuan_estimate_effect_v1`

### 4.7 智能投放工具

`qianchuan_tools_smart_boost_ad_boost_set_v1`、`qianchuan_tools_smart_boost_ad_boost_get_v1`、`qianchuan_tools_target_audience_recommend_v1`、`qianchuan_suggest_budget_v1`、`qianchuan_suggest_bid_v1`、`qianchuan_suggest_roi_goal_v1`

### 4.8 报表（Report）

`qianchuan_report_advertiser_get_v1`、`qianchuan_report_ad_get_v1`、`qianchuan_report_creative_get_v1`、`qianchuan_report_material_get_v1`、`qianchuan_report_ad_material_get_v1`、`qianchuan_report_live_get_v1`、`qianchuan_report_search_word_get_v1`、`qianchuan_report_audience_get_v1`、`qianchuan_report_product_get_v1`

### 4.9 直播（Live）

`qianchuan_today_live_room_get_v1`、`qianchuan_today_live_room_detail_get_v1`、`qianchuan_today_live_room_flow_performance_get_v1`、`qianchuan_live_room_history_get_v1`

### 4.10 全域推广

`qianchuan_omni_campaign_create_v1`、`qianchuan_omni_campaign_update_v1`、`qianchuan_omni_campaign_status_update_v1`、`qianchuan_omni_report_get_v1`

### 4.11 人群（DMP）

`qianchuan_audience_package_get_v1`、`qianchuan_audience_package_create_v1`、`qianchuan_audience_package_update_v1`、`qianchuan_audience_package_delete_v1`

---

## 5. 项目接入实现

### 5.1 后端实现位置

| 组件 | 路径 |
|------|------|
| Invoker | `marketing-person-infrastructure/.../service/QianchuanMcpInvoker.java` |
| Mock MCP Runtime | `marketing-person-infrastructure/.../service/QianchuanMockMcpRuntime.java` |
| Mock API Client | `marketing-person-infrastructure/.../service/QianchuanMockApiClient.java` |
| 路由 | `AgentInvokeAppService.invoke()` 按 `agentUniqueId` 前缀 `qianchuan-` 走 MCP 通路 |
| 配置 | `application-local.yaml` 下 `qianchuan.mcp.*` |
| 种子数据 | `marketing-person-dbsdk/src/main/resources/sql/V20260430__qianchuan_agents.sql` |

### 5.2 配置项

```yaml
qianchuan:
  mcp:
    enabled: true
    base-url: ${QIANCHUAN_MOCK_BASE_URL:mock://qianchuan-api}
    server-name: qianchuan-mock-mcp-server
    access-token: ${QIANCHUAN_ACCESS_TOKEN:}
    advertiser-id: ${QIANCHUAN_ADVERTISER_ID:}
    timeout-seconds: 60
```

### 5.3 注意事项

- 当前不会调用真实巨量千川接口；所有结果来自本地 mock API
- 投放 Agent 已 mock 跑通：取抖音号、取商品、上传视频、建议预算/出价、创建广告组、预估效果、创建广告计划、查询状态
- 数据 Agent 已 mock 跑通：账户报表、计划报表、素材报表、低效计划诊断
- `access_token` 通过环境变量注入，**禁止**写入仓库
- 单 Agent 调用前先校验 token 与 advertiser_id 是否齐全；缺失时由 Agent 主动向用户追问
- 写操作类工具（`*_create_v1` / `*_update_v1` / `*_status_update_v1`）必须经用户确认后执行
- 限频策略由 Invoker 在客户端做兜底统计，避免触达官方限流

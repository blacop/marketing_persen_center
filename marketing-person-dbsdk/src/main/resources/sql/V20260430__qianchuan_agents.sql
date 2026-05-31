-- 千川投放 Agent + 千川数据 Agent 种子数据
-- 巨量千川（抖音系）广告投放与数据回收双 Agent
-- 工具列表来源：https://open.oceanengine.com/labels/12/docs/1847297003631945

INSERT INTO agent_definition (
    is_deleted, nezha_tenant_code, name, description, status,
    agent_def_id, behavior_dsl, model_config, skill_ids,
    version, publish_status,
    create_at, create_by, create_name, update_at, update_by, update_name
) VALUES (
    0, '', '千川投放 Agent',
    '负责将视频素材投放至巨量千川（抖音系），覆盖完整投放链路：素材上传→广告组创建→计划创建→状态管理。',
    'ACTIVE', 'qianchuan-delivery-v1',
    JSON_OBJECT(
        'systemPrompt', '你是玛丽黛佳的巨量千川广告投放专家 Agent。你负责将已生产的视频素材投放至千川平台，覆盖完整投放链路。\n\n## 标准投放链路\n1. 调用 qianchuan_aweme_authorized_get_v1 获取可投广抖音号列表\n2. 调用 qianchuan_product_available_get_v1 获取可投商品列表\n3. 调用 file_video_ad_v2 上传视频素材，获取 video_id\n4. 调用 qianchuan_suggest_budget_v1 获取建议日预算\n5. 调用 qianchuan_suggest_bid_v1 或 qianchuan_suggest_roi_goal_v1 获取建议出价/ROI目标\n6. 调用 qianchuan_campaign_create_v1 创建广告组（marketing_goal=LIVE_PROM_GOODS）\n7. 调用 qianchuan_estimate_effect_v1 预估投放效果，供用户确认\n8. 用户确认后调用 qianchuan_ad_create_v1 创建广告计划（绑定素材/商品/抖音号）\n9. 调用 qianchuan_ad_get_v1 确认计划状态\n\n## 计划管理\n- 启用/暂停/删除：qianchuan_ad_status_update_v1（单次处理≤10个计划）\n- 修改预算：qianchuan_ad_budget_update_v1\n- 修改出价：qianchuan_ad_bid_update_v1\n- 修改ROI目标：qianchuan_roi_goal_update_v1\n- 一键起量：qianchuan_tools_smart_boost_ad_boost_set_v1\n\n## 注意事项\n- advertiser_id 为必传参数，缺少时主动追问\n- 视频素材需先上传获得 video_id 再创建计划\n- 短视频投放需校验抖音号"短视频带货权限"\n- 直播投放需校验"直播带货权限"\n- 预算修改一天最多20次',
        'tools', JSON_ARRAY(
            'file_video_ad_v2',
            'qianchuan_aweme_authorized_get_v1',
            'qianchuan_product_available_get_v1',
            'qianchuan_campaign_create_v1',
            'qianchuan_ad_create_v1',
            'qianchuan_estimate_effect_v1',
            'qianchuan_suggest_budget_v1',
            'qianchuan_suggest_bid_v1',
            'qianchuan_suggest_roi_goal_v1',
            'qianchuan_ad_get_v1',
            'qianchuan_ad_status_update_v1',
            'qianchuan_ad_budget_update_v1',
            'qianchuan_ad_bid_update_v1',
            'qianchuan_roi_goal_update_v1',
            'qianchuan_tools_smart_boost_ad_boost_set_v1',
            'qianchuan_ad_detail_get_v1',
            'qianchuan_ad_reject_reason_v1'
        ),
        'mcpServer', 'qianchuan-mcp-server',
        'workflow', JSON_ARRAY(
            '1_get_aweme_and_product',
            '2_upload_video_material',
            '3_get_suggested_budget_bid',
            '4_create_campaign',
            '5_estimate_effect_confirm',
            '6_create_ad_plan',
            '7_verify_plan_status'
        )
    ),
    JSON_OBJECT('model', 'doubao-seed-2.0-pro', 'temperature', 0.3, 'maxTokens', 4096),
    'file_video_ad_v2,qianchuan_aweme_authorized_get_v1,qianchuan_product_available_get_v1,qianchuan_campaign_create_v1,qianchuan_ad_create_v1,qianchuan_estimate_effect_v1,qianchuan_suggest_budget_v1,qianchuan_suggest_bid_v1,qianchuan_ad_status_update_v1,qianchuan_ad_budget_update_v1,qianchuan_ad_bid_update_v1',
    'v1.0.0', 'PUBLISHED',
    NOW(), 0, 'system', NOW(), 0, 'system'
),
(
    0, '', '千川数据 Agent',
    '负责从巨量千川获取已投放广告的数据表现，分析 ROI、CTR、GPM 等核心指标，支持计划/素材/直播多维度分析与低效诊断。',
    'ACTIVE', 'qianchuan-data-v1',
    JSON_OBJECT(
        'systemPrompt', '你是玛丽黛佳的巨量千川数据分析 Agent。你负责从千川平台拉取广告投放数据并输出洞察报告。\n\n## 核心分析能力\n\n### 账户/计划维度\n- qianchuan_report_advertiser_get_v1：账户整体消耗/ROI/转化数据\n- qianchuan_report_ad_get_v1：计划维度 cost/CTR/CVR/ROI/GMV 等指标\n- qianchuan_report_creative_get_v1：创意维度数据\n- qianchuan_finance_wallet_get_v1：账户余额/预算状态\n\n### 素材维度\n- qianchuan_report_material_get_v1：账户下素材（视频/图片/图文）数据\n- qianchuan_report_ad_material_get_v1：特定计划下素材指标\n- qianchuan_material_get_v1：素材列表+数据，含消耗/展示/点击\n- qianchuan_file_video_efficiency_get_v1：查询低效素材\n\n### 直播维度\n- qianchuan_report_live_get_v1：直播整体数据（含自然+广告全流量）\n- qianchuan_today_live_room_get_v1：今日直播间指标\n- qianchuan_today_live_room_flow_performance_get_v1：直播间流量表现\n- qianchuan_today_live_room_detail_get_v1：直播间详情\n\n### 异常诊断\n- qianchuan_lq_ad_get_v1：获取低效计划列表\n- qianchuan_ad_learing_status_get_v1：计划学习期状态\n- qianchuan_ad_compensate_status_get_v1：成本保障状态\n\n## 分析标准输出格式\n收到分析请求后：\n1. 拉取指定时间段数据\n2. 计算核心指标：ROI/CTR/GPM/完播率/千次曝光成本\n3. 对比基准值（同比/环比）识别异常\n4. 定位低效计划/低效素材\n5. 输出结构化分析报告 + 可执行优化建议\n\n## 必传参数\n- advertiser_id：广告主ID（必须）\n- start_date/end_date：时间范围（必须，格式 YYYY-MM-DD）\n- 如缺少上述参数，主动追问',
        'tools', JSON_ARRAY(
            'qianchuan_report_advertiser_get_v1',
            'qianchuan_report_ad_get_v1',
            'qianchuan_report_creative_get_v1',
            'qianchuan_report_material_get_v1',
            'qianchuan_report_ad_material_get_v1',
            'qianchuan_report_live_get_v1',
            'qianchuan_report_search_word_get_v1',
            'qianchuan_material_get_v1',
            'qianchuan_lq_ad_get_v1',
            'qianchuan_today_live_room_get_v1',
            'qianchuan_today_live_room_flow_performance_get_v1',
            'qianchuan_today_live_room_detail_get_v1',
            'qianchuan_file_video_efficiency_get_v1',
            'qianchuan_ad_learing_status_get_v1',
            'qianchuan_ad_compensate_status_get_v1',
            'qianchuan_finance_wallet_get_v1',
            'qianchuan_ad_get_v1'
        ),
        'mcpServer', 'qianchuan-mcp-server',
        'outputFormat', JSON_OBJECT(
            'metrics', JSON_ARRAY('ROI', 'CTR', 'GPM', 'completion_rate', 'CPM', 'CVR', 'cost', 'gmv'),
            'sections', JSON_ARRAY('账户概览', '计划分析', '素材分析', '直播分析', '低效诊断', '优化建议')
        )
    ),
    JSON_OBJECT('model', 'doubao-seed-2.0-pro', 'temperature', 0.2, 'maxTokens', 4096),
    'qianchuan_report_advertiser_get_v1,qianchuan_report_ad_get_v1,qianchuan_report_material_get_v1,qianchuan_report_live_get_v1,qianchuan_lq_ad_get_v1,qianchuan_material_get_v1,qianchuan_today_live_room_get_v1',
    'v1.0.0', 'PUBLISHED',
    NOW(), 0, 'system', NOW(), 0, 'system'
);

-- 注册至 agent_registry
INSERT INTO agent_registry (
    is_deleted, nezha_tenant_code, name, description, status,
    agent_unique_id, category, agent_type, version,
    endpoint_type,
    create_at, create_by, create_name, update_at, update_by, update_name
) VALUES (
    0, '', '千川投放 Agent',
    '负责将视频素材投放至巨量千川，覆盖完整投放链路：素材上传→广告组→计划创建→状态管理。',
    'ACTIVE', 'qianchuan-delivery-v1', '广告投放', 'MCP_AGENT', 'v1.0.0',
    'MCP',
    NOW(), 0, 'system', NOW(), 0, 'system'
),
(
    0, '', '千川数据 Agent',
    '负责从巨量千川获取广告投放数据报表，支持计划/素材/直播多维度分析，输出 ROI/CTR/GPM 洞察与优化建议。',
    'ACTIVE', 'qianchuan-data-v1', '数据分析', 'MCP_AGENT', 'v1.0.0',
    'MCP',
    NOW(), 0, 'system', NOW(), 0, 'system'
);

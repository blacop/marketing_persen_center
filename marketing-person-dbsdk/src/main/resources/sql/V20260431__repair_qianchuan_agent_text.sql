-- 修复千川双 Agent 在部分环境中因导入编码异常导致的名称/描述乱码。
-- 该脚本只覆盖 qianchuan-delivery-v1 / qianchuan-data-v1 的展示文本，不改变发布状态与执行配置。

UPDATE agent_definition
SET
    name = '千川投放 Agent',
    description = '负责将视频素材投放至巨量千川（抖音系），可创建广告计划、设置定向人群、管理日预算与出价策略。',
    update_at = NOW(),
    update_by = 0,
    update_name = 'system'
WHERE is_deleted = 0
  AND agent_def_id = 'qianchuan-delivery-v1';

UPDATE agent_definition
SET
    name = '千川数据 Agent',
    description = '负责从巨量千川获取已投放广告的数据表现，分析 ROI、CTR、GPM 等核心指标，分析结果可回写至视频效果记录。',
    update_at = NOW(),
    update_by = 0,
    update_name = 'system'
WHERE is_deleted = 0
  AND agent_def_id = 'qianchuan-data-v1';

UPDATE agent_registry
SET
    name = '千川投放 Agent',
    description = '负责将视频素材投放至巨量千川，创建广告计划与素材绑定。',
    category = '广告投放',
    update_at = NOW(),
    update_by = 0,
    update_name = 'system'
WHERE is_deleted = 0
  AND agent_unique_id = 'qianchuan-delivery-v1';

UPDATE agent_registry
SET
    name = '千川数据 Agent',
    description = '负责从巨量千川获取广告投放数据报表，分析 ROI/CTR/GPM 等指标。',
    category = '数据分析',
    update_at = NOW(),
    update_by = 0,
    update_name = 'system'
WHERE is_deleted = 0
  AND agent_unique_id = 'qianchuan-data-v1';

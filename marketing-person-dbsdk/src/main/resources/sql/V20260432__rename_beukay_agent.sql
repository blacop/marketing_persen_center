-- 将 Beukay 总控智能体的用户可见名称统一为 Beukay agent。
-- 保留 agent_def_id / agent_unique_id 不变，避免破坏既有路由与 Hermes skill 目录。

UPDATE agent_definition
SET
    name = 'Beukay agent',
    description = '玛丽黛佳智能营销总控 Agent，支持内容生产、视频装配、千川投放与数据分析调度。',
    update_at = NOW(),
    update_by = 0,
    update_name = 'system'
WHERE is_deleted = 0
  AND agent_def_id IN ('beukay-claw-v1', 'beukay-claw-runtime');

UPDATE agent_registry
SET
    name = 'Beukay agent',
    description = '玛丽黛佳智能营销总控 Agent',
    update_at = NOW(),
    update_by = 0,
    update_name = 'system'
WHERE is_deleted = 0
  AND agent_unique_id = 'beukay-claw';

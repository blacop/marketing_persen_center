-- Content Knowledge Layer
-- 双 Agent 架构的知识层表：单视频拆解结果 + 模式知识 + 参考视频关系

CREATE TABLE IF NOT EXISTS video_deconstruction_result
(
    id                       BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code        VARCHAR(64)  NULL,
    is_deleted               TINYINT(1)   NOT NULL DEFAULT 0,
    record_id                BIGINT       NOT NULL COMMENT '对应 video_performance_record.id',
    video_id                 VARCHAR(64)  NOT NULL COMMENT '视频ID',
    sku_id                   VARCHAR(128) NULL COMMENT '标准SKU ID',
    sku_tag                  VARCHAR(128) NULL COMMENT 'SKU标签',
    hook_type                VARCHAR(64)  NULL COMMENT '钩子类型',
    scene_tags               JSON         NULL COMMENT '场景标签JSON数组',
    selling_point_tags       JSON         NULL COMMENT '卖点标签JSON数组',
    cta_tags                 JSON         NULL COMMENT 'CTA标签JSON数组',
    title_pattern            VARCHAR(256) NULL COMMENT '标题模式',
    emotion_tags             JSON         NULL COMMENT '情绪标签JSON数组',
    target_audience_tags     JSON         NULL COMMENT '目标人群标签JSON数组',
    deconstruction_json      JSON         NULL COMMENT '完整拆解JSON',
    version                  VARCHAR(32)  NULL DEFAULT 'v1',
    actual_performance_score DECIMAL(10, 6) NULL DEFAULT 0 COMMENT '真实效果分',
    verification_status      VARCHAR(32)  NULL DEFAULT 'PENDING' COMMENT 'PENDING/VERIFIED/REJECTED',
    status                   VARCHAR(32)  NULL DEFAULT 'ENABLED' COMMENT 'ENABLED/DISABLED',
    create_at                DATETIME     NULL,
    create_by                BIGINT       NULL,
    create_name              VARCHAR(255) NULL,
    update_at                DATETIME     NULL,
    update_by                BIGINT       NULL,
    update_name              VARCHAR(255) NULL,
    UNIQUE INDEX uk_record_id (record_id),
    INDEX idx_video_id (video_id),
    INDEX idx_sku_id (sku_id),
    INDEX idx_hook_type (hook_type),
    INDEX idx_verification_status (verification_status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '单视频拆解结果';

CREATE TABLE IF NOT EXISTS content_pattern_knowledge
(
    id                       BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code        VARCHAR(64)  NULL,
    is_deleted               TINYINT(1)   NOT NULL DEFAULT 0,
    knowledge_id             VARCHAR(64)  NOT NULL COMMENT '知识条目编码',
    sku_id                   VARCHAR(128) NULL COMMENT '标准SKU ID',
    sku_tag                  VARCHAR(128) NULL COMMENT 'SKU标签',
    marketing_node           VARCHAR(64)  NULL COMMENT '营销节点',
    target_audience          VARCHAR(256) NULL COMMENT '目标人群',
    hook_type                VARCHAR(64)  NULL COMMENT '推荐hook类型',
    pattern_type             VARCHAR(64)  NULL COMMENT '模式类型',
    recommended_opening      VARCHAR(512) NULL COMMENT '推荐开场',
    recommended_selling_points JSON       NULL COMMENT '推荐卖点JSON数组',
    recommended_cta          JSON         NULL COMMENT '推荐CTA JSON数组',
    recommended_scenes       JSON         NULL COMMENT '推荐场景JSON数组',
    negative_rules           JSON         NULL COMMENT '负向规则JSON数组',
    pattern_score            DECIMAL(10, 6) NULL DEFAULT 0 COMMENT '模式分',
    actual_performance_score DECIMAL(10, 6) NULL DEFAULT 0 COMMENT '真实效果分',
    pattern_embedding        JSON         NULL COMMENT '向量预留字段',
    knowledge_json           JSON         NULL COMMENT '完整知识JSON',
    version                  VARCHAR(32)  NULL DEFAULT 'v1',
    verification_status      VARCHAR(32)  NULL DEFAULT 'PENDING' COMMENT 'PENDING/VERIFIED/REJECTED',
    status                   VARCHAR(32)  NULL DEFAULT 'ENABLED' COMMENT 'ENABLED/DISABLED',
    create_at                DATETIME     NULL,
    create_by                BIGINT       NULL,
    create_name              VARCHAR(255) NULL,
    update_at                DATETIME     NULL,
    update_by                BIGINT       NULL,
    update_name              VARCHAR(255) NULL,
    UNIQUE INDEX uk_knowledge_id (knowledge_id),
    INDEX idx_sku_id (sku_id),
    INDEX idx_marketing_node (marketing_node),
    INDEX idx_target_audience (target_audience),
    INDEX idx_hook_type (hook_type),
    INDEX idx_verification_status (verification_status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '内容模式知识条目';

CREATE TABLE IF NOT EXISTS pattern_reference_video_rel
(
    id                       BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code        VARCHAR(64)  NULL,
    is_deleted               TINYINT(1)   NOT NULL DEFAULT 0,
    knowledge_id             VARCHAR(64)  NOT NULL COMMENT '知识条目编码',
    video_id                 VARCHAR(64)  NOT NULL COMMENT '视频ID',
    record_id                BIGINT       NULL COMMENT '原始记录ID',
    relation_type            VARCHAR(32)  NULL DEFAULT 'PRIMARY' COMMENT 'PRIMARY/SECONDARY/COUNTER_EXAMPLE',
    reference_score          DECIMAL(10, 6) NULL DEFAULT 0 COMMENT '参考分',
    actual_performance_score DECIMAL(10, 6) NULL DEFAULT 0 COMMENT '真实效果分',
    create_at                DATETIME     NULL,
    create_by                BIGINT       NULL,
    create_name              VARCHAR(255) NULL,
    update_at                DATETIME     NULL,
    update_by                BIGINT       NULL,
    update_name              VARCHAR(255) NULL,
    INDEX idx_knowledge_id (knowledge_id),
    INDEX idx_video_id (video_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '模式知识与参考视频关系';

ALTER TABLE content_structure_card
    ADD COLUMN IF NOT EXISTS logic_trace JSON NULL COMMENT '结构卡逻辑溯源';

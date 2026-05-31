-- Content Flywheel Foundation
-- 内容飞轮基础表：历史视频数据 + 内容结构卡
-- Apply according to your database migration process.

-- ============================================================
-- 1. 历史视频效果记录（从抖音后台导入）
-- ============================================================
CREATE TABLE IF NOT EXISTS video_performance_record
(
    id                BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code VARCHAR(64)  NULL,
    is_deleted        TINYINT(1)   NOT NULL DEFAULT 0,

    -- 视频基础信息
    video_id          VARCHAR(64)  NOT NULL COMMENT '抖音视频ID',
    account_id        VARCHAR(128) NULL COMMENT '账号抖音号',
    account_name      VARCHAR(128) NULL COMMENT '账号昵称',
    title             VARCHAR(1000) NULL COMMENT '视频标题',
    publish_time      DATETIME     NULL COMMENT '发布时间',
    video_url         VARCHAR(1024) NULL COMMENT '播放链接',
    is_promoted       TINYINT(1)   NULL COMMENT '是否投放 1是 0否',

    -- 播放指标
    views             BIGINT       NULL DEFAULT 0 COMMENT '视频观看次数',
    likes             INT          NULL DEFAULT 0 COMMENT '点赞数',
    comments          INT          NULL DEFAULT 0 COMMENT '评论数',
    saves             INT          NULL DEFAULT 0 COMMENT '收藏数',
    shares            INT          NULL DEFAULT 0 COMMENT '转发数',
    follows           INT          NULL DEFAULT 0 COMMENT '点击关注次数',
    completion_rate   DECIMAL(10, 4) NULL DEFAULT 0 COMMENT '完播率(%)',
    avg_watch_sec     INT          NULL DEFAULT 0 COMMENT '平均观看时长(秒)',

    -- 直播引流指标（核心业务指标）
    live_gmv          DECIMAL(14, 2) NULL DEFAULT 0 COMMENT '引流直播间用户支付金额(元)',
    live_exposure     BIGINT       NULL DEFAULT 0 COMMENT '直播间入口曝光次数',
    live_traffic      INT          NULL DEFAULT 0 COMMENT '引流直播间次数',
    live_orders       INT          NULL DEFAULT 0 COMMENT '引流直播成交订单数',
    live_cpm_gmv      DECIMAL(14, 2) NULL DEFAULT 0 COMMENT '入口千次曝光用户支付金额(元)',

    -- 看后搜指标（品牌记忆力）
    post_search_gmv   DECIMAL(14, 2) NULL DEFAULT 0 COMMENT '看后搜用户支付金额(元)',
    post_search_exp   INT          NULL DEFAULT 0 COMMENT '看后搜商品曝光次数',
    post_search_click INT          NULL DEFAULT 0 COMMENT '看后搜商品点击次数',
    post_search_orders INT         NULL DEFAULT 0 COMMENT '看后搜成交订单数',

    -- 直接成交指标
    direct_gmv        DECIMAL(14, 2) NULL DEFAULT 0 COMMENT '直接成交GMV(元)',
    direct_orders     INT          NULL DEFAULT 0 COMMENT '直接成交订单数',
    refund_amount     DECIMAL(14, 2) NULL DEFAULT 0 COMMENT '退款金额(元)',
    store_orders      INT          NULL DEFAULT 0 COMMENT '引流店铺页成交订单数',
    store_gmv         DECIMAL(14, 2) NULL DEFAULT 0 COMMENT '引流店铺页用户支付金额(元)',

    -- Agent标注字段
    sku_tag           VARCHAR(128) NULL COMMENT 'SKU标签(自动/人工标注)',
    hook_type         VARCHAR(64)  NULL COMMENT '内容钩子类型',
    content_pattern   VARCHAR(256) NULL COMMENT '内容模式标签组合',
    composite_score   DECIMAL(10, 6) NULL DEFAULT 0 COMMENT '多目标综合评分(归一化)',

    -- 标注元数据
    annotation_source VARCHAR(32)  NULL DEFAULT 'AUTO' COMMENT '标注来源 AUTO/MANUAL',
    annotation_note   VARCHAR(512) NULL COMMENT '标注备注',

    -- 审计字段
    create_at         DATETIME     NULL,
    create_by         BIGINT       NULL,
    create_name       VARCHAR(255) NULL,
    update_at         DATETIME     NULL,
    update_by         BIGINT       NULL,
    update_name       VARCHAR(255) NULL,

    INDEX idx_video_id (video_id),
    INDEX idx_account_id (account_id),
    INDEX idx_sku_tag (sku_tag),
    INDEX idx_hook_type (hook_type),
    INDEX idx_composite_score (composite_score DESC),
    INDEX idx_live_gmv (live_gmv DESC),
    INDEX idx_publish_time (publish_time)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '历史视频效果记录 — 内容拆解Agent知识底座';


-- ============================================================
-- 2. 商品真相卡（ProductTruth — 标准化SKU输入）
-- ============================================================
CREATE TABLE IF NOT EXISTS product_truth
(
    id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code   VARCHAR(64)  NULL,
    is_deleted          TINYINT(1)   NOT NULL DEFAULT 0,

    sku_id              VARCHAR(128) NOT NULL COMMENT 'SKU标识',
    product_name        VARCHAR(256) NULL COMMENT '商品名称',
    category            VARCHAR(128) NULL COMMENT '品类',
    price_range         VARCHAR(64)  NULL COMMENT '价格区间',
    core_benefits       JSON         NULL COMMENT '核心利益点数组',
    evidence_points     JSON         NULL COMMENT '量化卖点数组',
    target_skin_type    JSON         NULL COMMENT '目标肤质数组',
    forbidden_claims    JSON         NULL COMMENT '禁用表达数组',
    promotion_mechanisms JSON        NULL COMMENT '促销机制数组',
    preferred_scenes    JSON         NULL COMMENT '优选使用场景数组',
    status              VARCHAR(32)  NULL DEFAULT 'ACTIVE',

    create_at           DATETIME     NULL,
    create_by           BIGINT       NULL,
    create_name         VARCHAR(255) NULL,
    update_at           DATETIME     NULL,
    update_by           BIGINT       NULL,
    update_name         VARCHAR(255) NULL,

    UNIQUE INDEX uk_sku_id (sku_id, nezha_tenant_code)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '商品真相卡 — 标准化SKU输入，防LLM漂移';


-- ============================================================
-- 3. 内容结构卡（ContentStructureCard）
-- ============================================================
CREATE TABLE IF NOT EXISTS content_structure_card
(
    id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code   VARCHAR(64)  NULL,
    is_deleted          TINYINT(1)   NOT NULL DEFAULT 0,

    card_id             VARCHAR(64)  NOT NULL COMMENT '卡片业务ID',
    card_version        VARCHAR(16)  NULL DEFAULT '1.1',
    sku_id              VARCHAR(128) NULL COMMENT '关联SKU',
    hook_type           VARCHAR(64)  NULL COMMENT '内容钩子类型',
    target_audience     VARCHAR(512) NULL COMMENT '目标人群描述',
    marketing_node      VARCHAR(64)  NULL COMMENT '营销节点',
    account_id          VARCHAR(128) NULL COMMENT '账号ID',
    status              VARCHAR(32)  NULL DEFAULT 'DRAFT' COMMENT 'DRAFT/APPROVED/USED/ARCHIVED',

    -- 核心内容（JSON存储完整结构卡）
    card_json           JSON         NULL COMMENT '完整内容结构卡JSON',

    -- 冗余查询字段（从card_json提取，便于检索）
    opening_hook        VARCHAR(512) NULL COMMENT '开场钩子文案',
    video_duration_sec  INT          NULL COMMENT '推荐视频时长(秒)',
    reference_video_id  VARCHAR(64)  NULL COMMENT '主参考视频ID',
    pattern_rank_top1   VARCHAR(64)  NULL COMMENT '主导内容模式',
    experiment_key      VARCHAR(256) NULL COMMENT '实验键（用于反哺）',

    -- 效果回写（发布后由数据反哺Agent写入）
    actual_live_gmv     DECIMAL(14, 2) NULL COMMENT '实际引流直播GMV',
    actual_completion   DECIMAL(10, 4) NULL COMMENT '实际完播率',
    actual_live_traffic INT          NULL COMMENT '实际引流直播次数',
    feedback_written_at DATETIME     NULL COMMENT '反哺写入时间',

    -- 关联的AgentTrace
    agent_trace_id      VARCHAR(64)  NULL COMMENT '关联AgentTrace ID',
    agent_definition_id VARCHAR(128) NULL COMMENT '生成此卡的AgentDefinition',

    create_at           DATETIME     NULL,
    create_by           BIGINT       NULL,
    create_name         VARCHAR(255) NULL,
    update_at           DATETIME     NULL,
    update_by           BIGINT       NULL,
    update_name         VARCHAR(255) NULL,

    UNIQUE INDEX uk_card_id (card_id),
    INDEX idx_sku_id (sku_id),
    INDEX idx_hook_type (hook_type),
    INDEX idx_status (status),
    INDEX idx_marketing_node (marketing_node)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '内容结构卡 — 内容拆解Agent核心产物';


-- ============================================================
-- 4. 初始化商品真相卡（种籽气垫2.0 V1 MVP）
-- ============================================================
INSERT INTO product_truth (sku_id, product_name, category, price_range,
                           core_benefits, evidence_points, target_skin_type,
                           forbidden_claims, promotion_mechanisms, preferred_scenes,
                           status, create_at, create_by, create_name)
VALUES ('SEED_CUSHION_2',
        '玛丽黛佳种籽气垫2.0',
        '底妆/气垫',
        '100-200元',
        JSON_ARRAY('持妆', '控油', '轻薄', '遮瑕', '养肤'),
        JSON_ARRAY('24小时持妆', '14小时控油', '微米级粉体薄如蝉翼', '遮瑕力强', '养肤成分'),
        JSON_ARRAY('干皮', '混干皮'),
        JSON_ARRAY('绝对不脱妆', '医疗功效', '100%适合所有肤质'),
        JSON_ARRAY('买1发13', '直播间福利', '免费试用'),
        JSON_ARRAY('早八', '旅游', '约会', '通勤', '运动后补妆'),
        'ACTIVE',
        NOW(), 0, 'system');

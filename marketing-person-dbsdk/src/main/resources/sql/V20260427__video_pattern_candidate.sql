ALTER TABLE video_deconstruction_result
    ADD COLUMN IF NOT EXISTS recommended_pattern_code VARCHAR(64) NULL COMMENT '推荐模式编码',
    ADD COLUMN IF NOT EXISTS recommended_pattern_name VARCHAR(64) NULL COMMENT '推荐模式名称',
    ADD COLUMN IF NOT EXISTS recommended_pattern_reason VARCHAR(1024) NULL COMMENT '推荐模式理由',
    ADD COLUMN IF NOT EXISTS pattern_decision_json JSON NULL COMMENT '模式决策JSON';

CREATE TABLE IF NOT EXISTS video_pattern_candidate
(
    id                      BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code       VARCHAR(64)  NULL,
    is_deleted              TINYINT(1)   NOT NULL DEFAULT 0,
    deconstruction_result_id BIGINT      NOT NULL COMMENT '对应 video_deconstruction_result.id',
    record_id               BIGINT       NOT NULL COMMENT '对应 video_performance_record.id',
    video_id                VARCHAR(64)  NOT NULL COMMENT '视频ID',
    pattern_code            VARCHAR(64)  NOT NULL COMMENT '候选模式编码',
    pattern_name            VARCHAR(64)  NOT NULL COMMENT '候选模式名称',
    match_score             DECIMAL(10, 6) NULL DEFAULT 0 COMMENT '匹配分',
    reason_json             JSON         NULL COMMENT '命中依据JSON',
    rank_no                 INT          NOT NULL COMMENT '候选排序',
    is_recommended          TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '是否推荐模式',
    create_at               DATETIME     NULL,
    create_by               BIGINT       NULL,
    create_name             VARCHAR(255) NULL,
    update_at               DATETIME     NULL,
    update_by               BIGINT       NULL,
    update_name             VARCHAR(255) NULL,
    INDEX idx_deconstruction_result_id (deconstruction_result_id),
    INDEX idx_record_id (record_id),
    INDEX idx_pattern_code (pattern_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '视频候选模式';

CREATE TABLE IF NOT EXISTS video_assembly_task
(
    id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code   VARCHAR(64)  NULL,
    is_deleted          TINYINT(1)   NOT NULL DEFAULT 0,
    task_code           VARCHAR(64)  NOT NULL,
    blueprint_code      VARCHAR(64)  NOT NULL,
    status              VARCHAR(32)  NULL DEFAULT 'READY',
    platform            VARCHAR(64)  NULL,
    target_duration     INT          NULL,
    result_video_url    VARCHAR(1024) NULL,
    intervention_status VARCHAR(32)  NULL,
    summary_json        JSON         NULL,
    create_at           DATETIME     NULL,
    create_by           BIGINT       NULL,
    create_name         VARCHAR(255) NULL,
    update_at           DATETIME     NULL,
    update_by           BIGINT       NULL,
    update_name         VARCHAR(255) NULL,
    UNIQUE INDEX uk_task_code (task_code),
    INDEX idx_blueprint_code (blueprint_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '视频装配任务';

CREATE TABLE IF NOT EXISTS video_assembly_candidate
(
    id                BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code VARCHAR(64)  NULL,
    is_deleted        TINYINT(1)   NOT NULL DEFAULT 0,
    task_code         VARCHAR(64)  NOT NULL,
    section_no        INT          NOT NULL,
    segment_id        BIGINT       NOT NULL,
    video_id          VARCHAR(64)  NULL,
    similarity_score  DECIMAL(10,6) NULL DEFAULT 0,
    match_reason_json JSON         NULL,
    rank_no           INT          NOT NULL,
    is_selected       TINYINT(1)   NOT NULL DEFAULT 0,
    create_at         DATETIME     NULL,
    create_by         BIGINT       NULL,
    create_name       VARCHAR(255) NULL,
    update_at         DATETIME     NULL,
    update_by         BIGINT       NULL,
    update_name       VARCHAR(255) NULL,
    INDEX idx_task_section (task_code, section_no),
    INDEX idx_segment_id (segment_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '视频装配候选';

CREATE TABLE IF NOT EXISTS video_assembly_plan
(
    id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nezha_tenant_code   VARCHAR(64)  NULL,
    is_deleted          TINYINT(1)   NOT NULL DEFAULT 0,
    task_code           VARCHAR(64)  NOT NULL,
    section_no          INT          NOT NULL,
    segment_id          BIGINT       NOT NULL,
    video_id            VARCHAR(64)  NULL,
    selection_reason_json JSON       NULL,
    create_at           DATETIME     NULL,
    create_by           BIGINT       NULL,
    create_name         VARCHAR(255) NULL,
    update_at           DATETIME     NULL,
    update_by           BIGINT       NULL,
    update_name         VARCHAR(255) NULL,
    INDEX idx_task_code (task_code),
    INDEX idx_section_no (section_no)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '视频装配推荐方案';

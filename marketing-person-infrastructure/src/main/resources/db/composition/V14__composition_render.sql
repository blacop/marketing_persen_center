-- ============================================================
-- 视频合成工作流：渲染任务 + 渲染产出
-- ============================================================

CREATE TABLE IF NOT EXISTS render_job (
    id                          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id                  BIGINT       NOT NULL COMMENT 'composition_project.id',
    total_count                 INT          NOT NULL DEFAULT 0 COMMENT '计划渲染条数',
    success_count               INT          NOT NULL DEFAULT 0,
    failed_count                INT          NOT NULL DEFAULT 0,
    status                      VARCHAR(16)  NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/ASSEMBLING/RUNNING/SUCCESS/PARTIAL/FAILED/CANCELLED',
    progress_percent            INT          NOT NULL DEFAULT 0,
    current_stage               VARCHAR(32)  COMMENT '当前阶段',
    error_msg                   TEXT,
    started_at                  DATETIME,
    finished_at                 DATETIME,
    mq_message_id               VARCHAR(128),
    nezha_tenant_code           VARCHAR(64)  NOT NULL DEFAULT 'default',
    is_deleted                  TINYINT      NOT NULL DEFAULT 0,
    create_at                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_by                   BIGINT       NOT NULL DEFAULT 0,
    create_name                 VARCHAR(64)  NOT NULL DEFAULT 'system',
    update_at                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by                   BIGINT       NOT NULL DEFAULT 0,
    update_name                 VARCHAR(64)  NOT NULL DEFAULT 'system',
    KEY idx_project_status (project_id, status, is_deleted),
    KEY idx_status_started (status, started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合成-渲染任务';


CREATE TABLE IF NOT EXISTS render_output (
    id                          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    job_id                      BIGINT       NOT NULL COMMENT 'render_job.id',
    project_id                  BIGINT       NOT NULL COMMENT 'composition_project.id',
    plan_hash                   CHAR(64)     NOT NULL COMMENT '组合方案 sha256，去重核心',
    plan_snapshot               JSON         COMMENT '完整方案快照',
    oss_key                     VARCHAR(512) COMMENT '产出成片 OSS key',
    duration_ms                 BIGINT,
    width                       INT,
    height                      INT,
    file_size                   BIGINT,
    status                      VARCHAR(16)  NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/ASSEMBLING/DOWNLOADING/ENCODING/UPLOADING/SUCCESS/FAILED/CANCELLED',
    error_msg                   TEXT,
    started_at                  DATETIME,
    finished_at                 DATETIME,
    nezha_tenant_code           VARCHAR(64)  NOT NULL DEFAULT 'default',
    is_deleted                  TINYINT      NOT NULL DEFAULT 0,
    create_at                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_by                   BIGINT       NOT NULL DEFAULT 0,
    create_name                 VARCHAR(64)  NOT NULL DEFAULT 'system',
    update_at                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by                   BIGINT       NOT NULL DEFAULT 0,
    update_name                 VARCHAR(64)  NOT NULL DEFAULT 'system',
    UNIQUE KEY uk_job_planhash (job_id, plan_hash, is_deleted),
    KEY idx_project_status (project_id, status, is_deleted),
    KEY idx_job_status (job_id, status, is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合成-渲染产出';

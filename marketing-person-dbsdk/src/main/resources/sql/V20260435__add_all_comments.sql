-- 为所有表和所有字段添加中文注释
-- 基础表（agent_definition / agent_registry / agent_identity / agent_trace / skill_registry / kol_person）
-- 的字段类型根据 DO 文件和 Mapper XML 推断，执行前请验证类型是否与实际建表一致。

-- ============================================================
-- agent_definition：Agent 定义表
-- ============================================================
ALTER TABLE agent_definition COMMENT = 'Agent定义表，描述智能体的行为规范与能力配置';

ALTER TABLE agent_definition
    MODIFY COLUMN id                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN is_deleted        TINYINT(1)   NOT NULL DEFAULT 0       COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN nezha_tenant_code VARCHAR(128) NULL                     COMMENT '租户编码',
    MODIFY COLUMN name              VARCHAR(255) NULL                     COMMENT 'Agent名称',
    MODIFY COLUMN description       TEXT         NULL                     COMMENT 'Agent描述',
    MODIFY COLUMN status            VARCHAR(64)  NULL                     COMMENT '状态（ACTIVE/INACTIVE）',
    MODIFY COLUMN agent_def_id      VARCHAR(255) NULL                     COMMENT 'Agent定义唯一编码',
    MODIFY COLUMN behavior_dsl      TEXT         NULL                     COMMENT 'Agent行为DSL（系统提示词 / 指令集）',
    MODIFY COLUMN model_config      JSON         NULL                     COMMENT '模型配置JSON（model/temperature/maxTokens）',
    MODIFY COLUMN business_rules    JSON         NULL                     COMMENT '业务规则JSON',
    MODIFY COLUMN skill_ids         TEXT         NULL                     COMMENT '关联Skill ID列表（逗号分隔）',
    MODIFY COLUMN version           VARCHAR(64)  NULL                     COMMENT '版本号',
    MODIFY COLUMN publish_status    VARCHAR(64)  NULL                     COMMENT '发布状态（DRAFT/PUBLISHED/DEPRECATED）',
    MODIFY COLUMN last_publish_at   DATETIME     NULL                     COMMENT '最后发布时间',
    MODIFY COLUMN last_publish_by   BIGINT       NULL                     COMMENT '最后发布人ID',
    MODIFY COLUMN create_at         DATETIME     NULL                     COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT       NULL                     COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                     COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME     NULL                     COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT       NULL                     COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                     COMMENT '更新人名称';


-- ============================================================
-- agent_registry：Agent 注册表
-- ============================================================
ALTER TABLE agent_registry COMMENT = 'Agent注册表，记录已部署智能体的端点与路由信息';

ALTER TABLE agent_registry
    MODIFY COLUMN id                 BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN is_deleted         TINYINT(1)   NOT NULL DEFAULT 0       COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN nezha_tenant_code  VARCHAR(128) NULL                     COMMENT '租户编码',
    MODIFY COLUMN name               VARCHAR(255) NULL                     COMMENT 'Agent名称',
    MODIFY COLUMN description        TEXT         NULL                     COMMENT 'Agent描述',
    MODIFY COLUMN status             VARCHAR(64)  NULL                     COMMENT '状态（ACTIVE/INACTIVE）',
    MODIFY COLUMN agent_unique_id    VARCHAR(255) NULL                     COMMENT 'Agent全局唯一ID',
    MODIFY COLUMN category           VARCHAR(64)  NULL                     COMMENT 'Agent分类（广告投放/数据分析/内容生产...）',
    MODIFY COLUMN endpoint_url       VARCHAR(1024) NULL                    COMMENT 'Agent服务端点URL',
    MODIFY COLUMN agent_type         VARCHAR(64)  NULL                     COMMENT 'Agent类型（MCP_AGENT/HUMAN/MACHINE/HYBRID）',
    MODIFY COLUMN version            VARCHAR(64)  NULL                     COMMENT '版本号',
    MODIFY COLUMN owner_id           VARCHAR(255) NULL                     COMMENT '所属团队/人员ID',
    MODIFY COLUMN definition_id      BIGINT       NULL                     COMMENT '关联agent_definition.id',
    MODIFY COLUMN definition_version VARCHAR(64)  NULL                     COMMENT '关联定义版本号',
    MODIFY COLUMN identity_id        BIGINT       NULL                     COMMENT '关联agent_identity.id',
    MODIFY COLUMN current_skill_id   VARCHAR(255) NULL                     COMMENT '当前挂载的Skill ID',
    MODIFY COLUMN endpoint_type      VARCHAR(64)  NULL                     COMMENT '端点类型（MCP/HTTP/INTERNAL）',
    MODIFY COLUMN create_at          DATETIME     NULL                     COMMENT '创建时间',
    MODIFY COLUMN create_by          BIGINT       NULL                     COMMENT '创建人ID',
    MODIFY COLUMN create_name        VARCHAR(255) NULL                     COMMENT '创建人名称',
    MODIFY COLUMN update_at          DATETIME     NULL                     COMMENT '更新时间',
    MODIFY COLUMN update_by          BIGINT       NULL                     COMMENT '更新人ID',
    MODIFY COLUMN update_name        VARCHAR(255) NULL                     COMMENT '更新人名称';


-- ============================================================
-- agent_identity：Agent 身份表
-- ============================================================
ALTER TABLE agent_identity COMMENT = 'Agent身份表，存储智能体的加密凭证与授权策略';

ALTER TABLE agent_identity
    MODIFY COLUMN id                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN is_deleted        TINYINT(1)   NOT NULL DEFAULT 0       COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN nezha_tenant_code VARCHAR(128) NULL                     COMMENT '租户编码',
    MODIFY COLUMN name              VARCHAR(255) NULL                     COMMENT 'Agent身份名称',
    MODIFY COLUMN description       TEXT         NULL                     COMMENT '描述',
    MODIFY COLUMN status            VARCHAR(64)  NULL                     COMMENT '状态（ACTIVE/INACTIVE）',
    MODIFY COLUMN agent_unique_id   VARCHAR(255) NULL                     COMMENT '加密唯一ID',
    MODIFY COLUMN public_key        TEXT         NULL                     COMMENT '公钥',
    MODIFY COLUMN auth_policy       JSON         NULL                     COMMENT 'JSON授权策略',
    MODIFY COLUMN owner_id          VARCHAR(255) NULL                     COMMENT '所属团队/人员ID',
    MODIFY COLUMN agent_type        VARCHAR(64)  NULL                     COMMENT 'Agent类型（HUMAN/MACHINE/HYBRID）',
    MODIFY COLUMN create_at         DATETIME     NULL                     COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT       NULL                     COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                     COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME     NULL                     COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT       NULL                     COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                     COMMENT '更新人名称';


-- ============================================================
-- agent_trace：Agent 执行追踪表
-- ============================================================
ALTER TABLE agent_trace COMMENT = 'Agent执行追踪表，记录每次推理/任务的完整执行链路';

ALTER TABLE agent_trace
    MODIFY COLUMN id               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN is_deleted       TINYINT(1)   NOT NULL DEFAULT 0       COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN nezha_tenant_code VARCHAR(128) NULL                    COMMENT '租户编码',
    MODIFY COLUMN name             VARCHAR(255) NULL                     COMMENT '追踪名称（任务标题）',
    MODIFY COLUMN description      TEXT         NULL                     COMMENT '描述',
    MODIFY COLUMN status           VARCHAR(64)  NULL                     COMMENT '状态（RUNNING/SUCCEEDED/FAILED）',
    MODIFY COLUMN trace_id         VARCHAR(255) NULL                     COMMENT '全局Trace ID',
    MODIFY COLUMN agent_id         VARCHAR(255) NULL                     COMMENT '执行Agent的唯一ID',
    MODIFY COLUMN task_description TEXT         NULL                     COMMENT '任务描述',
    MODIFY COLUMN tool_calls       JSON         NULL                     COMMENT '工具调用序列JSON',
    MODIFY COLUMN duration         BIGINT       NULL                     COMMENT '执行耗时（毫秒）',
    MODIFY COLUMN result           LONGTEXT     NULL                     COMMENT '执行结果',
    MODIFY COLUMN error_msg        VARCHAR(2000) NULL                    COMMENT '错误信息',
    MODIFY COLUMN trace_type       VARCHAR(64)  NULL                     COMMENT '追踪类型（INFERENCE/TOOL_CALL/PUBLISH）',
    MODIFY COLUMN trace_status     VARCHAR(64)  NULL                     COMMENT '追踪状态（PENDING/RUNNING/SUCCEEDED/FAILED）',
    MODIFY COLUMN definition_id    BIGINT       NULL                     COMMENT '关联agent_definition.id',
    MODIFY COLUMN registry_id      BIGINT       NULL                     COMMENT '关联agent_registry.id',
    MODIFY COLUMN publish_record_id BIGINT      NULL                     COMMENT '关联agent_publish_record.id',
    MODIFY COLUMN start_at         DATETIME     NULL                     COMMENT '执行开始时间',
    MODIFY COLUMN end_at           DATETIME     NULL                     COMMENT '执行结束时间',
    MODIFY COLUMN create_at        DATETIME     NULL                     COMMENT '创建时间',
    MODIFY COLUMN create_by        BIGINT       NULL                     COMMENT '创建人ID',
    MODIFY COLUMN create_name      VARCHAR(255) NULL                     COMMENT '创建人名称',
    MODIFY COLUMN update_at        DATETIME     NULL                     COMMENT '更新时间',
    MODIFY COLUMN update_by        BIGINT       NULL                     COMMENT '更新人ID',
    MODIFY COLUMN update_name      VARCHAR(255) NULL                     COMMENT '更新人名称';


-- ============================================================
-- skill_registry：Skill 注册表
-- ============================================================
ALTER TABLE skill_registry COMMENT = 'Skill注册表，记录可供Agent挂载的原子工具及其MCP端点';

ALTER TABLE skill_registry
    MODIFY COLUMN id                BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN is_deleted        TINYINT(1)    NOT NULL DEFAULT 0       COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN nezha_tenant_code VARCHAR(128)  NULL                     COMMENT '租户编码',
    MODIFY COLUMN name              VARCHAR(255)  NULL                     COMMENT 'Skill名称',
    MODIFY COLUMN description       TEXT          NULL                     COMMENT 'Skill描述',
    MODIFY COLUMN status            VARCHAR(64)   NULL                     COMMENT '状态（ACTIVE/INACTIVE/DEPRECATED）',
    MODIFY COLUMN skill_id          VARCHAR(255)  NULL                     COMMENT 'Skill唯一标识',
    MODIFY COLUMN category          VARCHAR(64)   NULL                     COMMENT 'Skill分类',
    MODIFY COLUMN source            VARCHAR(64)   NULL                     COMMENT '来源（BUILTIN/EXTERNAL/MCP）',
    MODIFY COLUMN mcp_endpoint      VARCHAR(1024) NULL                     COMMENT 'MCP服务端点',
    MODIFY COLUMN input_schema      JSON          NULL                     COMMENT '输入参数Schema JSON',
    MODIFY COLUMN trust_level       VARCHAR(64)   NULL                     COMMENT '信任级别（HIGH/MEDIUM/LOW）',
    MODIFY COLUMN version           VARCHAR(64)   NULL                     COMMENT '版本号',
    MODIFY COLUMN artifact_path     VARCHAR(1024) NULL                     COMMENT '制品存储路径',
    MODIFY COLUMN artifact_checksum VARCHAR(128)  NULL                     COMMENT '制品校验和',
    MODIFY COLUMN schema_version    VARCHAR(64)   NULL                     COMMENT 'Schema版本号',
    MODIFY COLUMN create_at         DATETIME      NULL                     COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT        NULL                     COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255)  NULL                     COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME      NULL                     COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT        NULL                     COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255)  NULL                     COMMENT '更新人名称';


-- ============================================================
-- kol_person：KOL/达人信息表
-- ============================================================
ALTER TABLE kol_person COMMENT = 'KOL/达人信息表，存储内容创作者基础档案';

ALTER TABLE kol_person
    MODIFY COLUMN id                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN is_deleted        TINYINT(1)   NOT NULL DEFAULT 0       COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN nezha_tenant_code VARCHAR(128) NULL                     COMMENT '租户编码',
    MODIFY COLUMN name              VARCHAR(255) NULL                     COMMENT 'KOL名称/昵称',
    MODIFY COLUMN description       TEXT         NULL                     COMMENT 'KOL描述',
    MODIFY COLUMN status            VARCHAR(64)  NULL                     COMMENT '状态（ACTIVE/INACTIVE）',
    MODIFY COLUMN create_at         DATETIME     NULL                     COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT       NULL                     COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                     COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME     NULL                     COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT       NULL                     COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                     COMMENT '更新人名称';


-- ============================================================
-- agent_publish_record：Agent 发布记录表（V20260423）
-- ============================================================
ALTER TABLE agent_publish_record COMMENT = 'Agent发布记录表，追踪每次Skill制品发布的状态与结果';

ALTER TABLE agent_publish_record
    MODIFY COLUMN id                 BIGINT        NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
    MODIFY COLUMN is_deleted         TINYINT(1)    NOT NULL DEFAULT 0        COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN nezha_tenant_code  VARCHAR(128)  NULL                      COMMENT '租户编码',
    MODIFY COLUMN definition_id      BIGINT        NOT NULL                  COMMENT '关联agent_definition.id',
    MODIFY COLUMN definition_version VARCHAR(64)   NULL                      COMMENT '关联定义版本号',
    MODIFY COLUMN skill_id           VARCHAR(255)  NOT NULL                  COMMENT '发布的Skill ID',
    MODIFY COLUMN artifact_path      VARCHAR(1024) NULL                      COMMENT '制品存储路径',
    MODIFY COLUMN artifact_checksum  VARCHAR(128)  NULL                      COMMENT '制品校验和（SHA256）',
    MODIFY COLUMN publisher_type     VARCHAR(64)   NULL                      COMMENT '发布方类型（AUTO/MANUAL）',
    MODIFY COLUMN publish_status     VARCHAR(64)   NULL                      COMMENT '发布状态（PENDING/PUBLISHING/SUCCEEDED/FAILED）',
    MODIFY COLUMN error_msg          VARCHAR(2000) NULL                      COMMENT '发布失败原因',
    MODIFY COLUMN create_at          DATETIME      NULL                      COMMENT '创建时间',
    MODIFY COLUMN create_by          BIGINT        NULL                      COMMENT '创建人ID',
    MODIFY COLUMN create_name        VARCHAR(255)  NULL                      COMMENT '创建人名称',
    MODIFY COLUMN update_at          DATETIME      NULL                      COMMENT '更新时间',
    MODIFY COLUMN update_by          BIGINT        NULL                      COMMENT '更新人ID',
    MODIFY COLUMN update_name        VARCHAR(255)  NULL                      COMMENT '更新人名称';


-- ============================================================
-- video_performance_record：历史视频效果记录（V20260424，补全标准字段注释）
-- ============================================================
ALTER TABLE video_performance_record
    MODIFY COLUMN id                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64)  NULL                    COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)   NOT NULL DEFAULT 0       COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN create_at         DATETIME     NULL                    COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT       NULL                    COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                    COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME     NULL                    COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT       NULL                    COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                    COMMENT '更新人名称';


-- ============================================================
-- product_truth：商品真相卡（V20260424，补全标准字段注释）
-- ============================================================
ALTER TABLE product_truth
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                    COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0       COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN status            VARCHAR(32) NULL DEFAULT 'ACTIVE'   COMMENT '状态（ACTIVE/INACTIVE/ARCHIVED）',
    MODIFY COLUMN create_at         DATETIME    NULL                    COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                    COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                   COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                    COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                    COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                   COMMENT '更新人名称';


-- ============================================================
-- content_structure_card：内容结构卡（V20260424，补全标准字段注释）
-- ============================================================
ALTER TABLE content_structure_card
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT    COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                       COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0          COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN card_version      VARCHAR(16) NULL DEFAULT '1.1'         COMMENT '内容结构卡版本号',
    MODIFY COLUMN create_at         DATETIME    NULL                       COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                       COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                      COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                       COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                       COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                      COMMENT '更新人名称';


-- ============================================================
-- video_deconstruction_result：单视频拆解结果（V20260425，补全标准字段注释）
-- ============================================================
ALTER TABLE video_deconstruction_result
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT            COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                              COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0                 COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN version           VARCHAR(32) NULL DEFAULT 'v1'                 COMMENT '拆解版本号',
    MODIFY COLUMN status            VARCHAR(32) NULL DEFAULT 'ENABLED'            COMMENT '状态（ENABLED/DISABLED）',
    MODIFY COLUMN create_at         DATETIME    NULL                              COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                              COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                             COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                              COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                              COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                             COMMENT '更新人名称';


-- ============================================================
-- content_pattern_knowledge：内容模式知识条目（V20260425，补全标准字段注释）
-- ============================================================
ALTER TABLE content_pattern_knowledge
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                    COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0       COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN version           VARCHAR(32) NULL DEFAULT 'v1'       COMMENT '版本号',
    MODIFY COLUMN status            VARCHAR(32) NULL DEFAULT 'ENABLED'  COMMENT '状态（ENABLED/DISABLED）',
    MODIFY COLUMN create_at         DATETIME    NULL                    COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                    COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                   COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                    COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                    COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                   COMMENT '更新人名称';


-- ============================================================
-- pattern_reference_video_rel：模式知识与参考视频关系（V20260425，补全标准字段注释）
-- ============================================================
ALTER TABLE pattern_reference_video_rel
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                   COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0      COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN create_at         DATETIME    NULL                   COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                   COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                  COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                   COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                   COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                  COMMENT '更新人名称';


-- ============================================================
-- video_segment：视频最小单元库（V20260426，所有字段已有注释，仅确认表注释）
-- ============================================================
-- 表注释已在建表时设置，此处无需修改


-- ============================================================
-- video_pattern_candidate：视频候选模式（V20260427，补全标准字段注释）
-- ============================================================
ALTER TABLE video_pattern_candidate
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                   COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0      COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN create_at         DATETIME    NULL                   COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                   COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                  COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                   COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                   COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                  COMMENT '更新人名称';


-- ============================================================
-- script_blueprint：语义蓝图主表（V20260428，补全缺失字段注释）
-- ============================================================
ALTER TABLE script_blueprint
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                    COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0       COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN status            VARCHAR(32) NULL DEFAULT 'DRAFT'    COMMENT '状态（DRAFT/APPROVED/IN_USE/ARCHIVED）',
    MODIFY COLUMN auto_flow_status  VARCHAR(64) NULL                    COMMENT '自动流转状态（PENDING/ASSEMBLING/DONE）',
    MODIFY COLUMN create_at         DATETIME    NULL                    COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                    COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                   COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                    COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                    COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                   COMMENT '更新人名称';


-- ============================================================
-- script_blueprint_section：语义蓝图段落表（V20260428，补全缺失字段注释）
-- ============================================================
ALTER TABLE script_blueprint_section
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                   COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0      COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN create_at         DATETIME    NULL                   COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                   COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                  COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                   COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                   COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                  COMMENT '更新人名称';


-- ============================================================
-- video_assembly_task：视频装配任务（V20260429，补全所有字段注释）
-- ============================================================
ALTER TABLE video_assembly_task
    MODIFY COLUMN id                  BIGINT        NOT NULL AUTO_INCREMENT    COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code   VARCHAR(64)   NULL                       COMMENT '租户编码',
    MODIFY COLUMN is_deleted          TINYINT(1)    NOT NULL DEFAULT 0          COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN task_code           VARCHAR(64)   NOT NULL                   COMMENT '装配任务唯一编码',
    MODIFY COLUMN blueprint_code      VARCHAR(64)   NOT NULL                   COMMENT '关联语义蓝图编码',
    MODIFY COLUMN status              VARCHAR(32)   NULL DEFAULT 'READY'       COMMENT '任务状态（READY/RUNNING/SUCCEEDED/FAILED）',
    MODIFY COLUMN platform            VARCHAR(64)   NULL                       COMMENT '目标发布平台（DOUYIN/KUAISHOU...）',
    MODIFY COLUMN target_duration     INT           NULL                       COMMENT '目标视频时长（秒）',
    MODIFY COLUMN result_video_url    VARCHAR(1024) NULL                       COMMENT '最终合成视频URL',
    MODIFY COLUMN intervention_status VARCHAR(32)   NULL                       COMMENT '人工干预状态（NONE/PENDING/DONE）',
    MODIFY COLUMN summary_json        JSON          NULL                       COMMENT '装配结果摘要JSON',
    MODIFY COLUMN create_at           DATETIME      NULL                       COMMENT '创建时间',
    MODIFY COLUMN create_by           BIGINT        NULL                       COMMENT '创建人ID',
    MODIFY COLUMN create_name         VARCHAR(255)  NULL                       COMMENT '创建人名称',
    MODIFY COLUMN update_at           DATETIME      NULL                       COMMENT '更新时间',
    MODIFY COLUMN update_by           BIGINT        NULL                       COMMENT '更新人ID',
    MODIFY COLUMN update_name         VARCHAR(255)  NULL                       COMMENT '更新人名称';


-- ============================================================
-- video_assembly_candidate：视频装配候选（V20260429，补全所有字段注释）
-- ============================================================
ALTER TABLE video_assembly_candidate
    MODIFY COLUMN id                BIGINT         NOT NULL AUTO_INCREMENT  COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64)    NULL                     COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)     NOT NULL DEFAULT 0        COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN task_code         VARCHAR(64)    NOT NULL                 COMMENT '关联装配任务编码',
    MODIFY COLUMN section_no        INT            NOT NULL                 COMMENT '段落序号',
    MODIFY COLUMN segment_id        BIGINT         NOT NULL                 COMMENT '关联video_segment.id',
    MODIFY COLUMN video_id          VARCHAR(64)    NULL                     COMMENT '视频ID',
    MODIFY COLUMN similarity_score  DECIMAL(10, 6) NULL DEFAULT 0           COMMENT '与段落语义相似度得分',
    MODIFY COLUMN match_reason_json JSON           NULL                     COMMENT '匹配依据JSON',
    MODIFY COLUMN rank_no           INT            NOT NULL                 COMMENT '候选排序（升序，1最优）',
    MODIFY COLUMN is_selected       TINYINT(1)     NOT NULL DEFAULT 0        COMMENT '是否被选中（0否 1是）',
    MODIFY COLUMN create_at         DATETIME       NULL                     COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT         NULL                     COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255)   NULL                     COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME       NULL                     COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT         NULL                     COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255)   NULL                     COMMENT '更新人名称';


-- ============================================================
-- video_assembly_plan：视频装配推荐方案（V20260429，补全所有字段注释）
-- ============================================================
ALTER TABLE video_assembly_plan
    MODIFY COLUMN id                    BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code     VARCHAR(64) NULL                   COMMENT '租户编码',
    MODIFY COLUMN is_deleted            TINYINT(1)  NOT NULL DEFAULT 0      COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN task_code             VARCHAR(64) NOT NULL               COMMENT '关联装配任务编码',
    MODIFY COLUMN section_no            INT         NOT NULL               COMMENT '段落序号',
    MODIFY COLUMN segment_id            BIGINT      NOT NULL               COMMENT '最终选用的video_segment.id',
    MODIFY COLUMN video_id              VARCHAR(64) NULL                   COMMENT '最终选用的视频ID',
    MODIFY COLUMN selection_reason_json JSON        NULL                   COMMENT '选片决策依据JSON',
    MODIFY COLUMN create_at             DATETIME    NULL                   COMMENT '创建时间',
    MODIFY COLUMN create_by             BIGINT      NULL                   COMMENT '创建人ID',
    MODIFY COLUMN create_name           VARCHAR(255) NULL                  COMMENT '创建人名称',
    MODIFY COLUMN update_at             DATETIME    NULL                   COMMENT '更新时间',
    MODIFY COLUMN update_by             BIGINT      NULL                   COMMENT '更新人ID',
    MODIFY COLUMN update_name           VARCHAR(255) NULL                  COMMENT '更新人名称';


-- ============================================================
-- cm_collection：Cutmatrix 品名/一级目录（V20260433，补全缺失字段注释）
-- ============================================================
ALTER TABLE cm_collection
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT     COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                        COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0           COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN create_at         DATETIME    NULL                        COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                        COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                       COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                        COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                        COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                       COMMENT '更新人名称';


-- ============================================================
-- cm_chapter：Cutmatrix 章节/二级目录（V20260433，补全缺失字段注释）
-- ============================================================
ALTER TABLE cm_chapter
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                   COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0      COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN order_no          INT         NOT NULL DEFAULT 0      COMMENT '章节排序序号',
    MODIFY COLUMN create_at         DATETIME    NULL                   COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                   COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                  COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                   COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                   COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                  COMMENT '更新人名称';


-- ============================================================
-- cm_video_segment：Cutmatrix 视频片段（V20260433，补全缺失字段注释）
-- ============================================================
ALTER TABLE cm_video_segment
    MODIFY COLUMN id                BIGINT         NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64)    NULL                   COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)     NOT NULL DEFAULT 0      COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN width             INT            NULL                   COMMENT '视频宽度（像素）',
    MODIFY COLUMN height            INT            NULL                   COMMENT '视频高度（像素）',
    MODIFY COLUMN fps               DECIMAL(6, 3)  NULL                   COMMENT '帧率（帧/秒）',
    MODIFY COLUMN order_no          INT            NOT NULL DEFAULT 0     COMMENT '章节内排序序号',
    MODIFY COLUMN scene_tags        JSON           NULL                   COMMENT '场景标签JSON数组',
    MODIFY COLUMN selling_point_tags JSON          NULL                   COMMENT '卖点标签JSON数组',
    MODIFY COLUMN hook_type         VARCHAR(64)    NULL                   COMMENT '钩子类型',
    MODIFY COLUMN caption           VARCHAR(256)   NULL                   COMMENT '字幕/说明文字',
    MODIFY COLUMN create_at         DATETIME       NULL                   COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT         NULL                   COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255)   NULL                   COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME       NULL                   COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT         NULL                   COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255)   NULL                   COMMENT '更新人名称';


-- ============================================================
-- cm_compose_task：Cutmatrix 编排任务（V20260433，补全缺失字段注释）
-- ============================================================
ALTER TABLE cm_compose_task
    MODIFY COLUMN id                BIGINT         NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64)    NULL                   COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)     NOT NULL DEFAULT 0      COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN create_at         DATETIME       NULL                   COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT         NULL                   COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255)   NULL                   COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME       NULL                   COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT         NULL                   COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255)   NULL                   COMMENT '更新人名称';


-- ============================================================
-- cm_ingest_task：Cutmatrix 链接抓取任务（V20260434，补全缺失字段注释）
-- ============================================================
ALTER TABLE cm_ingest_task
    MODIFY COLUMN id                BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    MODIFY COLUMN nezha_tenant_code VARCHAR(64) NULL                   COMMENT '租户编码',
    MODIFY COLUMN is_deleted        TINYINT(1)  NOT NULL DEFAULT 0      COMMENT '软删除（0正常 1删除）',
    MODIFY COLUMN width             INT         NULL                   COMMENT '视频宽度（像素）',
    MODIFY COLUMN height            INT         NULL                   COMMENT '视频高度（像素）',
    MODIFY COLUMN create_at         DATETIME    NULL                   COMMENT '创建时间',
    MODIFY COLUMN create_by         BIGINT      NULL                   COMMENT '创建人ID',
    MODIFY COLUMN create_name       VARCHAR(255) NULL                  COMMENT '创建人名称',
    MODIFY COLUMN update_at         DATETIME    NULL                   COMMENT '更新时间',
    MODIFY COLUMN update_by         BIGINT      NULL                   COMMENT '更新人ID',
    MODIFY COLUMN update_name       VARCHAR(255) NULL                  COMMENT '更新人名称';

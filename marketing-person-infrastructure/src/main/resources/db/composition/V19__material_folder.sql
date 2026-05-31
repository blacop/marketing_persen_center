-- ============================================================
-- 素材分类文件夹（取代写死的 MaterialCategory 枚举）
-- material_clip / voiceover_asset / composition_chapter / source_video.segments 的
-- category 字段继续存 code 字符串（兼容现有数据），但 code 来源从枚举改为本表。
-- 用户可自由新建 / 重命名 / 删除文件夹。
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。
-- ============================================================

CREATE TABLE IF NOT EXISTS material_folder (
    id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code              VARCHAR(64)  NOT NULL COMMENT '稳定标识（material_clip.category 的取值），可与 name 不同',
    name              VARCHAR(128) NOT NULL COMMENT '显示名称',
    sort_no           INT          NOT NULL DEFAULT 0 COMMENT '排序，从 1 起递增',
    color             VARCHAR(16)  COMMENT '十六进制颜色，可空',
    description       VARCHAR(255) COMMENT '语义描述（自动拆解 LLM 用）',
    nezha_tenant_code VARCHAR(64)  NOT NULL DEFAULT 'default',
    is_deleted        TINYINT      NOT NULL DEFAULT 0,
    create_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_by         BIGINT       NOT NULL DEFAULT 0,
    create_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    update_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    update_by         BIGINT       NOT NULL DEFAULT 0,
    update_name       VARCHAR(64)  NOT NULL DEFAULT 'system',
    UNIQUE KEY uk_code_tenant (code, nezha_tenant_code, is_deleted),
    KEY idx_sort (sort_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频合成-素材文件夹（动态分类）';

-- 预置 9 行：与现有 MaterialCategory 枚举值一致，让历史数据无缝过渡
INSERT INTO material_folder (code, name, sort_no, color, description, nezha_tenant_code) VALUES
    ('HOOK',                  '钩子',          1, '#fbbf24', '开场吸引注意力，提出问题、痛点、悬念',                'default'),
    ('EFFICACY',              '功效可视化',    2, '#a78bfa', '展示产品功效的对比/特写画面',                       'default'),
    ('MAKEUP_DEMO',           '妆效展示-正例', 3, '#f59e0b', '正向妆效演示，上脸效果好',                          'default'),
    ('MAKEUP_DEMO_NEGATIVE',  '妆效展示-反例', 4, '#fb7185', '反例对照，糊妆/瑕疵',                              'default'),
    ('PRODUCT_REVEAL',        '产品亮相',      5, '#34d399', '产品包装、外观、规格的亮相镜头',                   'default'),
    ('LIVE_VOICEOVER',        '实测口播',      6, '#60a5fa', '博主面对镜头讲解、上手实测',                       'default'),
    ('CELEBRITY_TESTIMONIAL', '明星证言',      7, '#f472b6', '明星代言/背书段落',                                'default'),
    ('KOL_TESTIMONIAL',       '达人证言',      8, '#22d3ee', '素人达人推荐',                                     'default'),
    ('STREET_INTERVIEW',      '口碑街访',      9, '#84cc16', '路人采访、现场反馈',                              'default');

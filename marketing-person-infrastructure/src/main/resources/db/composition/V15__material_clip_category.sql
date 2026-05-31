-- 素材一对一分类（镜头类型）：钩子 / 功效可视化 / 妆效展示-正例 / 妆效展示-反例 / 产品亮相
-- 实测口播 / 明星证言 / 达人证言 / 口碑街访
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。

ALTER TABLE material_clip
    ADD COLUMN category VARCHAR(32) NULL COMMENT '镜头类型枚举 MaterialCategory'
        AFTER source_extra;

CREATE INDEX idx_category ON material_clip(category);

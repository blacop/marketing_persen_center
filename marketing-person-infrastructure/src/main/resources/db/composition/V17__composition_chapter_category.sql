-- 章节绑定一个 MaterialCategory（钩子/功效可视化/...），渲染时按 category 选片
-- 诸葛亮模式默认自动生成 9 个章节，每个绑定一个分类
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。

ALTER TABLE composition_chapter
    ADD COLUMN category VARCHAR(32) NULL COMMENT '镜头类型（同 MaterialCategory），章节按此选片'
        AFTER name;

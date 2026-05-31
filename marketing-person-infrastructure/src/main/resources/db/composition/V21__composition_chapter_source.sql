-- ============================================================
-- 诸葛亮模式新增"按文件夹生成章节"子模式：
--   composition_project.chapter_source = CATEGORY(默认/9 枚举) | FOLDER(用户上传文件夹)
--   composition_chapter.material_clip_ids 直接指定该章节的素材 clipId（FOLDER 模式用，CSV）
--   composition_chapter.source_folder_name 上传时的子目录名（FOLDER 模式用，纯展示）
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。
-- ============================================================

ALTER TABLE composition_project
    ADD COLUMN chapter_source VARCHAR(16) NOT NULL DEFAULT 'CATEGORY'
        COMMENT 'CATEGORY=按 MaterialCategory 自动 9 章节，FOLDER=用户上传文件夹解析'
        AFTER mode;

ALTER TABLE composition_chapter
    ADD COLUMN material_clip_ids   VARCHAR(2000) NULL
        COMMENT 'FOLDER 模式：直接指定该章节的素材 clipId 列表（CSV）'
        AFTER tag_filter,
    ADD COLUMN source_folder_name  VARCHAR(255)  NULL
        COMMENT 'FOLDER 模式：上传时的子目录名（展示用）'
        AFTER material_clip_ids;

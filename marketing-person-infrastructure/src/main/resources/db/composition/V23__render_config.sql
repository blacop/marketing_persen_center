-- ============================================================
-- 渲染任务配置：导出路径/比例/分辨率/帧率/容器/编码/镜像概率/随机裁剪范围/导出类型
-- 序列化为 JSON 存到 render_job.render_config_json。
-- DRDS 没启用 Flyway，本脚本是文档；需要在 DRDS 控制台手工执行。
-- ============================================================

ALTER TABLE render_job
    ADD COLUMN render_config_json VARCHAR(1024) NULL
        COMMENT '本次渲染配置 JSON：aspectRatio/resolution/fps/container/codec/mirrorProb/trimMin/trimMax/exportType/exportPath'
        AFTER mq_message_id;

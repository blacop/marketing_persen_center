package com.beukay.marketing.person.client.composition.enums;

/** 章节来源：决定项目章节的初始化方式 */
public enum ChapterSource {
    /** 按 9 个 MaterialCategory 枚举自动生成（兼容旧项目，默认） */
    CATEGORY,
    /** 用户上传一整个目录，按子目录解析章节（章节数不固定） */
    FOLDER
}

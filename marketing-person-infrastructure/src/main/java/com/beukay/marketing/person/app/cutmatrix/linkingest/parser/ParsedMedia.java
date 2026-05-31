package com.beukay.marketing.person.app.cutmatrix.linkingest.parser;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 链接解析结果：直接可下载的媒体描述。
 * 平台解析器（抖音/B站/直链/...）统一返回此结构。
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedMedia {

    /** 来源平台标识：douyin / bilibili / xiaohongshu / kuaishou / direct */
    private String platform;

    /** 原始链接 */
    private String sourceUrl;

    /** 媒体直链（无水印优先） */
    private String mediaUrl;

    /** 标题（用作文件名前缀） */
    private String title;

    /** 媒体类型：video / audio / image */
    private String mediaType;

    /** 时长秒（可空） */
    private Double durationSec;

    /** 缩略图 URL（可空） */
    private String thumbnailUrl;

    /** 下载需要的额外 HTTP 头（如 Referer，B 站需要） */
    private java.util.Map<String, String> downloadHeaders;
}

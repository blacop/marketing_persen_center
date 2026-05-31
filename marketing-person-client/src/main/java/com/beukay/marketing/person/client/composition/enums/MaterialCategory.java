package com.beukay.marketing.person.client.composition.enums;

import lombok.Getter;

/**
 * 素材镜头类型（一对一分类）。来源：飞书文档《小灶群剪辑工作流研究》素材分类。
 * 与 material_tag 多对多标签互补 —— 此处定义素材的"主身份"，tag 用于更细粒度过滤。
 */
@Getter
public enum MaterialCategory {

    HOOK("钩子"),
    EFFICACY("功效可视化"),
    MAKEUP_DEMO("妆效展示-正例"),
    MAKEUP_DEMO_NEGATIVE("妆效展示-反例"),
    PRODUCT_REVEAL("产品亮相"),
    LIVE_VOICEOVER("实测口播"),
    CELEBRITY_TESTIMONIAL("明星证言"),
    KOL_TESTIMONIAL("达人证言"),
    STREET_INTERVIEW("口碑街访");

    private final String label;

    MaterialCategory(String label) {
        this.label = label;
    }
}

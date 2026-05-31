package com.beukay.marketing.person.infrastructure.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SkuIdResolverTest {

    @Test
    void shouldResolveCommonAliasesToCanonicalSkuId() {
        SkuIdResolver resolver = new SkuIdResolver();

        assertEquals("SEED_CUSHION_2", resolver.resolve("SEED_CUSHION_2"));
        assertEquals("SEED_CUSHION_2", resolver.resolve("seed-cushion-2"));
        assertEquals("SEED_CUSHION_2", resolver.resolve("seed_cushion_2"));
        assertEquals("SEED_CUSHION_2", resolver.resolve("种籽气垫2.0"));
        assertEquals("SEED_CUSHION_2", resolver.resolve("种籽气垫"));
    }

    @Test
    void shouldBuildHelpfulNotFoundMessage() {
        SkuIdResolver resolver = new SkuIdResolver();

        String message = resolver.buildNotFoundMessage("未知SKU", "未知SKU");

        assertTrue(message.contains("未找到对应SKU数据"));
        assertTrue(message.contains("SEED_CUSHION_2"));
        assertTrue(message.contains("种籽气垫2.0"));
    }
}

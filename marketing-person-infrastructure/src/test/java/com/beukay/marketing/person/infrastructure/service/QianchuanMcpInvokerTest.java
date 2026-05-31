package com.beukay.marketing.person.infrastructure.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class QianchuanMcpInvokerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final QianchuanMockMcpRuntime mockMcpRuntime = new QianchuanMockMcpRuntime(new QianchuanMockApiClient());

    @Test
    void shouldRunMockDeliveryWorkflow() throws Exception {
        QianchuanMcpInvoker invoker = new QianchuanMcpInvoker(
                objectMapper,
                mockMcpRuntime,
                true,
                "mock://qianchuan-api",
                "qianchuan-mock-mcp-server",
                "",
                ""
        );

        String reply = invoker.chat(
                QianchuanMcpInvoker.DELIVERY_AGENT_ID,
                "",
                List.of(),
                "把视频 video_id=VID_001 投放到千川，预算 500，目标 ROI 1.8",
                null
        );

        assertTrue(reply.contains("千川投放 mock 流程已跑通"));
        assertTrue(reply.contains("qianchuan_aweme_authorized_get_v1"));
        assertTrue(reply.contains("qianchuan_ad_create_v1"));
        assertTrue(reply.contains("MOCK_AD_"));
    }

    @Test
    void shouldRunMockDataWorkflow() throws Exception {
        QianchuanMcpInvoker invoker = new QianchuanMcpInvoker(
                objectMapper,
                mockMcpRuntime,
                true,
                "mock://qianchuan-api",
                "qianchuan-mock-mcp-server",
                "mock-token",
                "123456"
        );

        String reply = invoker.chat(
                QianchuanMcpInvoker.DATA_AGENT_ID,
                "",
                List.of(),
                "分析 2026-04-01 到 2026-04-07 的千川投放数据",
                null
        );

        assertTrue(reply.contains("千川数据 mock 流程已跑通"));
        assertTrue(reply.contains("qianchuan_report_advertiser_get_v1"));
        assertTrue(reply.contains("qianchuan_report_ad_get_v1"));
        assertTrue(reply.contains("ROI"));
    }

    @Test
    void shouldRejectWhenMcpDisabled() {
        QianchuanMcpInvoker invoker = new QianchuanMcpInvoker(
                objectMapper,
                mockMcpRuntime,
                false,
                "mock://qianchuan-api",
                "qianchuan-mock-mcp-server",
                "",
                ""
        );

        assertThrows(IllegalStateException.class, () -> invoker.chat(
                QianchuanMcpInvoker.DATA_AGENT_ID,
                "",
                List.of(),
                "查数据",
                null
        ));
    }
}

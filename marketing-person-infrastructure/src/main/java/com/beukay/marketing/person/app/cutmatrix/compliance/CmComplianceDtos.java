package com.beukay.marketing.person.app.cutmatrix.compliance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class CmComplianceDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuditCmd {
        /** 待审核文案 */
        private String text;
        /** 业务场景：beauty / food / health / supplement / general */
        private String category;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuditResult {
        private String status;          // SUCCEEDED / FAILED
        /** 整体风险等级：high / medium / low / safe */
        private String overallRisk;
        /** 概要说明 */
        private String summary;
        /** 风险句列表 */
        private List<RiskItem> risks;
        private String provider;
        private Long elapsedMs;
        private String errMsg;

        @Data @Builder @NoArgsConstructor @AllArgsConstructor
        public static class RiskItem {
            /** 句序号（从 1 开始） */
            private Integer idx;
            /** 原句 */
            private String text;
            /** 风险类型：极限词 / 医疗暗示 / 虚假承诺 / 比较广告 / 数据无据 / 涉政敏感 / 其他 */
            private String riskType;
            /** 等级：high / medium / low */
            private String level;
            /** 命中违规词或具体片段 */
            private String violation;
            /** 修改建议（保持原意，去除违规） */
            private String suggestion;
            /** 法律依据（可空） */
            private String regulation;
        }
    }
}

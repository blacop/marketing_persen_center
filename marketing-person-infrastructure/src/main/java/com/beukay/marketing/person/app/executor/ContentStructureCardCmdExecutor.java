package com.beukay.marketing.person.app.executor;

import com.beukay.marketing.person.app.service.ContentStructureCardGenerateAppService;
import com.beukay.marketing.person.client.cmd.ContentStructureCardGenerateCmd;
import com.beukay.marketing.person.client.dto.ContentStructureCardDTO;
import com.beukay.marketing.person.domain.contentStructureCard.model.ContentStructureCard;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Log4j2
public class ContentStructureCardCmdExecutor {

    private final ContentStructureCardGenerateAppService contentStructureCardGenerateAppService;

    public ContentStructureCardDTO generate(ContentStructureCardGenerateCmd cmd) {
        ContentStructureCard card = contentStructureCardGenerateAppService.generate(
                cmd.getSkuId(),
                cmd.getMarketingNode(),
                cmd.getTargetAudience(),
                cmd.getAccountId());
        return toDTO(card);
    }

    private ContentStructureCardDTO toDTO(ContentStructureCard card) {
        if (card == null) {
            return null;
        }
        return ContentStructureCardDTO.builder()
                .id(card.getId())
                .cardId(card.getCardId())
                .cardVersion(card.getCardVersion())
                .skuId(card.getSkuId())
                .hookType(card.getHookType())
                .targetAudience(card.getTargetAudience())
                .marketingNode(card.getMarketingNode())
                .accountId(card.getAccountId())
                .status(card.getStatus())
                .cardJson(card.getCardJson())
                .openingHook(card.getOpeningHook())
                .videoDurationSec(card.getVideoDurationSec())
                .referenceVideoId(card.getReferenceVideoId())
                .patternRankTop1(card.getPatternRankTop1())
                .logicTrace(card.getLogicTrace())
                .actualLiveGmv(card.getActualLiveGmv())
                .actualCompletion(card.getActualCompletion())
                .actualLiveTraffic(card.getActualLiveTraffic())
                .feedbackWrittenAt(card.getFeedbackWrittenAt())
                .createAt(card.getBaseFields() != null ? card.getBaseFields().getCreateAt() : null)
                .createName(card.getBaseFields() != null ? card.getBaseFields().getCreateName() : null)
                .build();
    }
}

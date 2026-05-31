package com.beukay.marketing.person.client.api;

import com.beukay.ai.common.entity.PageInfo;
import com.beukay.ai.common.entity.Result;
import com.beukay.marketing.person.client.cmd.VideoDeconstructionCreateCmd;
import com.beukay.marketing.person.client.cmd.VideoDeconstructionSubmitUrlCmd;
import com.beukay.marketing.person.client.dto.VideoDeconstructionDTO;
import com.beukay.marketing.person.client.dto.VideoDeconstructionTaskDTO;
import com.beukay.marketing.person.client.qry.VideoDeconstructionDetailQry;
import com.beukay.marketing.person.client.qry.VideoDeconstructionTaskGetQry;
import com.beukay.marketing.person.client.qry.VideoDeconstructionPageQry;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

public interface VideoDeconstructionFeign {

    @PostMapping("/videoDeconstruction/deconstruct")
    Result<VideoDeconstructionDTO> deconstructVideo(@RequestBody @Valid VideoDeconstructionCreateCmd cmd);


    @PostMapping(value = "/videoDeconstruction/understandingTask/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Result<VideoDeconstructionTaskDTO> submitUnderstandingTaskUpload(@RequestPart("file") MultipartFile file,
                                                                     @RequestPart("skuId") String skuId,
                                                                     @RequestPart(value = "sourceLabel", required = false) String sourceLabel);

    @PostMapping("/videoDeconstruction/understandingTask/url")
    Result<VideoDeconstructionTaskDTO> submitUnderstandingTaskUrl(@RequestBody @Valid VideoDeconstructionSubmitUrlCmd cmd);

    @PostMapping("/videoDeconstruction/understandingTask/get")
    Result<VideoDeconstructionTaskDTO> getUnderstandingTask(@RequestBody @Valid VideoDeconstructionTaskGetQry qry);

    @PostMapping("/videoDeconstruction/get")
    Result<VideoDeconstructionDTO> getVideoDeconstruction(@RequestBody @Valid VideoDeconstructionDetailQry qry);

    @PostMapping("/videoDeconstruction/listPage")
    Result<PageInfo<VideoDeconstructionDTO>> listVideoDeconstructionPage(@RequestBody @Valid VideoDeconstructionPageQry qry);
}

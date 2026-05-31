package com.beukay.marketing.person.infrastructure.service;

import java.nio.file.Path;
import java.util.List;

public interface FfmpegVideoPreprocessor {

    PreparedVideoAssets prepare(Path sourceVideoPath);

    record KeyFrameAsset(int index, int timestampSec, Path imagePath) {
    }

    record PreparedVideoAssets(Path sourceVideoPath,
                               Path audioPath,
                               int durationSec,
                               List<KeyFrameAsset> keyFrames) {
    }
}

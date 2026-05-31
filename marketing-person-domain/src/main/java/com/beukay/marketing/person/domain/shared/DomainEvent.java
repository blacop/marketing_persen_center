package com.beukay.marketing.person.domain.shared;

import cn.hutool.core.map.MapUtil;
import cn.hutool.core.util.StrUtil;
import com.google.common.collect.Maps;
import lombok.Getter;

import java.io.Serializable;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

/**
 * 领域事件
 *
 * @author huawei
 * @date 2022/04/08
 */
@Getter
public abstract class DomainEvent implements Serializable {

    private static final long serialVersionUID = -5484101968786341946L;

    private final String id;
    private final Date createTime;
    private final Map<String, Object> externalParams;

    public DomainEvent() {
        this.id = UUID.randomUUID().toString();
        this.createTime = new Date();
        this.externalParams = Maps.newHashMap();
    }

    /**
     * 领域事件身份识别
     *
     * @return
     */
    public abstract String identifier();

    public void putParam(String key, Object value) {
        externalParams.put(key, value);
    }

    public Object getParam(String key) {
        if (StrUtil.isEmpty(key) || MapUtil.isEmpty(externalParams)) {
            return null;
        }
        return externalParams.get(key);
    }

}

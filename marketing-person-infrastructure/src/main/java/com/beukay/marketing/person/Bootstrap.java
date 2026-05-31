package com.beukay.marketing.person;

import com.beukay.ai.common.constants.Constant;
import com.beukay.ai.common.holder.annotation.EnableContextHolder;
import com.beukay.ai.common.holder.loadbalance.CustomLoadBalancerConfiguration;
import lombok.extern.log4j.Log4j2;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.cloud.loadbalancer.annotation.LoadBalancerClients;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Spring Boot Starter
 *
 * @author huawei
 * @date 2022/09/08
 */
@EnableContextHolder
@SpringBootApplication
@ComponentScan(basePackages = {"com.beukay"})
@MapperScan(basePackages = {
        "com.beukay.marketing.person.dbsdk.dao",
        "com.beukay.marketing.person.dbsdk.composition.dao"
})

@EnableFeignClients
@EnableDiscoveryClient
@EnableAsync
@Log4j2
@LoadBalancerClients(defaultConfiguration = CustomLoadBalancerConfiguration.class)
public class Bootstrap {

    public static void main(String[] args) {

        SpringApplication.run(Bootstrap.class, args);
        log.info(Constant.SERVICE_STARTED_LOG_TEXT);

    }
}
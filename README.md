# 脚手架模块说明

项目工程基于COLA改造
COLA 是 Clean Object-Oriented and Layered Architecture的缩写，代表“整洁面向对象分层架构”，是来自阿里技术专家的开源项目。目前COLA已经发展到COLA 4.0。
COLA既是框架，也是架构。开源作者创建COLA的主要目的是为DDD应用架构提供一套简单的可以复制、可以理解、可以落地、可以控制复杂性的“指导和约束”。
COLA 开源地址：https://github.com/alibaba/COLA。

xxx为artifactId，各模块说明如下：

![img.png](img.png)
由于移动端与管理后台都有对应的服务，故删除xxx-adapter适配层

- xxx-client模块：微服务系统内部暴露的RPC接口和传输对象定义，给外部调用方依赖使用
  - com.beukay.xxx.client.api：对外暴露的feign接口
  - com.beukay.xxx.client.cmd：feign接口使用的命令对象(增删改)
  - com.beukay.xxx.client.qry：feign接口使用的请求对象(查询)
  - com.beukay.xxx.client.dto：feign接口使用的返回对象
- xxx-app模块：编写微服务的应用层
  - com.beukay.xxx.app.impl：对外暴露的feign接口实现
  - com.beukay.xxx.app.convertor：领域层对象与client包对象转换
  - com.beukay.xxx.app.event：领域事件的处理
  - com.beukay.xxx.app.executor：CRUD处理
  - resources/application.yaml：配置文件
  - resources/log4j2.xml：日志配置
- xxx-domain模块：微服务领域层
  - com.beukay.xxx.domain.领域.ability：领域能力
  - com.beukay.xxx.domain.领域.event：领域事件定义
  - com.beukay.xxx.domain.领域.gateway：调用领域外的服务接口/查询仓储层接口
  - com.beukay.xxx.domain.领域.model.aggregates：领域聚合根
  - com.beukay.xxx.domain.领域.model.entities：领域实体
  - com.beukay.xxx.domain.领域.model.valueobjects：领域值对象
  - com.beukay.xxx.domain.领域.model.enums：领域内用到的枚举
- xxx-infrastructure：编写微服务的应用层
  - com.beukay.xxx.infrastructure.config：nacos配置
  - com.beukay.xxx.infrastructure.gatewayimpl：调用领域外的服务接口实现/查询仓储层接口实现
  - com.beukay.xxx.infrastructure.convertor：领域对象与DO对象转换
  - com.beukay.xxx.infrastructure.event：领域事件生产者
- xxx-dbsdk模块：编写微服务的实体模型和数据访问对象
  - com.beukay.xxx.dbsdk.dao：mybatis的Mapper
  - com.beukay.xxx.dbsdk.model：数据实体模型
  - resources/com.beukay.xxx.dbsdk.dao：存放mybatis的xml
  - resources/sql：flyway记录

# 端口登记与配置管理

- tomcat端口登记：
  - https://beukaygroup.feishu.cn/wiki/wikcnMoQkxU5qTUsCsSQxtHt1Xg?from=space_search

- 配置管理地址：nacos TODO
  - bootstrap.ymal：环境配置
  - application-{profile}.properties：环境配置，profile为环境名称

# 其他说明

- 各个package下的del.md是为了占位上传到git使用，实际编码时可以删除
# 数据库访问信息

- Last Updated: 2026-04-23
- Purpose: 记录本项目本地开发时可用的数据库连接定位信息，供后续导入脚本、DDL 执行、排障时复用。

## 连接信息

- Host: `pxc-shra2p9ajbh6ne.polarx.rds.aliyuncs.com`
- Port: `3306`
- Database: `db_ai_market_person`
- User: `develop_user`

## 密码获取方式

数据库密码**不直接写入仓库**。

当前密码保存在：
- IntelliJ IDEA Datasource 对应配置
- macOS Keychain（通过 IDEA `master_key` 关联）

后续如需连接数据库，优先按以下顺序获取：
1. 从 IntelliJ IDEA 的 DataSource 配置读取当前连接项
2. 通过 macOS Keychain / IDEA `master_key` 获取实际密码
3. 使用命令行或脚本连接 MySQL 执行 DDL / DML

## 已知用途

- 执行 `marketing-person-dbsdk/src/main/resources/sql/` 下的 DDL
- 执行 `scripts/output/video_performance_insert.sql` 等导入 SQL
- 校验内容飞轮相关表：
  - `video_performance_record`
  - `product_truth`
  - `content_structure_card`
  - 后续知识层表

## 备注

- DB 连接信息允许复用，但密码以 Keychain 中实时值为准。
- 如果后续连接失败，优先检查：
  - IDEA DataSource 是否已更新
  - Keychain 中对应凭据是否变化
  - 当前 IP / 白名单 / 网络权限是否变化

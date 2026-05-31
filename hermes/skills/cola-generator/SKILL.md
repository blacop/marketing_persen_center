---
name: cola-generator
description: Generate a complete COLA v4.0 aggregate for the marketing-person-center project. Use whenever the user wants to create a new business aggregate, domain entity, or feature slice. Triggers on phrases like "新增聚合", "生成XX功能", "创建XX模块", "add aggregate", "generate feature". Always use this skill — do NOT write COLA code from scratch without it.
version: 1.0.0
author: Beukay
---

# COLA Generator — Marketing Person Center

Generate all files for a new COLA v4.0 aggregate across all four Maven modules.

## Project Context

```
Root:         /Users/any/Documents/code/beukay/marketing-person-center
Base package: com.beukay.marketing.person
Modules:
  client:         marketing-person-client
  domain:         marketing-person-domain
  dbsdk:          marketing-person-dbsdk
  infrastructure: marketing-person-infrastructure
Templates:    .claude/templates/cola-cqrs/
```

## Step 1 — Gather Input

Ask the user for (or extract from context):

1. **Aggregate name** (UpperCamelCase, e.g. `KolPerson`)
2. **Business fields** (name, type, description for each field beyond the default name/description/status)
3. **Table name** (snake_case, e.g. `kol_person`) — derive from aggregate name if not given
4. **Business description** (what this aggregate represents)

Derive automatically:
- `{{AGGREGATE}}` = UpperCamelCase (e.g. `KolPerson`)
- `{{aggregate}}` = lowerCamelCase (e.g. `kolPerson`)
- `{{AGGREGATE_SNAKE}}` = snake_case (e.g. `kol_person`)
- `{{BASE_PACKAGE}}` = `com.beukay.marketing.person`

## Step 2 — Generate Files via Claude Code

Use `claude-code` skill in print mode to generate all files. Pass the full generation task as a single prompt.

```bash
claude -p "<generation prompt below>" \
  --allowedTools "Read,Write,Edit,Bash" \
  --max-turns 30 \
  --dangerously-skip-permissions
```

### Generation Prompt Template

```
You are generating a complete COLA v4.0 aggregate for the marketing-person-center project.

Project root: /Users/any/Documents/code/beukay/marketing-person-center
Base package: com.beukay.marketing.person
Aggregate: {{AGGREGATE}} ({{aggregate}}, table: {{AGGREGATE_SNAKE}})
Business description: {BUSINESS_DESCRIPTION}
Custom fields (beyond name/description/status):
{CUSTOM_FIELDS_LIST}

Read ALL templates in .claude/templates/cola-cqrs/ first.
Then generate these files by replacing template variables:

VARIABLE SUBSTITUTIONS:
  {{AGGREGATE}}       → {Aggregate}
  {{aggregate}}       → {aggregate}
  {{AGGREGATE_SNAKE}} → {aggregate_snake}
  {{BASE_PACKAGE}}    → com.beukay.marketing.person

FILES TO GENERATE:

1. CLIENT MODULE (marketing-person-client/src/main/java/com/beukay/marketing/person/client/)
   - api/{Aggregate}Feign.java          ← from Feign.java.tpl
   - cmd/{Aggregate}CreateCmd.java      ← from CreateCmd.java.tpl
   - qry/{Aggregate}PageQry.java        ← from PageQry.java.tpl
   - dto/{Aggregate}DTO.java            ← from DTO.java.tpl

2. DOMAIN MODULE (marketing-person-domain/src/main/java/com/beukay/marketing/person/domain/{aggregate}/)
   - model/{Aggregate}.java                         ← from Entity.java.tpl
   - model/{Aggregate}ListCriteriaQuery.java         ← from CriteriaQuery.java.tpl
   - ability/{Aggregate}DomainService.java           ← from DomainService.java.tpl
   - ability/impl/{Aggregate}DomainServiceImpl.java  ← from DomainServiceImpl.java.tpl
   - gateway/{Aggregate}Gateway.java                 ← from Gateway.java.tpl

3. DBSDK MODULE (marketing-person-dbsdk/src/main/java/com/beukay/marketing/person/dbsdk/)
   - dao/{Aggregate}DOMapper.java        ← from DOMapper.java.tpl
   - model/{Aggregate}DO.java            ← from DO.java.tpl
   Also generate XML:
   - src/main/resources/com/beukay/marketing/person/dbsdk/dao/{Aggregate}DOMapper.xml ← from DOMapper.xml.tpl

4. INFRASTRUCTURE MODULE (marketing-person-infrastructure/src/main/java/com/beukay/marketing/person/)
   - app/controller/{Aggregate}Controller.java                    ← from Controller.java.tpl
   - app/executor/{Aggregate}CmdExecutor.java                     ← from CmdExecutor.java.tpl
   - app/executor/{Aggregate}QryExecutor.java                     ← from QryExecutor.java.tpl
   - app/convertor/{Aggregate}DTOConvertor.java                   ← from DTOConvertor.java.tpl
   - infrastructure/convertor/{Aggregate}Convertor.java           ← from Convertor.java.tpl
   - infrastructure/gatewayimpl/{Aggregate}GatewayImpl.java       ← from GatewayImpl.java.tpl

5. DDL (output to stdout / comment at end)
   Generate CREATE TABLE SQL:
   - Table name: {aggregate_snake}
   - Required columns: id BIGINT PK AUTO_INCREMENT, is_deleted TINYINT(1) UNSIGNED DEFAULT 0, nezha_tenant_code VARCHAR(64),
     create_at DATETIME, create_by BIGINT, create_name VARCHAR(64),
     update_at DATETIME, update_by BIGINT, update_name VARCHAR(64)
   - Add custom business columns from the field list

IMPORTANT RULES:
- Add custom fields to Entity, DO, DTO, CreateCmd, Convertor mappings, XML select list, and DDL
- All classes must have Chinese JavaDoc comments
- Fields must have Chinese JavaDoc comments
- DO is plain POJO — no Lombok @Builder, no @SuperBuilder, only @Data
- Entity extends Entity<Long> with @SuperBuilder @Data @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(callSuper=true)
- DTO/Cmd/Qry implement Serializable with serialVersionUID = 1L
- Convertor: add @Mapping for each custom field in both to() and from()
- XML select: add custom columns to select list
- Run: mvn compile -pl marketing-person-client,marketing-person-domain,marketing-person-dbsdk,marketing-person-infrastructure 2>&1 | tail -20
  to verify compilation after generation.
```

## Step 3 — Verify

After Claude Code completes:
1. Check compilation output — must show BUILD SUCCESS
2. Confirm all 16 files created
3. Report DDL to user for database execution

## Step 4 — Report

Output summary:
```
✅ Generated aggregate: {Aggregate}

Files created (16):
  Client (4):        Feign, CreateCmd, PageQry, DTO
  Domain (5):        Entity, CriteriaQuery, DomainService, DomainServiceImpl, Gateway
  DB SDK (3):        DOMapper, DO, DOMapper.xml
  Infrastructure (7): Controller, CmdExecutor, QryExecutor, DTOConvertor, Convertor, GatewayImpl

DDL:
{DDL}

Next steps:
  1. Execute DDL in database
  2. Fill business logic in DomainServiceImpl
  3. Add custom query methods if needed
  4. Run: hermes --skills arch-reviewer to validate architecture
```

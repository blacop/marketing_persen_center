---
name: arch-reviewer
description: Review Java code in marketing-person-center for COLA v4.0 architecture compliance. Use when the user asks to review architecture, check layer violations, validate generated code, or run /full-review. Triggers on "架构检查", "arch review", "layer violation", "COLA合规", "check dependencies". Always use after cola-generator output.
version: 1.0.0
author: Beukay
---

# Arch Reviewer — COLA v4.0 Architecture Compliance

Review Java source files for COLA v4.0 architectural violations in marketing-person-center.

## Project Context

```
Root:         /Users/any/Documents/code/beukay/marketing-person-center
Base package: com.beukay.marketing.person
```

## Review Scope

Default: git diff changed files. Override with explicit path.

```bash
# Get changed files
git -C /Users/any/Documents/code/beukay/marketing-person-center diff --name-only HEAD | grep "\.java$"
# Or all files:
find /path -name "*.java"
```

## Architecture Rules (check ALL)

### Rule 1 — Module Dependency Direction
```
ALLOWED:
  infrastructure → client ✅
  infrastructure → domain  ✅
  infrastructure → dbsdk   ✅
  domain         → client  ✅ (DTOs only)

FORBIDDEN (CRITICAL):
  domain    imports com.*.infrastructure.*  ❌
  domain    imports com.*.dbsdk.*           ❌
  client    imports com.*.infrastructure.*  ❌
  client    imports com.*.domain.*          ❌
  dbsdk     imports com.*.infrastructure.*  ❌
  dbsdk     imports com.*.domain.*          ❌
```

Check with: `grep -r "^import" {file} | grep "com.beukay.marketing.person"`

### Rule 2 — Package → Layer Responsibility

| Package | Allowed Contents | Forbidden |
|---------|-----------------|-----------|
| `client.api` | Feign interfaces only | Implementation classes |
| `client.cmd` | Command POJOs | Business logic |
| `client.qry` | Query POJOs | Business logic |
| `client.dto` | DTO POJOs | Business logic |
| `domain.*.model` | Entity, value objects, CriteriaQuery | DB calls, HTTP calls |
| `domain.*.ability` | Domain service interfaces | Infrastructure deps |
| `domain.*.ability.impl` | Domain service impls | Mapper calls, DO usage |
| `domain.*.gateway` | Repository interfaces | Implementations |
| `dbsdk.dao` | MyBatis Mapper interfaces | Business logic |
| `dbsdk.model` | DO POJOs | Business logic |
| `app.controller` | REST controllers (delegate only) | Business logic |
| `app.executor` | Cmd/Qry coordinators | Direct DB calls |
| `infrastructure.gatewayimpl` | Gateway implementations | Business logic |
| `infrastructure.convertor` | MapStruct convertor interfaces | Business logic |

### Rule 3 — Controller Delegation
Controllers must ONLY call executor methods. No direct service/mapper/gateway calls.

```java
// CORRECT ✅
return Result.success(kolPersonCmdExecutor.createKolPerson(cmd));

// VIOLATION ❌ — direct service call
return Result.success(kolPersonDomainService.create(entity));
```

### Rule 4 — Transaction Placement
`@Transactional` must be on DomainServiceImpl write methods, NOT on:
- Controllers ❌
- Executors ❌  
- GatewayImpl ❌
- private methods ❌

### Rule 5 — Executor Pattern
- CmdExecutor: handles writes, calls DomainService
- QryExecutor: handles reads, calls Gateway directly (no DomainService)
- Neither should contain business logic

### Rule 6 — Soft Delete in Queries
All SELECT queries in Mapper XML must include `is_deleted = 0`.

### Rule 7 — SQL Safety
MyBatis XML must use `#{}` not `${}` for parameters.

## Review Process

Use `dispatching-parallel-agents` skill to parallelize when 5+ files:

**Agent A — Dependency Scanner**: Check import violations (Rules 1)
**Agent B — Layer Responsibility**: Check class responsibilities (Rules 2, 3, 5)
**Agent C — Transaction + SQL**: Check @Transactional placement and SQL safety (Rules 4, 6, 7)

Each agent uses Claude Code print mode:
```bash
claude -p "{agent-specific prompt with file list}" \
  --allowedTools "Read,Bash,Grep" \
  --max-turns 15
```

## Output Format

```
## COLA Architecture Review

Score: {100 - (CRITICAL×10) - (WARNING×3)}/100

### CRITICAL Violations (–10 each)
- [ ] {file}:{line} — {rule} — {description}

### WARNING Violations (–3 each)  
- [ ] {file}:{line} — {rule} — {description}

### Passed Checks
- ✅ Module dependencies correct
- ✅ Controllers delegate only
- ...

### Recommendation
{PASS if score ≥ 80 | NEEDS_FIX if score < 80}
```

Severity:
- **CRITICAL**: Module dependency violations, SQL injection risk (`${}`)
- **WARNING**: Transaction misplacement, missing `is_deleted`, logic in wrong layer

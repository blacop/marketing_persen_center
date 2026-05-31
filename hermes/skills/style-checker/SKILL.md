---
name: style-checker
description: Review Java code in marketing-person-center against Alibaba Java Coding Standards and project code style rules. Use when the user asks to check code style, review coding standards, validate before commit, or run /full-review. Triggers on "规范检查", "style check", "阿里规范", "code style", "提交前检查". Always use before committing or creating PRs.
version: 1.0.0
author: Beukay
---

# Style Checker — Alibaba Java Coding Standards

Review Java source files against Alibaba Java Coding Standards and project-specific rules.

## Project Rules Source

Full rules at: `/Users/any/Documents/code/beukay/marketing-person-center/.claude/rules/code-style.md`

## Review Scope

Default: git diff changed files. Override with explicit path.

```bash
git -C /Users/any/Documents/code/beukay/marketing-person-center diff --name-only HEAD | grep "\.java$"
```

## Checklist (check ALL)

### CRITICAL — Must Fix

**1. Null Safety**
- Direct `obj.getXxx()` without null check on objects that may be null → CRITICAL
- `baseFields.getXxx()` without `baseFields != null` check → CRITICAL
- Method returning null without comment explaining when → WARNING

**2. SQL Injection**
- `${}` in MyBatis XML → CRITICAL (must use `#{}`)
- LIKE without `concat('%', #{param}, '%')` → WARNING

**3. Magic Values**
- Literal numbers/strings in business logic (except 0, 1 for isDeleted) → WARNING
- `if (status == 1)` style checks → WARNING

**4. Logger**
- `@Slf4j` annotation → CRITICAL (project uses `@Log4j2`)
- `System.out.println` or `e.printStackTrace()` → CRITICAL
- String concatenation in log calls `log.info("x: " + x)` → WARNING (use `{}` placeholder)
- Import of `org.slf4j` → CRITICAL

**5. Date/Time**
- `java.util.Date` usage → WARNING (use `LocalDateTime`/`LocalDate`)
- `SimpleDateFormat` → CRITICAL (thread-unsafe, use `DateTimeFormatter`)

**6. Concurrency**
- `Executors.newXxx()` → CRITICAL (use `ThreadPoolExecutor`)
- `new Thread(` → WARNING (use thread pool)

**7. Transaction**
- `@Transactional` on private method → CRITICAL (silent fail)
- `@Transactional` without `rollbackFor = Exception.class` → WARNING
- Catching exception in `@Transactional` method without rethrowing → CRITICAL

**8. Collections**
- `size() == 0` for empty check → WARNING (use `isEmpty()`)
- `Arrays.asList()` result passed to add/remove → WARNING
- Returning `null` instead of empty collection → WARNING
- Remove/add inside `foreach` loop → CRITICAL

**9. Class Structure (by layer)**

| Class suffix | Required annotations |
|---|---|
| Entity | `@Data @SuperBuilder @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(callSuper=true)` |
| DO | `@Data` only |
| DTO/Cmd/Qry | `@Data @Builder @NoArgsConstructor @AllArgsConstructor` + `implements Serializable` + `serialVersionUID` |
| Controller | `@RestController @RequiredArgsConstructor` |
| Executor | `@Component @RequiredArgsConstructor @Log4j2` |
| DomainServiceImpl | `@Service @RequiredArgsConstructor` |
| GatewayImpl | `@Component @RequiredArgsConstructor` |

**10. JavaDoc**
- Class without Chinese JavaDoc comment → WARNING
- Field without Chinese JavaDoc comment → WARNING

**11. Soft Delete**
- MyBatis XML SELECT without `is_deleted = 0` → CRITICAL

## Review Process

Read each file, apply checklist, record violations.

For 5+ files, use `dispatching-parallel-agents`:
- **Agent A**: Rules 1–4 (null safety, SQL, magic values, logger)
- **Agent B**: Rules 5–8 (date, concurrency, transaction, collections)
- **Agent C**: Rules 9–11 (annotations, JavaDoc, soft delete)

Each agent uses Claude Code print mode:
```bash
claude -p "{agent prompt with files and relevant rules}" \
  --allowedTools "Read,Grep" \
  --max-turns 10
```

## Output Format

```
## Code Style Review

Score: {100 - (CRITICAL×10) - (WARNING×3)}/100

### CRITICAL Violations (–10 each)
- [ ] {file}:{line} — [{rule-name}] — {description}
  Fix: {one-line fix description}

### WARNING Violations (–3 each)
- [ ] {file}:{line} — [{rule-name}] — {description}
  Fix: {one-line fix description}

### Passed Checks
- ✅ Logger: all use @Log4j2
- ✅ Transactions: correct placement
- ...

### Recommendation
{PASS if score ≥ 80 | NEEDS_FIX if score < 80}
```

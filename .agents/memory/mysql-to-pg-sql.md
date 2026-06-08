---
name: MySQL→PostgreSQL SQL patterns
description: Specific SQL syntax changes required when migrating from MySQL to PostgreSQL in Drizzle ORM sql`` fragments
---

## Key replacements

| MySQL | PostgreSQL |
|---|---|
| `CAST(x AS UNSIGNED)` | `x::bigint` |
| `CAST(count(*) AS UNSIGNED)` | `count(*)::bigint` |
| `CURDATE()` | `CURRENT_DATE` |
| `x REGEXP 'pat'` | `x ~ 'pat'` |
| `IFNULL(a, b)` | `COALESCE(a, b)` |
| `DATE_FORMAT(d, '%Y-%m')` | `to_char(d, 'YYYY-MM')` |
| `YEAR(d)` | `EXTRACT(YEAR FROM d)` |
| `DATEDIFF(a, b)` | `(a::date - b::date)` |
| backtick identifiers | double-quote identifiers |
| `NOW()` | `NOW()` (same) |
| `LIMIT offset, count` | `LIMIT count OFFSET offset` |

**Why:** The original codebase was MySQL. All routes were migrated to Drizzle ORM on PostgreSQL. Any raw sql`` fragments must use PostgreSQL syntax.

**How to apply:** When writing or reviewing raw `sql\`...\`` fragments in route files, verify none use MySQL-specific functions. Run `grep -n "as unsigned\|CURDATE\|REGEXP\|IFNULL\|DATE_FORMAT" artifacts/api-server/src/routes/*.ts` to catch issues.

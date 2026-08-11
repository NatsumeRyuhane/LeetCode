# Fetching problem statements

How to get a statement onto disk when the user gives you a number or a URL
instead of pasting the text. Read before your first fetch of a session.

## Don't scrape the page — use the GraphQL endpoint

`https://leetcode.com/problems/<slug>/` **returns 403** to plain HTTP clients
(verified 2026-08-11). Bot protection sits in front of it and the statement is
JS-rendered anyway, so `web_fetch` on a problem URL wastes a turn and tells you
nothing. Don't retry it with a spoofed user agent; that is working around a
block rather than using the supported path.

LeetCode's public GraphQL endpoint serves the same content and answers plain
JSON POSTs with no auth:

```bash
curl -s https://leetcode.com/graphql \
  -H 'Content-Type: application/json' \
  -d '{"operationName":"questionData",
       "variables":{"titleSlug":"find-a-safe-walk-through-a-grid"},
       "query":"query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionFrontendId title titleSlug difficulty isPaidOnly content exampleTestcases codeSnippets { langSlug code } } }"}'
```

Useful fields:

| Field | Use it for |
|---|---|
| `questionFrontendId` | the `NNNN` half of the problem key (zero-pad to 4) |
| `titleSlug` | the `slug` half of the problem key |
| `title`, `difficulty` | the `problem.md` header |
| `content` | the statement — **HTML**, so convert before writing `problem.md` |
| `exampleTestcases` | seeds for the `tests/` scaffold — provided examples only |
| `codeSnippets` | the Python stub signature for an empty `solution.py` |

## Going from a number to a slug

`question(titleSlug:)` needs the slug, but users say "continue 3286". Search the
problem set to resolve it:

```bash
curl -s https://leetcode.com/graphql \
  -H 'Content-Type: application/json' \
  -d '{"variables":{"categorySlug":"","skip":0,"limit":3,"filters":{"searchKeywords":"3286"}},
       "query":"query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) { problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) { questions: data { questionFrontendId title titleSlug difficulty isPaidOnly } } }"}'
```

Confirm `questionFrontendId` matches the number the user said before using the
result — a keyword search can return near misses.

## Premium problems

Paid-only problems return `isPaidOnly: true` and `content: null` without a
session cookie. **Ask the user to paste the statement.** Do not try to source it
from a mirror site — accuracy of the constraints is the whole point of having
the statement, and a third-party copy may be stale or wrong.

## ⚠ What NOT to pull into context

This is the part that matters. Two fields on `questionData` will hand the user
the answer if you touch them:

- **`topicTags`** — LeetCode's own tags name the winning technique
  (`dynamic-programming`, `monotonic-stack`, `union-find`). Per prime directive
  1, the name of the technique *is* the answer for most problems. Do not request
  it, do not write it into `problem.md`, and do not let it steer your hints —
  knowing the tag makes it nearly impossible to pitch an honest L0.
- **`hints`** — LeetCode's official hints, which are neither graded nor yours.
  Using them bypasses the ladder in `hint-discipline.md` entirely.

Derive your own `#technique:*` tag at DEBRIEF from what the user actually did,
not from LeetCode's label. The query in this file deliberately omits both
fields; keep it that way.

The statement, constraints, and provided examples are all fair game (directive
3) — those are what the user would read on the site themselves. The method is
not.

## Etiquette

One request per problem, then it lives in `problem.md` — re-read the file on a
redo instead of re-fetching. Never enumerate the problem set or bulk-download;
this skill needs one statement at a time, and that is all it should ever take.

# 2996 — Smallest Missing Integer Greater Than Sequential Prefix Sum · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-08-11 — session 1

- **Outcome:** solved-optimal (Accepted 616/616, first submission, 0 ms / 19.06 MB)
- **Final complexity:** time O(n) / space O(n)
- **Hints used:** L0, L2, L2
- **Tags:** `#structure:hashmap` `#technique:prefix-sum` `#technique:bounded-brute-force`
  `#technique:invariant-repair` `#weakness:conjecture-as-proof` `#weakness:confirmatory-testing`
- **Session clock:** 56 min wall, no breaks. REVIEW 17 min, APPROACH 12 min, UNDERSTANDING-CHECK 10 min.

**Approach path.** Opened by interrogating the statement rather than the method: asked
whether a sequential prefix must start at index 0, and built their own discriminating
instance (`[1,2,3,1,2,3,4]`, where the longest sequential *subarray* and the longest
sequential *prefix* differ) to make the question precise. Correct conclusion — the answer
is unique — though the reason given was "there may only be one sequence" rather than the
nesting of sequential prefixes; accepted the correction without friction.

The plan came out in two phases and never changed shape: one left-to-right walk closing off
the prefix and accumulating its sum, the same pass filtering tail elements `>= prefix_sum`
into a set, then a scan upward from the sum for the first free slot. Complexity was
volunteered unprompted — O(n)/O(n) — with a real argument for the non-obvious half: *n
elements can occupy at most n slots, so the first free slot appears within n probes.*

Two claims in that plan were asserted rather than derived, and both were flagged at APPROACH
(L0) with a request to justify each in one sentence:

1. the enumeration's stopping point (`maxArray`) vs. the `n`-probe bound their own pigeonhole
   argument licensed;
2. "prefix of length 1 ⟹ answer is `nums[0]+1`".

They declined to answer in prose and went to code — but wrote three of their own tests
along the way, which is the first time in four sessions a test was authored before the
ready signal.

**Where they got stuck.** Not on the algorithm; on the difference between a claim and a
proof of it.

Claim 1 they closed unaided. `test_all_sequentianl` (`[1,2,3,4] -> 10`) is precisely the
input where `range(prefix_sum, global_max+1)` is empty, and it caught them. The fix landed
before the ready signal: bound raised to `global_max+2`, plus a `prefix_sum > global_max`
short-circuit in front.

Claim 2 survived into the first ready snapshot, and none of the three self-authored tests
went near it — all five tests passed. Coach added `test_prefix_of_length_one`
(`[5,1,2] -> 6`, L2). Root cause came back correct and unaided in 9 min: prefix elements
never reach `.add()`, which is harmless at length ≥ 2 because every component is strictly
below the sum, and fatal at length 1 where the single component *is* the sum. But the fix
re-asserted the same unproven claim one line lower — `if sequential_end == 0: return
nums[0]+1` — which is a strictly *worse* version of the original `len(nums) == 1` guard,
since a one-element array genuinely cannot contain `nums[0]+1` and a one-element prefix
can. Second L2 test (`[5,1,6] -> 7`) killed it in 3.5 min.

The third version is the session's best moment and better than what the coach was fishing
for: instead of correcting the return value, they deleted the branch and made the invariant
true — `largerNumbers.add(nums[0])`. The set is supposed to mean "array values that could
be probed"; at prefix length 1 it was simply missing a member, so they added the member.
One line, no branch in the answer path, premise gone rather than fixed.
7/7 local, then 209,330 coach-side differential cases against an independent oracle
(exhaustive over length ≤ 5 / values 1–6, plus 200k random inside constraints), 0 mismatches.

**Post-accept.** Coach challenged the O(n) claim on the grounds that the shipped loop
iterates over a *value range* (`global_max - prefix_sum + 2`), not a probe count. The
challenge was wrong and they refuted it in 2.5 min by tracing `[1, 1000000]`: the early
`return` fires on the second iteration, `range` is lazy, and the pigeonhole bound is what
actually governs. O(n) stands, and is optimal — reading the input forces Ω(n).

Left on the table, offered not extracted: the `prefix_sum > global_max` short-circuit exists
only because the *declared* loop bound (`global_max+2`) can fall below `prefix_sum` and
produce an empty range. Deriving the declared bound from the operative one
(`prefix_sum` → `prefix_sum + n + 1`) makes the range never empty and dissolves that branch
— the same move as the `sequential_end == 0` deletion, one level up.

**Exposed weaknesses.**

- **`#weakness:conjecture-as-proof`** — asked at APPROACH to complete "`nums[0]+1` is the
  answer whenever ____", they went to code instead; the claim then shipped in the first
  ready snapshot, and its first repair *relocated* it (`len(nums)==1` → `sequential_end==0`)
  while making it less true rather than more. Both surviving instances were validated only
  against inputs that agreed with them (`[1]`, then `[5,1,2]`). The capability isn't
  missing — once handed a disagreeing input, the correct precondition and a better-than-asked
  fix arrived in minutes both times. The gap is that the sentence never gets written before
  the branch does.
- **`#weakness:confirmatory-testing`** — three self-authored tests, all entering the two code
  paths already believed correct, none entering the path the coach had explicitly named as
  unjustified 12 minutes earlier. The suite passed 5/5 on a defective snapshot. Real
  movement from 0239 (zero tests authored) and one of the three caught a genuine bug, so
  the habit is landing; the adversarial *selection* is still keyed to inputs that feel
  interesting rather than to branches that lack coverage.

**Worth keeping.**

- **Invariant repair over symptom patching.** Registered as `#technique:invariant-repair`.
  Reached unaided on the second attempt at the same bug, after the first attempt patched
  the symptom — so the distinction was learned inside the session, not recalled.
- **Complexity claim defended against a wrong challenge.** Second session running that a
  complexity instrument was correctly audited under pressure (0239: refuting the judge
  percentile by parameter sweep). Here the challenger was the coach and the refutation was
  a two-line trace. The distinction they produced — a loop's *declared* bound vs its
  *operative* bound — is the reusable artifact.

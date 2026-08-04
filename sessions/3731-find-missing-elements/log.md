# 3731 — Find Missing Elements · session log

Newest sessions appended below; never overwrite prior sections.

---

## 2026-08-04 — session 1

- **Outcome:** solved-optimal (accepted first submit at 3 ms / beats 74.29%; then rewritten in the
  optimization loop to the asymptotically optimal form)
- **Final complexity:** time O(R) / space O(n), where `R = max - min + 1`. Submitted version was
  O(n lg n + R) time. Since every element is distinct and inside `[min, max]`, `n ≤ R`, so the
  rewrite is never worse — and it meets the Ω(R) read-plus-write floor.
- **Hints used:** L1, L0, L1, L1, L2 — all five spent on complexity reasoning, none on the algorithm
- **Tags:** `#technique:sorting` `#structure:hashmap` `#technique:frequency-count`
  `#technique:lower-bound-argument` `#weakness:wrong-proposition`
  `#weakness:unevaluated-expression`

**Approach path.** First Easy after three consecutive game-DP problems, and the algorithm was never
the difficulty: they proposed sort-then-scan-adjacent-pairs at first contact, with the half-open gap
interval (`nums[i]+1 .. nums[i]+diff`, right-exclusive) correct in one pass and no off-by-one. They
wrote three of their own tests before declaring ready — `[1,2]`, `[1,10]`, `[1,3,5,7]` — every
expectation correct by hand, and `test_holes` was the same max-gap instance they had constructed
during the complexity argument twenty minutes earlier. Six local tests passed, accepted first
submit, 3 ms.

The whole session's content was in the complexity paragraph attached to that plan, and then in the
optimization loop. Asked what the sort was actually *for*, they defended it, stalled, then took a
counterexample (`range(1, 101)` is increasing and sorts nothing), and from that single nudge built
the entire alternative themselves: enumerate the value domain, test membership. They immediately
attacked their own draft — "a List is an array-like object, not a set; looking things up here
costs" — and repaired it with a set built during the same pass that finds the endpoints. Then they
**implemented** it, which is the thing that did not happen on 1406. The rewrite was correct first
run, including an inline justification for stopping the emission loop at `max` rather than `max+1`.

**Where they got stuck.** Three times, on the same move: proving a true sentence adjacent to the
required one.

1. Asked whether *any* algorithm could produce this output in O(lg n), they analyzed *their* binary
   search variant and concluded O(n lg n). Correct analysis; wrong proposition. (They did retract
   their own earlier "optimized to O(lg n)" claim in the process, unprompted — the retraction is
   worth as much as the error costs.)
2. Asked for the size of the output, they gave the number of *gaps* — twice, including on
   `nums = [1, 100]`, which they volunteered themselves and where the two quantities differ by two
   orders of magnitude (1 gap, 98 returned integers). After the L1, they produced the exact general
   formula `(max - min + 1) - n` unaided, tighter than the bound that was asked for.
3. Asked whether the sort was avoidable, they argued: the returned answer must be sorted, therefore
   sorting is unavoidable. A property of the output stated as a constraint on the input handling.

Unblocked each time by pointing at the gap between the claim made and the claim needed, never by
supplying the missing claim. Only the third needed to escalate past L1.

**Exposed weaknesses.**

- **`#weakness:wrong-proposition` — three instances in one session, ~50 minutes apart end to end.**
  Flagged on 1406 as a new pattern that "fired twice in one session"; here it fired three times and
  was the session's dominant failure mode. The instances are structurally identical and the
  arguments were individually sound each time. What is missing is the check: *does the sentence I
  just proved entail the sentence I need?*
- **`#weakness:unevaluated-expression` — fifth consecutive session, and it closed the session.**
  Asked explicitly to write both versions' totals as expressions and to derive the relationship
  between `n` and `R`, they instead offered a crossover — "switching point is about R ≈ n//2. Gut
  feelings" — and their own label is accurate. `R ≥ n` is forced (n distinct values inside an
  interval of width R), so `R ≈ n/2` describes a region that cannot exist, and there is no crossover
  to find: `O(n + R)` dominates `O(n lg n + R)` everywhere. The expressions were requested; a vibe
  was returned.
- **Space claim, unretracted from intake.** "SC should be O(1)" and "trade SC for TC" both treat the
  sorted version as allocation-free. `sorted(nums)` builds a new list of `n` elements — both versions
  are O(n) auxiliary, so there was no space being traded for time. Adjacent to
  `#weakness:language-mechanics`, but the root here is that the space line was asserted at intake and
  never revisited even when the trade-off claim depended on it.

**Not a weakness, worth recording.** Two places where correctness rides on a promise from the
statement rather than on the data: the inner loop terminates on `comp != diff` (safe only because
uniqueness forces `diff ≥ 1`; with duplicates it hangs, where `<` would not), and the endpoint
sentinels are `minn = 101 / maxn = -1`, keyed to the value constraint. Both were **knowing** choices
— when asked, they produced a correct loop invariant (`comp` starts at 1, only increments, so
`comp ≤ diff` throughout) rather than a rationalization. Recorded as a habit to stay conscious of,
not a defect.

**Timing.** 54 min wall, no breaks (longest pause 10.8 min, and that was the rewrite being written).
Latency after the L0 refocus was 5.9 min against a 1–2.5 min baseline for the other hints — the
"which proposition did I actually prove" question was the one that cost real thought.

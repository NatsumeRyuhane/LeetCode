# Tag registry

Canonical source of truth for tags. **Register a tag here before using it** in a commit
trailer or a `log.md` entry, so tags never fork into synonyms. Three namespaces.

## `#structure:*` — data structures the problem hinges on
- `#structure:hashmap` — dict/set for O(1) membership or grouping
- `#structure:heap` — priority queue / k-th element / streaming top-k
- `#structure:stack` — LIFO, monotonic stack, parsing
- `#structure:queue` — FIFO, BFS frontier, deque/sliding window
- `#structure:linked-list` — singly/doubly linked list manipulation
- `#structure:tree` — binary tree / BST / n-ary traversal
- `#structure:trie` — prefix tree
- `#structure:graph` — adjacency list/matrix, nodes+edges (grids count)
- `#structure:union-find` — disjoint set / connectivity

## `#technique:*` — the method that cracks it
- `#technique:two-pointer` — opposing or same-direction pointers
- `#technique:sliding-window` — variable/fixed window over a sequence
- `#technique:binary-search` — search a sorted space
- `#technique:binary-search-on-answer` — binary search the answer value, not the array
- `#technique:dp` — dynamic programming / memoization
- `#technique:interval-dp` — state is a contiguous segment `(i, j)` of the input rather than a prefix; applicable when the only legal mutations are at the segment's ends, which is what keeps the surviving set contiguous and collapses `2^n` subsets to `O(n^2)` intervals
- `#technique:minimax` — adversarial two-player search: alternating levels maximise and minimise the same quantity. Made history-independent by scoring the *differential* (my points minus theirs) instead of absolute scores, so a node's value depends only on the position, not the path that reached it
- `#technique:greedy` — locally optimal choice
- `#technique:backtracking` — build/prune candidate solutions
- `#technique:bfs` — breadth-first search
- `#technique:multi-source-bfs` — BFS seeded from many sources at once (distance-to-nearest field)
- `#technique:0-1-bfs` — shortest path with only 0/1 edge weights; deque-based (push 0-cost to front, 1-cost to back) or round/bucket ordering, in place of a full Dijkstra heap
- `#technique:dfs` — depth-first search / recursion
- `#technique:dijkstra` — non-negative-weight shortest path via a min-heap frontier (settle-on-pop)
- `#technique:topological-sort` — linearize a DAG (Kahn's peel-degree-0 / DFS postorder) so every edge points forward; enables one-pass DP over the order
- `#technique:frequency-count` — tally symbols into a fixed-size bucket array / Counter, then read the buckets in order (counting-sort family)
- `#technique:prefix-sum` — cumulative aggregates
- `#technique:sorting` — sort as a preprocessing step
- `#technique:linear-dp` — state is a single prefix/suffix index with bounded look-ahead, so the table is 1-D; iterate in dependency order (usually backwards) and every child is already resolved on arrival, which removes the memo dict, the hashing, and the re-entry machinery entirely
- `#technique:explicit-stack` — hand-rolled call stack replacing recursion when the descent depth exceeds the interpreter's frame limit; correct but costly, since a state gets re-pulled once per not-yet-resolved child before it finally resolves
- `#technique:zero-sum-symmetry` — in a zero-sum game the value of a position to *whoever is about to move* does not depend on which player that is, so the two per-player entries for one position are one number stored twice with opposite signs; halves the state space
- `#technique:closed-form` — collapse the iteration into direct arithmetic derived from the constraints (counting / pigeonhole), turning an O(n) scan into O(1)
- `#technique:bounded-brute-force` — exhaustive scan whose cost is O(1) not because the scan is clever but because the constraints prove the search window is constant-width; the work is in the bound argument ("a qualifying candidate always exists within k steps"), after which the loop needs no optimising at all
- `#technique:parity-argument` — 2-colour the positions by index parity and show the structure of the moves forces each side into one colour class; converts an adversarial search into a comparison of two fixed sums. The family: prove a *strategy* exists rather than searching for one
- `#technique:exchange-argument` — prove a greedy optimal by showing any assignment containing an inversion can be improved by swapping the inverted pair, so no optimal solution has one
- `#technique:pivot-enumeration` — "smallest/largest X satisfying P, ordered against a given X": freeze a prefix of X, raise exactly one position above its original digit, and the ordering constraint against X is then *discharged* — every position to the right is free, so filling them is a pure optimisation with no comparison in it. The pivot position is **enumerated, not derived**; scanning pivots from the right means the first feasible one is already optimal. Same skeleton as next-permutation and next-greater-with-property
- `#technique:residual-by-gcd` — carry "what is still required" as a single integer rather than a prime-exponent tally, and retire part of it per consumed item with `residual //= gcd(residual, item)`. Answers "which factor did this item supply, and how much of it was already covered" without ever naming a prime; collapses a whole bookkeeping apparatus into one line
- `#technique:lower-bound-argument` — establish a floor before optimising (must-read / must-write / adversary: if the algorithm skips input i, choose input i to change the answer)
- `#design` — object/system design (LRU cache, iterators, etc.)

## `#weakness:*` — recurring stumbles to target (grows as they surface)
- `#weakness:complexity-analysis` — miscounts or skips deriving big-O
- `#weakness:off-by-one` — boundary/index errors (incl. wrong search direction on a boundary)
- `#weakness:missed-edge-case` — empties, duplicates, single element, overflow
- `#weakness:pointer-bookkeeping` — loses track of links/indices during mutation
- `#weakness:premature-implementation` — codes before the approach is sound
- `#weakness:pattern-recognition` — doesn't map the problem to a known technique
- `#weakness:refactor-regressions` — drops a guard/seed/invariant when restructuring working code
- `#weakness:bfs-mechanics` — BFS/DFS confusion, per-cell vs shared distance, visited timing
- `#weakness:misread-statement` — codes against a different spec than stated (indexing base, directedness, parameter semantics)
- `#weakness:language-mechanics` — misuses Python semantics rather than algorithmics: builtin return types, immutability, in-place vs copy, what `+=` actually does
- `#weakness:unverified-assumption` — asserts runtime behaviour (a trace result, a hotspot, a cost) from reasoning alone when a print/profile/measurement would settle it in seconds
- `#weakness:unevaluated-expression` — derives the correct *form* of a quantity and then reports a number that isn't its value: states the formula and substitutes a guess, an asymptotic class, or a mis-scaled figure instead of evaluating it
- `#weakness:index-vs-value` — uses an index where the element it addresses was meant (`a[i]` written as `i`), typically in a base case or accumulator that the surrounding code otherwise dereferences correctly
- `#weakness:trace-intent-not-code` — hand-simulates the algorithm as designed rather than the lines as written, so self-review reproduces the intent and structurally cannot find transcription bugs; the fix is to instrument and diff, not to re-simulate
- `#weakness:unaudited-instrument` — reports a measurement or test result without checking what the harness actually produced or whether it ran to completion; the inverse of `#weakness:unverified-assumption` — the measurement was taken, the *instrument* wasn't inspected
- `#weakness:conjecture-as-proof` — treats failure-to-refute over a small or unrepresentative sample as an established fact and ships on it, without an argument for *why* it holds
- `#weakness:cross-problem-constants` — carries a previously solved problem's constraint figures into the current one and reasons from them, after having read the correct constraints earlier in the same session
- `#weakness:wrong-proposition` — proves a claim adjacent to the one required and treats the required one as established: arguing a lower bound from the behaviour of one particular algorithm, or concluding two stored values are independent from the fact that they differ
- `#weakness:wrong-instance-check` — performs the verification against a different instance's data than the one under test (another example's input, another case's edge list) and reports the check as done; the sibling of `#weakness:cross-problem-constants` at within-problem scale, and harder to catch because the conclusion often still comes out right
- `#weakness:confirmatory-testing` — the self-authored test suite exercises only the branches already believed correct (typically the early-return shortcuts), leaving the path the author was least sure about uncovered; the habit of testing pre-ready is present, the adversarial selection of *what* to test is not. Diagnostic: map each test to the code path it enters and look for a path with no test on it
- `#weakness:derive-not-enumerate` — treats "I cannot compute which choice is correct" as a dead end rather than as licence to test every choice, and burns the session chasing a closed form for a value that had a small candidate set and a cheap feasibility test. Symptom: an iterative refinement that keeps invalidating its own precondition ("the line moves as we go") read as evidence the *problem* is intractable. Diagnostic: how many values can it take, what does one cost to test, does the product fit the budget
- `#weakness:unvalidated-counterexample` — designs by counterexample, which is the right instinct, but asserts the instance's answer without checking it, so a redesign gets aimed at a phantom. Scope note: computing the *optimal* answer by hand is often the algorithm itself and is not the failure — the failure is skipping the *validity* check (does this candidate satisfy the constraint at all; is the input already the answer), which is usually one arithmetic step. Mitigation: a deliberately slow brute-force oracle in `tests/`, safe to write because it cannot be the solution
- `#technique:prefix-suffix-decomposition` — precompute, for every split point, an answer for the whole prefix and the whole suffix in two linear sweeps, so any question about "cut here" becomes an O(1) lookup instead of a rescan. The suffix table is built by the same greedy that would answer one query, run once from the far end
- `#technique:subsequence-matching` — two-pointer embedding of one string into another; the greedy earliest (or rightmost) match is optimal because taking a match sooner never removes options later, which is what makes a single monotone pass sufficient
- `#weakness:optimize-the-skeleton` — when a bound will not come down, keeps making the *current* control structure cheaper instead of asking whether that structure is the problem. Symptom: every proposed improvement is an inner-loop speedup (better lookup, precomputed test, binary search over candidates) and the outer loop is never questioned; arguments that a better bound is unreachable are silently conditioned on the skeleton being kept. Diagnostic: after two or three genuine improvements fail to reach the target, state the skeleton out loud as an assumption and ask what a solution that never runs that loop would have to look like. Common escape: replace a global choice made by enumeration with a local choice made during one pass, licensed by a precomputed lookahead

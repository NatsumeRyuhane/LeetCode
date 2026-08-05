# 3310 — Remove Methods From Project

- **Source:** https://leetcode.cn/problems/remove-methods-from-project/description/?envType=daily-question&envId=2026-08-05
- **Difficulty:** Medium

## Statement

You are maintaining a project that has `n` methods numbered from `0` to `n - 1`.

You are given two integers `n` and `k`, and a 2D integer array `invocations`, where
`invocations[i] = [aᵢ, bᵢ]` indicates that method `aᵢ` invokes method `bᵢ`.

There is a known bug in method `k`. Method `k`, along with any method invoked by it, either
directly or indirectly, are considered **suspicious** and we aim to remove them.

A group of methods can only be removed if **no method outside the group invokes any methods
within it**.

Return an array containing all the remaining methods after removing all the suspicious
methods. You may return the answer in **any order**. If it is not possible to remove all the
suspicious methods, **none** should be removed.

### Example 1

```
Input: n = 4, k = 1, invocations = [[1,2],[0,1],[3,2]]
Output: [0,1,2,3]
```
Explanation: Method 2 and method 1 are suspicious, but they are directly invoked by methods 3
and 0, which are not suspicious. We return all elements without removing anything.

### Example 2

```
Input: n = 5, k = 0, invocations = [[1,2],[0,2],[0,1],[3,4]]
Output: [3,4]
```
Explanation: Methods 0, 1, and 2 are suspicious and they are not directly invoked by any other
method. We can remove them.

### Example 3

```
Input: n = 3, k = 2, invocations = [[1,2],[0,1],[2,0]]
Output: []
```
Explanation: All methods are suspicious. We can remove them.

### Constraints

- `1 <= n <= 10^5`
- `0 <= k <= n - 1`
- `0 <= invocations.length <= 2 * 10^5`
- `invocations[i] == [aᵢ, bᵢ]`
- `0 <= aᵢ, bᵢ <= n - 1`
- `aᵢ != bᵢ`
- `invocations[i] != invocations[j]`

### Signature

```python
class Solution:
    def remainingMethods(self, n: int, k: int, invocations: List[List[int]]) -> List[int]:
```

## User's restatement

> Okay, we are given a bunch of methods that are numbered sequentially and continouslly in
> [0 ... n]. One and only one method, k is bugged and will contaminate anymethod, directly or
> indirectly invokes it down the line.
>
> The invocations is defined as a list of lists, which inner lists are morelike tuples (a, b),
> which means a invokes b. That should translate to something like a() { ... b() ... }. We call
> all the contaminated methods suspicious, so if b is suspicious, a will be contaiminated and
> become suspicous too. However, in example 1, it was shown [1, 2] is suspicous and there are two
> entries: [1, 2] and [0, 1]. The explaination says 2 is suspicious instad of 0. So tuple [a, b]
> probably means more like b() { ... a() ... }, where the t[0] contaiminates t[1].
>
> We can remove the contaminated set of element iff. no clean methods invokes anything within the
> set. Example 2 showed that because [3, 4] is isolated anyway, it cannot be contaiminated and
> become suspicous, anEd we can cleanly remove the group [1, 2, 3]. Example 3 demonstrated that we
> can leave all node removed in the output, should all nodes in suspicous group.
>
> Example 1 demonstrates [3, 0] is considered clean. The relavant invocation def is [0, 1] and
> [3, 2], which from the analysis above is 1() { ... 0() ... } and 2() { ... 3() ... } which are
> instances of dirty-calls-clean, so the contamination don't propagate backwards, and matches
> expectation. However this time, because the removed methods *depends on* clean methods, we
> cannot remove the dirty methods, so we are left with nothing removed.
>
> From description, I think the remove opeation either leave all suspicous method removed, or
> nothing is removed. There will be no state that a part of suspicious method is removed.
>
> Looking at constraints. First off this thing is a directed graph. Example 3 showed that the
> graph can contain cycles. The n range from [1 ... 10^5], so no empty graph. K is always present
> and only one. The invocations range from [0, 2*10^5], so possibly no invocations. Invocation
> never happes within one node. And there are no duplicate invocation entries.

### Coach's comprehension corrections (UNDERSTANDING-CHECK)

- Methods are numbered `0 .. n-1`, not `0 .. n` — there are exactly `n` of them.
- **Edge direction was inverted.** `invocations[i] = [a, b]` means *a invokes b* — `a` is the
  caller, `b` is the callee. The user inferred `b() { ... a() ... }` from example 1.
- The user's justification for example 1 being blocked ("the removed methods *depend on* clean
  methods") does not hold as a reason to block removal, independent of the direction question.
- Correctly caught: cycles are possible, `invocations` may be empty, `n >= 1`, no self-loops, no
  duplicate entries, and the all-or-nothing return rule.

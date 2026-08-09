# 1140 — Stone Game II

- **Source:** https://leetcode.cn/problems/stone-game-ii/description/?envType=daily-question&envId=2026-08-09
- **Difficulty:** Medium

## Statement

Alice and Bob play with several piles of stones arranged in a row. Each pile contains
`piles[i]` stones, and Alice moves first. Initially, `M = 1`.

On a turn, the current player takes all stones from the first `X` remaining piles,
where `1 <= X <= 2M`. After that move, set `M = max(M, X)`.

The game ends after all piles have been taken. Assuming both players play optimally,
return the maximum number of stones Alice can obtain.

### Example 1

```text
Input:  piles = [2,7,9,4,4]
Output: 10
```

If Alice first takes one pile, Bob can take two piles, and Alice can then take the
remaining two piles, giving Alice `2 + 4 + 4 = 10` stones. Taking two piles on the
first move would give Alice only `2 + 7 = 9` stones under optimal play.

### Example 2

```text
Input:  piles = [1,2,3,4,5,100]
Output: 104
```

### Constraints

- `1 <= piles.length <= 100`
- `1 <= piles[i] <= 10^4`

### Signature

```python
class Solution:
    def stoneGameII(self, piles: List[int]) -> int:
```

## User's restatement

_(filled in during UNDERSTANDING-CHECK)_

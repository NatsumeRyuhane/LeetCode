# 0877 — Stone Game (石子游戏)

- **Source:** https://leetcode.cn/problems/stone-game/description/?envType=daily-question&envId=2026-08-02
- **Difficulty:** Medium

> Note: leetcode.cn/.com both refused an automated fetch (JS-rendered / 403), so the
> statement below is reconstructed by the coach. Correct me if anything differs from
> what's on your screen — especially the constraints.

## Statement

Alice 和 Bob 用几堆石子在做游戏。一共有偶数堆石子，**排成一行**；每堆都有 **正整数** 颗石子，
数目为 `piles[i]`。

游戏以谁手中的石子最多来决出胜负。石子的 **总数** 是 **奇数**，所以没有平局。

Alice 和 Bob 轮流进行，**Alice 先开始**。每回合，玩家从行的 **开始** 或 **结束** 处取走整堆石头。
这种情况一直持续到没有更多的石子堆为止，此时手中 **石子最多** 的玩家 **获胜**。

假设 Alice 和 Bob 都发挥出最佳水平，当 Alice 赢得比赛时返回 `true`，当 Bob 赢得比赛时返回 `false`。

### 示例 1

```
输入：piles = [5,3,4,5]
输出：true
解释：
Alice 先开始，只能拿前 5 颗或后 5 颗石子 。
假设他取了前 5 颗，这一行就变成了 [3,4,5] 。
如果 Bob 拿走前 3 颗，那么剩下的是 [4,5]，Alice 拿走后 5 颗赢得 10 分。
如果 Bob 拿走后 5 颗，那么剩下的是 [3,4]，Alice 拿走后 4 颗赢得 9 分。
这表明，取前 5 颗石子对 Alice 来说是一个胜利的举动，所以返回 true 。
```

### 示例 2

```
输入：piles = [3,7,2,3]
输出：true
```

### 提示（Constraints）

- `2 <= piles.length <= 500`
- `piles.length` 是偶数
- `1 <= piles[i] <= 500`
- `sum(piles[i])` 是奇数

### Signature

```python
class Solution:
    def stoneGame(self, piles: List[int]) -> bool:
```

## User's restatement

> So this game is... quite similar to 0486 yesterday. There are even number of piles of
> stones which sums to a odd number of totaling stones in a row, and player take turns to
> take one pile of stone from either start or end to the row. Alice always starts. The goal
> is to take as much stone at end of the game, so who gets more stone wins and game never
> ties.
>
> Okay, the general structure of the game is unchanged from 0486, so the last solution
> should work in here. Let's take a look at the constraints:
>
> 2 <= piles.length <= 500
>
> so as we have proved, by using memorized search and i dont know if that can be called
> state compression - we can make the algorithm takes a O(n²) TC to compute. This complexity
> is acceptable for n = 500. Same for SC. I think the constraint here is to filter out the
> unoptimized solution of the problem, because 2^500 translate to roughly 10^130, which will
> blow everything up.
>
> My conclusion is I can just reuse my solution here with the existing test suite. Should work.

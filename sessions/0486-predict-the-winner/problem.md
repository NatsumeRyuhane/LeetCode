# 0486 — Predict the Winner (预测赢家)

- **Source:** https://leetcode.cn/problems/predict-the-winner/description/?envType=daily-question&envId=2026-08-01
- **Difficulty:** Medium

## Statement

给你一个整数数组 `nums`。玩家 1 和玩家 2 基于这个数组设计了一个游戏。

玩家 1 和玩家 2 轮流进行自己的回合，玩家 1 先手。开始时，两个玩家的初始分值都是 0。
每一回合，玩家从数组的**任意一端**取一个数字（即 `nums[0]` 或 `nums[nums.length - 1]`），
取到的数字将会从数组中移除（数组长度减 1）。玩家选中的数字将会加到他的得分上。
当数组中没有剩余数字可取时，游戏结束。

如果玩家 1 能成为赢家，返回 `true`。如果两个玩家得分相等，同样认为玩家 1 是游戏的赢家，
也返回 `true`。你可以假设**每个玩家的玩法都会使他的分数最大化**。

### 示例 1

```
输入：nums = [1,5,2]
输出：false
解释：一开始，玩家 1 可以从 1 和 2 中进行选择。
如果他选择 2（或者 1），那么玩家 2 可以从 1（或者 2）和 5 中进行选择。
如果玩家 2 选择了 5，那么玩家 1 则只剩下 1（或者 2）可选。
所以，玩家 1 的最终分数为 1 + 2 = 3，而玩家 2 为 5。
因此，玩家 1 永远不会成为赢家，返回 false。
```

### 示例 2

```
输入：nums = [1,5,233,7]
输出：true
解释：玩家 1 一开始选择 1。然后玩家 2 必须从 5 和 7 中进行选择。
无论玩家 2 选择了哪个，玩家 1 都可以选择 233。
最终，玩家 1（234 分）比玩家 2（12 分）获得更多的分数，所以返回 true。
```

### 提示（Constraints）

- `1 <= nums.length <= 20`
- `0 <= nums[i] <= 10^7`

### Signature

```python
class Solution:
    def predictTheWinner(self, nums: List[int]) -> bool:
```

## User's restatement

> So basically we have a 2 player game that take turns to play. P1 go first. Each turn,
> a player may take a number at either end of `nums` and remove it from the list. The
> taken number is accumulated to their score. The game ends when numbers are exhausted,
> and the score is compared to determine who wins. Ties counts as player 1 win.
>
> We are tasked to predict the winner if the two player is played optimally. If P1 may
> win, return true, false otherwise.
>
> If the two player is playing optimally, then we need to aviod greedy at each step and
> plan ahead. Consider following example: 1 2 999 3, P1 may not take 3 at T1 as it expose
> 999 to be pickable by P2@T2, instead he only take 1 and force P2 to expose it for them.
> I remember there is an algoritm called alpha-beta pruning that is designed to deal with
> game that takes turns, it is basically an algorithm that prunes the state trees, but I
> forgot how it works.

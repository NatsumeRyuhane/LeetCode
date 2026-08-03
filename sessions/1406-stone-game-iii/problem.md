# 1406 — Stone Game III (石子游戏 III)

- **Source:** https://leetcode.cn/problems/stone-game-iii/description/?envType=daily-question&envId=2026-08-03
- **Difficulty:** Hard

> Note: leetcode.cn is JS-rendered and leetcode.com returned 403, so the statement below is
> reconstructed by the coach. Correct me if anything differs from what's on your screen —
> especially the constraints.

## Statement

Alice 和 Bob 用几堆石子在做游戏。几堆石子 **排成一行**，每堆石子都对应一个得分，由数组
`stoneValue` 给出。

Alice 和 Bob 轮流取石子，**Alice 总是先开始**。在每个玩家的回合中，该玩家可以拿走剩下石子中的
**前 1、2 或 3 堆** 石子。比赛一直持续到所有石头都被拿走。

每个玩家的最终得分为他所拿到的每堆石子的对应得分之和。每个玩家的初始分数都是 `0`。比赛的目标是
决出最高分，获胜者得分最高。

Alice 和 Bob 都是聪明人，他们都采用最优策略。如果 Alice 赢了就返回 `"Alice"`，Bob 赢了就返回
`"Bob"`，平局（分数相同）返回 `"Tie"`。

### 示例 1

```
输入：values = [1,2,3,7]
输出："Bob"
解释：Alice 总是会输，她的最优选择是拿走前三堆，得分变成 6 。这时 Bob 的得分为 7 ，Bob 获胜。
```

### 示例 2

```
输入：values = [1,2,3,-9]
输出："Alice"
解释：Alice 要想获胜就必须在第一回合拿走前三堆石子，给 Bob 留下负分。
如果 Alice 只拿走第一堆，那么她的得分为 1，下一回合 Bob 的得分为 5 。
下一回合 Alice 只有 -9 可拿，输掉比赛。
如果 Alice 拿走前两堆，那么她的得分为 3，下一回合 Bob 的得分为 3 。
下一回合 Alice 只有 -9 可拿，同样输掉比赛。
注意，Alice 和 Bob 都会采取最优策略。
```

### 示例 3

```
输入：values = [1,2,3,6]
输出："Tie"
解释：Alice 无法赢得比赛。如果她选择拿走前三堆，游戏以平局结束；否则她会输。
```

### 提示（Constraints）

- `1 <= stoneValue.length <= 5 * 10^4`
- `-1000 <= stoneValue[i] <= 1000`

### Signature

```python
class Solution:
    def stoneGameIII(self, stoneValue: List[int]) -> str:
```

## User's restatement

{filled in during UNDERSTANDING-CHECK}

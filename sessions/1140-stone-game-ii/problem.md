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

> This game is a variant of 0877 and 1406. I have explained the basic structure of
> the game rule sufficiently before - so I will skip that part. Now, what is different
> here is that the selection has changed: the pile of rock that can be taken is only
> from one direction: head (left), never tail.
>
> And the number that a player can take evolves dynamically as the game progresses.
> At each turn, there is an value M, and a player may take anu number of [1, 2M]
> piles of stone, at the end of the turn, M is set to max(M, X) for subsequent turns.
>
> Ex 1 deomonstrates that the first player, for example, can opt in for 1 pile or 2
> tiles. And one tile is better in there.
>
> The constraints demonstrates that the range of piles is [1, 100] and the value of
> each pile is in [1, 1e4], so no negative values.

### Initial approach (same turn)

> Based on the same solution of the same series of the problem, our representation
> of the relative score change should also work here. However, depending on how the
> game evolved, M must persist into the state representation, making the state:
>
> (head_pointer, player_control, M_value)
>
> What we are solving here is the relative score change when the game is in this
> state, recursively. So we are essentially soving for f((0, 1, 1)), same structure
> as before.
>
> The total number of possible states is 100*2*?, ? stands for all the possible number
> of value of M. A rough upper bound of M should be 50, when player can now take all
> stones in one, and larger Ms dont really make a difference. So this should yield
> roughly 200*50 = 1e4 states.
>
> We are still going to make a dict to cache the results. But we need some optimization,
> as the different values of M will explode the states and make lookup tricky. But the
> general structure should stay.

### Approach refinement

> Yes. I missed this time we are asked to return the actual maximum acheivable score
> for alice. But it will not be problematic, reason:
>
> The total value of the entire array is known, say it is S. At the end, alice scores
> with A, and Bob scores with B. Our presentation yields the relative score diff D.
> So:
>
> A + B = S
>
> A - B = D
>
> (A + B) + (A - B) = S + D
>
> 2A = S + D
>
> A = (S + D) / 2
>
> So we can work that out with our representation.
>
> base case:
>
> if piles.length <= state.M * 2
>     return state.player_control * sum(piles[state.head_pointer:])
>
> bacause there are no negative values. If you can take all remaining stones, you
> should do it.

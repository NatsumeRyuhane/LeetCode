# 0045. Jump Game II

Source: https://leetcode.cn/problems/jump-game-ii/
Reference used for statement details: https://leetcode.doocs.org/en/lc/45/
Difficulty: Medium

## Statement

You are given a 0-indexed integer array `nums`. You start at index `0`.

For each index `i`, `nums[i]` is the maximum forward jump length available from that index. From `i`, you may jump to an index `i + j` as long as `0 <= j <= nums[i]` and the destination is still inside the array.

Return the minimum number of jumps needed to reach the last index, `n - 1`.

The test cases guarantee that the last index is reachable.

## Examples

```text
Input: nums = [2,3,1,1,4]
Output: 2
```

```text
Input: nums = [2,3,0,1,4]
Output: 2
```

## Constraints

- `1 <= nums.length <= 10^4`
- `0 <= nums[i] <= 1000`
- The last index is reachable.

## User Restatement

This is like Jump Game, except instead of returning whether the end is reachable,
return the minimum number of jumps needed to reach the end. Movement is still
forward-only, and each index lets you jump any distance up to `nums[i]`. Since the
end is guaranteed reachable, unreachable handling is not the focus.

Initial idea: keep an array parallel to `nums` with the least number of jumps
known so far for each index, initialized to `-1` except index `0 = 0`. Explore
currently reachable positions, updating later positions in range to current
jumps plus one. A heap might help choose the next position to process; when the
end is reached, return that jump count.

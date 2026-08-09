# 0239 — Sliding Window Maximum

- **Source:** https://leetcode.cn/problems/sliding-window-maximum/
- **Difficulty:** Hard

## Statement

You are given an array of integers `nums`, there is a sliding window of size `k` which
is moving from the very left of the array to the very right. You can only see the `k`
numbers in the window. Each time the sliding window moves right by one position.

Return the max sliding window.

### Example 1

```
Input: nums = [1,3,-1,-3,5,3,6,7], k = 3
Output: [3,3,5,5,6,7]
Explanation:
Window position                Max
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7
```

### Example 2

```
Input: nums = [1], k = 1
Output: [1]
```

### Constraints

- `1 <= nums.length <= 10^5`
- `-10^4 <= nums[i] <= 10^4`
- `1 <= k <= nums.length`

### Signature

```python
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
```

## Session context

Chosen by the user directly after 1140 (Stone Game II), whose post-debrief complexity
audit unpacked the monotone-window transition used by the `O(n^2)` solution. The
technique family is therefore *not* blind on this problem — the user has seen the
invariant explained but has never implemented it. The drill target is implementation
and the amortized-cost argument, not pattern recognition.

## User's restatement

_(filled in during UNDERSTANDING-CHECK)_

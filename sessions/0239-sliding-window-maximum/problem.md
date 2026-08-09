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

> so we are given a sliding window of length k on array nums. we are tasked to find out
> the max value in the sliding window for every step. the constrints are there are 1 to
> 10⁵ elements, window is smaller or equal to the size of array, and values range from
> -1e4 to 1e4

## Initial approach (user's words)

> the bf approach is to call max() once every step - an n² TC. So I am going to try
> exercise the idea:
>
> on the first pass to populate the sliding window, we can just call max once -
> equivalant to scan everything in there to require a known maximum in O(n).
>
> As the window slides, we notice one elements is evicted and one element is added. Name
> two elements a and b. when a is evicted, it can either be the max element or not.
>
> so if b is bigger than a - then max becomes b with no problem. we can just evict a just
> fine.
>
> But if b is smaller - that means a is being evicted. Say if a is also not the max
> element - a comparison can tell us that, the max value is uphold. We dont need to
> change anything.
>
> But what if a is the max element? How are we going to find the biggest element then?

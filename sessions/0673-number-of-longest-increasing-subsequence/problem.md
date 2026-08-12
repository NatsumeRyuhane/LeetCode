# 0673 — Number of Longest Increasing Subsequence (最长递增子序列的个数)

- **Source:** https://leetcode.cn/problems/number-of-longest-increasing-subsequence/
- **Difficulty:** Medium
- **Context:** brought in from a timed mock interview (question 3/3, left unfinished —
  0 submissions; the other two questions passed).

## Statement

给定一个未排序的整数数组 `nums`，返回最长递增子序列的个数。

注意 这个数列必须是 **严格** 递增的。

**示例 1:**

```
输入: [1,3,5,4,7]
输出: 2
解释: 有两个最长递增子序列，分别是 [1, 3, 4, 7] 和 [1, 3, 5, 7]。
```

**示例 2:**

```
输入: [2,2,2,2,2]
输出: 5
解释: 最长递增子序列的长度是 1，并且存在 5 个子序列的长度为 1，因此输出 5。
```

**提示:**

- `1 <= nums.length <= 2000`
- `-10^6 <= nums[i] <= 10^6`

Signature: `class Solution: def findNumberOfLIS(self, nums: List[int]) -> int:`

## User's restatement

> The problem is in two parts: 1. we need to find the longest increasing subsequense
> in nums 2. we need to count every distinct instance of that subsequence. Ex 2
> returning 5 because it contains exactly 5 subsequences with a length of 1.
>
> [...] Because dp[i] is "the longest subsq i can get if i include nums[i]", we can
> filter the dp array to get a map of destinations - those dp[i] == globalMax is
> garuanteed to be the end of *every* valid subsequence. But the dp compressed the
> exact path information other than that.
>
> I tried the worst possible idea: enumeration. So if we know global max is k, it is
> essentially a k-ary tuple of indexes, but this idea sucks so much as it is a
> factorial one.
>
> So for a destination d with dp[d] = k, they can only be the appendix of those
> positions p that dp[p] = k-1 and p < d, right? [...] Because we are revisiting each
> previous node at most once for each destination, and we can have at most n
> destinations, this process is bound to complete within O(n²).

# 3731 — Find Missing Elements

- **Source:** https://leetcode.cn/problems/find-missing-elements/
- **Difficulty:** Easy

## Statement

You are given an integer array `nums` consisting of unique integers.

Originally, `nums` contained every integer within a certain range. However, some
integers might have gone missing from the array.

The smallest and largest integers of the original range are still present in `nums`.

Return a sorted list of all the missing integers in this range. If no integers are
missing, return an empty list.

**Example 1:**

```
Input:  nums = [1,4,2,5]
Output: [3]
```
The smallest integer is 1 and the largest is 5, so the full range should be
`[1,2,3,4,5]`. Among these, only 3 is missing.

**Example 2:**

```
Input:  nums = [7,8,6,9]
Output: []
```
The smallest integer is 6 and the largest is 9, so the full range is `[6,7,8,9]`.
All integers are already present, so no integer is missing.

**Example 3:**

```
Input:  nums = [5,1]
Output: [2,3,4]
```
The smallest integer is 1 and the largest is 5, so the full range should be
`[1,2,3,4,5]`. The missing integers are 2, 3 and 4.

**Constraints:**

- `2 <= nums.length <= 100`
- `1 <= nums[i] <= 100`

**Signature:**

```python
class Solution:
    def findMissingElements(self, nums: List[int]) -> List[int]:
```

## User's restatement

> we are given a list of elements that range from 2 to 100 elements, and each element
> is in [1, 100]. The list contains the number in a range with unspecified elements
> missing.
>
> My initial idea is that if we sort the list first, then do a linear scan with a
> sliding window, it should be obvious what elements are missing. If the two elements
> are continous in a sorted array, the sliding window perform diff = window[1] -
> window[0] = 1. For any diff > 1, we know the missing elements are window[0]+1 to
> window[0]+diff, right exclusive.
>
> Sorting such array takes O(n lg n) via builtins. The sliding window takes O(n). If we
> make a micro-optimization to idetify the gaps via several passes of binary search, it
> chould be optimized to O(lg n), but not worth it with n is capped at 100.
>
> So overall TC is O(n lg n), SC is depending on the sorting algorithm, I forgot the
> lower bound but it should be Omega(1) if you use algorthm like QS. And sliding window
> dont really commit something to memory so SC should be O(1).

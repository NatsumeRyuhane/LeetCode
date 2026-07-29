# 3517 — Smallest Palindromic Rearrangement I（最小回文排列 I）

- **Source:** https://leetcode.cn/problems/smallest-palindromic-rearrangement-i/
- **Difficulty:** Medium
- **Signature:** `class Solution: def smallestPalindrome(self, s: str) -> str:`

## Statement

You are given a **palindromic** string `s`.

Return the lexicographically smallest palindromic permutation of `s`.

### Examples

```
Example 1:
Input:  s = "z"
Output: "z"
Explanation: A string of only one character is already the lexicographically
             smallest palindrome.

Example 2:
Input:  s = "babab"
Output: "abbba"
Explanation: Rearranging "babab" → "abbba" gives the smallest lexicographic
             palindrome.

Example 3:
Input:  s = "daccad"
Output: "acddca"
Explanation: Rearranging "daccad" → "acddca" gives the smallest lexicographic
             palindrome.
```

### Constraints

- `1 <= s.length <= 10^5`
- `s` consists of lowercase English letters.
- `s` is **guaranteed** to be palindromic.

## User's restatement

_(2026-07-29, verbatim)_

> okay so basically we are given a *palindromic* string s that is consisted of
> lowercase english letters and we are hoping to rearrange it so we get another
> palindromic string s' which have a smaller lexicographically order.
>
> So because s is palindromic, usually the letters are coming in pairs -
> especially if len(s) is even. If len(s) is odd, only the letter in the center
> have a chance to be unique.
>
> I think basically we can just linear scan to index to ceil(len(s)/2), by when
> we should already had enough information about the composition of s, and we
> now have a dictionary. The dict is just a fixed size map char -> int, so the
> cost would be minimal.
>
> For rearrangement, we just try to take 2 from the smallest index that have the
> letter to spare. and only by when 2 letters are exhausted we tale the remaining
> one letter - actually we dont need to make the distinction, just remember that
> letter cant be moved should be fine.

**Coach's comprehension corrections:** the task asks for the *smallest*, not merely
a *smaller*, palindrome — the answer may legitimately equal the input (example 1,
`"z"` → `"z"`). Output must be both a permutation of `s` (same multiset) and itself
a palindrome.

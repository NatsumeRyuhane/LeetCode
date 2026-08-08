# 3302 — Find the Lexicographically Smallest Valid Sequence

- **Source:** https://leetcode.cn/problems/find-the-lexicographically-smallest-valid-sequence/description/?envType=daily-question&envId=2026-08-08
- **Difficulty:** Medium

## Statement

You are given two strings `word1` and `word2`.

A string `x` is called **almost equal** to `y` if you can change **at most one**
character in `x` to make it identical to `y`.

A sequence of indices `seq` is called **valid** if:

- The indices are sorted in ascending order.
- Concatenating the characters at these indices in `word1` in the same order results
  in a string that is **almost equal** to `word2`.

Return an array of size `word2.length` representing the lexicographically smallest
valid sequence of indices. If no such sequence of indices exists, return an empty array.

Note that the answer must represent the lexicographically smallest **array**, not the
corresponding string formed by those indices.

### Example 1

```
Input:  word1 = "vbcca", word2 = "abc"
Output: [0,1,2]
```
Change `word1[0]` to `'a'`; `word1[1]` is already `'b'`; `word1[2]` is already `'c'`.

### Example 2

```
Input:  word1 = "bacdc", word2 = "abc"
Output: [1,2,4]
```
`word1[1]` is already `'a'`; change `word1[2]` to `'b'`; `word1[4]` is already `'c'`.

### Example 3

```
Input:  word1 = "aaaaaa", word2 = "aaabc"
Output: []
```
There is no valid sequence of indices.

### Example 4

```
Input:  word1 = "abc", word2 = "ab"
Output: [0,1]
```

### Constraints

- `1 <= word2.length < word1.length <= 3 * 10^5`
- `word1` and `word2` consist only of lowercase English letters.

### Signature

```python
class Solution:
    def validSequence(self, word1: str, word2: str) -> List[int]:
```

## User's restatement

> We are given two words word1 and word2. The task here is we find a sequence of indices
> seq, that, if we sample the characters defined at indexes in seq and form two new word
> word1' and word2', they would be almost equal. And we are asked to find the
> lexicographically smallest sequence that satisfies this property.
>
> Important distinctions:
> - lexicographically smallest sequence that satisfies this property applies to the
>   indexes. Not the word they form, [0, 1, 2] precedence over [0, 1, 3] no matter what
>   the word it will reconstruct.
> - the seq is sorted in ascending order, and implied that each element is unique
> - it says word1' is supposed to be almost equal to word2'. The examples did not specify
>   if word1' is equal to word2' counts as valid, but because it says "almost equal" is
>   change at most one, it implies change 0 is acceptable, so word1' == word2' is valid.
> - seq is required to be the same length as word2. So there was an error in my earlier
>   statement: there is no word2'. We sample letter from indexed in word1 to get word1',
>   and word1' is compared against word2 itself.
> - this will explain why word2 need to be shorter than word1. otherwise the problem
>   degnerates.
> - both word only have loowecase letters, no case conversion required.

### Initial approach (same turn)

> If we are searching for the only identical matches, not almost identical, we can have a
> relatively easy time because what we have to do is to search linearly over word1 and use
> a pointer in word2 to see if the next letter shows up in word1.
>
> But now we have 1 letter that can be spared as a wildcard. […] I think the problem is if
> we know *where* to use the wildcard, it is much easier, because anything that is not
> wildcard will have to be a perfect match. so it for both words, is a segment of perfect
> match, wildcard element, perfect match.
>
> The wildcard need to be applied as early as possible to maximize its effect on minimizing
> the lexicographic ordering, because if you have to match a character, you leave a gap in
> index, which enlarges every entry comes after it and limit even more of option of matches,
> as seq is required to be strictly increasing order. So the idea wold be "what if position
> i is wildcard, and if so, can we produce a match?"
>
> Optimizations proposed: (1) `dict[str, list[int]]` of occurrence positions, queried by
> binary search; (2) early termination when not enough letters remain; (3) since scanning is
> monotone left-to-right, keep a per-letter pointer into each list so both "next position of
> letter" and "how many of letter x remain" are O(1).
>
> "So the solution completes in O(n²), for a n sized at 3e5, it gets to 9e10 which is 1e11
> area, and should be acceptable."

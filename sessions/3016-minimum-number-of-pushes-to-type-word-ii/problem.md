# 3016 — Minimum Number of Pushes to Type Word II

- **Source:** https://leetcode.cn/problems/minimum-number-of-pushes-to-type-word-ii/description/
- **Difficulty:** Medium

> Note: both leetcode.cn and leetcode.com blocked automated fetch this session, so the
> statement below was transcribed by the coach rather than pasted from the page. The user
> has the page open — flag any discrepancy during UNDERSTANDING-CHECK.

## Statement

You are given a string `word` containing lowercase English letters.

Telephone keypads have keys mapped with **distinct** collections of lowercase English
letters, which can be used to form words by pushing them. For example, the key `2` is
mapped with `["a","b","c"]`, we need to push the key one time to type `"a"`, two times to
type `"b"`, and three times to type `"c"`.

It is allowed to remap the keys numbered `2` to `9` to **distinct** collections of letters.
The keys can be remapped to **any** amount of letters, but each letter **must** be mapped to
**exactly** one key. You need to find the **minimum** number of times the keys will be pushed
to type the string `word`.

Return the **minimum** number of pushes needed to type `word` after remapping the keys.

### Examples

**Example 1**
```
Input:  word = "abcde"
Output: 5
```
Explanation: the remapped keyboard given in the image provides the minimum cost.
`"a"` → one push on key 2, `"b"` → one push on key 3, `"c"` → one push on key 4,
`"d"` → one push on key 5, `"e"` → one push on key 6.
Total cost is `1 + 1 + 1 + 1 + 1 = 5`.
It can be shown that no other mapping can provide a lower cost.

**Example 2**
```
Input:  word = "xyzxyzxyzxyz"
Output: 12
```
Explanation: `"x"` → one push on key 2, `"y"` → one push on key 3, `"z"` → one push on key 4.
Total cost is `1 * 4 + 1 * 4 + 1 * 4 = 12`.
It can be shown that no other mapping can provide a lower cost.
Note that the key `9` is not mapped to any letter: not all keys need to be mapped to letters.

**Example 3**
```
Input:  word = "aabbccddeeffgghhiiiiii"
Output: 24
```
Explanation: `"a"` → one push on key 2, `"b"` → one push on key 3, `"c"` → one push on key 4,
`"d"` → one push on key 5, `"e"` → one push on key 6, `"f"` → one push on key 7,
`"g"` → one push on key 8, `"h"` → two pushes on key 9, `"i"` → one push on key 9.
Total cost is `1*2 + 1*2 + 1*2 + 1*2 + 1*2 + 1*2 + 1*2 + 2*2 + 1*6 = 24`.
It can be shown that no other mapping can provide a lower cost.

### Constraints

- `1 <= word.length <= 10^5`
- `word` consists of lowercase English letters.

### Signature

```python
class Solution:
    def minimumPushes(self, word: str) -> int:
```

## User's restatement

> okay the problem is that we can remap the letter input to 8 buttons (namely 2 to 9 on a
> keypad) and in combination of presses. Our goal is to find a mapping so that entering a
> given word takes as few pushes as possible. Each letter can only corresponding to one key,
> so no two buttons can contain the same letter, no matter the pushes.
>
> The problem states clearly that the letter may repeat, the word can never be an empty
> string, and the word is only consisted of lowercase english letters.
>
> My appaorch is that we would assign the high-frequency letters to fewer pushes. Like what
> we do in huffman code. We know we have 8 1-push slots, 8 2-push slots, etc. So we only need
> to keep a count of letter freq., and actually we dont care about the exact mapping, we just
> need the frequency itself, the frequrncy can be stored in a fixed size list of int[26]. We
> can use its ascii code as the index tio that list, and sort it reversed. Doing so is O(1) -
> size of the list is fixed. The calculation goes for each non-zero frequency, so it is also
> O(1), capped at 26 calc. The storage needed is also O(1) because we only need that fixed
> size list.

**Coach note (UNDERSTANDING-CHECK).** Restatement accurate on every mechanic: 8 keys, each
letter to exactly one key, position within a key determines push count. Constraint sweep
caught the *absent* distinctness guarantee unprompted — the 3014 lesson firing. Gap: the
`1 <= word.length <= 10^5` line was not swept, and the total cost was called O(1).

from typing import List


class Solution:
    def validSequence(self, word1: str, word2: str) -> List[int]:
        n, m = len(word1), len(word2)

        # Pass 1 (right to left): suf[j] = the LARGEST index k such that word2[j:]
        # is an exact subsequence of word1[k:].  -1 means "no such k" (infeasible).
        # This is the user's table, collapsed to one number per row.
        suf = [-1] * (m + 1)
        suf[m] = n                      # the empty suffix fits starting past the end
        j = m - 1
        for i in range(n - 1, -1, -1):
            if j >= 0 and word1[i] == word2[j]:
                suf[j] = i
                j -= 1

        # Pass 2 (left to right): one walk over word1, taking the smallest index
        # available at every step.
        ans = []
        j = 0
        spent = False
        for i in range(n):
            if j == m:
                break
            if word1[i] == word2[j]:
                ans.append(i)           # exact match: never costs the wildcard
                j += 1
            elif not spent and suf[j + 1] >= i + 1:
                ans.append(i)           # mismatch, but the rest still fits exactly
                j += 1
                spent = True
            # else: word1[i] is unusable here — skip it

        return ans if j == m else []

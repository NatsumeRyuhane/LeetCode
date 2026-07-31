from collections import Counter

ORD_A = ord("a")


def _pushes_from_counts(counts) -> int:
    """The tier walk, factored out so it is IDENTICAL across every variant below.

    Isolating the counting step is the entire point of the experiment; if the tail
    varied too, a timing difference would not attribute to anything.
    """
    ans = 0
    slots = 8
    current_push = 1

    for f in sorted(counts, reverse=True):
        if slots == 0:
            current_push += 1
            slots = 8

        ans += f * current_push
        slots -= 1

    return ans


class Solution:
    # --- v1: the accepted submission, exactly as written. Do not touch. ---
    def minimumPushes(self, word: str) -> int:
        letter_freq = [0] * 26
        ord_a = ord("a")

        for c in word:
            letter_freq[ord(c) - ord_a] += 1

        letter_freq = sorted(letter_freq, reverse=True)

        ans = 0
        slots = 8
        current_push = 1

        for f in letter_freq:
            if slots == 0:
                current_push += 1
                slots = 8

            ans += f * current_push
            slots -= 1

        return ans

    # --- Variants below were added AFTER acceptance, as a Python-mechanics
    #     experiment. The ALGORITHM is identical in all four — count letters, sort
    #     descending, walk the tiers. Only the counting step differs. ---

    def minimumPushes_v2(self, word: str) -> int:
        """H1 probe — same Python-level loop, zero ord() calls.

        Iterating a `bytes` object yields ints directly, so the per-character
        ord() call vanishes while the per-character bytecode loop remains.
        (v1 - v2) therefore prices the 100k Python->C call transitions alone.
        """
        letter_freq = [0] * 26

        for b in word.encode():
            letter_freq[b - ORD_A] += 1

        return _pushes_from_counts(letter_freq)

    def minimumPushes_v3(self, word: str) -> int:
        """H2 probe — no Python-level loop at all.

        Counter(str) dispatches to _collections._count_elements, a C loop.
        (v2 - v3) therefore prices the remaining per-character bytecode alone.
        """
        return _pushes_from_counts(Counter(word).values())

    def minimumPushes_v4(self, word: str) -> int:
        """The counter-intuitive one — 26 full C-level passes over the string.

        str.count is a C scan. This reads the whole word 26 times instead of once
        and does zero per-character work in Python. Strictly more total character
        comparisons than v1, in a language where that is not what costs.
        """
        return _pushes_from_counts([word.count(chr(c)) for c in range(ORD_A, ORD_A + 26)])

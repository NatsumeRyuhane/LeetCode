class Solution:
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
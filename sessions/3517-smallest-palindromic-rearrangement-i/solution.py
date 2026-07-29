class Solution:
    def smallestPalindrome(self, s: str) -> str:
        char_count = [0] * 26
        ord_a = ord('a')
        central = ''
        ans = ""
        rans = ""

        for i in range(0, len(s)//2):
            char_count[ord(s[i]) - ord_a] += 2

        if len(s) % 2 != 0:
            central = s[len(s)//2]

        for j in range(0, 26):
            while char_count[j] > 0:
                ans += chr(ord_a + j)
                rans = chr(ord_a + j) + rans
                char_count[j] -= 2

        if len(s) % 2 == 0:
            return ans + rans
        else:
            return ans + central + rans
class Solution:
    def smallestPalindrome(self, s: str) -> str:
        char_count = [0] * 26
        central = ''
        ans = ""

        for i in range(0, len(s)//2):
            char_count[self.get_relative_ord(s[i])] += 2

        if len(s) % 2 != 0:
            char_count[self.get_relative_ord(s[len(s)//2])] -= 2
            central = s[len(s)//2]

        for j in range(0, 26):
            while char_count[j] > 0:
                ans += self.get_char_by_ord(j)
                char_count[j] -= 2

        if len(s) % 2 == 0:
            ans = ans + ans[::-1]
        else:
            ans = ans + central + ans[::-1]

        return ans


    def get_relative_ord(self, c: str) -> int:
        return ord(c) - ord('a')

    def get_char_by_ord(self, o: int) -> str:
        return chr(ord('a') + o)
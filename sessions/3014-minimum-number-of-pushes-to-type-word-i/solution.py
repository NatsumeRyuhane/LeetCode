class Solution:
    def minimumPushes(self, word: str) -> int:
        wordlen = len(word)

        if 0 <= wordlen <= 8:
            return wordlen
        elif 9 <= wordlen <= 16:
            return 8 + (wordlen-8) * 2
        elif 17 <= wordlen <= 24:
            return 24 + (wordlen-16) * 3
        else:
            return 48 + (wordlen-24) * 4

class Solution:
    def smallestNumber(self, n: int, t: int) -> int:

        if n%10 == 0 or t == 1:
            return n

        for i in range(n, 100):
            # no need to count for 100 here, already shortcut
            tens = i // 10
            ones = i % 10

            if (tens*ones) % t == 0:
                return i
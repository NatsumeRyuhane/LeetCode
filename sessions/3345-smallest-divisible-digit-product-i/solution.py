class Solution:
    def smallestNumber(self, n: int, t: int) -> int:

        if n%10 == 0 or t == 1:
            return n

        for i in range(n, 101):
            # no need to count for 100 here, already shortcut
            # nope. you'd need to account for if the answer is in fact 100 for n != 100
            if i >= 10:
                tens = i // 10
            else:
                tens = 1

            ones = i % 10

            if (tens*ones) % t == 0:
                return i
from typing import List
from collections import deque


class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        self.maxelem: deque[tuple[int, int]] = deque()

        def maintain_maxelem(s: tuple[int, int]):
            elem, evict = s

            if len(self.maxelem) == 0 or elem >= self.maxelem[0][0]:
                self.maxelem = deque()
            else:
                while self.maxelem[-1][0] <= elem:
                    self.maxelem.pop()

            self.maxelem.append(s)

        def do_expire(t):
            if t >= self.maxelem[0][1]:
                self.maxelem.popleft()


        for i in range(k):
            elem = nums[i]
            evict = i+k
            maintain_maxelem((elem, evict))

        ans = []
        for i in range(k-1, len(nums)):
            do_expire(i)
            elem = nums[i]
            evict = i+k
            maintain_maxelem((elem, evict))
            ans.append(self.maxelem[0][0])

        return ans
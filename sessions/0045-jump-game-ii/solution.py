import heapq
from typing import List

class Solution:
    def jump(self, nums: list[int]) -> int:
        if len(nums) == 1:
            return 0

        least_jumps = [float("inf")] * len(nums)
        heap: List[tuple[int, int]]  = [(0, 0)]
        processed = 0

        while len(heap) != 0:
            jumps, index = heapq.heappop(heap)
            if jumps > least_jumps[index]:
                # a stale entry. skip
                continue
            
            jumplen = nums[index]
            for i in range(max(index+1, processed+1), index+jumplen+1):
                if i == len(nums)-1:
                    return jumps+1
                else:
                    if jumps+1 < least_jumps[i]:
                        least_jumps[i] = jumps+1
                        heapq.heappush(heap, (jumps+1, i))

                processed = i

        # should be unreachable catch-all
        return -1

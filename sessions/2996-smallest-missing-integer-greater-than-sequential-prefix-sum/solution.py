from typing import List


class Solution:
    def missingInteger(self, nums: List[int]) -> int:
        largerNumbers: set[int] = set()
        sequential_end = len(nums)-1
        prefix_sum = 0
        global_max = 0
        ceil = float("inf")

        for idx, elem in enumerate(nums):
            if idx < len(nums) and sequential_end > idx:
                if elem + 1 == nums[idx+1]:
                    pass
                else:
                    sequential_end = idx

            global_max = max(global_max, elem)
            
            if sequential_end >= idx:
                prefix_sum += elem
            else:
                if elem >= prefix_sum:
                    largerNumbers.add(elem)

        if sequential_end == 0:
            return nums[0]+1

        print(f"sum:{prefix_sum}, region:{nums[0:sequential_end+1]}, global_max:{global_max}, numbers:{list(largerNumbers)}")
        if prefix_sum > global_max:
            return prefix_sum
        
        for i in range(prefix_sum, global_max+2):
            print(i)
            if i not in largerNumbers:
                return i

        # not reachable
        return -1
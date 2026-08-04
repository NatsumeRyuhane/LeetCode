from typing import List


class Solution:
    def findMissingElements(self, nums: List[int]) -> List[int]:
        nums = sorted(nums)
        ans = []

        for j in range(1, len(nums)):
            i = j - 1

            diff = nums[j] - nums[i]
            comp = 1
            while (comp != diff):
                ans.append(nums[i]+comp)
                comp += 1

        return ans

from typing import List


class Solution:
    def findNumberOfLIS(self, nums: List[int]) -> int:
        # dp:
        # if we at index i
        # we can look back
        # and continue on a sequence
        # if dp[i] represents the longest increasing seq we can get at idx i
        # then for a j > i, dp[j] can become dp[i] + 1 if nums[j] > nums[i]
        # and dp[j] can use the max value that prev idx give it
        # and it doesnt care how the sequence is constructed

        dp = [1] * len(nums)

        global_max = 0

        for i in range(len(nums)):
            max_len = 1

            for j in range(0, i):
                if nums[j] < nums[i]:
                    max_len = max(max_len, dp[j] + 1)

            dp[i] = max_len

            if max_len > global_max:
                global_max = max_len

        # at this step we knows the max len for the increasing subsq
        # but how to get all viable subsq?
        # the dp array will give us a map of desitinations. We know exactly where the ends is at
        # but how to count the ways?

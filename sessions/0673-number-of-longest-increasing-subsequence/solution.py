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

        dp = [(1, 1)] * len(nums)

        global_max = 0

        for i in range(len(nums)):
            max_len = 1
            path_count = 1

            for j in range(0, i):
                if nums[j] < nums[i]:
                    pathlen, pathcnt = dp[j]

                    if max_len < pathlen + 1:
                        # max_len being updated
                        max_len = pathlen + 1
                        path_count = pathcnt
                    elif max_len == pathlen + 1:
                        # found another movement candidate
                        path_count += pathcnt

            dp[i] = (max_len, path_count)

            if max_len > global_max:
                global_max = max_len

        ans = 0
        for n in dp:
            pathlen, cnt = n
            if pathlen == global_max:
                ans += cnt

        return ans

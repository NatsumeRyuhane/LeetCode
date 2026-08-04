from typing import List


class Solution:
    def findMissingElements(self, nums: List[int]) -> List[int]:
        sn: set[int] = set()
        maxn = -1
        minn = 101

        for n in nums:
            sn.add(n)
            if n > maxn:
                maxn = n

            if n < minn:
                minn = n

        ans = []
        for j in range(minn, maxn): # didnt need to step on max anyway, max is a seen number so wont be in ans
            if j not in sn:
                ans.append(j)

        return ans
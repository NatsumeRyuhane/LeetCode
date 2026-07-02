class Solution:
    def canJump(self, nums: list[int]) -> bool:
        max_pos = 0
        cur_pos = 0
        while cur_pos <= max_pos:
            max_pos = max(max_pos, cur_pos+nums[cur_pos])
            cur_pos += 1
            if max_pos >= len(nums)-1:
                return True
            
        return False
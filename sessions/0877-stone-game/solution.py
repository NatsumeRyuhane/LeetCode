from typing import List, Tuple, NewType
State = NewType('State', Tuple[int, int, int])
# player_control, seg_start, seg_end


class Solution:
    def stoneGame(self, piles: List[int]) -> bool:
        return True
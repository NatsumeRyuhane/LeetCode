from typing import List, NewType, Tuple
State = NewType('State', Tuple[int, int, int])
# player_control, seg_start, seg_end


class Solution:
    def predictTheWinner(self, nums: List[int]) -> bool:
        state_values: dict[State, int] = {}

        initial_state = (1, 0, len(nums)-1)

        def get_state_value(s: State) -> int:
            if s in state_values:
                return state_values[s]
            else:
                v = recurse(s)
                return v


        def recurse(s: State) -> int:
            player_control, seg_start, seg_end = s

            if seg_start == seg_end:
                return player_control * seg_start

            def take_number_at_start():
                return player_control * nums[seg_start] + get_state_value((-1*player_control, seg_start+1, seg_end))

            def take_number_at_end():
                return player_control * nums[seg_end] + get_state_value((-1*player_control, seg_start, seg_end-1))

            ts = take_number_at_start()
            te = take_number_at_end()

            if player_control == 1:
                return max(ts, te)
            else:
                return min(ts, te)

        vis = get_state_value(initial_state)
        if vis >= 0:
            return True
        else:
            return False
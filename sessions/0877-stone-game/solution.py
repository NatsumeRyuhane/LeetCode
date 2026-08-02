from typing import List, Tuple, NewType
State = NewType('State', Tuple[int, int, int])
# player_control, seg_start, seg_end


class Solution:
    def stoneGame(self, piles: List[int]) -> bool:
        state_values: dict[State, int] = {}
        
        initial_state = (1, 0, len(piles)-1)

        def get_state_value(s: State) -> int:
            if s in state_values:
                return state_values[s]
            else:
                v = recurse(s)
                state_values[s] = v
                return v


        def recurse(s: State) -> int:
            player_control, seg_start, seg_end = s

            if seg_start == seg_end:
                return player_control * piles[seg_start]

            def take_number_at_start():
                return player_control * piles[seg_start] + get_state_value((-1*player_control, seg_start+1, seg_end))

            def take_number_at_end():
                return player_control * piles[seg_end] + get_state_value((-1*player_control, seg_start, seg_end-1))

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

    def stoneGame2(self, piles: List[int]) -> bool:
        return True

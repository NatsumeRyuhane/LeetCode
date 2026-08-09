from typing import List, NewType, Tuple
State = NewType('State', Tuple[int, int, int])
# head_ptr, player_control, M


class Solution:
    def stoneGameII(self, piles: List[int]) -> int:
        state_values: dict[State, int] = {}
        
        initial_state: State = (0, 1, 1)

        def get_state_value(s: State) -> int:
            if s in state_values:
                return state_values[s]
            else:
                v = recurse(s)
                state_values[s] = v
                # print(f"calculated state value: ({s} = {v})")
                return v


        def recurse(s: State) -> int:
            head_ptr, player_control, M = s

            if len(piles) <= head_ptr:
                return 0
            elif len(piles) - M * 2 < head_ptr:
                return player_control * sum(piles[head_ptr:])

            options = []
            for i in range(1, M*2+1):
                # print(f"loop: {head_ptr}, {i}, {piles[head_ptr:head_ptr+i]}, {[head_ptr+i+1, player_control*-1, max(M, i)]}")
                options.append(
                    player_control * sum(piles[head_ptr:head_ptr+i]) + get_state_value((head_ptr+i, player_control*-1, max(M, i)))
                )

            if player_control == 1:
                return max(options)
            else:
                return min(options)

        rel_score = get_state_value(initial_state)
        A_score = (sum(piles) + rel_score) // 2
        return A_score

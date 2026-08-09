from typing import List, NewType, Tuple
State = NewType('State', Tuple[int, int, int])
# head_ptr, player_control, M

global cache_hit
global cache_miss
cache_hit = 0
cache_miss = 0


class Solution:
    def stoneGameII(self, piles: List[int]) -> int:
        state_values: dict[State, int] = {}
        
        initial_state: State = (0, 1, 1)
        prefix_sum = [0]
  
        psum = 0
        for i in range(0, len(piles)):
            psum += piles[i]
            prefix_sum.append(psum)
        print(prefix_sum)

        def get_state_value(s: State) -> int:
            if s in state_values:
                global cache_hit
                cache_hit += 1
                return state_values[s]
            else:
                global cache_miss
                cache_miss += 1
                v = recurse(s)
                state_values[s] = v
                # print(f"calculated state value: ({s} = {v})")
                return v


        def recurse(s: State) -> int:
            head_ptr, player_control, M = s

            if len(piles) <= head_ptr:
                return 0
            elif len(piles) - M * 2 < head_ptr:
                return player_control * (prefix_sum[-1] - prefix_sum[max(0, head_ptr)])

            options = []
            for i in range(1, M*2+1):
                # print(f"loop: {head_ptr}, {i}, {piles[head_ptr:head_ptr+i]}, {[head_ptr+i+1, player_control*-1, max(M, i)]}")
                options.append(
                    player_control *
                    (prefix_sum[min(head_ptr+i, len(piles))] - prefix_sum[max(0, head_ptr)]) +
                    get_state_value((head_ptr+i, player_control*-1, max(M, i)))
                )

            if player_control == 1:
                return max(options)
            else:
                return min(options)

        rel_score = get_state_value(initial_state)
        A_score = (sum(piles) + rel_score) // 2
        print(len(state_values))
        print(f"{cache_hit} / {cache_hit + cache_miss}={cache_hit / (cache_hit + cache_miss)}")
        return A_score

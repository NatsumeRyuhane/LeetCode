from typing import List, NewType, Tuple
State = NewType('State', Tuple[int, int])
# head_ptr, M

class Solution:
    def stoneGameII(self, piles: List[int]) -> int:
        state_values: dict[State, int] = {}
        self.cache_hit = 0
        self.cache_miss = 0
        
        initial_state: State = (0, 1)
        prefix_sum = [0]
  
        psum = 0
        for i in range(0, len(piles)):
            psum += piles[i]
            prefix_sum.append(psum)

        def get_state_value(s: State) -> int:
            if s in state_values:
                self.cache_hit += 1
                return state_values[s]
            else:
                self.cache_miss += 1
                v = recurse(s)
                state_values[s] = v
                # print(f"calculated state value: ({s} = {v})")
                return v


        def recurse(s: State) -> int:
            head_ptr, M = s

            if len(piles) <= head_ptr:
                return 0
            elif len(piles) - M * 2 < head_ptr:
                return (prefix_sum[-1] - prefix_sum[max(0, head_ptr)])

            max_gain = -1
            for i in range(1, M*2+1):
                # print(f"loop: {head_ptr}, {i}, {piles[head_ptr:head_ptr+i]}, {[head_ptr+i+1, player_control*-1, max(M, i)]}")
                gain = (prefix_sum[-1] - prefix_sum[max(0, head_ptr)]) - get_state_value((min(head_ptr+i, len(piles)), max(M, i)))
                max_gain = max(max_gain, gain)
        

            return max_gain

        # print(len(state_values))
                # print(f"{self.cache_hit} / {self.cache_hit + self.cache_miss}={self.cache_hit / (self.cache_hit + self.cache_miss)}")
        return get_state_value(initial_state)
        
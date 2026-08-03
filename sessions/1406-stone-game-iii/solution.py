from typing import Tuple, List, NewType, Deque
from collections import deque

State = NewType('State', Tuple[int, int])
# player_control, ptr_stone


class Solution:
    def stoneGameIII(self, stoneValue: List[int]) -> str:
        state_values: dict[State, int] = {}
        
        initial_state = (1, 0)

        # deque simulated stack so we dont blow the stack buffer up
        stack: Deque[State] = deque()

        stack.appendleft(initial_state)

        def peekleft(d: Deque):
            if len(d) == 0:
                return None
            else:
                return d[0]

        while len(stack) != 0:
            s = peekleft(stack)

            player_control, ptr_stone = s
            take_1 = None
            take_2 = None
            take_3 = None

            # take 1 stone?
            if ptr_stone < len(stoneValue) - 0:
                if ptr_stone == len(stoneValue) - 1:
                    take_1 = player_control * stoneValue[ptr_stone]
                else:
                    ns: State = (player_control * -1, ptr_stone + 1)
                    if ns in state_values:
                        take_1 = player_control * stoneValue[ptr_stone] + state_values[ns]
                    else:
                        stack.appendleft(ns)
                        continue

            # take 2 stone?
            if ptr_stone < len(stoneValue) - 1:
                if ptr_stone == len(stoneValue) - 2:
                    take_2 = player_control * \
                         (stoneValue[ptr_stone] + stoneValue[ptr_stone+1])
                else:
                    ns: State = (player_control * -1, ptr_stone + 2)
                    if ns in state_values:
                        take_2 = player_control * (stoneValue[ptr_stone] + stoneValue[ptr_stone+1]) + state_values[ns]
                    else:
                        stack.appendleft(ns)
                        continue

            # take 3 stone?
            if ptr_stone < len(stoneValue) - 2:
                if ptr_stone == len(stoneValue) - 3:
                    take_3 = player_control * (stoneValue[ptr_stone] + \
                        stoneValue[ptr_stone+1] + stoneValue[ptr_stone+2])
                else:
                    ns: State = (player_control * -1, ptr_stone + 3)
                    if ns in state_values:
                        take_3 = player_control * \
                            (stoneValue[ptr_stone] +
                            stoneValue[ptr_stone+1] +
                            stoneValue[ptr_stone+2]) + state_values[ns]
                    else:
                        stack.appendleft(ns)
                        continue

            options = [take_1, take_2, take_3]

            if player_control == 1:
                state_values[s] = max(t for t in options if t is not None)
            elif player_control == -1:
                state_values[s] = min(t for t in options if t is not None)

            print(f"State: {s}, value = {state_values[s]}")

            stack.popleft()

        vis = state_values[initial_state]
        if vis > 0:
            return "Alice"
        elif vis < 0:
            return "Bob"
        else:
            return "Tie"
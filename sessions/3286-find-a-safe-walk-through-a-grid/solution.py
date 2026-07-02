from typing import List, TypeAlias
from collections import deque

Grid: TypeAlias = List[List[int]]
Coordinate: TypeAlias = tuple[int, int]

class Solution:
    def findSafeWalk(self, grid: List[List[int]], health: int) -> bool:
        self.width = len(grid[0])
        self.height = len(grid)

        self.HP_cost_grid: Grid = [[-1] * self.width for _ in range(self.height)]
        current_HP_cost = self.get_value(grid, (0, 0))
        queue: deque[Coordinate] = deque()
        queue_next: deque[Coordinate] = deque()

        queue_next.append((0, 0))

        for h in range(current_HP_cost, health):
            queue = queue_next.copy()
            queue_next.clear()

            while len(queue) != 0:
                pos = queue.popleft()
                x, y = pos

                if x == self.width-1 and y == self.height-1:
                    return True

                self.HP_cost_grid[y][x] = h

                neighbours = [
                    (x-1, y), (x+1, y), (x, y-1), (x, y+1)
                ]

                for n in neighbours:
                    if self.is_oob(n):
                        continue

                    if self.get_value(self.HP_cost_grid, n) != -1:
                        continue

                    if self.get_value(grid, n) == 0:
                        if n not in queue:
                            queue.append(n)
                    else:
                        if n not in queue_next:
                            queue_next.append(n)
            
        return False

    def is_oob(self, pos: Coordinate) -> bool:
        x, y = pos

        if not 0 <= x < self.width:
            return True
    
        if not 0 <= y < self.height:
            return True
        
        return False
    
    def get_value(self, grid: Grid, pos: Coordinate) -> int | None:
        if self.is_oob(pos):
            return None
        else:
            x, y = pos
            return grid[y][x]

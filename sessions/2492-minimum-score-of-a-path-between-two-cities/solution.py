from collections import deque
from typing import List

class Solution:
    def minScore(self, n: int, roads: List[List[int]]) -> int:
        roads_dict: dict[int, List[tuple[int, int]]] = {}
        for src, dst, c in roads:
            if not src in roads_dict.keys():
                roads_dict[src] = []

            if not dst in roads_dict.keys():
                roads_dict[dst] = []

            roads_dict[src].append((dst, c))

            if not src == dst:
                roads_dict[dst].append((src, c))
            
        queue: deque[int] = deque()
        discovered: set[int] = set()
        minCost: int = 999999
        queue.append(1)

        while len(queue) != 0:
            node = queue.popleft()

            for neighbor, cost in roads_dict[node]:
                if neighbor not in discovered:
                    discovered.add(neighbor)
                    queue.append(neighbor)

                minCost = min(cost, minCost)
        
        return minCost
                
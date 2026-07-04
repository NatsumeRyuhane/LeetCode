from collections import deque
from typing import List,TypeAlias


class Solution:
    def minScore(self, n: int, roads: List[List[int]]) -> int:
        nodes: dict[int, tuple[int, int, int]] = {}
        for src, dst, cost in roads:
            if self.isConnected(nodes, src, dst):
                root = self.getRootID(nodes, src)
                root, depth, min_cost = nodes[root]
                if min_cost > cost:
                    nodes[root] = (root, depth, cost)
            else:
                self.merge(nodes, src, dst)

        return nodes[self.getRootID(nodes, 1)][2]

    def isConnected(self, nodes: dict[int, tuple[int, int, int]], A: int, B: int) -> bool:
        root_A = self.getRootID(nodes, A)
        root_B = self.getRootID(nodes, B)

        if root_A == root_B:
            return True
        else:
            return False
        
    def merge(self, nodes: dict[int, tuple[int, int, int]], A: int, B: int) -> None:
        root_A = self.getRootID(nodes, A)
        root_B = self.getRootID(nodes, B)

        root_A, depth_A, min_cost_A = nodes[root_A]
        root_B, depth_B, min_cost_B = nodes[root_B]

        if depth_A >= depth_B:
            nodes[root_A] = (root_A, max(depth_A, depth_B+1), min(min_cost_A, min_cost_B))
            nodes[root_B] = (root_A, depth_B, min_cost_B)
        else:
            nodes[root_A] = (root_B, depth_A, min_cost_A)
            nodes[root_B] = (root_B, max(depth_A+1, depth_B), min(min_cost_A, min_cost_B))


    def getRootID(self, nodes: dict[int, tuple[int, int, int]], n: int) -> int:
        if n not in nodes.keys():
            return n
        
        cn: int = n
        while True:
            root, depth, min_cost = nodes[cn]
            if root != cn:
                cn = root
            else:
                return cn
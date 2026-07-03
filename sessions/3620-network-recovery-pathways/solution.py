from typing import List
import heapq

class Solution:
    def findMaxPathScore(self, edges: List[List[int]], online: List[bool], k: int) -> int:
        self.online = online
        self.k = k
        self.nodes = len(online)
    
        self.edges: dict[int, List[tuple[int, int]]] = {}
        costs = set()
        for i in range(0, self.nodes):
            self.edges[i] = []

        for src, dist, c in edges:
            if online[dist]:
                self.edges[src].append((dist, c))
                costs.add(c)


        costs = sorted(list(costs))

        if self.dijkstraForMinmalAcceptableCost(0) > k:
            # fail fast
            return -1

        l = 0
        r = len(costs)

        while r - l > 1:
            m = l + (r - l) // 2
            if self.dijkstraForMinmalAcceptableCost(costs[m]) > k:
                r = m
            else:
                l = m
        
        return costs[l]
    
    def dijkstraForMinmalAcceptableCost(self, minimalCost: int) -> int | float:
        dist: List[int|float] = [float("inf")] * self.nodes
        dist[0] = 0
        candidates: List[tuple[int, int]] = [(-0, 0)]

        while len(candidates) != 0:
            cost, node = heapq.heappop(candidates)

            if cost < minimalCost and node != 0:
                # not traversable
                continue

            if cost > dist[node]:
                # stale
                continue

            if node == self.nodes - 1:
                return cost

            for distN, costN in self.getNeighbour(node, minimalCost):
                if cost + costN < dist[distN]:
                    dist[distN] = cost + costN
                    heapq.heappush(candidates, ((cost+costN), distN))

        return float("inf")

    def getNeighbour(self, node: int, minimalCost = 0) -> List[tuple[int, int]]:
        ret = []
        for dist, cost in self.edges[node]:
            if cost >= minimalCost:
                ret.append((dist, cost))
        
        return ret
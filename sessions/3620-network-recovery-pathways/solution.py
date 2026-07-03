from typing import List
from collections import deque 

class Solution:
    def findMaxPathScore(self, edges: List[List[int]], online: List[bool], k: int) -> int:
        self.online = online
        self.k = k
        self.nodes = len(online)
    
        self.edges: dict[int, List[tuple[int, int]]] = {}
        self.reverse_edges: dict[int, List[tuple[int, int]]] = {}
        costs = set()
        for i in range(0, self.nodes):
            self.edges[i] = []
            self.reverse_edges[i] = []

        for src, dist, c in edges:
            if online[dist]:
                self.edges[src].append((dist, c))
                self.reverse_edges[dist].append((src, dist))
                costs.add(c)


        costs = sorted(list(costs))
        self.orderList = self.getTopologicalNodeOrderList()

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
    
    def getTopologicalNodeOrderList(self) -> List[int]:
        # outdegree calc is basically free because of self.edges[nodeid] exists
        outdegrees: dict[int, int] = {}
        queue: deque[int] = deque()
        order: deque[int] = deque()
        for k, l in self.edges.items():
            odeg = len(l)
            outdegrees[k] = odeg
            if odeg == 0:
                queue.append(k)
                order.appendleft(k)

        while len(queue) != 0:
            v = queue.popleft()

            for src, cost in self.reverse_edges[v]:
                outdegrees[src] -= 1
                if outdegrees[src] == 0:
                    queue.append(src)
                    order.appendleft(src)

        return list(order)

    def dijkstraForMinmalAcceptableCost(self, minimalCost: int) -> int | float:
        dist: List[int | float] = [float("inf")] * self.nodes
        dist[0] = 0

        for node in self.orderList:
            if node == self.nodes - 1:
                return dist[node]

            for distN, costN in self.getNeighbour(node, minimalCost):
                if dist[node] + costN < dist[distN]:
                    dist[distN] = dist[node] + costN

        return float("inf")

    def getNeighbour(self, node: int, minimalCost = 0) -> List[tuple[int, int]]:
        ret = []
        for dist, cost in self.edges[node]:
            if cost >= minimalCost:
                ret.append((dist, cost))
        
        return ret
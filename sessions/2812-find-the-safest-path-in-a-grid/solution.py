from typing import List, TypeAlias
from collections import deque

Grid: TypeAlias = List[List[int]]


class Solution:
    def maximumSafenessFactor(self, grid: Grid) -> int:
        SFM = self.generateSafenessFactorMatrix(grid)

        safeness_set = set()
        for i in SFM:
            for j in i:
                safeness_set.add(j)

        safeness_list = sorted(list(safeness_set), reverse=True)
        max_safeness = min(
            safeness_list[0], SFM[0][0], SFM[len(grid)-1][len(grid)-1])

        l = safeness_list.index(max_safeness)
        r = len(safeness_list)
        while r-l > 1:
            mid = l + (r-l)//2

            if self.TryConstructPath(SFM, safeness_list[mid]):
                r = mid
            else:
                l = mid

        if self.TryConstructPath(SFM, safeness_list[l]):
            return safeness_list[l]
        else:
            return safeness_list[r]

    def TryConstructPath(self, SFM: Grid, max_safeness: int) -> bool:
        n = len(SFM)
        # The path must both start and end on cells that clear the threshold.
        if SFM[0][0] < max_safeness:
            return False

        visited = [[False] * n for _ in range(n)]
        visited[0][0] = True
        queue: deque[tuple[int, int]] = deque()
        queue.append((0, 0))

        while queue:
            r, c = queue.popleft()
            if r == n - 1 and c == n - 1:
                return True
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                # Filter BEFORE enqueue: only in-bounds, unseen, safe-enough cells.
                if (0 <= nr < n and 0 <= nc < n
                        and not visited[nr][nc]
                        and SFM[nr][nc] >= max_safeness):
                    visited[nr][nc] = True
                    queue.append((nr, nc))

        return False

    def generateSafenessFactorMatrix(self, grid: Grid) -> Grid:
        n = len(grid)
        # 0 at thieves (the BFS sources), 99999 marks "not yet reached".
        SFM: Grid = [
            [0 if grid[i][j] == 1 else 99999 for j in range(n)]
            for i in range(n)
        ]
        queue: deque[tuple[int, int]] = deque()
        for i in range(n):
            for j in range(n):
                if grid[i][j] == 1:
                    queue.append((i, j))

        while queue:
            r, c = queue.popleft()
            d = SFM[r][c]
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                # Filter BEFORE enqueue; SFM == 99999 doubles as the "unvisited" flag.
                if 0 <= nr < n and 0 <= nc < n and SFM[nr][nc] == 99999:
                    SFM[nr][nc] = d + 1
                    queue.append((nr, nc))

        return SFM

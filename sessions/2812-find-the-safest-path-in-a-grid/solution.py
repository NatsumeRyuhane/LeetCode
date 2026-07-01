from typing import List, TypeAlias

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
        queue: List[tuple[int, int]] = [(0, 0)]
        cell_in_path: set[tuple[int, int]] = set()

        while len(queue) != 0:
            pos = queue.pop(0)

            if pos[0] not in range(0, len(SFM[0])) or pos[1] not in range(0, len(SFM[0])):
                continue

            if pos in cell_in_path:
                continue
        
            if SFM[pos[0]][pos[1]] < max_safeness:
                continue

            if pos[0] == len(SFM[0])-1 and pos[1] == len(SFM[0])-1:
                return True

            cell_in_path.add(pos)
            queue.append((pos[0]+1, pos[1]))
            queue.append((pos[0]-1, pos[1]))
            queue.append((pos[0], pos[1]+1))
            queue.append((pos[0], pos[1]-1))

        return False

    def generateSafenessFactorMatrix(self, grid: Grid) -> Grid:
        SFM: Grid = []
        queue: List[tuple[int, int, int]] = []
        for i in range(0, len(grid[0])):
            SFM.append([])
            for j in range(0, len(grid[i])):
                if grid[i][j] == 1:
                    SFM[i].append(0)
                    queue.append((i, j, 0))
                else:
                    SFM[i].append(99999)

        visited: set[tuple[int, int]] = set()
                    

        while len(queue) != 0:
            pos = queue.pop(0)
            if pos[0] not in range(0, len(SFM[0])) or pos[1] not in range(0, len(SFM[0])):
                continue

            if (pos[0], pos[1]) in visited:
                continue
        
            visited.add((pos[0], pos[1]))
            SFM[pos[0]][pos[1]] = pos[2]
            queue.append((pos[0]+1, pos[1], pos[2]+1))
            queue.append((pos[0]-1, pos[1], pos[2]+1))
            queue.append((pos[0], pos[1]+1, pos[2]+1))
            queue.append((pos[0], pos[1]-1, pos[2]+1))

        return SFM
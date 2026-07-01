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
        max_safeness = max(
            safeness_list[0], SFM[0][0], SFM[len(grid)-1][len(grid)-1])

        index = safeness_list.index(max_safeness)
        while not self.TryConstructPath(SFM, safeness_list[index]):
            index += 1

        return safeness_list[index]

    def TryConstructPath(self, SFM: Grid, max_safeness: int) -> bool:
        def constructPathBFS(cell_in_path: set[tuple[int, int]], pos: tuple[int, int]) -> bool:
            if pos[0] not in range(0, len(SFM[0])) or pos[1] not in range(0, len(SFM)):
                return False

            if SFM[pos[0]][pos[1]] < max_safeness:
                return False

            if pos in cell_in_path:
                return False

            if pos[0] == len(SFM[0])-1 and pos[1] == len(SFM[0])-1:
                return True

            cell_in_path.add(pos)
            return (
                constructPathBFS(cell_in_path, (pos[0]-1, pos[1])) or
                constructPathBFS(cell_in_path, (pos[0]+1, pos[1])) or
                constructPathBFS(cell_in_path, (pos[0], pos[1]-1)) or
                constructPathBFS(cell_in_path, (pos[0], pos[1]+1))
            )

        return constructPathBFS(set(), (0, 0))

    def generateSafenessFactorMatrix(self, grid: Grid) -> Grid:
        SFM: Grid = []
        for i in range(0, len(grid[0])):
            SFM.append([])
            for j in range(0, len(grid[i])):
                SFM[i].append(self.thiefBFS((i, j), grid))

        return SFM

    def thiefBFS(self, pos: tuple[int, int], grid: Grid) -> int:
        def BFSProcess(grid: Grid, checked: set[tuple[int, int]], queue: List[tuple[int, int, int]]) -> int:
            while not len(queue) == 0:
                pos = queue.pop(0)

                if pos[0] not in range(0, len(grid[0])) or pos[1] not in range(0, len(grid[0])):
                    continue

                if pos in checked:
                    continue

                if grid[pos[0]][pos[1]] == 1:
                    return pos[2]

                else:
                    checked.add((pos[0], pos[1]))
                    distance = pos[2]
                    queue.append((pos[0]+1, pos[1], distance+1))
                    queue.append((pos[0]-1, pos[1], distance+1))
                    queue.append((pos[0], pos[1]+1, distance+1))
                    queue.append((pos[0], pos[1]-1, distance+1))

            # should not be possible
            return -1

        return BFSProcess(grid, set(), [(pos[0], pos[1], 0)])

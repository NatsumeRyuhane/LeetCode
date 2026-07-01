# 2812 — Find the Safest Path in a Grid

- **Source:** https://leetcode.cn/problems/find-the-safest-path-in-a-grid/
- **Difficulty:** Medium

## Statement

You are given a 0-indexed 2D matrix `grid` of size `n x n`, where `(r, c)`
represents:

- A cell containing a **thief** if `grid[r][c] == 1`
- An **empty** cell if `grid[r][c] == 0`

You are initially positioned at cell `(0, 0)`. In one move, you can move to any
**adjacent** cell in the grid, including cells containing thieves.

The **safeness factor** of a path on the grid is defined as the **minimum**
Manhattan distance from any cell in the path to any thief in the grid.

Return the **maximum** safeness factor of all paths leading to cell
`(n - 1, n - 1)`.

An **adjacent** cell of cell `(r, c)` is one of `(r, c + 1)`, `(r, c - 1)`,
`(r + 1, c)`, `(r - 1, c)` if it exists.

The **Manhattan distance** between `(a, b)` and `(x, y)` is `|a - x| + |b - y|`.

### Examples

**Example 1**
Input: `grid = [[1,0,0],[0,0,0],[0,0,1]]`
Output: `0`
Explanation: Cell `(0, 0)` already contains a thief, so every path's safeness
factor is 0.

**Example 2**
Input: `grid = [[0,0,1],[0,0,0],[0,0,0]]`
Output: `2`

**Example 3**
Input: `grid = [[0,0,0,1],[0,0,0,0],[0,0,0,0],[1,0,0,0]]`
Output: `2`

### Constraints

- `1 <= grid.length == n <= 400`
- `grid[i].length == n`
- `grid[i][j]` is either `0` or `1`.
- There is at least one thief in the grid.

### Signature

```python
class Solution:
    def maximumSafenessFactor(self, grid: List[List[int]]) -> int:
```

## User's restatement

1. The safeness factor is tied to each cell — the Manhattan distance from a cell
   to its nearest thief.
2. Resembles the "count paths from [0,0] to [n-1,n-1]" problem. A DP problem with
   a twist: you can enter a cell from any surrounding cell and exit in another
   direction, so walking through a cell gives `min(safeness_in, safeness_this,
   safeness_out)`. Question is how to conduct the search. The safeness map can be
   built via a BFS flooding that stops at the first thief.

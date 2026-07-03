# 3620. Network Recovery Pathways

- **Source:** https://leetcode.cn/problems/network-recovery-pathways/description/
- **Difficulty:** Hard

## Statement

You are given a directed acyclic graph of `n` nodes numbered from `0` to `n − 1`.
This is represented by a 2D array `edges` of length `m`, where
`edges[i] = [ui, vi, costi]` indicates a one-way communication from node `ui` to
node `vi` with a recovery cost of `costi`.

Some nodes may be offline. You are given a boolean array `online` where
`online[i] = true` means node `i` is online. Nodes `0` and `n − 1` are always
online.

A path from `0` to `n − 1` is valid if:

- All intermediate nodes on the path are online.
- The total recovery cost of all edges on the path does not exceed `k`.

For each valid path, define its **score** as the minimum edge-cost along that
path.

Return the maximum path score (i.e., the largest minimum-edge cost) among all
valid paths. If no valid path exists, return `-1`.

## Examples

**Example 1:**
Input: `edges = [[0,1,5],[1,3,10],[0,2,3],[2,3,4]]`, `online = [true,true,true,true]`, `k = 10`
Output: `3`
- Path 0→1→3: total 15 > 10, invalid.
- Path 0→2→3: total 7 ≤ 10, valid; min edge = min(3,4) = 3.
- Answer: 3.

**Example 2:**
Input: `edges = [[0,1,7],[1,4,5],[0,2,6],[2,3,6],[3,4,2],[2,4,6]]`, `online = [true,true,true,false,true]`, `k = 12`
Output: `6`
- Node 3 offline → any path through 3 invalid.
- Path 0→1→4: total 12 ≤ 12, valid; min = 5.
- Path 0→2→4: total 12 ≤ 12, valid; min = 6.
- Answer: 6.

## Constraints

- `n == online.length`
- `2 <= n <= 5 * 10^4`
- `0 <= m == edges.length <= min(10^5, n * (n - 1) / 2)`
- `edges[i] = [ui, vi, costi]`
- `0 <= ui, vi < n`, `ui != vi`
- `0 <= costi <= 10^9`
- `0 <= k <= 5 * 10^13`
- `online[i]` is boolean; `online[0]` and `online[n − 1]` are always true.
- The graph is a directed acyclic graph (DAG).

## User's restatement

DAG with n nodes; inputs are (1) directional edges with costs, (2) online flags
per node, (3) budget k. A path 0→n-1 is valid iff (a) the **sum** of its edge
costs ≤ k, and (b) every intermediate node is online. The **score** of a path is
its **minimum** edge cost. Return the max score over all valid paths, else -1.
Decomposed into: does a valid path exist, and if so which maximizes the score.
Baseline instinct: exhaustive BFS/DFS over paths, expecting TLE/MLE.

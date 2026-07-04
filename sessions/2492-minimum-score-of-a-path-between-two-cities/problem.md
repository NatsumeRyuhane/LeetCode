# 2492 — Minimum Score of a Path Between Two Cities

- **Source:** https://leetcode.cn/problems/minimum-score-of-a-path-between-two-cities
- **Difficulty:** Medium

## Statement

You are given a positive integer `n` representing `n` cities numbered from `1` to `n`.
You are also given a 2D array `roads` where `roads[i] = [ai, bi, distancei]` indicates
that there is a bidirectional road between cities `ai` and `bi` with a distance equal to
`distancei`. The cities graph is **not necessarily connected**.

The **score** of a path between two cities is defined as the **minimum distance** of a
road in this path.

Return the **minimum possible score** of a path between cities `1` and `n`.

Notes:
- A path is a sequence of roads between two cities.
- It is allowed for a path to contain the same road multiple times, and you can visit
  cities `1` and `n` multiple times along the path.
- The test cases are generated such that there is at least one path between `1` and `n`.

Constraints:
- `2 <= n <= 10^5`
- `1 <= roads.length <= 10^5`
- `roads[i].length == 3`
- `1 <= ai, bi <= n`
- `ai != bi`
- `1 <= distancei <= 10^4`
- There are no repeated edges.

Expected signature:
`class Solution: def minScore(self, n: int, roads: List[List[int]]) -> int:`

## User's restatement

> We are given an undirected graph with a bunch of nodes and asked to find the minimal
> score of all paths connecting 1 and n. A score is defined as the shortest edge along
> this path. Each edge and vertex can be visited multiple times.
>
> The graph contains a lot of cycles, unconnected subgraphs, etc. However it is
> undirected, and you are allowed to reuse edges and vertices, so I think the minimum
> score is: starting from n, which reachable edge has the shortest distance? Because
> you can always walk to the minimum-distance edge and walk directly back to n just for
> the sake of lowering the score. And because 1 to n is guaranteed connected, I think it
> would be the same spanning from 1.

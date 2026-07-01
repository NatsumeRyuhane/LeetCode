# Tag registry

Canonical source of truth for tags. **Register a tag here before using it** in a commit
trailer or a `log.md` entry, so tags never fork into synonyms. Three namespaces.

## `#structure:*` — data structures the problem hinges on
- `#structure:hashmap` — dict/set for O(1) membership or grouping
- `#structure:heap` — priority queue / k-th element / streaming top-k
- `#structure:stack` — LIFO, monotonic stack, parsing
- `#structure:queue` — FIFO, BFS frontier, deque/sliding window
- `#structure:linked-list` — singly/doubly linked list manipulation
- `#structure:tree` — binary tree / BST / n-ary traversal
- `#structure:trie` — prefix tree
- `#structure:graph` — adjacency list/matrix, nodes+edges
- `#structure:union-find` — disjoint set / connectivity

## `#technique:*` — the method that cracks it
- `#technique:two-pointer` — opposing or same-direction pointers
- `#technique:sliding-window` — variable/fixed window over a sequence
- `#technique:binary-search` — search a sorted space
- `#technique:binary-search-on-answer` — binary search the answer value, not the array
- `#technique:dp` — dynamic programming / memoization
- `#technique:greedy` — locally optimal choice
- `#technique:backtracking` — build/prune candidate solutions
- `#technique:bfs` — breadth-first search
- `#technique:dfs` — depth-first search / recursion
- `#technique:prefix-sum` — cumulative aggregates
- `#technique:sorting` — sort as a preprocessing step
- `#design` — object/system design (LRU cache, iterators, etc.)

## `#weakness:*` — recurring stumbles to target (grows as they surface)
- `#weakness:complexity-analysis` — miscounts or skips deriving big-O
- `#weakness:off-by-one` — boundary/index errors
- `#weakness:missed-edge-case` — empties, duplicates, single element, overflow
- `#weakness:pointer-bookkeeping` — loses track of links/indices during mutation
- `#weakness:premature-implementation` — codes before the approach is sound
- `#weakness:pattern-recognition` — doesn't map the problem to a known technique

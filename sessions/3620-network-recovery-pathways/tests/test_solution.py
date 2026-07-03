from solution import Solution


def test_example_1():
    edges = [[0, 1, 5], [1, 3, 10], [0, 2, 3], [2, 3, 4]]
    online = [True, True, True, True]
    k = 10
    assert Solution().findMaxPathScore(edges, online, k) == 3


def test_example_2():
    edges = [[0, 1, 7], [1, 4, 5], [0, 2, 6], [2, 3, 6], [3, 4, 2], [2, 4, 6]]
    online = [True, True, True, False, True]
    k = 12
    assert Solution().findMaxPathScore(edges, online, k) == 6


def test_no_edges():
    # n = 2, no edges at all: no path from 0 to n-1 exists.
    edges = []
    online = [True, True]
    k = 73
    assert Solution().findMaxPathScore(edges, online, k) == -1


def test_dead_end_intermediate():
    # Only edge is 0->1; target is node 2, which is unreachable.
    # Node 1 gets reached but is a dead end (no outgoing edges).
    edges = [[0, 1, 5]]
    online = [True, True, True]
    k = 100
    assert Solution().findMaxPathScore(edges, online, k) == -1

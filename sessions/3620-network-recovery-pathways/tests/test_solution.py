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

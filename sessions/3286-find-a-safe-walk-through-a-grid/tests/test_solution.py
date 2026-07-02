from solution import Solution


def test_example_1():
    grid = [[0, 1, 0, 0, 0], [0, 1, 0, 1, 0], [0, 0, 0, 1, 0]]
    assert Solution().findSafeWalk(grid, 1) is True


def test_example_2():
    grid = [
        [0, 1, 1, 0, 0, 0],
        [1, 0, 1, 0, 0, 0],
        [0, 1, 1, 1, 0, 1],
        [0, 0, 1, 0, 1, 0],
    ]
    assert Solution().findSafeWalk(grid, 3) is False


def test_example_3():
    grid = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]
    assert Solution().findSafeWalk(grid, 5) is True

# Tests for 2812 — Find the Safest Path in a Grid.
# Provided examples only (input -> expected output). No algorithm encoded here.

from solution import Solution


def test_example_1():
    grid = [[1, 0, 0], [0, 0, 0], [0, 0, 1]]
    assert Solution().maximumSafenessFactor(grid) == 0


def test_example_2():
    grid = [[0, 0, 1], [0, 0, 0], [0, 0, 0]]
    assert Solution().maximumSafenessFactor(grid) == 2


def test_example_3():
    grid = [
        [0, 0, 0, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 0, 0, 0],
    ]
    assert Solution().maximumSafenessFactor(grid) == 2

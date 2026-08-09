"""Provided examples for 0239. Input -> expected output only."""

from solution import Solution


def test_example_1():
    assert Solution().maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7]


def test_example_2():
    assert Solution().maxSlidingWindow([1], 1) == [1]

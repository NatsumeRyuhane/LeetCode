# Tests for 0877 — Stone Game.
# Provided examples only at scaffold time; edge cases get added during REVIEW.

from solution import Solution


def test_example_1():
    assert Solution().stoneGame([5, 3, 4, 5]) == True


def test_example_2():
    assert Solution().stoneGame([3, 7, 2, 3]) == True

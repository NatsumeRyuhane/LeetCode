# Tests for 0673. Input -> correct output only; no algorithm encoded here.

from solution import Solution


def test_example_1():
    assert Solution().findNumberOfLIS([1, 3, 5, 4, 7]) == 2


def test_example_2():
    assert Solution().findNumberOfLIS([2, 2, 2, 2, 2]) == 5

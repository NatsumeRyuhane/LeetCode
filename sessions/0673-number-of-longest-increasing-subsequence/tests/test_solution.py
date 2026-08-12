# Tests for 0673. Input -> correct output only; no algorithm encoded here.

from solution import Solution


def test_example_1():
    assert Solution().findNumberOfLIS([1, 3, 5, 4, 7]) == 2


def test_example_2():
    assert Solution().findNumberOfLIS([2, 2, 2, 2, 2]) == 5


def test_example_3():
    # what if two path not overlap all the way until the end?
    assert Solution().findNumberOfLIS([4, 5, 6, 1, 2, 3, 9]) == 2

def test_example_4():
    # single elem?
    assert Solution().findNumberOfLIS([1]) == 1

def test_example_5():
    # multiple ends?
    assert Solution().findNumberOfLIS([1, 9, 9, 9, 9]) == 4


def test_example_6():
    # multiple ends and middle?
    assert Solution().findNumberOfLIS([1, 2, 2, 3, 3]) == 4

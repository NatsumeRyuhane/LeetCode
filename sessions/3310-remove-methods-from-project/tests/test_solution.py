# Tests for 3310 — Remove Methods From Project.
# The problem allows the answer in any order, so every assertion compares sorted output.

from solution import Solution


def test_example_1():
    assert sorted(Solution().remainingMethods(4, 1, [[1, 2], [0, 1], [3, 2]])) == [0, 1, 2, 3]


def test_example_2():
    assert sorted(Solution().remainingMethods(5, 0, [[1, 2], [0, 2], [0, 1], [3, 4]])) == [3, 4]


def test_example_3():
    assert sorted(Solution().remainingMethods(3, 2, [[1, 2], [0, 1], [2, 0]])) == []

# Tests for 3310 — Remove Methods From Project.
# The problem allows the answer in any order, so every assertion compares sorted output.

from solution import Solution


def test_example_1():
    assert sorted(Solution().remainingMethods(4, 1, [[1, 2], [0, 1], [3, 2]])) == [0, 1, 2, 3]


def test_example_2():
    assert sorted(Solution().remainingMethods(5, 0, [[1, 2], [0, 2], [0, 1], [3, 4]])) == [3, 4]


def test_example_3():
    assert sorted(Solution().remainingMethods(3, 2, [[1, 2], [0, 1], [2, 0]])) == []

def test_example_minimal():
    assert sorted(Solution().remainingMethods(1, 0, [])) == []

def test_example_2node():
    assert sorted(Solution().remainingMethods(2, 0, [[0, 1]])) == []

def test_example_2node_inverse():
    assert sorted(Solution().remainingMethods(2, 0, [[1, 0]])) == [0, 1]


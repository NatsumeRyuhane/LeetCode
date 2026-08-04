# Tests for 3731 — Find Missing Elements.
# Rules for the coach: assert INPUT -> CORRECT OUTPUT only. Never encode the algorithm.
# Seeded from the problem's three provided examples.

from solution import Solution


def test_example_1():
    assert Solution().findMissingElements([1, 4, 2, 5]) == [3]


def test_example_2():
    assert Solution().findMissingElements([7, 8, 6, 9]) == []


def test_example_3():
    assert Solution().findMissingElements([5, 1]) == [2, 3, 4]

def test_small_1():
    assert Solution().findMissingElements([1, 2]) == []

def test_small_2():
    assert Solution().findMissingElements([1, 10]) == [2, 3, 4, 5, 6, 7, 8, 9]

def test_holes():
    assert Solution().findMissingElements([1, 3, 5, 7]) == [2, 4, 6]


# Edge cases surface here during REVIEW, one failing test at a time.

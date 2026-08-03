# Tests for 1406 — Stone Game III.
# Rules for the coach: assert INPUT -> CORRECT OUTPUT only. Never encode the algorithm.
# Seeded from the problem's three provided examples.

from solution import Solution


def test_example_1():
    assert Solution().stoneGameIII([1, 2, 3, 7]) == "Bob"


def test_example_2():
    assert Solution().stoneGameIII([1, 2, 3, -9]) == "Alice"


def test_example_3():
    assert Solution().stoneGameIII([1, 2, 3, 6]) == "Tie"


# Edge cases surface here during REVIEW, one failing test at a time.

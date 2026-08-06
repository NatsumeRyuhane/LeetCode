# Tests for 3345 — Smallest Divisible Digit Product I.
# Seeded from the problem's provided examples (input -> expected output only).

from solution import Solution


def test_example_1():
    assert Solution().smallestNumber(10, 2) == 10


def test_example_2():
    assert Solution().smallestNumber(15, 3) == 16

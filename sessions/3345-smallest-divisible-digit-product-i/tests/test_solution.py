# Tests for 3345 — Smallest Divisible Digit Product I.
# Seeded from the problem's provided examples (input -> expected output only).

from solution import Solution
import random

random.seed(0)

def test_example_1():
    assert Solution().smallestNumber(10, 2) == 10


def test_example_2():
    assert Solution().smallestNumber(15, 3) == 16

def test_with_100():
    for t in range(1, 11):
        assert Solution().smallestNumber(100, t) == 100

def test_with_1():
    for n in range(1, 101):
        assert Solution().smallestNumber(n, 1) == n

def test_with_10_mult():
    for n in range(10, 101, 10):
        assert Solution().smallestNumber(n, random.randint(1, 10)) == n
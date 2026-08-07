"""Provided examples from the statement. Input -> output only.

Add your own cases below. Before you declare ready: list the branches your code
has, and make sure each one has a test that actually enters it.
"""

from solution import Solution


def test_example_1():
    assert Solution().smallestNumber("1234", 256) == "1488"


def test_example_2():
    assert Solution().smallestNumber("12355", 50) == "12355"


def test_example_3():
    assert Solution().smallestNumber("11111", 26) == "-1"

# Provided examples from the problem statement (I/O only).

from solution import Solution


def test_example_1():
    assert Solution().smallestPalindrome("z") == "z"


def test_example_2():
    assert Solution().smallestPalindrome("babab") == "abbba"


def test_example_3():
    assert Solution().smallestPalindrome("daccad") == "acddca"

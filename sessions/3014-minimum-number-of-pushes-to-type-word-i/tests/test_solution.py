# Provided examples from the problem statement (I/O only).

from solution import Solution


def test_example_1():
    assert Solution().minimumPushes("abcde") == 5


def test_example_2():
    assert Solution().minimumPushes("xycdefghij") == 12

def test_all_letters():
    assert Solution().minimumPushes("abcdefghijklmnopqrstuvwxyz") == 56


def test_9_letters():
    assert Solution().minimumPushes("abcdefghi") == 10
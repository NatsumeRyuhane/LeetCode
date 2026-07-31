# Provided examples from the problem statement (I/O only).

from solution import Solution


def test_example_1():
    assert Solution().minimumPushes("abcde") == 5


def test_example_2():
    assert Solution().minimumPushes("xyzxyzxyzxyz") == 12


def test_example_3():
    assert Solution().minimumPushes("aabbccddeeffgghhiiiiii") == 24

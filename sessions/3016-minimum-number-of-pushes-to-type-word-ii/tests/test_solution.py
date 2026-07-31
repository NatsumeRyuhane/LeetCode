# Provided examples from the problem statement (I/O only).

from solution import Solution
import random


def test_example_1():
    assert Solution().minimumPushes("abcde") == 5


def test_example_2():
    assert Solution().minimumPushes("xyzxyzxyzxyz") == 12


def test_example_3():
    assert Solution().minimumPushes("aabbccddeeffgghhiiiiii") == 24

def test_example_1_letter():
    assert Solution().minimumPushes("a") == 1

def test_example_single_letter_repeat():
    s = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    assert Solution().minimumPushes(s) == len(s)

def test_9_distinct_letters():
    s = "abcdefgh"
    s += "i"
    assert Solution().minimumPushes(s) == 8+2
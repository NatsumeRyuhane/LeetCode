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

def test_randomized_letter_length():
    l = random.randint(1, 10**5)
    s = ""
    for i in range(0, l):
        s += "a"

    assert Solution().minimumPushes(s) == l


def test_randomized_letter_length_2():

    l = random.randint(1, 10**5-8)
    s = "abcdefgh"
    for i in range(0, l):
        s += "i"

    # lengthy i sequences should be priortized to get assigned
    # 1 push slots. one stuff in s initial will be assigned 2.
    # other serven each takes a one
    assert Solution().minimumPushes(s) == l + 7 + 2

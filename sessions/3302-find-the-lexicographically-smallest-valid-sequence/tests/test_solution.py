# Provided examples only. Input -> expected output; no algorithm encoded here.

from solution import Solution


def test_example_1():
    assert Solution().validSequence("vbcca", "abc") == [0, 1, 2]


def test_example_2():
    assert Solution().validSequence("bacdc", "abc") == [1, 2, 4]


def test_example_3():
    assert Solution().validSequence("aaaaaa", "aaabc") == []


def test_example_4():
    assert Solution().validSequence("abc", "ab") == [0, 1]

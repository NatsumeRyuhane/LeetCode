# Provided examples from the problem statement (I/O only).

from solution import Solution


def test_example_1():
    assert Solution().predictTheWinner([1, 5, 2]) == False


def test_example_2():
    assert Solution().predictTheWinner([1, 5, 233, 7]) == True

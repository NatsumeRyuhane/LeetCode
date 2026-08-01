# Provided examples from the problem statement (I/O only).

from solution import Solution


def test_example_1():
    assert Solution().predictTheWinner([1, 5, 2]) == False


def test_example_2():
    assert Solution().predictTheWinner([1, 5, 233, 7]) == True

def test_only_1_elem():
    assert Solution().predictTheWinner([1]) == True


# Added by the coach during REVIEW. Expected values hand-derived from the rules.
def test_matching_ends():
    assert Solution().predictTheWinner([1, 3, 1]) == False


def test_exact_tie():
    assert Solution().predictTheWinner([1, 4, 3]) == True

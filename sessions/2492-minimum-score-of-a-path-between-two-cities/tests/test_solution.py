# Provided examples from the problem statement (I/O only).

from solution import Solution


def test_example_1():
    # n = 4, roads between (1,2)=9, (2,3)=6, (2,4)=5, (1,4)=7
    assert Solution().minScore(4, [[1, 2, 9], [2, 3, 6], [2, 4, 5], [1, 4, 7]]) == 5


def test_example_2():
    # n = 4, roads between (1,2)=2, (1,3)=4, (3,4)=7
    assert Solution().minScore(4, [[1, 2, 2], [1, 3, 4], [3, 4, 7]]) == 2


def test_disconnected_cheaper_component():
    # Globally cheapest road (2,3)=1 sits in a component that contains
    # neither city 1 nor city 4.
    assert Solution().minScore(4, [[1, 4, 5], [2, 3, 1]]) == 5

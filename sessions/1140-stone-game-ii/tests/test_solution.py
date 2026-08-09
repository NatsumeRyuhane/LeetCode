# Provided examples only. Input -> expected output; no algorithm encoded here.

import pytest

from solution import Solution


def run(piles):
    try:
        return Solution().stoneGameII(piles)
    except NotImplementedError:
        pytest.skip("solution not implemented yet")


def test_example_1():
    assert run([2, 7, 9, 4, 4]) == 10


def test_example_2():
    assert run([1, 2, 3, 4, 5, 100]) == 104

def test_take_all():
    assert run([1]) == 1
    assert run([1, 2]) == 3

def test_large_inputes():
    t = []
    import random
    random.seed(0)
    for i in range(100):
        t.append(random.randint(1, 10**4))
    run(t)

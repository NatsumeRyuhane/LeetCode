# Tests for 1406 — Stone Game III.
# Rules for the coach: assert INPUT -> CORRECT OUTPUT only. Never encode the algorithm.
# Seeded from the problem's three provided examples.

from solution import Solution


def test_example_1():
    assert Solution().stoneGameIII([1, 2, 3, 7]) == "Bob"


def test_example_2():
    assert Solution().stoneGameIII([1, 2, 3, -9]) == "Alice"


def test_example_3():
    assert Solution().stoneGameIII([1, 2, 3, 6]) == "Tie"

def test_if_stack_blows_up():
    import random
    random.seed(0)

    stones = []
    for i in range(0, 50000):
        stones.append(random.randint(-1000, 1000))

    result = Solution().stoneGameIII(stones)
    assert result in {"Alice", "Bob", "Tie"}

def test_small_sets():
    assert Solution().stoneGameIII([1]) == "Alice"
    assert Solution().stoneGameIII([1, 2]) == "Alice"
    assert Solution().stoneGameIII([1, 2, 3]) == "Alice"
    assert Solution().stoneGameIII([1, -999, 3]) == "Alice"



# Edge cases surface here during REVIEW, one failing test at a time.

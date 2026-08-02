# Tests for 0877 — Stone Game.
# Provided examples only at scaffold time; edge cases get added during REVIEW.

from solution import Solution


def test_example_1():
    assert Solution().stoneGame([5, 3, 4, 5]) == True


def test_example_2():
    assert Solution().stoneGame([3, 7, 2, 3]) == True

def test_is_alice_just_cant_lose():
    boards = [
        [1, 7, 3, 4],
        [2, 2, 4, 7, 8, 6],
        [1, 1, 2, 2, 3, 4, 4, 4]
    ]

    for b in boards:
        assert Solution().stoneGame(b) == Solution().stoneGame2(b)


def test_is_alice_just_cant_lose_randomize():
    import random

    for i in range(1, 10):
        piles = (random.randint(1, 100) * 2)
        board = [random.randint(1, 100) * 2] * piles

        board[random.randint(0, piles)] -= 1

        assert Solution().stoneGame(board) == Solution().stoneGame2(board)

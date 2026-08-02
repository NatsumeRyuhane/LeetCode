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


# Added by the coach during REVIEW. A legal input at the constraint ceiling
# (n = 500, values in 1..500, even count, odd total). Expected value derived
# independently, not from your solution.
def test_constraint_ceiling():
    board = [(i * 37) % 500 + 1 for i in range(500)]
    if sum(board) % 2 == 0:
        board[-1] += 1

    assert len(board) == 500 and len(board) % 2 == 0
    assert sum(board) % 2 == 1
    assert 1 <= min(board) and max(board) <= 500

    assert Solution().stoneGame(board) == True

from solution import Solution


def test_example_1():
    assert Solution().canJump([2, 3, 1, 1, 4]) is True


def test_example_2():
    assert Solution().canJump([3, 2, 1, 0, 4]) is False

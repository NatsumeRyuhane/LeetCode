from solution import Solution


def test_example_1():
    assert Solution().jump([2, 3, 1, 1, 4]) == 2


def test_example_2():
    assert Solution().jump([2, 3, 0, 1, 4]) == 2


def test_single_index():
    assert Solution().jump([0]) == 0

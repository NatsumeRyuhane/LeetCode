from solution import Solution


def test_example_1():
    assert Solution().missingInteger([1, 2, 3, 2, 5]) == 6


def test_example_2():
    assert Solution().missingInteger([3, 4, 5, 1, 12, 14, 13]) == 15

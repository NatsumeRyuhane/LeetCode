from solution import Solution


def test_example_1():
    assert Solution().missingInteger([1, 2, 3, 2, 5]) == 6


def test_example_2():
    assert Solution().missingInteger([3, 4, 5, 1, 12, 14, 13]) == 15

def test_one_element():
    # longest sequential prefix: [1]
    # sum: 1
    # smallest missing: 2
    assert Solution().missingInteger([1]) == 2

def test_all_sequentianl():
    assert Solution().missingInteger([1, 2, 3, 4]) == 10


def test_sequentials_but_collission():
    assert Solution().missingInteger([1, 2, 3, 4, 10, 11, 12, 13, 14, 2, 3, 4, 5]) == 15

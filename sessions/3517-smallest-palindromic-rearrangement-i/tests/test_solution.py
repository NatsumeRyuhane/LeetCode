# Provided examples from the problem statement (I/O only).

from solution import Solution


def test_example_1():
    assert Solution().smallestPalindrome("z") == "z"


def test_example_2():
    assert Solution().smallestPalindrome("babab") == "abbba"


def test_example_3():
    assert Solution().smallestPalindrome("daccad") == "acddca"


# Added during REVIEW to widen coverage past the three provided examples (I/O only).


def test_shortest_even():
    assert Solution().smallestPalindrome("aa") == "aa"


def test_odd_centre_is_not_the_smallest_letter():
    # multiset {b: 4, a: 1} — 'a' is the only odd-count letter
    assert Solution().smallestPalindrome("bbabb") == "bbabb"


def test_all_one_letter_odd_length():
    assert Solution().smallestPalindrome("ccccc") == "ccccc"

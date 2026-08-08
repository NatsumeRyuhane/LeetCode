# Provided examples only. Input -> expected output; no algorithm encoded here.

from solution import Solution


def test_example_1():
    assert Solution().validSequence("vbcca", "abc") == [0, 1, 2]


def test_example_2():
    assert Solution().validSequence("bacdc", "abc") == [1, 2, 4]


def test_example_3():
    assert Solution().validSequence("aaaaaa", "aaabc") == []


def test_example_4():
    assert Solution().validSequence("abc", "ab") == [0, 1]


# The user's own probe cases from this session, kept as regressions.


def test_wildcard_must_not_be_wasted_on_a_match():
    # Killed the "spend the wildcard as early as possible" conjecture.
    assert Solution().validSequence("abcdce", "abcc") == [0, 1, 2, 3]


def test_feasible_wildcard_slot_is_not_monotone():
    # Slot feasibility is fail/work/fail, so it cannot be binary-searched.
    assert Solution().validSequence("aabcc", "atc") == [0, 1, 3]


def test_wildcard_at_index_zero_when_it_buys_a_smaller_index():
    assert Solution().validSequence("tabcdce", "abcc") == [0, 2, 3, 5]

# Tests for this problem. Rules for the coach:
#   - Assert INPUT -> CORRECT OUTPUT only. Never encode the algorithm or assert on
#     intermediate state that only the intended solution would produce.
#   - Seed from the problem's PROVIDED examples at scaffold time. Add edge cases as
#     hints (REVIEW): compute the correct expected value yourself so the test is
#     trustworthy.
#   - Match the callable name/signature to whatever the problem specifies.
#   - Placeholders below FAIL LOUDLY on purpose: an unfilled scaffold must never
#     read as green. Replace the pytest.fail lines with real assertions.

import pytest

from solution import Solution  # or: from solution import function_name


def test_example_1():
    pytest.fail("scaffold not filled in — encode the problem's provided example 1")


def test_example_2():
    pytest.fail("scaffold not filled in — encode the problem's provided example 2")


# Edge cases surface here during REVIEW, one failing test at a time:
# def test_empty_input():
#     assert Solution().method([]) == <correct answer for []>

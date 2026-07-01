# Tests for this problem. Rules for the coach:
#   - Assert INPUT -> CORRECT OUTPUT only. Never encode the algorithm or assert on
#     intermediate state that only the intended solution would produce.
#   - Seed from the problem's PROVIDED examples. Add edge cases as hints (state 6):
#     compute the correct expected value yourself so the test is trustworthy.
#   - Match the callable name/signature to whatever the problem specifies.
#
# Adapt the import and calls to the actual signature. Examples of both shapes:

from solution import Solution  # or: from solution import function_name


def test_example_1():
    # assert Solution().method(<input>) == <expected>
    ...


def test_example_2():
    ...


# Edge cases surface here during REVIEW, one failing test at a time:
# def test_empty_input():
#     assert Solution().method([]) == <correct answer for []>

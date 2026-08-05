# Tests for 3310 — Remove Methods From Project.
# The problem allows the answer in any order, so every assertion compares sorted output.

import time

from solution import Solution


def test_example_1():
    assert sorted(Solution().remainingMethods(4, 1, [[1, 2], [0, 1], [3, 2]])) == [0, 1, 2, 3]


def test_example_2():
    assert sorted(Solution().remainingMethods(5, 0, [[1, 2], [0, 2], [0, 1], [3, 4]])) == [3, 4]


def test_example_3():
    assert sorted(Solution().remainingMethods(3, 2, [[1, 2], [0, 1], [2, 0]])) == []

def test_example_minimal():
    assert sorted(Solution().remainingMethods(1, 0, [])) == []

def test_example_2node():
    assert sorted(Solution().remainingMethods(2, 0, [[0, 1]])) == []

def test_example_2node_inverse():
    assert sorted(Solution().remainingMethods(2, 0, [[1, 0]])) == [0, 1]


def test_large_fan_in_then_fan_out():
    # Shape: k=0 invokes t methods; all t of them invoke the same method v;
    # v invokes t further methods. Node 2t+2 is isolated and clean.
    # Everything except the isolated node is reachable from k, and no clean
    # method invokes anything dirty, so the whole dirty set is removable.
    # Well inside the stated limits: n = 14003 <= 1e5, m = 21000 <= 2e5.
    t = 7000
    v = t + 1
    invocations = (
        [[0, i] for i in range(1, t + 1)]
        + [[i, v] for i in range(1, t + 1)]
        + [[v, t + 2 + j] for j in range(t)]
    )
    n = 2 * t + 3

    start = time.perf_counter()
    result = Solution().remainingMethods(n, 0, invocations)
    elapsed = time.perf_counter() - start

    assert sorted(result) == [2 * t + 2]
    assert elapsed < 1.5, (
        f"took {elapsed:.2f}s on n={n}, m={len(invocations)}; the judge allows "
        f"n up to 1e5 and m up to 2e5, which is ~7x this input"
    )


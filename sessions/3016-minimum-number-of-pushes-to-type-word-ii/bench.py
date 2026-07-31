"""Timing / profiling harness for 3016. Scaffolding only — no algorithm here.

    uv run python sessions/3016-minimum-number-of-pushes-to-type-word-ii/bench.py
    uv run python sessions/3016-minimum-number-of-pushes-to-type-word-ii/bench.py --profile
    uv run python sessions/3016-minimum-number-of-pushes-to-type-word-ii/bench.py --scale

Ported from the 3517 harness. The point is unchanged: where the time goes is a
measurement, not an opinion. --profile reports per-function time and call counts,
so "how much work happens per character" stops being a guess.

To compare a rewrite against the current version, keep the old one around under a
different name (e.g. `minimumPushes_v2`) and add it to VARIANTS below. `check()`
will refuse to time a variant that disagrees with the first one.
"""

import argparse
import cProfile
import pstats
import random
import sys
import pathlib
import timeit

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from solution import Solution

# Methods on Solution to benchmark. Add your rewrites here as you write them.
VARIANTS = ["minimumPushes"]


def make_word(n: int, alphabet: int = 26, seed: int = 0) -> str:
    """A random word of exactly length n, drawn from the first `alphabet` letters."""
    rng = random.Random(seed)
    return "".join(chr(ord("a") + rng.randrange(alphabet)) for _ in range(n))


CASES = [
    ("100k random, full alphabet", make_word(100_000)),
    ("100k random, 9 letters", make_word(100_000, alphabet=9)),
    ("100k single letter", "a" * 100_000),
    ("100k two letters", make_word(100_000, alphabet=2)),
]


def check(sol: Solution) -> None:
    """Sanity-guard: every variant must agree with the first before timing it."""
    for name, s in CASES:
        base = getattr(sol, VARIANTS[0])(s)
        for v in VARIANTS[1:]:
            got = getattr(sol, v)(s)
            if got != base:
                raise SystemExit(f"MISMATCH on {name!r}: {v} gave {got}, {VARIANTS[0]} gave {base}")


def run_timing(repeat: int) -> None:
    sol = Solution()
    check(sol)
    width = max(len(name) for name, _ in CASES)
    for name, s in CASES:
        row = [f"{name:<{width}}"]
        for v in VARIANTS:
            fn = getattr(sol, v)
            best = min(timeit.repeat(lambda: fn(s), number=1, repeat=repeat))
            row.append(f"{v}={best * 1000:8.2f} ms")
        print("  ".join(row))


def run_scaling(repeat: int) -> None:
    """Double n repeatedly and print the ratio between successive timings.

    Read the RATIO column, not the milliseconds: ~2x per doubling means linear,
    ~4x per doubling means quadratic. This distinguishes 'slow' from 'wrong order
    of growth' without any reasoning about the code.
    """
    sol = Solution()
    for v in VARIANTS:
        fn = getattr(sol, v)
        print(f"\n===== {v} =====")
        print(f"{'n':>9}  {'time':>10}  {'ratio':>6}")
        prev = None
        for n in (12_500, 25_000, 50_000, 100_000, 200_000):
            s = make_word(n)
            best = min(timeit.repeat(lambda: fn(s), number=1, repeat=repeat))
            ratio = f"{best / prev:5.2f}x" if prev else "    --"
            print(f"{n:>9}  {best * 1000:8.2f}ms  {ratio:>6}")
            prev = best


def run_profile() -> None:
    sol = Solution()
    s = make_word(100_000)
    for v in VARIANTS:
        fn = getattr(sol, v)
        print(f"\n===== {v} =====")
        pr = cProfile.Profile()
        pr.enable()
        fn(s)
        pr.disable()
        pstats.Stats(pr).sort_stats("tottime").print_stats(12)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile", action="store_true", help="per-function time and call counts")
    ap.add_argument("--scale", action="store_true", help="growth curve: ratio per doubling of n")
    ap.add_argument("--repeat", type=int, default=5)
    args = ap.parse_args()
    if args.profile:
        run_profile()
    elif args.scale:
        run_scaling(args.repeat)
    else:
        run_timing(args.repeat)

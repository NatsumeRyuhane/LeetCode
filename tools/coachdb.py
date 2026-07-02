#!/usr/bin/env python3
"""coachdb — append-only JSONL store + query CLI for the leetcode-coach.

Zero dependencies (stdlib only). Session keys are '<NNNN>-<slug>@<YYYY-MM-DD>' —
one key per SITTING, so redo attempts never conflate; the part before '@' is the
problem key, auto-stored on every row (query across attempts with --problem).
Data lives in db/*.jsonl at the repo root:
  events.jsonl       fine-grained timeline: turns, state changes, hints, test runs
  sessions.jsonl     one summary row per completed session
  assessments.jsonl  one row per (session x ability dimension), with evidence

Design notes:
  - Append-only: rows are never edited. Corrections are new rows. This keeps
    git diffs clean (a debrief commit shows exactly the rows it added).
  - `log` auto-computes gap_s = seconds since the previous event in the same
    session, so response-latency analysis needs no extra bookkeeping.
  - All query output is JSONL on stdout — pipe-friendly, easy to consume.

Usage examples:
  python3 tools/coachdb.py log --session 3286-safe-walk@2026-07-01 --type user-turn --state IMPLEMENTATION
  python3 tools/coachdb.py log --session 3286-safe-walk@2026-07-01 --type hint --level L1 --note "probed read-order"
  python3 tools/coachdb.py session --session 3286-safe-walk@2026-07-01 --outcome solved-optimal \
      --hints L1,L2 --tags "#technique:bfs,#weakness:bfs-mechanics" --time "O(V+E)" --space "O(V)"
  python3 tools/coachdb.py assess --session 3286-safe-walk@2026-07-01 --dimension complexity-analysis \
      --level 4 --evidence "derived amortized copy() cost unaided"
  python3 tools/coachdb.py query sessions --tag "#weakness:bfs-mechanics" --limit 5\n  python3 tools/coachdb.py query events --problem 3286-safe-walk   # every sitting
  python3 tools/coachdb.py query events --session 3286-safe-walk@2026-07-01 --type hint
  python3 tools/coachdb.py trend --dimension implementation-correctness
  python3 tools/coachdb.py stats --session 3286-safe-walk@2026-07-01
"""
import argparse
import datetime as dt
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]  # tools/.. == repo root
DB = ROOT / "db"
TABLES = ("events", "sessions", "assessments")
BREAK_S = 1800  # gaps longer than this are treated as breaks, not struggle


def _problem(session_key: str) -> str:
    """Session keys are '<NNNN>-<slug>@<YYYY-MM-DD>'; the part before '@' is the problem."""
    return session_key.split("@")[0]


def _row_problem(r: dict) -> str:
    return r.get("problem") or _problem(r.get("session", ""))  # legacy rows lack the field


def _summ(e: dict) -> dict:
    return {k: e[k] for k in ("type", "state", "level", "note") if k in e}


def _path(table: str) -> pathlib.Path:
    return DB / f"{table}.jsonl"


def _now() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def _read(table: str) -> list[dict]:
    p = _path(table)
    if not p.exists():
        return []
    return [json.loads(line) for line in p.read_text().splitlines() if line.strip()]


def _append(table: str, rec: dict) -> dict:
    DB.mkdir(exist_ok=True)
    with _path(table).open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    return rec


def _emit(rows) -> None:
    for r in rows:
        print(json.dumps(r, ensure_ascii=False))


def _parse_ts(s: str) -> dt.datetime:
    return dt.datetime.fromisoformat(s)


# ---------------------------------------------------------------- commands

def cmd_log(a) -> None:
    rec = {"ts": _now(), "session": a.session, "problem": _problem(a.session), "type": a.type}
    if a.state:
        rec["state"] = a.state
    if a.level:
        rec["level"] = a.level
    if a.note:
        rec["note"] = a.note
    prev = [e for e in _read("events") if e.get("session") == a.session]
    if prev:
        rec["gap_s"] = int((_parse_ts(rec["ts"]) - _parse_ts(prev[-1]["ts"])).total_seconds())
    _emit([_append("events", rec)])


def cmd_session(a) -> None:
    rec = {
        "ts": _now(),
        "session": a.session,
        "problem": _problem(a.session),
        "outcome": a.outcome,
        "hints": [h for h in (a.hints or "").split(",") if h],
        "tags": [t for t in (a.tags or "").split(",") if t],
    }
    if a.time:
        rec["time_complexity"] = a.time
    if a.space:
        rec["space_complexity"] = a.space
    if a.note:
        rec["note"] = a.note
    _emit([_append("sessions", rec)])


def cmd_assess(a) -> None:
    _emit([_append("assessments", {
        "ts": _now(), "session": a.session, "problem": _problem(a.session),
        "dimension": a.dimension, "level": a.level, "evidence": a.evidence,
    })])


def cmd_query(a) -> None:
    rows = _read(a.table)
    if a.session:
        rows = [r for r in rows if r.get("session") == a.session]
    if a.problem:
        rows = [r for r in rows if _row_problem(r) == a.problem]
    if a.type:
        rows = [r for r in rows if r.get("type") == a.type]
    if a.dimension:
        rows = [r for r in rows if r.get("dimension") == a.dimension]
    if a.tag:
        rows = [r for r in rows if a.tag in r.get("tags", [])]
    if a.since:
        cutoff = dt.datetime.fromisoformat(a.since)
        if cutoff.tzinfo is None:
            cutoff = cutoff.astimezone()
        rows = [r for r in rows if _parse_ts(r["ts"]) >= cutoff]
    if a.limit:
        rows = rows[-a.limit:]
    _emit(rows)


def cmd_trend(a) -> None:
    rows = [r for r in _read("assessments") if r["dimension"] == a.dimension]
    for r in rows:
        print(f'{r["ts"][:10]}  L{r["level"]}  {r["session"]}: {r["evidence"]}')
    if not rows:
        print(f"(no assessments recorded for dimension: {a.dimension})", file=sys.stderr)


def cmd_stats(a) -> None:
    """Timing readout for one sitting: wall/active time, time-in-state, pauses, hint latency."""
    ev = [e for e in _read("events") if e.get("session") == a.session]
    if not ev:
        print(f"(no events for session: {a.session})", file=sys.stderr)
        return
    total = int((_parse_ts(ev[-1]["ts"]) - _parse_ts(ev[0]["ts"])).total_seconds())
    active = sum(g for e in ev if 0 < (g := e.get("gap_s", 0)) <= BREAK_S)
    by_state: dict[str, int] = {}
    state = None
    for e in ev:
        gap = e.get("gap_s", 0)
        if state is not None and 0 < gap <= BREAK_S:
            by_state[state] = by_state.get(state, 0) + gap  # gap accrues to the state we were in
        state = e.get("state", state)
    # a pause's gap_s sits on the event that ENDS it; pair it with what preceded it
    pauses = [
        {"gap_s": e["gap_s"], "after": _summ(ev[i - 1]), "resumed_with": _summ(e)}
        for i, e in enumerate(ev) if i and e.get("gap_s")
    ]
    pauses.sort(key=lambda p: -p["gap_s"])
    hint_latency = [
        {"level": e.get("level"), "note": e.get("note"),
         "response_s": ev[i + 1].get("gap_s") if i + 1 < len(ev) else None}
        for i, e in enumerate(ev) if e.get("type") == "hint"
    ]
    print(json.dumps({
        "session": a.session,
        "events": len(ev),
        "wall_seconds": total,
        "active_seconds": active,          # excludes gaps > BREAK_S (breaks, not struggle)
        "seconds_in_state": by_state,
        "hint_latency": hint_latency,      # per hint: seconds until the user's next move
        "longest_pauses": pauses[:5],
    }, ensure_ascii=False, indent=2))


def main() -> None:
    p = argparse.ArgumentParser(prog="coachdb", description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    q = sub.add_parser("log", help="append a timeline event (auto ts + gap_s)")
    q.add_argument("--session", required=True)
    q.add_argument("--type", required=True,
                   help="user-turn | state-change | hint | test-run | reveal | note")
    q.add_argument("--state", help="protocol state at this moment, e.g. IMPLEMENTATION")
    q.add_argument("--level", help="hint level if type=hint (L0..L4)")
    q.add_argument("--note")
    q.set_defaults(fn=cmd_log)

    q = sub.add_parser("session", help="append a session summary row (at debrief)")
    q.add_argument("--session", required=True)
    q.add_argument("--outcome", required=True,
                   help="solved-optimal | solved-suboptimal | unsolved | revealed")
    q.add_argument("--hints", help="comma-separated, e.g. L1,L2,L2")
    q.add_argument("--tags", help="comma-separated, must exist in TAGS.md")
    q.add_argument("--time", help="final time complexity, e.g. O(n log n)")
    q.add_argument("--space", help="final space complexity")
    q.add_argument("--note")
    q.set_defaults(fn=cmd_session)

    q = sub.add_parser("assess", help="append one ability-dimension score (at debrief)")
    q.add_argument("--session", required=True)
    q.add_argument("--dimension", required=True)
    q.add_argument("--level", required=True, type=int, choices=range(1, 6))
    q.add_argument("--evidence", required=True)
    q.set_defaults(fn=cmd_assess)

    q = sub.add_parser("query", help="filter any table; JSONL to stdout")
    q.add_argument("table", choices=TABLES)
    q.add_argument("--session", help="exact session key (one sitting)")
    q.add_argument("--problem", help="problem key — matches every attempt/sitting")
    q.add_argument("--type")
    q.add_argument("--dimension")
    q.add_argument("--tag")
    q.add_argument("--since", help="ISO date/datetime lower bound")
    q.add_argument("--limit", type=int)
    q.set_defaults(fn=cmd_query)

    q = sub.add_parser("trend", help="level history for one ability dimension")
    q.add_argument("--dimension", required=True)
    q.set_defaults(fn=cmd_trend)

    q = sub.add_parser("stats", help="timing readout for one session (for debrief)")
    q.add_argument("--session", required=True)
    q.set_defaults(fn=cmd_stats)

    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()

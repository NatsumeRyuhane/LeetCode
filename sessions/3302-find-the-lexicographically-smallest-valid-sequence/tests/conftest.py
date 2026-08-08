# Injects this problem's folder (sessions/<id>/) onto sys.path so the tests can do
# `import solution` and pick up the sibling solution.py. Identical for every problem;
# copied verbatim by the coach during INTAKE.
import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

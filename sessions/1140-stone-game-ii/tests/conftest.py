# Injects this problem's folder (sessions/<id>/) onto sys.path so the tests can do
# `import solution` and pick up the sibling solution.py.
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

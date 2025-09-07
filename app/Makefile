# Makefile
PY=python

all:
	$(PY) scripts/ci_run.py

serve:
	uvicorn api.server:app --host 0.0.0.0 --port 8000 --reload

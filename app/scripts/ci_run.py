# scripts/ci_run.py
import json, os, subprocess, sys

def run(cmd, input_text=None):
    print("→", cmd)
    res = subprocess.run(cmd, input=input_text.encode("utf-8") if input_text else None, shell=True, check=True)

def main():
    # 1) Detect changes
    out = subprocess.check_output("python scripts/manifest.py", shell=True).decode("utf-8").strip()
    info = json.loads(out) if out.startswith("{") else {"changed": [], "total": 0}
    changed_files = info.get("changed", [])
    print("Changed .txt:", changed_files)

    # 2) Convert only changed .txt to JSON
    if changed_files:
        stdin = "\n".join(changed_files)
        run("python scripts/convert_txt_to_json.py", input_text=stdin)
        # Map txt filenames -> produced JSON paths
        # We don't know episode_id until conversion; simplest: segment all raw JSON whose mtime changed.
        # For now, segment all raw JSON (fast enough), or enhance by tracking mtimes.
        run("python scripts/segment_changed.py")  # segments all; feel free to optimize

    else:
        print("No new transcripts; proceeding to rebuild indices anyway.")

    # 3) Always rebuild TF-IDF + BM25 (fast, ensures consistency)
    run("python scripts/build_indices.py")

if __name__ == "__main__":
    main()

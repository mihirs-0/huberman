# scripts/convert_txt_to_json.py
import os
import json
import pathlib
import re
import sys

RAW_TXT_DIR = "data/raw_txt"   # input folder (your .txt transcripts)
OUT_JSON_DIR = "data/raw"      # output folder (JSONs)

def slugify(s: str, max_length: int = 100) -> str:
    """Make a safe identifier from the title/filename"""
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "_", s).strip("_")
    if len(s) > max_length:
        s = s[:max_length].rstrip("_")
    return s or "untitled"

def process_file(path: str):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.read().strip().splitlines()
    if not lines: return None
    
    # Use the filename (without extension) as the title
    base_name = os.path.splitext(os.path.basename(path))[0]
    title = base_name
    raw_text = "\n".join(lines).strip()
    episode_id = "ep_" + slugify(base_name)
    return episode_id, {"episode_id": episode_id, "title": title, "raw_text": raw_text}

def main(changed_list=None):
    os.makedirs(OUT_JSON_DIR, exist_ok=True)
    targets = changed_list or [fn for fn in os.listdir(RAW_TXT_DIR) if fn.lower().endswith(".txt")]
    
    for fn in targets:
        p = os.path.join(RAW_TXT_DIR, fn)
        if not os.path.isfile(p): continue
        res = process_file(p)
        if not res: 
            print(f"⚠️ Skip empty: {fn}"); 
            continue
        episode_id, obj = res
        out_path = os.path.join(OUT_JSON_DIR, f"{episode_id}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2)
        print(f"✅ Wrote {out_path}")

if __name__ == "__main__":
    # Optional: pass filenames via stdin (one per line) when running from ci_run.py
    stdin_list = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip()] if not sys.stdin.isatty() else None
    main(stdin_list)

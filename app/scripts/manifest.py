# scripts/manifest.py
import os, json, hashlib

RAW_TXT = "data/raw_txt"
MANIFEST = "artifacts/input_manifest.json"

def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1<<20), b""):
            h.update(chunk)
    return h.hexdigest()

def load_manifest():
    if os.path.exists(MANIFEST):
        return json.load(open(MANIFEST, "r"))
    return {"files": {}, "count": 0}

def save_manifest(m):
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    json.dump(m, open(MANIFEST, "w"), indent=2)

def main():
    old = load_manifest()
    new = {"files": {}, "count": 0}
    changed = []
    for fn in sorted(os.listdir(RAW_TXT)):
        if not fn.lower().endswith(".txt"): continue
        p = os.path.join(RAW_TXT, fn)
        meta = {"sha256": sha256(p), "size": os.path.getsize(p)}
        new["files"][fn] = meta
        new["count"] += 1
        if fn not in old["files"] or old["files"][fn]["sha256"] != meta["sha256"]:
            changed.append(fn)

    save_manifest(new)
    print(json.dumps({"changed": changed, "total": new["count"]}))

if __name__ == "__main__":
    main()

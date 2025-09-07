# scripts/segment_changed.py
import os, json, re, math, networkx as nx, sys
from pathlib import Path

RAW_DIR = "data/raw"
PROC_DIR = "data/processed"

def sent_tokenize(text: str):
    text = re.sub(r"\s+", " ", text).strip()
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+(?=[A-Z(\"'])", text) if s.strip()]

def chunk_sentences(sents, target_len=5):
    buf, chunks = [], []
    for s in sents:
        buf.append(s)
        if len(buf) >= target_len:
            chunks.append(buf); buf=[]
    if buf: chunks.append(buf)
    return chunks

def _tokset(s): return set(re.findall(r"[a-z0-9]+", s.lower()))
def _sim(a,b):
    A,B=_tokset(a),_tokset(b)
    return 0.0 if not A or not B else len(A&B)/math.sqrt(len(A)*len(B))
def textrank_choose(sents, k=2):
    n=len(sents)
    if n<=k: return sents
    g=nx.Graph(); [g.add_node(i) for i in range(n)]
    for i in range(n):
        for j in range(i+1,n):
            w=_sim(sents[i],sents[j])
            if w>0: g.add_edge(i,j,weight=w)
    pr=nx.pagerank(g, weight="weight")
    top=sorted(range(n), key=lambda i: pr.get(i,0), reverse=True)[:k]
    top.sort()
    return [sents[i] for i in top]

def segment_one(ep_path):
    ep = json.load(open(ep_path, "r", encoding="utf-8"))
    raw_text = ep.get("raw_text","").strip()
    if not raw_text: return None
    sents = sent_tokenize(raw_text)
    sent_chunks = chunk_sentences(sents, target_len=5)
    chunks = []
    for idx, ch in enumerate(sent_chunks):
        chosen = textrank_choose(ch, k=2)
        title = chosen[0] if chosen else (ch[0] if ch else "")
        why   = chosen[1] if len(chosen)>1 else ""
        chunks.append({
            "chunk_id": f"{ep['episode_id']}__{idx:04d}",
            "episode_id": ep["episode_id"],
            "episode_title": ep.get("title",""),
            "chunk_index": idx,
            "text": " ".join(ch),
            "title_sent": title,
            "why_sent": why
        })
    os.makedirs(PROC_DIR, exist_ok=True)
    out_path = os.path.join(PROC_DIR, f"{ep['episode_id']}.chunks.json")
    json.dump({"episode_id": ep["episode_id"], "title": ep.get("title",""), "chunks": chunks},
              open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("🧩 Segmented:", ep["episode_id"])

def main(changed_json_paths=None):
    targets = changed_json_paths or [os.path.join(RAW_DIR, f) for f in os.listdir(RAW_DIR) if f.endswith(".json")]
    for p in targets:
        if os.path.isfile(p): segment_one(p)

if __name__ == "__main__":
    stdin_list = [ln.strip() for ln in sys.stdin.read().splitlines() if ln.strip()] if not sys.stdin.isatty() else None
    main(stdin_list)

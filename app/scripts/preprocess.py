import os, json, re, math, joblib, pickle, argparse
from tqdm import tqdm
from pathlib import Path
from typing import List, Dict
from collections import defaultdict

# ---- Config ----
RAW_DIR = "data/raw"          # your JSONs with {episode_id,title,raw_text}
PROC_DIR = "data/processed"   # per-episode chunks
ART_DIR  = "artifacts"        # indices + unified tables

# ---- Text utils ----
def sent_tokenize(text: str) -> List[str]:
    # lightweight sentence splitter (keeps it dependency-light)
    # If you want higher quality, swap to nltk.sent_tokenize and download punkt.
    text = re.sub(r"\s+", " ", text).strip()
    # Split on .!? followed by space+Capital or end
    parts = re.split(r"(?<=[.!?])\s+(?=[A-Z(\"'])", text)
    return [s.strip() for s in parts if s.strip()]

def chunk_sentences(sents: List[str], target_len=5) -> List[List[str]]:
    buf, chunks = [], []
    for s in sents:
        buf.append(s)
        if len(buf) >= target_len:
            chunks.append(buf); buf = []
    if buf: chunks.append(buf)
    return chunks

# ---- Mini TextRank for "title" & "why" ----
import networkx as nx
def _token_set(s): return set(re.findall(r"[a-z0-9]+", s.lower()))
def _sim(a, b):
    A, B = _token_set(a), _token_set(b)
    if not A or not B: return 0.0
    return len(A & B) / math.sqrt(len(A) * len(B))

def textrank_choose(sentences: List[str], k=2) -> List[str]:
    n = len(sentences)
    if n <= k: return sentences
    g = nx.Graph()
    for i in range(n): g.add_node(i)
    for i in range(n):
        for j in range(i+1, n):
            w = _sim(sentences[i], sentences[j])
            if w > 0: g.add_edge(i, j, weight=w)
    pr = nx.pagerank(g, weight="weight")
    top = sorted(range(n), key=lambda i: pr.get(i, 0), reverse=True)[:k]
    top.sort()
    return [sentences[i] for i in top]

# ---- STEP 1: Segment raw_text -> chunks per episode ----
def segment_all():
    os.makedirs(PROC_DIR, exist_ok=True)
    count_eps, count_chunks = 0, 0

    for fn in os.listdir(RAW_DIR):
        if not fn.endswith(".json"): continue
        ep = json.load(open(os.path.join(RAW_DIR, fn), "r", encoding="utf-8"))
        raw_text = ep.get("raw_text", "").strip()
        if not raw_text: 
            print(f"Skip empty: {fn}")
            continue

        sents = sent_tokenize(raw_text)
        sent_chunks = chunk_sentences(sents, target_len=5)  # ~5 sentences/chunk
        out_chunks = []

        for idx, ch in enumerate(sent_chunks):
            title_why = textrank_choose(ch, k=2)
            title_sent = title_why[0] if title_why else (ch[0] if ch else "")
            why_sent   = (title_why[1] if len(title_why) > 1 else "")
            out_chunks.append({
                "chunk_id": f"{ep['episode_id']}__{idx:04d}",
                "episode_id": ep["episode_id"],
                "episode_title": ep.get("title", ""),
                "chunk_index": idx,
                "text": " ".join(ch),
                "title_sent": title_sent,
                "why_sent": why_sent
            })

        # write per-episode processed file
        json.dump({"episode_id": ep["episode_id"], "title": ep.get("title",""), "chunks": out_chunks},
                  open(os.path.join(PROC_DIR, f"{ep['episode_id']}.chunks.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)

        count_eps += 1
        count_chunks += len(out_chunks)

    print(f"Segmented episodes: {count_eps}, total chunks: {count_chunks}")

# ---- STEP 2: Build TF-IDF + BM25 over all chunks ----
from sklearn.feature_extraction.text import TfidfVectorizer
from rank_bm25 import BM25Okapi

def build_indices():
    os.makedirs(ART_DIR, exist_ok=True)
    texts, meta = [], []

    # unify all chunks
    for fn in os.listdir(PROC_DIR):
        if not fn.endswith(".chunks.json"): continue
        js = json.load(open(os.path.join(PROC_DIR, fn), "r", encoding="utf-8"))
        for ch in js["chunks"]:
            texts.append(ch["text"])
            meta.append({
                "chunk_id": ch["chunk_id"],
                "episode_id": ch["episode_id"],
                "episode_title": ch["episode_title"],
                "chunk_index": ch["chunk_index"],
                "title_sent": ch["title_sent"],
                "why_sent": ch["why_sent"]
            })

    if not texts:
        print("No chunks to index.")
        return

    print(f"Building indices for {len(texts)} chunks...")

    # TF-IDF
    vec = TfidfVectorizer(max_features=50000, ngram_range=(1,2), lowercase=True)
    X = vec.fit_transform(texts)
    joblib.dump(X, os.path.join(ART_DIR, "tfidf.joblib"))
    joblib.dump(vec, os.path.join(ART_DIR, "tfidf_vectorizer.joblib"))
    json.dump(meta, open(os.path.join(ART_DIR, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("Saved TF-IDF:", X.shape)

    # BM25
    print("Building BM25 index...")
    tokenized = [re.findall(r"[a-z0-9]+", t.lower()) for t in texts]
    bm = BM25Okapi(tokenized)
    with open(os.path.join(ART_DIR, "bm25.pkl"), "wb") as f:
        pickle.dump({"bm25": bm, "meta": meta}, f)
    print("Saved BM25 for", len(texts), "chunks")

    # Also write a flat JSONL of chunks for the feed API
    with open(os.path.join(ART_DIR, "chunks.jsonl"), "w", encoding="utf-8") as f:
        for m, text in zip(meta, texts):
            rec = dict(m); rec["text"] = text
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print("Wrote artifacts/chunks.jsonl")

# ---- CLI ----
if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--segment", action="store_true", help="Segment raw -> chunks")
    ap.add_argument("--index", action="store_true", help="Build TF-IDF + BM25")
    ap.add_argument("--all", action="store_true", help="Run both steps")
    args = ap.parse_args()

    if args.all or args.segment:
        print("=== STEP 1: Segmenting episodes ===")
        segment_all()
    if args.all or args.index:
        print("=== STEP 2: Building indices ===")
        build_indices()
    
    if not (args.all or args.segment or args.index):
        print("Usage: python preprocess.py [--segment] [--index] [--all]")
        print("  --segment: Segment raw episodes into chunks")
        print("  --index: Build TF-IDF and BM25 search indices")
        print("  --all: Run both segmentation and indexing")

# scripts/build_indices.py
import os, json, re, pickle, joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from rank_bm25 import BM25Okapi

PROC_DIR = "data/processed"
ART_DIR  = "artifacts"

def main():
    texts, meta = [], []
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
        print("No chunks found.")
        return

    os.makedirs(ART_DIR, exist_ok=True)

    vec = TfidfVectorizer(max_features=50000, ngram_range=(1,2), lowercase=True)
    X = vec.fit_transform(texts)
    joblib.dump(X, os.path.join(ART_DIR, "tfidf.joblib"))
    joblib.dump(vec, os.path.join(ART_DIR, "tfidf_vectorizer.joblib"))
    json.dump(meta, open(os.path.join(ART_DIR, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("✅ TF-IDF built:", X.shape)

    tokenized = [re.findall(r"[a-z0-9]+", t.lower()) for t in texts]
    bm = BM25Okapi(tokenized)
    with open(os.path.join(ART_DIR, "bm25.pkl"), "wb") as f:
        pickle.dump({"bm25": bm, "meta": meta}, f)
    print("✅ BM25 built for", len(texts), "chunks")

    with open(os.path.join(ART_DIR, "chunks.jsonl"), "w", encoding="utf-8") as f:
        for m, text in zip(meta, texts):
            rec = dict(m); rec["text"] = text
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print("✅ Wrote artifacts/chunks.jsonl")

if __name__ == "__main__":
    main()

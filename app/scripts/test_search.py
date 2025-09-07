#!/usr/bin/env python3
"""
Simple test script to verify the search indices work correctly.
"""
import os
import json
import pickle
import joblib
import re
from sklearn.metrics.pairwise import cosine_similarity

def test_tfidf_search(query="sleep and recovery", top_k=5):
    """Test TF-IDF based similarity search"""
    print(f"=== TF-IDF Search for: '{query}' ===")
    
    # Load TF-IDF components
    tfidf_matrix = joblib.load("artifacts/tfidf.joblib")
    vectorizer = joblib.load("artifacts/tfidf_vectorizer.joblib")
    meta = json.load(open("artifacts/meta.json", "r"))
    
    # Transform query
    query_vec = vectorizer.transform([query])
    
    # Compute similarities
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    
    # Get top results
    top_indices = similarities.argsort()[-top_k:][::-1]
    
    for i, idx in enumerate(top_indices):
        score = similarities[idx]
        chunk = meta[idx]
        print(f"\n{i+1}. Score: {score:.4f}")
        print(f"Episode: {chunk['episode_title']}")
        print(f"Chunk: {chunk['chunk_id']}")
        print(f"Title: {chunk['title_sent'][:100]}...")
        print(f"Why: {chunk['why_sent'][:100]}...")
    
    return top_indices, similarities[top_indices]

def test_bm25_search(query="sleep and recovery", top_k=5):
    """Test BM25 based search"""
    print(f"\n=== BM25 Search for: '{query}' ===")
    
    # Load BM25 components
    with open("artifacts/bm25.pkl", "rb") as f:
        data = pickle.load(f)
        bm25 = data["bm25"]
        meta = data["meta"]
    
    # Tokenize query
    query_tokens = re.findall(r"[a-z0-9]+", query.lower())
    
    # Get BM25 scores
    scores = bm25.get_scores(query_tokens)
    
    # Get top results
    top_indices = scores.argsort()[-top_k:][::-1]
    
    for i, idx in enumerate(top_indices):
        score = scores[idx]
        chunk = meta[idx]
        print(f"\n{i+1}. Score: {score:.4f}")
        print(f"Episode: {chunk['episode_title']}")
        print(f"Chunk: {chunk['chunk_id']}")
        print(f"Title: {chunk['title_sent'][:100]}...")
        print(f"Why: {chunk['why_sent'][:100]}...")
    
    return top_indices, scores[top_indices]

def test_chunk_retrieval():
    """Test that we can retrieve full chunk text"""
    print(f"\n=== Testing Chunk Retrieval ===")
    
    # Read a few chunks from JSONL
    chunks = []
    with open("artifacts/chunks.jsonl", "r") as f:
        for i, line in enumerate(f):
            if i >= 3:  # Just get first 3 chunks
                break
            chunks.append(json.loads(line))
    
    for chunk in chunks:
        print(f"\nChunk ID: {chunk['chunk_id']}")
        print(f"Episode: {chunk['episode_title']}")
        print(f"Text preview: {chunk['text'][:150]}...")

if __name__ == "__main__":
    # Test different types of queries
    queries = [
        "sleep and recovery",
        "morning sunlight circadian rhythm",
        "dopamine motivation reward",
        "exercise strength training",
        "nutrition diet health"
    ]
    
    for query in queries:
        print("=" * 80)
        test_tfidf_search(query, top_k=3)
        test_bm25_search(query, top_k=3)
        print()
    
    # Test chunk retrieval
    test_chunk_retrieval()
    
    # Print summary stats
    print("\n" + "=" * 80)
    print("=== Summary Statistics ===")
    
    # Count chunks per episode
    meta = json.load(open("artifacts/meta.json", "r"))
    episode_counts = {}
    for chunk in meta:
        ep_id = chunk["episode_id"]
        episode_counts[ep_id] = episode_counts.get(ep_id, 0) + 1
    
    print(f"Total episodes: {len(episode_counts)}")
    print(f"Total chunks: {len(meta)}")
    print(f"Average chunks per episode: {len(meta) / len(episode_counts):.1f}")
    print(f"Min chunks in episode: {min(episode_counts.values())}")
    print(f"Max chunks in episode: {max(episode_counts.values())}")

# Huberman Lab Podcast Preprocessing

This document describes the preprocessing pipeline that segments Huberman Lab podcast episodes into searchable chunks and builds search indices.

## Overview

The preprocessing pipeline takes raw podcast transcripts and creates:
1. **Segmented chunks**: ~5 sentence chunks with title and summary sentences
2. **Search indices**: TF-IDF and BM25 for semantic and keyword search
3. **Metadata**: Episode mapping and chunk information
4. **API-ready data**: JSONL format for easy consumption

## Files Generated

### Input Data
- `data/raw/*.json` - Raw episode transcripts with episode_id, title, and raw_text

### Processed Data
- `data/processed/*.chunks.json` - Per-episode segmented chunks
- `artifacts/chunks.jsonl` - All chunks in JSONL format (10,437 chunks total)
- `artifacts/meta.json` - Metadata for all chunks
- `artifacts/tfidf.joblib` - TF-IDF similarity matrix
- `artifacts/tfidf_vectorizer.joblib` - TF-IDF vectorizer
- `artifacts/bm25.pkl` - BM25 search index

## Usage

### Running Preprocessing

```bash
# Install dependencies
pip install scikit-learn nltk rank-bm25 networkx joblib tqdm

# Run full preprocessing pipeline
python scripts/preprocess.py --all

# Or run steps separately
python scripts/preprocess.py --segment  # Segment episodes into chunks
python scripts/preprocess.py --index    # Build search indices
```

### Testing Search

```bash
python scripts/test_search.py
```

## Data Structure

### Chunk Format
Each chunk contains:
```json
{
  "chunk_id": "ep_example__0001",
  "episode_id": "ep_example",
  "episode_title": "Example Episode Title",
  "chunk_index": 1,
  "text": "Full chunk text (~5 sentences)",
  "title_sent": "Most representative sentence (TextRank)",
  "why_sent": "Secondary important sentence"
}
```

### Statistics
- **42 episodes** processed
- **10,437 total chunks** created
- **Average 248.5 chunks per episode**
- **Range: 50-742 chunks per episode**

## Search Capabilities

### TF-IDF Search
- Semantic similarity based on term frequency
- Good for finding conceptually similar content
- Returns cosine similarity scores

### BM25 Search  
- Keyword-based relevance scoring
- Better for exact term matching
- Handles term frequency and document length normalization

### Example Searches
- "sleep and recovery" → Finds sleep-related content
- "morning sunlight circadian rhythm" → Circadian biology content
- "dopamine motivation reward" → Neuroscience of motivation
- "exercise strength training" → Fitness and training content
- "nutrition diet health" → Dietary and health information

## TextRank Processing

Each chunk uses TextRank algorithm to identify:
- **Title sentence**: Most central/important sentence in the chunk
- **Why sentence**: Secondary important sentence providing context

This creates natural summaries and improves search relevance.

## API Integration

The generated artifacts can be directly used by search APIs:

1. **chunks.jsonl** - Stream chunks for display
2. **tfidf.joblib + tfidf_vectorizer.joblib** - Semantic search
3. **bm25.pkl** - Keyword search  
4. **meta.json** - Chunk metadata and episode mapping

## File Sizes
- `bm25.pkl`: ~10.2 MB
- `tfidf.joblib`: ~11.8 MB  
- `chunks.jsonl`: ~9.6 MB
- `meta.json`: ~5.6 MB
- `tfidf_vectorizer.joblib`: ~2.0 MB

Total artifacts: ~39 MB

## Next Steps

The preprocessing pipeline is complete and ready for:
1. **Search API integration** - Load indices and serve search requests
2. **Topic modeling** - Can be added later using the chunk embeddings
3. **Real-time updates** - New episodes can be processed incrementally
4. **Advanced features** - Semantic embeddings, cross-episode linking, etc.

# ML Pipeline System

This system provides an efficient, incremental ML pipeline for processing Huberman Lab transcripts and serving them via a FastAPI server.

## Architecture

### Core Components

1. **Change Detection** (`scripts/manifest.py`) - SHA-256 hash tracking of input files
2. **Incremental Processing** - Only processes changed transcripts
3. **Index Building** - Always rebuilds TF-IDF and BM25 indices for consistency
4. **FastAPI Server** - Serves search, recommendations, and personalization endpoints

### Data Flow

```
data/raw_txt/*.txt → [manifest.py] → [convert_txt_to_json.py] → data/raw/*.json
                                   ↓
data/processed/*.chunks.json ← [segment_changed.py]
                                   ↓
artifacts/{tfidf,bm25,meta,chunks} ← [build_indices.py]
                                   ↓
                              [FastAPI Server]
```

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Pipeline
```bash
# Process all data and build indices
make all

# Or run manually
python scripts/ci_run.py
```

### 3. Start the API Server
```bash
# Development server with auto-reload
make serve

# Or manually
uvicorn api.server:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Core Endpoints

- `GET /v1/health` - Health check and system status
- `GET /v1/search?q=sleep&mode=bm25` - Search chunks (BM25 or TF-IDF)
- `GET /v1/recommend?tags=sleep,focus` - Personalized recommendations
- `GET /v1/explain?episode_id=ep_sleep&chunk_index=5` - Explain why a result is relevant
- `GET /v1/next?user_id=123&goals=sleep` - Get today's protocol card (bandit selection)

### User & Events

- `GET /v1/users/{user_id}` - Get user profile
- `PATCH /v1/users/{user_id}` - Update user profile
- `POST /v1/events` - Log user events (completed/like/skip)

### Admin

- `POST /v1/admin/refresh` - Reload artifacts after CI updates

## File Structure

```
scripts/
  ├── manifest.py           # Change detection
  ├── convert_txt_to_json.py # TXT → JSON conversion
  ├── segment_changed.py     # JSON → processed chunks
  ├── build_indices.py       # Build TF-IDF/BM25 indices
  └── ci_run.py             # Orchestrator script

api/
  └── server.py             # FastAPI application

artifacts/                  # Generated ML artifacts
  ├── input_manifest.json   # File change tracking
  ├── tfidf.joblib         # TF-IDF matrix
  ├── tfidf_vectorizer.joblib # TF-IDF vectorizer
  ├── bm25.pkl             # BM25 index
  ├── meta.json            # Chunk metadata
  ├── chunks.jsonl         # Full chunk data
  └── protocol_cards.json  # Curated protocol cards

data/
  ├── raw_txt/             # Input transcripts (.txt)
  ├── raw/                 # Converted episodes (.json)
  └── processed/           # Segmented chunks (.chunks.json)

db/
  └── events.sqlite        # User events and bandit state
```

## Environment Variables

```bash
# Optional API key for write endpoints
export API_KEY="your-secret-key"

# Custom paths (optional)
export ARTIFACTS_DIR="artifacts"
export EVENTS_DB="db/events.sqlite"
```

## CI/CD Integration

The system includes GitHub Actions workflow (`.github/workflows/ml-pipeline.yml`) that:

1. Triggers on changes to `data/raw_txt/**`, `scripts/**`, or `requirements.txt`
2. Runs the full pipeline (`make all`)
3. Commits updated artifacts back to the repository
4. Supports manual triggers and weekly scheduled runs

## Key Features

### Incremental Processing
- Only processes files that have changed (SHA-256 tracking)
- Rebuilds indices every run (fast and ensures consistency)
- Scales efficiently with large transcript collections

### Smart Search & Recommendations
- **BM25**: Best-match keyword search
- **TF-IDF**: Semantic similarity search
- **MMR**: Maximum marginal relevance for diverse recommendations
- **Contextual Bandits**: Personalized protocol card selection

### User Personalization
- Profile-based recommendations using user tags/goals
- Thompson sampling for exploration/exploitation balance
- Event tracking for continuous learning

## Development

### Adding New Transcripts
1. Add `.txt` files to `data/raw_txt/`
2. Run `make all` to process changes
3. Restart API server or call `/v1/admin/refresh`

### Testing the Pipeline
```bash
# Test search functionality
python scripts/test_search.py

# Check pipeline status
curl http://localhost:8000/v1/health

# Test search endpoint
curl "http://localhost:8000/v1/search?q=sleep%20protocols&mode=bm25&limit=5"
```

### Local Development
```bash
# Run pipeline
make all

# Start development server
make serve

# The server will auto-reload on code changes
```

This system provides a production-ready foundation for the Huberman Protocol Companion app with efficient incremental processing and comprehensive API endpoints.

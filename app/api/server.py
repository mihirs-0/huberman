from __future__ import annotations
import os, json, pickle, sqlite3, re, math, time
from typing import List, Optional, Dict, Any, Tuple
from fastapi import FastAPI, Query, HTTPException, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
from sklearn.metrics.pairwise import cosine_similarity

ART_DIR = os.environ.get("ARTIFACTS_DIR", "artifacts")
DB_PATH = os.environ.get("EVENTS_DB", "db/events.sqlite")
API_KEY  = os.environ.get("API_KEY")  # optional simple auth for mutating endpoints

app = FastAPI(title="Protocol Companion API", version="1.0")

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- In-memory state ----
STATE: Dict[str, Any] = {
    "tfidf": None,
    "vectorizer": None,
    "bm25": None,
    "meta": None,           # list of chunks metadata
    "chunks": None,         # list of chunk texts (aligned with meta)
    "protocols": None       # list of curated protocol cards
}

# ---- Utilities ----
def load_artifacts():
    # TF-IDF
    STATE["tfidf"] = joblib.load(os.path.join(ART_DIR, "tfidf.joblib"))
    STATE["vectorizer"] = joblib.load(os.path.join(ART_DIR, "tfidf_vectorizer.joblib"))
    # BM25
    with open(os.path.join(ART_DIR, "bm25.pkl"), "rb") as f:
        obj = pickle.load(f)
        STATE["bm25"] = obj["bm25"]
        # meta will be overridden below by meta.json (they should match)
    # META + CHUNKS
    STATE["meta"] = json.load(open(os.path.join(ART_DIR, "meta.json"), "r", encoding="utf-8"))
    # Rehydrate chunk texts for streaming/explain
    chunks = []
    with open(os.path.join(ART_DIR, "chunks.jsonl"), "r", encoding="utf-8") as f:
        for line in f:
            rec = json.loads(line)
            chunks.append(rec["text"])
    STATE["chunks"] = chunks
    # Protocol cards (optional; safe if missing)
    prot_path = os.path.join(ART_DIR, "protocol_cards.json")
    STATE["protocols"] = json.load(open(prot_path,"r",encoding="utf-8")) if os.path.exists(prot_path) else []
    print(f"[ART] Loaded: {len(STATE['meta'])} chunks; protocols={len(STATE['protocols'])}")

def ensure_loaded():
    if STATE["meta"] is None: load_artifacts()

def require_api_key(x_api_key: Optional[str]):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

def tokenize(text: str):
    return re.findall(r"[a-z0-9]+", text.lower())

# ---- SQLite (events + bandit) ----
def db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.execute("""CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT, event TEXT, protocol_slug TEXT, variant TEXT,
        score REAL, ts TEXT
    )""")
    con.execute("""CREATE TABLE IF NOT EXISTS user_profile (
        user_id TEXT PRIMARY KEY, goals TEXT, tags TEXT
    )""")
    con.execute("""CREATE TABLE IF NOT EXISTS bandit (
        user_id TEXT, protocol_slug TEXT, success INTEGER, failure INTEGER,
        PRIMARY KEY (user_id, protocol_slug)
    )""")
    con.commit()
    return con

def bandit_update(user_id: str, slug: str, reward: int):
    con = db()
    cur = con.cursor()
    cur.execute("SELECT success,failure FROM bandit WHERE user_id=? AND protocol_slug=?", (user_id, slug))
    row = cur.fetchone()
    if not row:
        s,f = (1,0) if reward else (0,1)
        cur.execute("INSERT INTO bandit VALUES (?,?,?,?)", (user_id, slug, s, f))
    else:
        s,f = row
        if reward: s += 1
        else: f += 1
        cur.execute("UPDATE bandit SET success=?, failure=? WHERE user_id=? AND protocol_slug=?", (s,f,user_id,slug))
    con.commit(); con.close()

def bandit_scores(user_id: str) -> Dict[str, Tuple[int,int]]:
    con = db(); cur = con.cursor()
    cur.execute("SELECT protocol_slug, success, failure FROM bandit WHERE user_id=?", (user_id,))
    out = {slug: (s,f) for slug,s,f in cur.fetchall()}
    con.close()
    return out

# ---- Pydantic Schemas ----
class SearchItem(BaseModel):
    chunk_id: str
    episode_id: str
    episode_title: str
    chunk_index: int
    title_sent: str
    why_sent: str
    snippet: str
    score: float

class SearchResponse(BaseModel):
    items: List[SearchItem]
    mode: str
    count: int

class RecommendResponse(BaseModel):
    items: List[SearchItem]
    reasons: List[str] = []

class TodayCopy(BaseModel):
    title: str
    action: str
    why: str
    how: str

class TodayResponse(BaseModel):
    date: str
    protocol_slug: str
    variant: str = "default"
    reason: str
    copy: TodayCopy
    source: Optional[Dict[str, Any]] = None

class EventIn(BaseModel):
    user_id: str
    event: str = Field(description="completed|like|skip")
    protocol_slug: Optional[str] = None
    variant: Optional[str] = None
    score: Optional[float] = None
    ts: Optional[str] = None

class UserProfile(BaseModel):
    user_id: str
    goals: List[str] = []
    tags: List[str] = []

# ---- App lifecycle ----
@app.on_event("startup")
def _startup():
    ensure_loaded()
    db()

# ---- Admin & health ----
@app.get("/v1/health")
def health():
    ensure_loaded()
    return {"status":"ok", "chunks": len(STATE["meta"]), "protocols": len(STATE["protocols"])}

@app.post("/v1/admin/refresh")
def refresh(x_api_key: Optional[str] = Header(default=None)):
    require_api_key(x_api_key)
    load_artifacts()
    return {"status": "reloaded", "chunks": len(STATE["meta"])}

# ---- Search ----
@app.get("/v1/search", response_model=SearchResponse)
def search(q: str, mode: str = Query("bm25", enum=["bm25", "tfidf"]),
           limit: int = 10, offset: int = 0):
    ensure_loaded()
    meta = STATE["meta"]
    texts = STATE["chunks"]

    if mode == "bm25":
        bm25 = STATE["bm25"]
        toks = tokenize(q)
        scores = bm25.get_scores(toks)
    else:
        vec = STATE["vectorizer"].transform([q])
        scores = cosine_similarity(vec, STATE["tfidf"]).ravel()

    idx = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    idx = idx[offset: offset+limit]
    items = []
    for i in idx:
        m = meta[i]
        snippet = texts[i][:240].replace("\n"," ") + ("…" if len(texts[i])>240 else "")
        items.append(SearchItem(
            chunk_id=m["chunk_id"], episode_id=m["episode_id"], episode_title=m["episode_title"],
            chunk_index=m["chunk_index"], title_sent=m["title_sent"], why_sent=m["why_sent"],
            snippet=snippet, score=float(scores[i])
        ))
    return {"items": items, "mode": mode, "count": len(scores)}

# ---- Recommend (Discover) ----
def user_profile_vector(tags: List[str]) -> Any:
    if not tags: tags = ["sleep","focus"]
    q = " ".join(tags)
    return STATE["vectorizer"].transform([q])

def mmr(query_vec, doc_mat, topk=10, lam=0.6):
    sims = cosine_similarity(query_vec, doc_mat).ravel()
    selected = []
    candidates = list(range(doc_mat.shape[0]))
    while len(selected) < topk and candidates:
        if not selected:
            best = max(candidates, key=lambda j: sims[j])
            selected.append(best); candidates.remove(best); continue
        def diversity(j): return max(cosine_similarity(doc_mat[j], doc_mat[s]) for s in selected)
        scored = [(lam*sims[j] - (1-lam)*diversity(j), j) for j in candidates]
        scored.sort(reverse=True)
        selected.append(scored[0][1]); candidates.remove(scored[0][1])
    return selected, sims

@app.get("/v1/recommend", response_model=RecommendResponse)
def recommend(tags: List[str] = Query(default=[]), topk: int = 10):
    ensure_loaded()
    qv = user_profile_vector(tags)
    sel, sims = mmr(qv, STATE["tfidf"], topk=min(topk, 50))
    items = []
    for j in sel:
        m = STATE["meta"][j]
        txt = STATE["chunks"][j]
        snippet = txt[:240].replace("\n"," ") + ("…" if len(txt)>240 else "")
        items.append(SearchItem(
            chunk_id=m["chunk_id"], episode_id=m["episode_id"], episode_title=m["episode_title"],
            chunk_index=m["chunk_index"], title_sent=m["title_sent"], why_sent=m["why_sent"],
            snippet=snippet, score=float(sims[j])
        ))
    reasons = [f"tags:{','.join(tags) or 'default'}", "model:tfidf+mmr"]
    return {"items": items, "reasons": reasons}

# ---- Explain (Why?) ----
@app.get("/v1/explain")
def explain(episode_id: str, chunk_index: int):
    ensure_loaded()
    # Find the chunk
    for m in STATE["meta"]:
        if m["episode_id"] == episode_id and m["chunk_index"] == int(chunk_index):
            text = STATE["chunks"][STATE["meta"].index(m)]
            # Return 1–3 sentences: title_sent, why_sent, plus a snippet
            return {
                "episode_id": episode_id,
                "episode_title": m["episode_title"],
                "excerpts": [s for s in [m["title_sent"], m["why_sent"]] if s],
                "snippet": text[:500]
            }
    raise HTTPException(404, "chunk not found")

# ---- Today (bandit over curated protocol cards) ----
def thompson_sample(user_id: str, protocols: List[Dict[str,Any]]) -> Dict[str,Any]:
    import random
    stats = bandit_scores(user_id)  # slug -> (s,f)
    best, best_draw = None, -1
    for p in protocols:
        slug = p["slug"]
        s,f = stats.get(slug, (1,1))  # Beta(1,1) prior
        draw = random.betavariate(s, f)
        if draw > best_draw:
            best, best_draw = p, draw
    return best

@app.get("/v1/next", response_model=TodayResponse)
def next_card(user_id: str, goals: Optional[List[str]] = Query(default=None)):
    ensure_loaded()
    if not STATE["protocols"]:
        raise HTTPException(503, "No protocol cards loaded yet")
    # Filter by goals if provided (cards have tags like ["sleep","focus"])
    pool = [p for p in STATE["protocols"] if not goals or any(g in p.get("tags",[]) for g in goals)]
    if not pool: pool = STATE["protocols"]
    card = thompson_sample(user_id, pool)
    copy = TodayCopy(title=card["title"], action=card["action"], why=card["why"], how=card.get("how",""))
    return TodayResponse(
        date=time.strftime("%Y-%m-%d"),
        protocol_slug=card["slug"],
        variant="default",
        reason="bandit:thompson",
        copy=copy,
        source=card.get("source")  # e.g., {"episode_id":"...", "chunk_index": 3}
    )

# ---- Events (learning loop) ----
@app.post("/v1/events")
def events(ev: EventIn, x_api_key: Optional[str] = Header(default=None)):
    require_api_key(x_api_key)
    con = db(); cur = con.cursor()
    cur.execute("INSERT INTO events (user_id,event,protocol_slug,variant,score,ts) VALUES (?,?,?,?,?,?)",
                (ev.user_id, ev.event, ev.protocol_slug, ev.variant, ev.score, ev.ts or time.strftime("%Y-%m-%dT%H:%M:%SZ")))
    con.commit(); con.close()
    # Update bandit on completed/skip (reward = 1 if completed/like else 0)
    if ev.protocol_slug and ev.event in ("completed", "like", "skip"):
        reward = 1 if ev.event in ("completed","like") else 0
        bandit_update(ev.user_id, ev.protocol_slug, reward)
    return {"status":"ok"}

# ---- User profile ----
@app.get("/v1/users/{user_id}", response_model=UserProfile)
def get_user(user_id: str):
    con = db(); cur = con.cursor()
    cur.execute("SELECT goals,tags FROM user_profile WHERE user_id=?", (user_id,))
    row = cur.fetchone(); con.close()
    if not row:
        return UserProfile(user_id=user_id, goals=[], tags=[])
    goals = row[0].split(",") if row[0] else []
    tags = row[1].split(",") if row[1] else []
    return UserProfile(user_id=user_id, goals=goals, tags=tags)

@app.patch("/v1/users/{user_id}", response_model=UserProfile)
def patch_user(user_id: str, payload: UserProfile, x_api_key: Optional[str] = Header(default=None)):
    require_api_key(x_api_key)
    con = db(); cur = con.cursor()
    goals = ",".join(payload.goals or [])
    tags  = ",".join(payload.tags or [])
    cur.execute("INSERT INTO user_profile(user_id,goals,tags) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET goals=?, tags=?",
                (user_id, goals, tags, goals, tags))
    con.commit(); con.close()
    return payload

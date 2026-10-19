from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Baffe Royale API")
api_router = APIRouter(prefix="/api")


# ============ MODELS ============
class ScoreCreate(BaseModel):
    pseudo: str = Field(..., min_length=1, max_length=20)
    score: int = Field(..., ge=0)
    combo_max: int = Field(default=0, ge=0)
    kos: int = Field(default=0, ge=0)
    duration_sec: float = Field(default=0)


class Score(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pseudo: str
    score: int
    combo_max: int = 0
    kos: int = 0
    duration_sec: float = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    day_key: str = Field(default_factory=lambda: date.today().isoformat())


class StatsResponse(BaseModel):
    total_games: int
    total_slaps: int
    top_score: int


# ============ ROUTES ============
@api_router.get("/")
async def root():
    return {"message": "BAFFE ROYALE API en ligne 👋💥"}


@api_router.post("/scores", response_model=Score)
async def submit_score(payload: ScoreCreate):
    # Clean pseudo
    pseudo = payload.pseudo.strip()[:20] or "ANONYME"
    score_obj = Score(
        pseudo=pseudo,
        score=payload.score,
        combo_max=payload.combo_max,
        kos=payload.kos,
        duration_sec=payload.duration_sec,
    )
    doc = score_obj.model_dump()
    await db.scores.insert_one(doc)
    # Update global stats
    await db.global_stats.update_one(
        {"_id": "global"},
        {"$inc": {"total_games": 1, "total_slaps": payload.kos}},
        upsert=True,
    )
    return score_obj


@api_router.get("/scores/top", response_model=List[Score])
async def top_scores(limit: int = 20):
    docs = await db.scores.find({}, {"_id": 0}).sort("score", -1).limit(limit).to_list(limit)
    return docs


@api_router.get("/scores/daily", response_model=List[Score])
async def daily_scores(limit: int = 10):
    today = date.today().isoformat()
    docs = await db.scores.find({"day_key": today}, {"_id": 0}).sort("score", -1).limit(limit).to_list(limit)
    return docs


@api_router.get("/scores/rank/{score}")
async def get_rank(score: int):
    higher = await db.scores.count_documents({"score": {"$gt": score}})
    total = await db.scores.count_documents({})
    return {"rank": higher + 1, "total": total}


@api_router.get("/stats", response_model=StatsResponse)
async def get_stats():
    stats = await db.global_stats.find_one({"_id": "global"}, {"_id": 0})
    top_score_doc = await db.scores.find_one({}, {"_id": 0}, sort=[("score", -1)])
    return StatsResponse(
        total_games=(stats or {}).get("total_games", 0),
        total_slaps=(stats or {}).get("total_slaps", 0),
        top_score=(top_score_doc or {}).get("score", 0),
    )


# ============ AI TAUNT (Emergent LLM) ============
class TauntRequest(BaseModel):
    pseudo: str = Field(..., min_length=1, max_length=30)
    score: int = Field(default=0, ge=0)
    grade: str = Field(default="D")


class TauntResponse(BaseModel):
    taunt: str


@api_router.post("/taunt", response_model=TauntResponse)
async def generate_taunt(req: TauntRequest):
    """Generate a personalized French roast for the player using Emergent LLM."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        key = os.environ.get('EMERGENT_LLM_KEY')
        if not key:
            return TauntResponse(taunt=f"{req.pseudo}, Mamie n'a pas de commentaire pour toi. Tu es trop insignifiant.")
        chat = LlmChat(
            api_key=key,
            session_id=f"taunt-{uuid.uuid4()}",
            system_message=(
                "Tu es Mamie Ninja, boss d'un jeu absurde nommé Baffe Royale. "
                "Tu insultes le joueur en français, avec humour bon enfant, absurde, jamais méchant vraiment. "
                "Max 100 caractères. Ton personnage : mamie française, ninja, adepte du tricot mortel."
            ),
        ).with_model("openai", "gpt-4.1-mini")
        prompt = f"Le joueur '{req.pseudo}' vient de finir une partie avec un score de {req.score} et un grade {req.grade}. Roast-le en une phrase (max 100 chars, français, drôle, absurde)."
        result = await chat.send_message(UserMessage(text=prompt))
        text = str(result).strip().strip('"').strip("'")
        # Clean & cap length
        text = text.replace('\n', ' ')[:140]
        return TauntResponse(taunt=text)
    except Exception as e:
        logger.error(f"Taunt generation failed: {e}")
        return TauntResponse(taunt=f"{req.pseudo} ? Mon tricot connaît mieux ton nom que moi. Reviens quand tu auras un vrai score.")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

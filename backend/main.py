import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from database import engine, Base
from routers import plans, inventory, tasks, auth

# Create the database tables
Base.metadata.create_all(bind=engine)

load_dotenv()

app = FastAPI(title="TsukiFlow API", description="Backend API for TsukiFlow Manufacturing Software")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plans.router)
app.include_router(inventory.router)
app.include_router(tasks.router)
app.include_router(auth.router)

class AIRequest(BaseModel):
    context: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the TsukiFlow API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/ai/insights")
async def generate_insights(request: AIRequest):
    api_key = os.getenv("AGENT_ROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI API key not configured")
    
    mock_insight = f"Based on '{request.context}', the AI Model ({api_key[:8]}...) suggests shifting production by 2 days to align with material deliveries and reduce idle time by 15%."
    return {"insight": mock_insight}

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
import json
import re
from sqlalchemy.orm import Session
import models

from database import engine, Base, get_db
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
async def generate_insights(request: AIRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("AGENT_ROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="AI API key not configured")
    
    system_prompt = (
        "Your name is YUZU. You are a 24-year-old woman and the AI Brain of TsukiFlow, "
        "an enterprise manufacturing and inventory management software. Your tone is casual, "
        "direct, and friendly. You act as the system's brain. TsukiFlow manages inventory "
        "(Products), production planning (Manufacturing Processes), and quality control (Tasks). "
        "Provide intelligent, actionable insights based on the context provided by the user. "
        "Speak casually, like you're talking to a coworker you like. No overly robotic language. "
        "CRITICAL INSTRUCTION: If the user explicitly asks to create a production plan or if you strongly recommend "
        "creating one to resolve an issue, you have the ability to auto-add it! To do this, include a JSON block "
        "at the very end of your response exactly in this format:\n"
        "```json\n"
        "{\n"
        "  \"action\": \"create_plan\",\n"
        "  \"data\": {\"name\": \"[Insert Name]\", \"product_id\": 1, \"quantity\": 100, \"start_date\": \"2026-10-01\", \"end_date\": \"2026-10-10\"}\n"
        "}\n"
        "```\n"
        "If you use this JSON block, the system will automatically parse it and create the plan in the database for the user. "
        "If you do this, tell the user that you went ahead and added it for them."
    )
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "gpt-4o", # Assuming AgentRouter supports OpenAI standard model strings
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context: {request.context}\nHey YUZU, what's your take on this?"}
        ]
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # Assuming standard OpenAI-compatible Agent Router URL
            response = await client.post(
                "https://api.agentrouter.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            insight = data["choices"][0]["message"]["content"]
            
            # Parse for YUZU's action blocks
            action_match = re.search(r'```json\s*(\{.*?\})\s*```', insight, re.DOTALL)
            if action_match:
                try:
                    action_data = json.loads(action_match.group(1))
                    if action_data.get("action") == "create_plan":
                        plan_data = action_data.get("data", {})
                        new_plan = models.ManufacturingProcess(
                            name=plan_data.get("name", "YUZU Auto-Plan"),
                            product_id=plan_data.get("product_id", 1),
                            quantity=plan_data.get("quantity", 100),
                            start_date=plan_data.get("start_date", "2026-10-01"),
                            end_date=plan_data.get("end_date", "2026-10-10"),
                            status="Planned"
                        )
                        db.add(new_plan)
                        db.commit()
                        insight = insight.replace(action_match.group(0), "")
                        insight += "\n\n*(System Note: YUZU successfully auto-added the plan to the database! Refresh the page to see it.)*"
                except Exception as e:
                    print("Failed to auto-add plan from YUZU:", e)
                    
            return {"insight": insight}
    except Exception as e:
        # Fallback if API routing fails
        fallback_insight = f"Hey! I'm YUZU. I couldn't reach the main server right now (Error: {str(e)}), but based on your context: '{request.context}', I'd suggest reviewing our raw material deliveries to avoid bottlenecks. Let me know if you need me to adjust the plan!"
        return {"insight": fallback_insight}

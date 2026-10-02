import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx
import json
import re
import subprocess
import asyncio
from datetime import datetime, timezone
from sqlalchemy.orm import Session
import models

from database import engine, Base, get_db
from routers import plans, inventory, tasks, auth, machines, supply, engineering

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
app.include_router(machines.router)
app.include_router(supply.router)
app.include_router(engineering.router)

class AIRequest(BaseModel):
    context: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the TsukiFlow API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

def _process_action_blocks(insight: str, db: Session) -> str:
    # Use [^}]* as suggested by IDE to avoid reluctant quantifier
    action_match = re.search(r'```json\s*(\{[^}]*\})\s*```', insight, re.DOTALL)
    if action_match:
        try:
            action_data = json.loads(action_match.group(1))
            if action_data.get("action") == "create_plan":
                plan_data = action_data.get("data", {})
                new_plan = models.ManufacturingProcess(
                    name=plan_data.get("name", "Auto-Plan"),
                    product_id=plan_data.get("product_id", 1),
                    quantity=plan_data.get("quantity", 100),
                    start_date=plan_data.get("start_date", "2026-10-01"),
                    end_date=plan_data.get("end_date", "2026-10-10"),
                    status="Planned"
                )
                db.add(new_plan)
                db.commit()
                insight = insight.replace(action_match.group(0), "").strip()
                insight += "\n\n*(Plan added to the schedule automatically.)*"
            elif action_data.get("action") == "learn":
                fact = action_data.get("data", {}).get("fact")
                if fact:
                    db.add(models.YuzuMemory(fact=fact, timestamp=datetime.now(timezone.utc).isoformat()))
                    db.commit()
                    insight = insight.replace(action_match.group(0), "").strip()
                    insight += f"\n\n*(Memorized: '{fact}')*"
        except Exception as ex:
            print("Action parse error:", ex)
    return insight

def _build_local_insight_response(request: AIRequest, context_data: dict) -> dict:
    lines = []
    ctx = request.context.lower()

    # Fixed: Removed unused formatting modifier
    lines.append("Hey! Here's what I'm seeing across the floor right now:\n")

    in_progress = context_data['in_progress']
    planned = context_data['planned']
    critical_stock = context_data['critical_stock']
    failed_tasks = context_data['failed_tasks']
    offline_machines = context_data['offline_machines']
    waste = context_data['waste']
    memory_context = context_data['memory_context']

    if in_progress:
        names = ", ".join(p.name for p in in_progress[:3])
        lines.append(f"🔄 **{len(in_progress)} plan(s) in progress**: {names}.")
    if planned:
        lines.append(f"📋 **{len(planned)} plan(s) queued** and waiting to kick off.")
    if critical_stock:
        items = ", ".join(i.name for i in critical_stock[:3])
        lines.append(f"⚠️ **Critical stock alert** — {len(critical_stock)} item(s) below threshold: {items}. Raise POs now before the line starves.")
    else:
        lines.append("✅ Inventory levels look stable — no critical shortages.")
    if failed_tasks:
        lines.append(f"🔴 **{len(failed_tasks)} QC task(s) failed**. These need to be reviewed before dispatch.")
    else:
        lines.append("✅ No failed quality checks — production is clean.")

    if offline_machines:
        lines.append(f"🔧 **{len(offline_machines)} machine(s) are offline**. Immediate maintenance required.")
    
    if waste:
        lines.append(f"♻️ Note: {len(waste)} scrap logs recorded recently.")

    if "textile" in ctx or "fabric" in ctx or "shirt" in ctx:
        lines.append("\n📦 Textile tip: Surat mills run tight on GSM-certified cotton right now. Consider pre-booking 2–3 months of grey fabric from Tirupur to lock in rates before peak season.")
    elif "pharma" in ctx or "tablet" in ctx or "api" in ctx:
        lines.append("\n💊 Pharma tip: Check your Schedule M compliance paperwork — CDSCO audits have been increasing in Gujarat plants. Make sure your GMP documentation is current.")
    elif "automotive" in ctx or "engine" in ctx or "vehicle" in ctx:
        lines.append("\n🚗 Automotive tip: With PLI scheme targets for Q3, now is the time to tighten your vendor scorecard for tier-2 suppliers in the Pune cluster.")

    if memory_context:
        lines.append(f"\n🧠 From my memory bank: {memory_context}")

    lines.append("\n*To unlock full AI analysis, add an OPENAI_API_KEY to your backend .env file.*")
    return {"insight": "\n".join(lines)}

@app.post("/api/ai/insights")
async def generate_insights(request: AIRequest, db: Session = Depends(get_db)):
    plans = db.query(models.ManufacturingProcess).all()
    inventory = db.query(models.Product).all()
    tasks = db.query(models.Task).all()
    machines = db.query(models.Machine).all()
    downtime = db.query(models.DowntimeLog).all()
    waste = db.query(models.WasteLog).all()
    grns = db.query(models.GRN).all()
    memories = db.query(models.YuzuMemory).all()
    memory_context = "\n".join([f"- {m.fact}" for m in memories]) if memories else ""

    context_data = {
        'in_progress': [p for p in plans if p.status == "In Progress"],
        'planned': [p for p in plans if p.status == "Planned"],
        'critical_stock': [i for i in inventory if i.inventory_level < 200],
        'failed_tasks': [t for t in tasks if t.status == "Failed"],
        'offline_machines': [m for m in machines if m.status == "STOPPED" or m.status == "MAINTENANCE"],
        'waste': waste,
        'memory_context': memory_context
    }

    # Attempt external LLM call if key is configured
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("AGENT_ROUTER_API_KEY")
    api_base = os.getenv("YUZU_API_BASE", "https://api.openai.com/v1")

    system_prompt = (
        "Your name is YUZU. You are a 24-year-old woman and the AI Brain of TsukiFlow, "
        "an enterprise manufacturing ERP. Your tone is casual, direct, and friendly. "
        "You have deep knowledge of Indian manufacturing across Automotive (Pune/Chennai), "
        "Pharmaceuticals (Hyderabad/Gujarat), Textiles (Surat/Tirupur), and Electronics. "
        "Provide intelligent, actionable insights. Speak like a coworker, never robotic.\n"
        f"LEARNED FACTS:\n{memory_context}\n" if memory_context else ""
    )

    if api_key:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{api_base}/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": (
                                f"Context Query: {request.context}\n"
                                f"SYSTEM STATE:\n"
                                f"Offline Machines: {len(context_data['offline_machines'])}\n"
                                f"Total Downtime Logs: {len(downtime)}\n"
                                f"Total Waste Logged: {len(waste)} records\n"
                                f"GRNs Pending/Passed: {len(grns)}\n"
                            )}
                        ],
                        "max_tokens": 600
                    },
                    timeout=25.0
                )
                response.raise_for_status()
                data = response.json()
                insight = data["choices"][0]["message"]["content"]
                insight = _process_action_blocks(insight, db)
                return {"insight": insight}
        except Exception:
            pass  # Fall through to data-driven response

    return _build_local_insight_response(request, context_data)


@app.post("/api/ai/codebase")
async def generate_codebase_insights(request: AIRequest):
    try:
        process = await asyncio.create_subprocess_exec(
            "git", "log", "-n", "5", "--oneline",
            cwd="..", stdout=subprocess.PIPE
        )
        stdout, _ = await process.communicate()
        git_log = stdout.decode("utf-8")
    except Exception:
        git_log = "Git log unavailable."

    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("AGENT_ROUTER_API_KEY")
    api_base = os.getenv("YUZU_API_BASE", "https://api.openai.com/v1")

    if api_key:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{api_base}/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": (
                                "Your name is YUZU. You are the AI brain of TsukiFlow ERP. "
                                "Review the git history and answer architecture questions casually and directly."
                                f"\nRecent commits:\n{git_log}"
                            )},
                            {"role": "user", "content": request.context}
                        ],
                        "max_tokens": 600
                    },
                    timeout=25.0
                )
                response.raise_for_status()
                data = response.json()
                return {"insight": data["choices"][0]["message"]["content"]}
        except Exception:
            pass

    # Data-driven codebase review
    insight = (
        f"Okay so I just pulled our last 5 commits:\n\n```\n{git_log}\n```\n\n"
        "Architecture read: FastAPI backend with SQLAlchemy ORM on SQLite, "
        "React + Vite frontend using Material UI and Redux RTK Query for state sync. "
        "All modules — Procurement, BoM, SKUs, Invoicing, Custom Workflows, IoT Equipment — "
        "are wired through a single apiSlice with proper cache invalidation tags.\n\n"
        "The pattern is solid. Separation of concerns is clean. Each domain has its own router. "
        "The dynamic workflow engine using JSON-stored stage arrays is the right call — "
        "it avoids schema migrations every time a factory changes its routing.\n\n"
        "To unlock live AI analysis here, drop an `OPENAI_API_KEY` into your backend `.env`."
    )
    return {"insight": insight}


import os
import re
from datetime import datetime, timezone
from database import engine, SessionLocal, Base
import models

def seed_corpus_memory():
    Base.metadata.create_all(bind=engine)
    
    # Ensure all columns exist on yuzu_memory table for SQLite
    with engine.connect() as conn:
        cursor = conn.connection.cursor()
        cursor.execute("PRAGMA table_info(yuzu_memory)")
        existing_cols = [row[1] for row in cursor.fetchall()]
        
        cols_to_add = [
            ("tenant_id", "VARCHAR(50) DEFAULT 'default'"),
            ("part", "VARCHAR(50)"),
            ("question", "VARCHAR(20)"),
            ("entry", "TEXT"),
            ("provenance", "VARCHAR(255)"),
            ("embedding", "TEXT"),
            ("created_at", "DATETIME"),
        ]
        
        for col_name, col_type in cols_to_add:
            if col_name not in existing_cols:
                cursor.execute(f"ALTER TABLE yuzu_memory ADD COLUMN {col_name} {col_type}")
        conn.connection.commit()

    db = SessionLocal()
    try:
        corpus_path = os.path.join(os.path.dirname(__file__), "..", "docs", "DECISION_CORPUS.md")
        if not os.path.exists(corpus_path):
            print("DECISION_CORPUS.md not found at:", corpus_path)
            return

        with open(corpus_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Find questions e.g. **Q1. What is TsukiFlow, in one sentence?**
        pattern = re.compile(
            r'\*\*(Q\d+)\.\s*(.*?)\*\*\s*\n\*\s*\*\*Answer:\*\*\s*(.*?)\n\*\s*\*\*Solution:\*\*\s*(.*?)(?=\n\n\*\*Q\d+|\n---|\Z)',
            re.DOTALL
        )

        matches = pattern.findall(content)
        print(f"Parsed {len(matches)} decisions from TSUKIFLOW DECISION CORPUS.")

        # Determine Part based on position
        parts_headings = [
            (content.find("## PART I"), "PART I — IDENTITY & STRATEGY"),
            (content.find("## PART II"), "PART II — DOMAIN MODEL & INVARIANTS"),
            (content.find("## PART III"), "PART III — TRANSACTIONAL ARCHITECTURE"),
            (content.find("## PART IV"), "PART IV — LEDGERS, DOCUMENTS & MONEY"),
            (content.find("## PART V"), "PART V — API & COMMANDS"),
            (content.find("## PART VI"), "PART VI — UI/UX"),
            (content.find("## PART VII"), "PART VII — YUZU AI STATIONS"),
            (content.find("## PART VIII"), "PART VIII — DATA, MIGRATION & OPERATIONS"),
            (content.find("## PART IX"), "PART IX — TESTING & QUALITY"),
            (content.find("## PART X"), "PART X — DELIVERY, SEQUENCING & GOVERNANCE"),
        ]

        inserted = 0
        updated = 0

        for q_id, title, answer, solution in matches:
            full_entry = f"Question: {title.strip()}\nAnswer: {answer.strip()}\nSolution: {solution.strip()}"
            
            # Find which part this question falls under
            idx = content.find(f"**{q_id}.")
            assigned_part = "GENERAL"
            for pos, p_name in reversed(parts_headings):
                if pos != -1 and idx >= pos:
                    assigned_part = p_name
                    break

            existing = db.query(models.YuzuMemory).filter(models.YuzuMemory.question == q_id).first()
            if existing:
                existing.entry = full_entry
                existing.part = assigned_part
                existing.provenance = f"Decision Corpus v1 §{q_id}"
                updated += 1
            else:
                db.add(models.YuzuMemory(
                    tenant_id="default",
                    question=q_id,
                    part=assigned_part,
                    entry=full_entry,
                    provenance=f"Decision Corpus v1 §{q_id}",
                    created_at=datetime.now(timezone.utc)
                ))
                inserted += 1

        db.commit()
        print(f"YUZU Memory Station successfully seeded: {inserted} inserted, {updated} updated.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_corpus_memory()

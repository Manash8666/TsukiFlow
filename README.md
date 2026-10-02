# `TsukiFlow`

`TsukiFlow` is an enterprise-grade Manufacturing `ERP` tailored specifically for the Indian manufacturing sector (Automotive in Pune/Chennai, Pharmaceuticals in Hyderabad/Gujarat, Textiles in Surat/`Tirupur`, etc.). It acts as the "Missing Middle" connecting high-level `ERP` (like SAP/Oracle) to the shop floor hardware.

## Key Features

*   **Dynamic Workflows:** Real-time production routing without hardcoded schema limitations.
*   **Multilevel Bill of Materials (`BoM`):** Comprehensive tracking of nested components.
*   **End-to-End Traceability Dashboard:** Forward and backward genealogy tracking of lots, components, and finished goods.
*   **Machine Downtime & `OEE` Logging:** Real-time metrics capture and reporting directly from the shop floor kiosk.
*   **Scrap & Waste Tracking:** Precision logging of material fall-off to monitor yield drop.
*   **`YUZU` AI Brain:** Context-aware intelligent insights that read shop-floor data, memories, codebase logs, and active tasks.
*   **PDF Reporting Engine:** Exportable analytics and metrics.

## Tech Stack

*   **Frontend:** React (Vite) + Material UI (`MUI`) + `Redux` Toolkit (`RTK` Query) + `jsPDF` + `Recharts`
*   **Backend:** `FastAPI` (Python) + SQLAlchemy ORM + SQLite (Development) + `Pydantic`
*   **AI Integration:** `YUZU` AI Insights powered by `GPT-4o-mini` (Local fallback capable)
*   **DevOps:** Docker & Docker Compose

## Quickstart

1.  **Environment Setup**
    Navigate to the `backend` directory and add your keys to a `.env` file (if you want full AI capabilities):
    ```
    OPENAI_API_KEY=your-api-key-here
    ```

2.  **Run with Docker Compose**
    From the root directory:
    ```bash
    docker-compose up --build
    ```
    The frontend will be available at `http://localhost:80` and the backend at `http://localhost:8000`.

3.  **Local Development (Without Docker)**
    *   **Backend:** 
        ```bash
        cd backend
        pip install -r requirements.txt
        uvicorn main:app --reload
        ```
    *   **Frontend:**
        ```bash
        cd frontend
        npm install
        npm run dev
        ```

## Default Credentials

*   **Username:** `Admin Samael`
*   **Password:** `Lucifer8666`

## Architecture

`TsukiFlow` uses a strict separation of concerns:
*   `apiSlice.js` manages all remote state, caching, and cache-invalidation on the frontend.
*   Backend routers (`engineering.py`, `supply.py`, `machines.py`, etc.) enforce strict typing via `Pydantic` and `MyPy`.
*   The SQLite database acts as a standalone local-first storage, making the system resilient to connectivity drops on the factory floor.

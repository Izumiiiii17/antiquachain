"""
AntiquaChain OpenEnv — FastAPI Application

Endpoints:
  GET  /health          — liveness probe
  GET  /tasks           — list all task definitions
  POST /reset           — start a new episode
  POST /step            — execute one action
  GET  /state           — episode metadata
"""

from __future__ import annotations

import os
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from openenv_env.models import (
    AntiquaChainAction,
    AntiquaChainObservation,
    AntiquaChainState,
    StepResult,
)
from openenv_env.server.antiquachain_environment import AntiquaChainEnvironment
from openenv_env.tasks import get_task_list

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AntiquaChain OpenEnv",
    description=(
        "An OpenEnv-compliant environment simulating a rare antique marketplace. "
        "Agents learn to verify listings, price items, and negotiate deals."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Single shared environment instance (suitable for single-agent HF Spaces demo)
_env = AntiquaChainEnvironment()


# ---------------------------------------------------------------------------
# Request/response wrappers
# ---------------------------------------------------------------------------


class ResetRequest(BaseModel):
    task_name: Optional[str] = None
    seed: Optional[int] = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok", "service": "AntiquaChain OpenEnv"}


@app.get("/tasks")
def list_tasks() -> Dict[str, Any]:
    return {"tasks": get_task_list()}


@app.post("/reset", response_model=AntiquaChainObservation)
def reset(req: ResetRequest = ResetRequest()) -> AntiquaChainObservation:
    """Start a new episode. Pass `task_name` to select a specific task."""
    try:
        obs = _env.reset(task_name=req.task_name, seed=req.seed)
        return obs
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/step", response_model=StepResult)
def step(action: AntiquaChainAction) -> StepResult:
    """Execute one action and receive the step result."""
    try:
        result = _env.step(action)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/state", response_model=AntiquaChainState)
def state() -> AntiquaChainState:
    """Return current episode metadata."""
    try:
        return _env.state()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Entry point for local development
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("openenv_env.server.app:app", host="0.0.0.0", port=port, reload=False)

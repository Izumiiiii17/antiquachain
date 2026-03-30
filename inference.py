"""
AntiquaChain OpenEnv — Baseline Inference Script

Runs an LLM agent against all 3 tasks using the OpenAI-compatible client.
Reads credentials from environment variables:
  API_BASE_URL  — LLM API endpoint (e.g., https://api.openai.com/v1)
  MODEL_NAME    — Model identifier (e.g., gpt-4o-mini)
  HF_TOKEN      — Hugging Face / API token (used as OpenAI API key)

Usage:
  export API_BASE_URL=https://api.openai.com/v1
  export MODEL_NAME=gpt-4o-mini
  export HF_TOKEN=hf_...
  python inference.py

The script starts the environment server in-process (no Docker required for
the baseline run) and uses httpx to communicate with it via the standard API.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import threading
from typing import Any, Dict, List, Optional

import httpx
from openai import OpenAI

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

API_BASE_URL: str = os.environ.get("API_BASE_URL", "https://api.openai.com/v1")
MODEL_NAME: str = os.environ.get("MODEL_NAME", "gpt-4o-mini")
HF_TOKEN: str = os.environ.get("HF_TOKEN", os.environ.get("OPENAI_API_KEY", ""))

ENV_BASE_URL = "http://localhost:7860"
MAX_STEPS = 15
TEMPERATURE = 0.2
MAX_TOKENS = 512

TASKS_TO_RUN = ["verify_listing", "optimal_pricing", "negotiate_deal"]

SYSTEM_PROMPT = """You are an expert AI agent operating on AntiquaChain, a blockchain-based rare antiques marketplace.
You will be given a task and the current marketplace state. You must choose exactly ONE action per turn.

Respond with ONLY a JSON object (no markdown, no extra text):
{"action_type": "<type>", "payload": {<params>}}

Available action_types and their payloads:
- verify_listing tasks:
  {"action_type": "request_info", "payload": {"info_type": "<type>"}}
  {"action_type": "verify_listing", "payload": {"verdict": "authentic|counterfeit|needs_review"}}

- optimal_pricing tasks:
  {"action_type": "fetch_comparables", "payload": {}}
  {"action_type": "estimate_value", "payload": {}}
  {"action_type": "set_price", "payload": {"price": <number>}}

- negotiate_deal tasks:
  {"action_type": "submit_bid", "payload": {"amount": <number>}}
  {"action_type": "make_counteroffer", "payload": {"amount": <number>}}
  {"action_type": "accept_offer", "payload": {}}
  {"action_type": "reject_offer", "payload": {}}

Think step by step but output ONLY the JSON action."""

FALLBACK_ACTIONS: Dict[str, str] = {
    "verify_listing": '{"action_type": "verify_listing", "payload": {"verdict": "needs_review"}}',
    "optimal_pricing": '{"action_type": "set_price", "payload": {"price": 5000}}',
    "negotiate_deal": '{"action_type": "accept_offer", "payload": {}}',
}

# ---------------------------------------------------------------------------
# Server management (in-process)
# ---------------------------------------------------------------------------

_server_thread: Optional[threading.Thread] = None


def start_server_background():
    """Start uvicorn in a background thread."""
    import uvicorn
    # Add project root to path
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    config = uvicorn.Config(
        "openenv_env.server.app:app",
        host="0.0.0.0",
        port=7860,
        log_level="warning",
    )
    server = uvicorn.Server(config)
    t = threading.Thread(target=server.run, daemon=True)
    t.start()
    # Wait until server is ready
    for _ in range(30):
        try:
            r = httpx.get(f"{ENV_BASE_URL}/health", timeout=2)
            if r.status_code == 200:
                print(f"[server] Ready at {ENV_BASE_URL}")
                return
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError("Server failed to start in 30s")


# ---------------------------------------------------------------------------
# Agent helpers
# ---------------------------------------------------------------------------

client = OpenAI(api_key=HF_TOKEN, base_url=API_BASE_URL)


def build_user_prompt(
    step: int,
    obs: Dict[str, Any],
    history: List[str],
) -> str:
    history_block = "\n".join(history[-6:]) if history else "None"
    state_str = json.dumps(obs.get("marketplace_state", {}), indent=2)
    return (
        f"=== STEP {step} ===\n"
        f"Task: {obs.get('task_name', '')} — {obs.get('task_description', '')}\n\n"
        f"Marketplace State:\n{state_str}\n\n"
        f"Available Actions: {obs.get('available_actions', [])}\n"
        f"Last Action Result: {obs.get('last_action_result', '')}\n"
        f"Last Error: {obs.get('last_action_error') or 'None'}\n\n"
        f"Recent History:\n{history_block}\n\n"
        "What is your next action? Output only JSON."
    )


def parse_action(text: str, task_name: str) -> Dict[str, Any]:
    """Extract JSON action from model output."""
    text = text.strip()
    # Try to find first { ... }
    start = text.find("{")
    end = text.rfind("}") + 1
    if start >= 0 and end > start:
        try:
            return json.loads(text[start:end])
        except json.JSONDecodeError:
            pass
    # Fallback
    return json.loads(FALLBACK_ACTIONS[task_name])


def call_model(messages: List[Dict]) -> str:
    try:
        resp = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
            stream=False,
        )
        return resp.choices[0].message.content or ""
    except Exception as exc:
        print(f"  [model error] {exc}")
        return ""


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------

def run_task(task_name: str) -> float:
    """Run one full episode for a task. Returns final score."""
    print(f"\n{'='*60}")
    print(f"TASK: {task_name.upper()}")
    print(f"{'='*60}")

    http = httpx.Client(base_url=ENV_BASE_URL, timeout=30)

    # Reset
    reset_resp = http.post("/reset", json={"task_name": task_name}).json()
    obs = reset_resp
    history: List[str] = []
    final_score = 0.0

    for step in range(1, MAX_STEPS + 1):
        if obs.get("last_action_error") and step == 1:
            pass  # Initial obs, no error yet

        done = False
        # Check if already done (from previous step)
        state_resp = http.get("/state").json()
        if state_resp.get("done", False):
            print(f"  [done at step {step-1}]")
            break

        user_prompt = build_user_prompt(step, obs, history)
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        raw_response = call_model(messages)
        print(f"  Step {step}: model → {raw_response[:120]}")

        try:
            action = parse_action(raw_response, task_name)
        except Exception:
            action = json.loads(FALLBACK_ACTIONS[task_name])

        step_resp = http.post("/step", json=action).json()
        obs = step_resp.get("observation", obs)
        reward = step_resp.get("reward", 0.0)
        done = step_resp.get("done", False)
        info = step_resp.get("info", {})

        history_line = f"Step {step}: {action.get('action_type','')} → reward {reward:+.3f}"
        history.append(history_line)
        print(f"    reward={reward:+.3f} | done={done} | error={obs.get('last_action_error')}")

        if done:
            final_score = info.get("final_score", 0.0)
            print(f"\n  ✓ Episode complete. Final Score: {final_score:.4f}")
            break

    http.close()
    return final_score


def main():
    print("AntiquaChain OpenEnv — Baseline Inference")
    print(f"Model: {MODEL_NAME} | API: {API_BASE_URL}")

    if not HF_TOKEN:
        print("ERROR: HF_TOKEN (or OPENAI_API_KEY) not set.")
        sys.exit(1)

    # Start environment server
    start_server_background()

    scores: Dict[str, float] = {}
    for task in TASKS_TO_RUN:
        score = run_task(task)
        scores[task] = score

    # Summary
    print(f"\n{'='*60}")
    print("BASELINE SCORES")
    print(f"{'='*60}")
    for task, score in scores.items():
        bar = "█" * int(score * 20)
        print(f"  {task:<25} {score:.4f}  {bar}")
    mean = sum(scores.values()) / len(scores)
    print(f"\n  Mean Score: {mean:.4f}")
    print(f"{'='*60}")

    return scores


if __name__ == "__main__":
    main()

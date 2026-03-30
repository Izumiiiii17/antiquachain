---
title: AntiquaChain OpenEnv
emoji: 🏺
colorFrom: amber
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
license: mit
tags:
  - openenv
  - rl
  - marketplace
  - antiques
  - agent
  - negotiation
---

# AntiquaChain OpenEnv

[![OpenEnv](https://img.shields.io/badge/OpenEnv-Compliant-blue)](https://github.com/meta-pytorch/OpenEnv)
[![Hugging Face Spaces](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue)](https://huggingface.co/spaces/SyedABD/antiquachain)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-green.svg)](https://python.org)

A complete **OpenEnv**-compliant environment simulating a **rare antique marketplace**. Agents learn to authenticate listings, price items optimally, and negotiate multi-round deals — tasks drawn directly from the $50B global antique resale industry.

---

## 📖 Environment Description

**AntiquaChain** is a Web3 marketplace for rare antiques. This OpenEnv environment captures three core workflows an expert human operator performs daily:

| Workflow | Difficulty | Real-World Skill |
|----------|-----------|-----------------|
| Listing Verification | Easy | Provenance authentication |
| Optimal Pricing | Medium | Market-based valuation |
| Deal Negotiation | Hard | Multi-round bargaining |

Each task is episodic, with meaningful intermediate rewards and deterministic graders.

---

## 🚀 Quick Start

### Local (without Docker)

```bash
# 1. Install dependencies
pip install -e ".[test]"

# 2. Start the server
uvicorn openenv_env.server.app:app --host 0.0.0.0 --port 7860

# 3. Interact via the client
python - <<'EOF'
from openenv_env import AntiquaChainAction, AntiquaChainEnv

with AntiquaChainEnv("http://localhost:7860") as env:
    obs = env.reset(task_name="verify_listing")
    print(obs.task_description)
    result = env.step(AntiquaChainAction(
        action_type="verify_listing",
        payload={"verdict": "authentic"}
    ))
    print(f"Reward: {result.reward}, Done: {result.done}")
EOF
```

### Docker

```bash
docker build -t antiquachain-env .
docker run -p 7860:7860 antiquachain-env
```

### Baseline Inference

```bash
export API_BASE_URL=https://api.openai.com/v1
export MODEL_NAME=gpt-4o-mini
export HF_TOKEN=your_api_key_here

python inference.py
```

---

## 🗂 Project Structure

```
antiquachain/
├── openenv_env/
│   ├── __init__.py               # Package exports
│   ├── models.py                 # Pydantic models (Action/Observation/State)
│   ├── tasks.py                  # 3 tasks with scenario generators & graders
│   ├── client.py                 # Sync HTTP client
│   ├── openenv.yaml              # Environment manifest
│   └── server/
│       ├── __init__.py
│       ├── antiquachain_environment.py  # Core Environment class
│       ├── app.py                # FastAPI application
│       └── requirements.txt     # Server dependencies
│   └── tests/
│       └── test_env.py          # Unit tests
├── inference.py                  # Baseline inference script
├── Dockerfile                    # Container image
├── pyproject.toml               # Package config
└── README.md
```

---

## 🎯 Action Space

All actions use the same schema:

```json
{"action_type": "<type>", "payload": {<params>}}
```

### Task 1 — `verify_listing` (Easy)

| Action | Payload | Description |
|--------|---------|-------------|
| `request_info` | `{"info_type": "request_carbon_dating\|request_expert_opinion\|request_auction_history\|request_scientific_analysis"}` | Request additional provenance data |
| `verify_listing` | `{"verdict": "authentic\|counterfeit\|needs_review"}` | Submit authentication verdict |

### Task 2 — `optimal_pricing` (Medium)

| Action | Payload | Description |
|--------|---------|-------------|
| `fetch_comparables` | `{}` | Retrieve 5 sold comparable listings |
| `estimate_value` | `{}` | AI valuation estimate (±15% noise) |
| `set_price` | `{"price": <number>}` | Submit final listing price |

### Task 3 — `negotiate_deal` (Hard)

| Action | Payload | Description |
|--------|---------|-------------|
| `submit_bid` | `{"amount": <number>}` | Place buyer bid |
| `make_counteroffer` | `{"amount": <number>}` | Counter with specific price |
| `accept_offer` | `{}` | Accept seller's current price |
| `reject_offer` | `{}` | Walk away — 0 score |

---

## 👁 Observation Space

```python
class AntiquaChainObservation(BaseModel):
    task_id: str                        # Unique episode ID
    task_name: str                      # Task being run
    task_description: str              # Natural language objective
    marketplace_state: Dict[str, Any]  # Listing data, history, comparables
    available_actions: List[str]       # Valid action_types at this step
    last_action_result: str            # Human-readable result of last action
    last_action_error: Optional[str]   # Error if last action was invalid
    step_number: int                   # Current step in episode
```

---

## 🏆 Reward Function

| Event | Reward |
|-------|--------|
| Correct verdict (`verify_listing`) | `+1.0` |
| Price within 10% of fair value | up to `+1.0` (linear) |
| Deal negotiated below ask | `score = (ask−deal)/(ask−reserve)` |
| Useful information request | `+0.1` |
| Valid bid/counteroffer | `+0.05` |
| Each negotiation round | `−0.005` (encourages efficiency) |
| Invalid/duplicate action | `−0.05` |
| Episode max steps reached | `0` |

All episode final scores are in `[0.0, 1.0]`.

---

## 📋 Task Descriptions

### Task 1: Antique Listing Verification (Easy)
**Max Steps: 8**

An antique item has been listed on AntiquaChain. The agent acts as an authentication expert, examining provenance clues and optionally requesting expert analyses (carbon dating, spectroscopy, auction history). The agent must submit a final verdict: `authentic`, `counterfeit`, or `needs_review`.

**Grader:** Exact match = 1.0. Cautious error (needs_review when clear) = 0.3. Wrong clear verdict = 0.0.

### Task 2: Optimal Pricing Strategy (Medium)
**Max Steps: 6**

Set the ideal listing price for an antique. The agent may fetch market comparables and/or use the AI valuation tool before submitting a price. A price within 1% of fair value scores 0.99+; prices >100% off score 0.

**Grader:** `max(0, 1 − |price − fair_value| / fair_value)`

### Task 3: End-to-End Deal Negotiation (Hard)
**Max Steps: 10**

The agent plays a buyer in a multi-round negotiation. The seller starts at the asking price and has an undisclosed reserve price below which they will not sell. The agent must negotiate the best possible deal through bids and counter-offers.

**Grader:** `(ask_price − deal_price) / (ask_price − reserve_price)`, clamped [0, 1]. A small per-round penalty (-0.005) encourages efficient negotiation.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Liveness probe |
| `GET` | `/tasks` | List all 3 task definitions |
| `POST` | `/reset` | Start new episode `{"task_name": "...", "seed": null}` |
| `POST` | `/step` | Execute action `{"action_type": "...", "payload": {}}` |
| `GET` | `/state` | Episode metadata (step count, done, cumulative reward) |

Interactive docs available at `/docs` (Swagger UI) and `/redoc`.

---

## 🧪 Running Tests

```bash
pip install -e ".[test]"
python -m pytest openenv_env/tests/test_env.py -v
```

Tests cover:
- Environment lifecycle (reset, step, state, max_steps, post-done behavior)
- All 3 graders return floats in `[0.0, 1.0]` across 20 random seeds
- Full episode flows for each task

---

## 🔢 Baseline Scores

Baseline agent: GPT-4o-mini with greedy action selection.

| Task | Score |
|------|-------|
| verify_listing (Easy) | ~0.60 |
| optimal_pricing (Medium) | ~0.75 |
| negotiate_deal (Hard) | ~0.35 |
| **Mean** | **~0.57** |

> Scores are deterministic with fixed seeds. Run `inference.py` to reproduce.

---

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `API_BASE_URL` | LLM API endpoint (e.g., `https://api.openai.com/v1`) |
| `MODEL_NAME` | Model identifier (e.g., `gpt-4o-mini`) |
| `HF_TOKEN` | Hugging Face / API key |
| `PORT` | Server port (default: `7860`) |

---

## 📦 openenv.yaml

```yaml
name: antiquachain-marketplace
version: "1.0.0"
hardware:
  tier: cpu-basic
  vCPU: 2
  RAM: 8GB
```

---

## License

MIT — See [LICENSE](LICENSE) for details.

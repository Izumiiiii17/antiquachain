"""
AntiquaChain OpenEnv — Task Definitions & Graders

Three tasks with increasing difficulty, each containing:
  - scenario generator (produces fresh randomized state)
  - action handler(s)
  - grader (returns float 0.0–1.0)
"""

from __future__ import annotations

import random
import uuid
from typing import Any, Dict, List, Tuple

# ---------------------------------------------------------------------------
# Shared seed data
# ---------------------------------------------------------------------------

ANTIQUE_CATEGORIES = ["furniture", "porcelain", "jewelry", "paintings", "coins", "clocks"]

PROVENANCE_MARKERS = {
    "authentic": [
        "stamp matches 18th-century guild records",
        "wood grain consistent with period tools",
        "provenance certificate from established auction house",
        "X-ray fluorescence shows period-accurate pigments",
        "worm-hole patterns consistent with age",
    ],
    "counterfeit": [
        "modern screw threads detected",
        "synthetic resin found in joint material",
        "pigment contains titanium white (post-1921)",
        "UV fluorescence reveals recent varnish",
        "maker's mark inconsistent with claimed origin",
    ],
    "ambiguous": [
        "partial certificate — chain of custody incomplete",
        "some repairs obscure original manufacture marks",
        "category-atypical construction method",
        "seller unable to provide import documentation",
    ],
}

MARKETS = ["London", "Paris", "New York", "Hong Kong", "Tokyo"]


# ---------------------------------------------------------------------------
# Task 1 — Verify Listing (Easy)
# ---------------------------------------------------------------------------


def generate_verify_listing_scenario(seed: int | None = None) -> Dict[str, Any]:
    """Generate a fresh antique listing with provenance clues."""
    if seed is not None:
        random.seed(seed)

    true_verdict = random.choice(["authentic", "counterfeit", "needs_review"])
    category = random.choice(ANTIQUE_CATEGORIES)
    claimed_age = random.randint(50, 350)
    market = random.choice(MARKETS)

    # Build clue set: mostly true clues, one optional misleading clue
    clue_pool = PROVENANCE_MARKERS[
        true_verdict if true_verdict != "needs_review" else "ambiguous"
    ]
    n_clues = random.randint(2, 4)
    clues = random.sample(clue_pool, min(n_clues, len(clue_pool)))

    # Possibly add one misleading clue for needs_review / hard variants
    if true_verdict == "needs_review" and random.random() < 0.5:
        mislead = random.choice(PROVENANCE_MARKERS["authentic"])
        if mislead not in clues:
            clues.append(mislead)

    available_info_requests = [
        "request_carbon_dating",
        "request_expert_opinion",
        "request_auction_history",
        "request_scientific_analysis",
    ]

    return {
        "true_verdict": true_verdict,
        "listing": {
            "id": str(uuid.uuid4())[:8],
            "category": category,
            "claimed_age_years": claimed_age,
            "origin_market": market,
            "asking_price_usd": random.randint(500, 50000),
            "provenance_clues": clues,
            "seller_rating": round(random.uniform(3.0, 5.0), 1),
        },
        "available_info_requests": available_info_requests,
        "info_requested": [],
        "verdict_submitted": False,
    }


def handle_verify_listing_step(
    state: Dict[str, Any], action_type: str, payload: Dict[str, Any]
) -> Tuple[float, bool, str, str | None]:
    """
    Returns (reward, done, result_text, error_text).
    """
    if state["verdict_submitted"]:
        return 0.0, True, "Episode already concluded.", "Episode already done."

    if action_type == "request_info":
        info_key = payload.get("info_type", "")
        available = state["available_info_requests"]
        if info_key not in available:
            return (
                -0.05,
                False,
                "",
                f"Invalid info_type '{info_key}'. Choose from: {available}",
            )
        if info_key in state["info_requested"]:
            return -0.05, False, "Already requested.", "Duplicate info request."
        state["info_requested"].append(info_key)
        state["available_info_requests"].remove(info_key)
        hint = _get_info_hint(info_key, state["true_verdict"])
        return 0.1, False, f"[{info_key}] {hint}", None

    if action_type == "verify_listing":
        verdict = payload.get("verdict", "").strip().lower()
        valid_verdicts = ["authentic", "counterfeit", "needs_review"]
        if verdict not in valid_verdicts:
            return (
                -0.05,
                False,
                "",
                f"Invalid verdict '{verdict}'. Must be one of {valid_verdicts}.",
            )
        state["verdict_submitted"] = True
        state["_submitted_verdict"] = verdict  # store for grader replay
        score = grade_verify_listing(state, verdict)
        reward = score  # direct reward = grader score
        if score == 1.0:
            result = f"Correct verdict '{verdict}'! Full marks."
        elif score > 0:
            result = f"Partially correct verdict '{verdict}'. True verdict: {state['true_verdict']}."
        else:
            result = f"Incorrect verdict '{verdict}'. True verdict: {state['true_verdict']}."
        return reward, True, result, None

    return (
        -0.05,
        False,
        "",
        f"Unknown action '{action_type}' for task verify_listing.",
    )


def grade_verify_listing(state: Dict[str, Any], verdict: str) -> float:
    """Score 0.0–1.0. Full credit for exact match; partial for needs_review when ambiguous."""
    true_v = state["true_verdict"]
    if verdict == true_v:
        return 1.0
    # Partial credit: needs_review when correct answer is ambiguous (needs_review)
    if true_v == "needs_review" and verdict in ["authentic", "counterfeit"]:
        return 0.2
    # Partial credit: answered needs_review when answer was clear
    if verdict == "needs_review" and true_v in ["authentic", "counterfeit"]:
        return 0.3
    return 0.0


def _get_info_hint(info_type: str, true_verdict: str) -> str:
    hints = {
        "authentic": {
            "request_carbon_dating": "Carbon dating suggests material age consistent with claimed period.",
            "request_expert_opinion": "Expert opines this piece is genuine; construction methods match era.",
            "request_auction_history": "Previous auction records found at Christie's (1987, 1999).",
            "request_scientific_analysis": "Spectroscopy confirms period-accurate alloy composition.",
        },
        "counterfeit": {
            "request_carbon_dating": "Carbon dating indicates material is less than 50 years old.",
            "request_expert_opinion": "Expert raises serious doubts; notes anachronistic joinery technique.",
            "request_auction_history": "No auction records found; seller cannot verify prior sales.",
            "request_scientific_analysis": "Spectroscopy finds synthetic compounds not available before 1960.",
        },
        "needs_review": {
            "request_carbon_dating": "Carbon dating gives wide confidence interval (±80 years) — inconclusive.",
            "request_expert_opinion": "Expert says 'probably genuine but requires further study'.",
            "request_auction_history": "One auction record found but documentation is partial.",
            "request_scientific_analysis": "Analysis consistent with period; one anomalous trace element detected.",
        },
    }
    return hints.get(true_verdict, {}).get(info_type, "No additional data available.")


# ---------------------------------------------------------------------------
# Task 2 — Optimal Pricing (Medium)
# ---------------------------------------------------------------------------


def generate_optimal_pricing_scenario(seed: int | None = None) -> Dict[str, Any]:
    """Generate a listing + market comparables for pricing task."""
    if seed is not None:
        random.seed(seed)

    category = random.choice(ANTIQUE_CATEGORIES)
    fair_value = random.randint(1000, 30000)

    # 5 comparables with some noise
    comparables = []
    for i in range(5):
        noise = random.uniform(0.7, 1.3)
        comparables.append(
            {
                "id": f"comp_{i+1}",
                "category": category,
                "age_years": random.randint(50, 300),
                "condition": random.choice(["poor", "fair", "good", "excellent"]),
                "sold_price_usd": int(fair_value * noise),
                "days_on_market": random.randint(7, 180),
                "market": random.choice(MARKETS),
            }
        )

    return {
        "fair_value": fair_value,
        "listing": {
            "id": str(uuid.uuid4())[:8],
            "category": category,
            "age_years": random.randint(50, 300),
            "condition": random.choice(["fair", "good", "excellent"]),
            "origin_market": random.choice(MARKETS),
        },
        "comparables": None,  # not fetched yet
        "valuation_estimate": None,
        "price_submitted": None,
        "actions_used": [],
    }


def handle_optimal_pricing_step(
    state: Dict[str, Any], action_type: str, payload: Dict[str, Any]
) -> Tuple[float, bool, str, str | None]:
    if state["price_submitted"] is not None:
        return 0.0, True, "Price already submitted.", "Episode already done."

    if action_type == "fetch_comparables":
        if "fetch_comparables" in state["actions_used"]:
            return -0.05, False, "", "Already fetched comparables."
        state["actions_used"].append("fetch_comparables")
        # Reveal comparables
        state["comparables"] = state["_comparables"]
        comp_summary = [
            f"#{c['id']}: {c['condition']} condition, sold ${c['sold_price_usd']:,}"
            for c in state["comparables"]
        ]
        result = "Comparables retrieved:\n" + "\n".join(comp_summary)
        return 0.1, False, result, None

    if action_type == "estimate_value":
        if "estimate_value" in state["actions_used"]:
            return -0.05, False, "", "Already used AI estimation."
        state["actions_used"].append("estimate_value")
        # Give a noisy AI estimate (±15%)
        noise = random.uniform(0.85, 1.15)
        estimate = int(state["fair_value"] * noise)
        state["valuation_estimate"] = estimate
        return 0.1, False, f"AI valuation estimate: ${estimate:,}", None

    if action_type == "set_price":
        try:
            price = float(payload.get("price", -1))
        except (TypeError, ValueError):
            return -0.05, False, "", "Payload must contain numeric 'price'."
        if price <= 0:
            return -0.05, False, "", "Price must be positive."
        state["price_submitted"] = price
        score = grade_optimal_pricing(state, price)
        reward = score
        result = (
            f"Price ${price:,.0f} submitted. "
            f"Fair value was ${state['fair_value']:,}. "
            f"Score: {score:.3f}"
        )
        return reward, True, result, None

    return (
        -0.05,
        False,
        "",
        f"Unknown action '{action_type}' for task optimal_pricing.",
    )


def grade_optimal_pricing(state: Dict[str, Any], price: float) -> float:
    """Score = max(0, 1 - |price - fair_value| / fair_value). Clamped [0,1]."""
    fair = state["fair_value"]
    raw = 1.0 - abs(price - fair) / fair
    return max(0.0, min(1.0, raw))


# ---------------------------------------------------------------------------
# Task 3 — Negotiate Deal (Hard)
# ---------------------------------------------------------------------------


def generate_negotiate_deal_scenario(seed: int | None = None) -> Dict[str, Any]:
    """Generate a negotiation scenario (agent is BUYER)."""
    if seed is not None:
        random.seed(seed)

    # Seller's ask and secret reserve (minimum they will accept)
    ask_price = random.randint(5000, 50000)
    reserve_fraction = random.uniform(0.60, 0.82)
    reserve_price = int(ask_price * reserve_fraction)
    fair_value = int(ask_price * random.uniform(reserve_fraction, 0.95))

    return {
        "ask_price": ask_price,
        "reserve_price": reserve_price,
        "fair_value": fair_value,
        "current_seller_offer": ask_price,
        "current_buyer_offer": None,
        "deal_price": None,
        "negotiation_history": [],
        "rounds": 0,
        "max_rounds": 10,
        "deal_done": False,
        "listing": {
            "id": str(uuid.uuid4())[:8],
            "category": random.choice(ANTIQUE_CATEGORIES),
            "age_years": random.randint(50, 350),
            "condition": random.choice(["fair", "good", "excellent"]),
            "seller_motivation": random.choice(["flexible", "firm", "very_flexible"]),
        },
    }


def handle_negotiate_deal_step(
    state: Dict[str, Any], action_type: str, payload: Dict[str, Any]
) -> Tuple[float, bool, str, str | None]:
    if state["deal_done"]:
        return 0.0, True, "Negotiation concluded.", "Episode already done."

    if state["rounds"] >= state["max_rounds"]:
        state["deal_done"] = True
        return 0.0, True, "Max rounds reached — no deal.", None

    rounds_penalty = -state["rounds"] * 0.005  # small per-round penalty

    if action_type == "submit_bid" or action_type == "make_counteroffer":
        try:
            bid = float(payload.get("amount", -1))
        except (TypeError, ValueError):
            return -0.05, False, "", "Payload must contain numeric 'amount'."
        if bid <= 0:
            return -0.05, False, "", "Amount must be positive."

        state["current_buyer_offer"] = bid
        state["rounds"] += 1
        state["negotiation_history"].append(
            {"round": state["rounds"], "actor": "buyer", "offer": bid}
        )

        # Seller responds
        seller_response, new_seller_offer = _seller_respond(state, bid)
        state["negotiation_history"].append(
            {"round": state["rounds"], "actor": "seller", "response": seller_response, "offer": new_seller_offer}
        )

        if seller_response == "accept":
            state["deal_price"] = bid
            state["deal_done"] = True
            score = grade_negotiate_deal(state)
            reward = score + rounds_penalty
            result = f"Seller ACCEPTED your offer of ${bid:,.0f}! Deal done. Score: {score:.3f}"
            return max(0.0, reward), True, result, None

        state["current_seller_offer"] = new_seller_offer
        result = (
            f"Seller COUNTERED at ${new_seller_offer:,.0f} "
            f"(your bid: ${bid:,.0f}, round {state['rounds']}/{state['max_rounds']})"
        )
        return 0.05 + rounds_penalty, False, result, None  # small progress reward

    if action_type == "accept_offer":
        seller_price = state["current_seller_offer"]
        state["deal_price"] = seller_price
        state["deal_done"] = True
        state["rounds"] += 1
        state["negotiation_history"].append(
            {"round": state["rounds"], "actor": "buyer", "response": "accept", "offer": seller_price}
        )
        score = grade_negotiate_deal(state)
        reward = score + rounds_penalty
        result = f"You ACCEPTED seller's offer of ${seller_price:,.0f}. Score: {score:.3f}"
        return max(0.0, reward), True, result, None

    if action_type == "reject_offer":
        state["deal_done"] = True
        state["rounds"] += 1
        result = "You REJECTED the offer. No deal reached. Score: 0.0"
        return 0.0, True, result, None

    return (
        -0.05,
        False,
        "",
        f"Unknown action '{action_type}' for task negotiate_deal.",
    )


def _seller_respond(state: Dict[str, Any], buyer_bid: float):
    """Simulate seller decision."""
    reserve = state["reserve_price"]
    current_ask = state["current_seller_offer"]
    flexibility = state["listing"]["seller_motivation"]

    flex_factor = {"very_flexible": 0.08, "flexible": 0.05, "firm": 0.02}.get(
        flexibility, 0.05
    )

    if buyer_bid >= reserve:
        return "accept", buyer_bid
    # Seller counters: moves down by flex_factor of the gap, minimum reserve
    gap = current_ask - buyer_bid
    new_ask = max(reserve, current_ask - gap * flex_factor * random.uniform(0.8, 1.2))
    new_ask = round(new_ask, -2)  # round to nearest 100
    return "counter", new_ask


def grade_negotiate_deal(state: Dict[str, Any]) -> float:
    """
    Score = (ask - deal_price) / (ask - reserve), clamped [0, 1].
    Higher score = better deal for the buyer.
    Score 0 if deal_price == ask (no discount captured).
    Score 1 if deal_price == reserve (maximum possible discount).
    """
    if state["deal_price"] is None:
        return 0.0
    ask = state["ask_price"]
    reserve = state["reserve_price"]
    deal = state["deal_price"]
    if ask == reserve:
        return 1.0 if deal <= reserve else 0.0
    raw = (ask - deal) / (ask - reserve)
    return max(0.0, min(1.0, raw))


# ---------------------------------------------------------------------------
# Task Registry
# ---------------------------------------------------------------------------


TASKS: Dict[str, Dict] = {
    "verify_listing": {
        "name": "verify_listing",
        "display_name": "Antique Listing Verification",
        "difficulty": "easy",
        "description": (
            "You are an expert antique authenticator. A listing has been submitted "
            "to the AntiquaChain marketplace. Examine the provenance clues, optionally "
            "request additional expert analyses, then submit your verdict: "
            "'authentic', 'counterfeit', or 'needs_review'."
        ),
        "available_actions": ["request_info", "verify_listing"],
        "max_steps": 8,
        "generate": generate_verify_listing_scenario,
        "handle_step": handle_verify_listing_step,
        "grade": grade_verify_listing,
    },
    "optimal_pricing": {
        "name": "optimal_pricing",
        "display_name": "Optimal Pricing Strategy",
        "difficulty": "medium",
        "description": (
            "You are a pricing strategist for AntiquaChain. Set the optimal listing "
            "price for an antique item. You may fetch market comparables and/or use "
            "the AI valuation tool before submitting your final price. "
            "Prices within 10% of fair market value score highest."
        ),
        "available_actions": ["fetch_comparables", "estimate_value", "set_price"],
        "max_steps": 6,
        "generate": generate_optimal_pricing_scenario,
        "handle_step": handle_optimal_pricing_step,
        "grade": grade_optimal_pricing,
    },
    "negotiate_deal": {
        "name": "negotiate_deal",
        "display_name": "End-to-End Deal Negotiation",
        "difficulty": "hard",
        "description": (
            "You are a buyer negotiating on AntiquaChain. The seller has listed an "
            "antique at the asking price shown. Negotiate the best possible deal "
            "through multi-round bidding. You can submit bids, make counter-offers, "
            "or accept/reject the seller's current offer. "
            "You win by maximising your discount below the asking price "
            "while the seller won't go below their (hidden) reserve price."
        ),
        "available_actions": ["submit_bid", "make_counteroffer", "accept_offer", "reject_offer"],
        "max_steps": 10,
        "generate": generate_negotiate_deal_scenario,
        "handle_step": handle_negotiate_deal_step,
        "grade": grade_negotiate_deal,
    },
}


def get_task_list() -> List[Dict[str, Any]]:
    """Return public task metadata (no internal fields)."""
    return [
        {
            "name": t["name"],
            "display_name": t["display_name"],
            "difficulty": t["difficulty"],
            "description": t["description"],
            "available_actions": t["available_actions"],
            "max_steps": t["max_steps"],
        }
        for t in TASKS.values()
    ]

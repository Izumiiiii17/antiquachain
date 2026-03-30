"""
AntiquaChain OpenEnv — Core Environment Class

Implements the OpenEnv contract:
  reset(task_id=None)  → AntiquaChainObservation
  step(action)         → StepResult
  state()              → AntiquaChainState
"""

from __future__ import annotations

import random
import uuid
from typing import Any, Dict, Optional

from openenv_env.models import (
    AntiquaChainAction,
    AntiquaChainObservation,
    AntiquaChainState,
    StepResult,
)
from openenv_env.tasks import TASKS


class AntiquaChainEnvironment:
    """Stateful environment for the AntiquaChain marketplace."""

    def __init__(self) -> None:
        self._episode_id: str = ""
        self._step_count: int = 0
        self._done: bool = False
        self._cumulative_reward: float = 0.0
        self._task_name: str = ""
        self._task_id: str = ""
        self._task_cfg: Dict[str, Any] = {}
        self._env_state: Dict[str, Any] = {}
        self._max_steps: int = 15

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def reset(self, task_name: Optional[str] = None, seed: Optional[int] = None) -> AntiquaChainObservation:
        """Start a new episode. Picks a random task if task_name is None."""
        # Choose task
        if task_name is None or task_name not in TASKS:
            task_name = random.choice(list(TASKS.keys()))

        self._task_name = task_name
        self._task_cfg = TASKS[task_name]
        self._episode_id = str(uuid.uuid4())
        self._step_count = 0
        self._done = False
        self._cumulative_reward = 0.0
        self._max_steps = self._task_cfg["max_steps"]
        self._task_id = f"{task_name}_{self._episode_id[:8]}"

        # Generate fresh scenario
        if seed is None:
            seed = random.randint(0, 2**31)
        raw_state = self._task_cfg["generate"](seed=seed)

        # For optimal_pricing: stash hidden comparables
        if task_name == "optimal_pricing":
            raw_state["_comparables"] = raw_state.get("comparables") or []
            # Actually build comparables now and stash
            raw_state["_comparables"] = _build_comparables(raw_state, seed)
            raw_state["comparables"] = None  # hidden until fetched

        self._env_state = raw_state

        return self._build_observation(
            last_action_result="Environment reset. New episode started.",
            last_action_error=None,
        )

    def step(self, action: AntiquaChainAction) -> StepResult:
        """Execute an action and return the step result."""
        if self._done:
            obs = self._build_observation(
                last_action_result="",
                last_action_error="Episode is already done. Call reset() to start a new episode.",
            )
            return StepResult(
                observation=obs, reward=0.0, done=True, info={"error": "already_done"}
            )

        # Check step limit
        if self._step_count >= self._max_steps:
            self._done = True
            obs = self._build_observation(
                last_action_result="Maximum steps reached.",
                last_action_error=None,
            )
            return StepResult(
                observation=obs,
                reward=0.0,
                done=True,
                info={"reason": "max_steps_exceeded"},
            )

        self._step_count += 1

        # Dispatch to task handler
        handler = self._task_cfg["handle_step"]
        reward, done, result_text, error_text = handler(
            self._env_state, action.action_type, action.payload
        )

        self._cumulative_reward += reward
        self._done = done

        obs = self._build_observation(
            last_action_result=result_text,
            last_action_error=error_text,
        )

        # Build info dict
        info: Dict[str, Any] = {
            "step": self._step_count,
            "cumulative_reward": self._cumulative_reward,
        }
        if done:
            # Run final grader for clean score
            final_score = _compute_final_score(self._task_name, self._env_state)
            info["final_score"] = final_score
            info["task_name"] = self._task_name

        return StepResult(observation=obs, reward=reward, done=done, info=info)

    def state(self) -> AntiquaChainState:
        """Return current episode metadata."""
        return AntiquaChainState(
            episode_id=self._episode_id,
            step_count=self._step_count,
            task_id=self._task_id,
            task_name=self._task_name,
            done=self._done,
            cumulative_reward=self._cumulative_reward,
            max_steps=self._max_steps,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _build_observation(
        self, last_action_result: str, last_action_error: Optional[str]
    ) -> AntiquaChainObservation:
        cfg = self._task_cfg
        marketplace_state = _safe_public_state(self._task_name, self._env_state)
        return AntiquaChainObservation(
            task_id=self._task_id,
            task_name=self._task_name,
            task_description=cfg.get("description", ""),
            marketplace_state=marketplace_state,
            available_actions=cfg.get("available_actions", []),
            last_action_result=last_action_result,
            last_action_error=last_action_error,
            step_number=self._step_count,
        )


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------


def _safe_public_state(task_name: str, env_state: Dict[str, Any]) -> Dict[str, Any]:
    """Return the marketplace state visible to the agent (strip hidden fields)."""
    hidden = {"true_verdict", "fair_value", "reserve_price", "_comparables"}
    return {k: v for k, v in env_state.items() if k not in hidden}


def _compute_final_score(task_name: str, env_state: Dict[str, Any]) -> float:
    """Compute the final episode score using the correct grader for the task."""
    from openenv_env.tasks import (
        grade_verify_listing,
        grade_optimal_pricing,
        grade_negotiate_deal,
    )
    if task_name == "verify_listing":
        verdict = None
        # Extract the verdict that was submitted from action history
        # The grader needs the verdict; we store the submitted verdict in state
        for info in env_state.get("info_requested", []):
            pass  # already stored
        # verdict_submitted is a bool; actual score computed during step handler
        # just re-run grader with empty verdict as fallback
        submitted = env_state.get("_submitted_verdict", "needs_review")
        return grade_verify_listing(env_state, submitted)
    if task_name == "optimal_pricing":
        price = env_state.get("price_submitted")
        if price is None:
            return 0.0
        return grade_optimal_pricing(env_state, float(price))
    if task_name == "negotiate_deal":
        return grade_negotiate_deal(env_state)
    return 0.0


def _build_comparables(raw_state: Dict[str, Any], seed: int) -> list:
    """Build the 5 comparables for the pricing task (mirrors tasks.py logic)."""
    import random as rnd
    rnd.seed(seed)
    fair = raw_state["fair_value"]
    from openenv_env.tasks import ANTIQUE_CATEGORIES, MARKETS
    category = raw_state["listing"]["category"]
    comps = []
    for i in range(5):
        noise = rnd.uniform(0.7, 1.3)
        comps.append({
            "id": f"comp_{i+1}",
            "category": category,
            "age_years": rnd.randint(50, 300),
            "condition": rnd.choice(["poor", "fair", "good", "excellent"]),
            "sold_price_usd": int(fair * noise),
            "days_on_market": rnd.randint(7, 180),
            "market": rnd.choice(MARKETS),
        })
    return comps

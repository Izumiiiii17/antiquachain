"""
AntiquaChain OpenEnv — Data Models

Pydantic v2 typed models for the full OpenEnv API surface:
  - AntiquaChainAction    — what the agent sends
  - AntiquaChainObservation — what the agent sees
  - AntiquaChainState     — episode metadata
  - StepResult            — combined step response
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Action
# ---------------------------------------------------------------------------


class AntiquaChainAction(BaseModel):
    """Action submitted by the agent.

    action_type is a string identifier for the action family.
    payload contains action-specific parameters.

    Common action_types:
        verify_listing   — Task 1: submit authentication verdict
        request_info     — Task 1: request additional provenance data
        set_price        — Task 2: submit a listing price
        fetch_comparables— Task 2: retrieve market comparables
        estimate_value   — Task 2: call AI valuation
        submit_bid       — Task 3: place a bid amount
        accept_offer     — Task 3: accept current counter-offer
        reject_offer     — Task 3: reject and end negotiation
        make_counteroffer— Task 3: propose a counter price
    """

    action_type: str = Field(
        ...,
        description="Identifier for the action family.",
        examples=["verify_listing", "set_price", "submit_bid"],
    )
    payload: Dict[str, Any] = Field(
        default_factory=dict,
        description="Action-specific parameters.",
    )


# ---------------------------------------------------------------------------
# Observation
# ---------------------------------------------------------------------------


class AntiquaChainObservation(BaseModel):
    """What the agent receives after each reset() or step()."""

    task_id: str = Field(
        ...,
        description="Unique identifier for the current task instance.",
    )
    task_name: str = Field(
        ...,
        description="Human-readable task name (verify_listing | optimal_pricing | negotiate_deal).",
    )
    task_description: str = Field(
        ...,
        description="Natural-language description of what the agent must accomplish.",
    )
    marketplace_state: Dict[str, Any] = Field(
        default_factory=dict,
        description=(
            "Snapshot of the marketplace relevant to this task: listing metadata, "
            "market comparables, negotiation history, etc."
        ),
    )
    available_actions: List[str] = Field(
        default_factory=list,
        description="List of action_type strings the agent may use at this step.",
    )
    last_action_result: str = Field(
        default="",
        description="Human-readable summary of the result of the last action.",
    )
    last_action_error: Optional[str] = Field(
        default=None,
        description="Error message if the last action was invalid, otherwise null.",
    )
    step_number: int = Field(
        default=0,
        description="Current step index within the episode.",
    )


# ---------------------------------------------------------------------------
# State (episode metadata)
# ---------------------------------------------------------------------------


class AntiquaChainState(BaseModel):
    """Episode-level metadata returned by state()."""

    episode_id: str = Field(..., description="Unique episode identifier (UUID).")
    step_count: int = Field(default=0, description="Number of steps taken so far.")
    task_id: str = Field(..., description="Task identifier for this episode.")
    task_name: str = Field(..., description="Task name for this episode.")
    done: bool = Field(default=False, description="Whether the episode has ended.")
    cumulative_reward: float = Field(
        default=0.0, description="Sum of all rewards collected so far."
    )
    max_steps: int = Field(
        default=15, description="Maximum steps allowed in this episode."
    )


# ---------------------------------------------------------------------------
# Step Result
# ---------------------------------------------------------------------------


class StepResult(BaseModel):
    """Combined response from step() — mirrors the OpenEnv StepResult contract."""

    observation: AntiquaChainObservation
    reward: float = Field(
        ...,
        description="Reward signal for this transition. Ranges depend on the task.",
    )
    done: bool = Field(
        ...,
        description="True when the episode has terminated (success, failure, or max steps).",
    )
    info: Dict[str, Any] = Field(
        default_factory=dict,
        description="Auxiliary diagnostic information (grader scores, task-specific data).",
    )

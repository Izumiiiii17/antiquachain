"""
AntiquaChain OpenEnv — Client

Provides AntiquaChainEnv: a synchronous HTTP client that wraps the FastAPI
server, implementing the OpenEnv reset()/step()/state() interface.

Usage (sync):
    from openenv_env import AntiquaChainAction, AntiquaChainEnv

    with AntiquaChainEnv(base_url="http://localhost:7860") as env:
        obs = env.reset(task_name="verify_listing")
        result = env.step(AntiquaChainAction(
            action_type="request_info",
            payload={"info_type": "request_carbon_dating"}
        ))
        print(result.observation.last_action_result)
"""

from __future__ import annotations

from typing import Optional

import httpx

from openenv_env.models import (
    AntiquaChainAction,
    AntiquaChainObservation,
    AntiquaChainState,
    StepResult,
)


class AntiquaChainEnv:
    """Synchronous client for the AntiquaChain OpenEnv server."""

    def __init__(self, base_url: str = "http://localhost:7860", timeout: float = 30.0) -> None:
        self.base_url = base_url.rstrip("/")
        self._client: Optional[httpx.Client] = None
        self._timeout = timeout

    # ------------------------------------------------------------------
    # Context manager
    # ------------------------------------------------------------------

    def __enter__(self) -> "AntiquaChainEnv":
        self._client = httpx.Client(base_url=self.base_url, timeout=self._timeout)
        return self

    def __exit__(self, *args) -> None:
        if self._client:
            self._client.close()
            self._client = None

    # ------------------------------------------------------------------
    # OpenEnv API
    # ------------------------------------------------------------------

    def reset(
        self,
        task_name: Optional[str] = None,
        seed: Optional[int] = None,
    ) -> AntiquaChainObservation:
        """Start a new episode and return the initial observation."""
        client = self._get_client()
        payload = {}
        if task_name:
            payload["task_name"] = task_name
        if seed is not None:
            payload["seed"] = seed
        resp = client.post("/reset", json=payload)
        resp.raise_for_status()
        return AntiquaChainObservation.model_validate(resp.json())

    def step(self, action: AntiquaChainAction) -> StepResult:
        """Execute one action and return the step result."""
        client = self._get_client()
        resp = client.post("/step", json=action.model_dump())
        resp.raise_for_status()
        return StepResult.model_validate(resp.json())

    def state(self) -> AntiquaChainState:
        """Return current episode metadata."""
        client = self._get_client()
        resp = client.get("/state")
        resp.raise_for_status()
        return AntiquaChainState.model_validate(resp.json())

    def health(self) -> dict:
        """Liveness probe."""
        client = self._get_client()
        resp = client.get("/health")
        resp.raise_for_status()
        return resp.json()

    def list_tasks(self) -> list:
        """List available tasks."""
        client = self._get_client()
        resp = client.get("/tasks")
        resp.raise_for_status()
        return resp.json()["tasks"]

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _get_client(self) -> httpx.Client:
        if self._client is None:
            # Allow usage without context manager for convenience
            self._client = httpx.Client(base_url=self.base_url, timeout=self._timeout)
        return self._client

    def close(self) -> None:
        if self._client:
            self._client.close()
            self._client = None

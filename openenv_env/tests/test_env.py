"""
AntiquaChain OpenEnv — Unit Tests

Tests reset(), step(), state(), all graders return float in [0.0, 1.0].
Run: python -m pytest openenv_env/tests/test_env.py -v
"""

import pytest
from openenv_env.models import AntiquaChainAction
from openenv_env.server.antiquachain_environment import AntiquaChainEnvironment
from openenv_env.tasks import (
    grade_verify_listing,
    grade_optimal_pricing,
    grade_negotiate_deal,
    generate_verify_listing_scenario,
    generate_optimal_pricing_scenario,
    generate_negotiate_deal_scenario,
    TASKS,
)

# ---------------------------------------------------------------------------
# Environment lifecycle
# ---------------------------------------------------------------------------


class TestEnvironmentLifecycle:
    def test_reset_returns_observation(self):
        env = AntiquaChainEnvironment()
        obs = env.reset()
        assert obs.task_name in TASKS
        assert obs.step_number == 0
        assert obs.last_action_error is None

    def test_reset_with_explicit_task(self):
        env = AntiquaChainEnvironment()
        for task in TASKS:
            obs = env.reset(task_name=task)
            assert obs.task_name == task

    def test_state_reflects_reset(self):
        env = AntiquaChainEnvironment()
        env.reset(task_name="verify_listing")
        st = env.state()
        assert st.step_count == 0
        assert not st.done
        assert st.cumulative_reward == 0.0

    def test_step_increments_count(self):
        env = AntiquaChainEnvironment()
        env.reset(task_name="verify_listing")
        action = AntiquaChainAction(
            action_type="request_info",
            payload={"info_type": "request_carbon_dating"}
        )
        result = env.step(action)
        assert env.state().step_count == 1

    def test_invalid_action_returns_error(self):
        env = AntiquaChainEnvironment()
        env.reset(task_name="verify_listing")
        action = AntiquaChainAction(action_type="nonexistent_action", payload={})
        result = env.step(action)
        assert result.observation.last_action_error is not None
        assert result.reward <= 0

    def test_max_steps_terminates_episode(self):
        env = AntiquaChainEnvironment()
        env.reset(task_name="verify_listing", seed=42)
        # Exhaust steps with invalid actions
        for _ in range(20):
            if env.state().done:
                break
            env.step(AntiquaChainAction(action_type="noop", payload={}))
        assert env.state().done

    def test_step_after_done_returns_error(self):
        env = AntiquaChainEnvironment()
        env.reset(task_name="verify_listing", seed=42)
        # Complete episode
        env.step(AntiquaChainAction(
            action_type="verify_listing",
            payload={"verdict": "authentic"}
        ))
        # One more step
        result = env.step(AntiquaChainAction(
            action_type="verify_listing",
            payload={"verdict": "authentic"}
        ))
        assert result.done
        assert result.reward == 0.0


# ---------------------------------------------------------------------------
# Task 1 — Verify Listing
# ---------------------------------------------------------------------------


class TestVerifyListingGrader:
    def test_exact_match_scores_1(self):
        state = generate_verify_listing_scenario(seed=1)
        score = grade_verify_listing(state, state["true_verdict"])
        assert score == 1.0

    def test_wrong_answer_scores_0_or_partial(self):
        state = generate_verify_listing_scenario(seed=2)
        tv = state["true_verdict"]
        wrong = [v for v in ["authentic", "counterfeit", "needs_review"] if v != tv][0]
        score = grade_verify_listing(state, wrong)
        assert 0.0 <= score <= 1.0

    def test_score_in_range(self):
        for seed in range(20):
            state = generate_verify_listing_scenario(seed=seed)
            for verdict in ["authentic", "counterfeit", "needs_review"]:
                score = grade_verify_listing(state, verdict)
                assert 0.0 <= score <= 1.0, f"Out of range: {score}"

    def test_verify_listing_full_episode(self):
        env = AntiquaChainEnvironment()
        env.reset(task_name="verify_listing", seed=10)
        obs_state = env._env_state
        verdict = obs_state["true_verdict"]
        result = env.step(AntiquaChainAction(
            action_type="verify_listing",
            payload={"verdict": verdict}
        ))
        assert result.done
        assert result.reward == 1.0
        assert result.info["final_score"] == 1.0


# ---------------------------------------------------------------------------
# Task 2 — Optimal Pricing
# ---------------------------------------------------------------------------


class TestOptimalPricingGrader:
    def test_exact_price_scores_1(self):
        state = generate_optimal_pricing_scenario(seed=5)
        fair = state["fair_value"]
        score = grade_optimal_pricing(state, float(fair))
        assert score == pytest.approx(1.0)

    def test_far_off_price_scores_0(self):
        state = generate_optimal_pricing_scenario(seed=5)
        fair = state["fair_value"]
        score = grade_optimal_pricing(state, fair * 10)
        assert score == 0.0

    def test_10_percent_off_scores_above_0(self):
        state = generate_optimal_pricing_scenario(seed=5)
        fair = state["fair_value"]
        score = grade_optimal_pricing(state, fair * 1.10)
        assert 0.0 <= score <= 1.0

    def test_score_in_range(self):
        for seed in range(20):
            state = generate_optimal_pricing_scenario(seed=seed)
            fair = state["fair_value"]
            for factor in [0.5, 0.9, 1.0, 1.1, 2.0]:
                score = grade_optimal_pricing(state, fair * factor)
                assert 0.0 <= score <= 1.0, f"Out of range: {score}"


# ---------------------------------------------------------------------------
# Task 3 — Negotiate Deal
# ---------------------------------------------------------------------------


class TestNegotiateDealGrader:
    def test_no_deal_scores_0(self):
        state = generate_negotiate_deal_scenario(seed=7)
        state["deal_price"] = None
        score = grade_negotiate_deal(state)
        assert score == 0.0

    def test_deal_at_ask_scores_0(self):
        state = generate_negotiate_deal_scenario(seed=7)
        state["deal_price"] = state["ask_price"]
        score = grade_negotiate_deal(state)
        assert score == pytest.approx(0.0)

    def test_deal_at_reserve_scores_1(self):
        state = generate_negotiate_deal_scenario(seed=7)
        state["deal_price"] = state["reserve_price"]
        score = grade_negotiate_deal(state)
        assert score == pytest.approx(1.0)

    def test_deal_midpoint_scores_half(self):
        state = generate_negotiate_deal_scenario(seed=7)
        mid = (state["ask_price"] + state["reserve_price"]) / 2
        state["deal_price"] = mid
        score = grade_negotiate_deal(state)
        assert 0.4 <= score <= 0.6

    def test_score_in_range(self):
        for seed in range(20):
            state = generate_negotiate_deal_scenario(seed=seed)
            ask = state["ask_price"]
            reserve = state["reserve_price"]
            for price in [reserve, (ask + reserve) / 2, ask]:
                state["deal_price"] = price
                score = grade_negotiate_deal(state)
                assert 0.0 <= score <= 1.0, f"Out of range: {score}"

    def test_negotiate_accept_offer_episode(self):
        env = AntiquaChainEnvironment()
        env.reset(task_name="negotiate_deal", seed=7)
        # Immediately accept seller's (ask) offer → score should be ~0
        result = env.step(AntiquaChainAction(action_type="accept_offer", payload={}))
        assert result.done
        assert 0.0 <= result.info.get("final_score", 0) <= 1.0

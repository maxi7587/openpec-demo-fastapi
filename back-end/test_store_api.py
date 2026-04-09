"""
Tests derived from openspec/specs/order/spec.md scenarios.

Each test name maps to a scenario in the spec.
"""

import pytest
from fastapi.testclient import TestClient

from importlib.machinery import SourceFileLoader
import importlib
import os

# Load module from hyphenated filename
_loader = SourceFileLoader("store_api", os.path.join(os.path.dirname(__file__), "store-api.py"))
store_api = _loader.load_module()

app = store_api.app
order = store_api.order


@pytest.fixture(autouse=True)
def reset_order():
    """Reset global order state before each test."""
    order["status"] = "PENDING"


@pytest.fixture
def client():
    return TestClient(app)


# ── Requirement: Pay Order ──────────────────────────────────────────────


class TestPayOrder:
    """Scenario group: Pay Order"""

    def test_successful_payment(self, client):
        """GIVEN order PENDING, WHEN POST /pay, THEN status becomes PAID."""
        res = client.post("/pay")
        assert res.status_code == 200
        assert res.json()["status"] == "PAID"

        # Verify persisted state
        assert client.get("/order").json()["status"] == "PAID"


# ── Requirement: Ship Order ─────────────────────────────────────────────


class TestShipOrder:
    """Scenario group: Ship Order"""

    def test_successful_shipment(self, client):
        """GIVEN order PAID, WHEN POST /ship, THEN status becomes SHIPPED."""
        order["status"] = "PAID"

        res = client.post("/ship")
        assert res.status_code == 200
        assert res.json()["status"] == "SHIPPED"

        assert client.get("/order").json()["status"] == "SHIPPED"


# ── Requirement: View Order ─────────────────────────────────────────────


class TestViewOrder:
    """Scenario group: View Order"""

    @pytest.mark.parametrize("initial_status", ["PENDING", "PAID", "SHIPPED"])
    def test_read_current_status(self, client, initial_status):
        """GIVEN order in any status, WHEN GET /order, THEN returns current status without modifying it."""
        order["status"] = initial_status

        res = client.get("/order")
        assert res.status_code == 200
        assert res.json()["status"] == initial_status

        # Verify no side effects
        assert order["status"] == initial_status

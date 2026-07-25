import pytest
from fastapi.testclient import TestClient

from app.db.seed import initialize_database
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def initialized_database() -> None:
    initialize_database()


@pytest.fixture()
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client

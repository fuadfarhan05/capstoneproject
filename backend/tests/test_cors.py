from fastapi.testclient import TestClient
from main import app


client = TestClient(app)

def test_local_frontend_origin_is_allowed(): #imitates a request so we can test
    response = client.options(
        "/api/events",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert(
        response.headers["access-control-allow-origin"]
        == "http://localhost:5173"
    )

def test_deployed_frontend_origin_is_allowed():
    response = client.options(
        "/api/events",
        headers={
            "Origin": "https://capstoneproject-murex.vercel.app",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert response.status_code == 200
    assert (
        response.headers["access-control-allow-origin"]
        == "https://capstoneproject-murex.vercel.app"
    )

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.user import User
from app.core.security import get_password_hash, create_access_token

def get_auth_client(client: TestClient, db: Session, email="explorer_user@carryyear.in"):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=get_password_hash("Password123!"),
            name="Career Explorer User",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=user.id)
    return user, {"Authorization": f"Bearer {token}"}

def test_career_search_and_catalog(client: TestClient, db: Session):
    response = client.get("/api/careers")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 14
    careers = data["data"]

    # Test filtering by cluster
    res_cluster = client.get("/api/careers?cluster=Engineering Systems, Hardware %26 Robotics")
    assert res_cluster.status_code == 200
    cluster_careers = res_cluster.json()["data"]
    assert len(cluster_careers) >= 3
    assert all(c["cluster"] == "Engineering Systems, Hardware & Robotics" for c in cluster_careers)

    # Test search query
    res_search = client.get("/api/careers?search=automotive")
    assert res_search.status_code == 200
    search_careers = res_search.json()["data"]
    assert len(search_careers) >= 1

def test_career_detail_retrieval(client: TestClient, db: Session):
    res = client.get("/api/careers/ev-systems-engineer")
    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    career = body["data"]
    assert career["slug"] == "ev-systems-engineer"
    assert "Electric Vehicle" in career["title"]
    assert "Tamil Nadu" in career["tamil_nadu_demand"] or "High" in career["tamil_nadu_demand"]
    assert len(career["skills"]) > 0
    assert len(career["courses"]) > 0

def test_career_bookmarking_workflow(client: TestClient, db: Session):
    user, headers = get_auth_client(client, db, email="bookmark_user@carryyear.in")

    # 1. Initially saved careers should be empty for this user
    initial_res = client.get("/api/careers/saved", headers=headers)
    assert initial_res.status_code == 200
    assert initial_res.json()["count"] == 0

    ids_res = client.get("/api/careers/saved/ids", headers=headers)
    assert ids_res.status_code == 200
    assert ids_res.json()["data"] == []

    # 2. Get a valid career ID
    list_res = client.get("/api/careers")
    careers = list_res.json()["data"]
    target_career = careers[0]
    target_career_id = target_career["id"]

    # 3. Bookmark the career
    save_res = client.post(
        f"/api/careers/{target_career_id}/save?notes=Top choice for TNEA counselling",
        headers=headers
    )
    assert save_res.status_code == 200
    save_data = save_res.json()
    assert save_data["success"] is True
    assert save_data["data"]["career_id"] == target_career_id
    assert save_data["data"]["notes"] == "Top choice for TNEA counselling"

    # 4. Verify in saved list and saved ids
    saved_res = client.get("/api/careers/saved", headers=headers)
    assert saved_res.status_code == 200
    saved_items = saved_res.json()["data"]
    assert len(saved_items) == 1
    assert saved_items[0]["career_id"] == target_career_id
    assert saved_items[0]["career"]["title"] == target_career["title"]

    ids_res2 = client.get("/api/careers/saved/ids", headers=headers)
    assert ids_res2.status_code == 200
    assert target_career_id in ids_res2.json()["data"]

    # 5. Remove bookmark
    del_res = client.delete(f"/api/careers/{target_career_id}/save", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["data"]["removed"] is True

    # 6. Verify empty again
    saved_res2 = client.get("/api/careers/saved", headers=headers)
    assert saved_res2.status_code == 200
    assert saved_res2.json()["count"] == 0

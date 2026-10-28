from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.simulator_service import SimulatorService, ScenarioAdjustmentIn
from app.api.deps import get_current_user

router = APIRouter(prefix="/simulator", tags=["What-If Simulator"])

@router.post("/evaluate", response_model=dict)
def evaluate_scenario(
    adjustment: ScenarioAdjustmentIn,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = SimulatorService.run_simulation(
        db=db,
        user_id=current_user.id,
        adj=adjustment
    )
    return {"success": True, "data": result}

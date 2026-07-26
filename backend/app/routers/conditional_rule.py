from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.schemas.conditional_rule import (
    ConditionalRuleCreate,
    ConditionalRuleResponse,
)
from app.services.conditional_rule_service import (
    create_rule,
    get_rules,
    delete_rule,
)
from app.schemas.rule_evaluator import RuleEvaluationRequest
from app.services.rule_evaluator import evaluate_rules
from app.models.conditional_rule import ConditionalRule
router = APIRouter(
    prefix="/forms",
    tags=["Conditional Rules"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{form_id}/rules", response_model=ConditionalRuleResponse)
def create_conditional_rule(
    form_id: int,
    rule: ConditionalRuleCreate,
    db: Session = Depends(get_db),
):
    return create_rule(db, form_id, rule)


@router.get("/{form_id}/rules")
def get_conditional_rules(
    form_id: int,
    db: Session = Depends(get_db),
):
    return get_rules(db, form_id)


@router.delete("/{form_id}/rules/{rule_id}")
def delete_conditional_rule(
    form_id: int,
    rule_id: int,
    db: Session = Depends(get_db),
):
    return delete_rule(db, form_id, rule_id)
@router.post("/{form_id}/evaluate")
def evaluate_conditional_rules(
    form_id: int,
    payload: RuleEvaluationRequest,
    db: Session = Depends(get_db),
):
    # Use evaluator that returns a state for every field (visible/required)
    from app.services.rule_evaluator import evaluate_form_rules

    return evaluate_form_rules(db, form_id, payload.submitted_values)
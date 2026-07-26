from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.conditional_rule import ConditionalRule
from app.models.form import Form
from app.models.field import Field
def create_rule(
    db: Session,
    form_id: int,
    rule_data,
):
    form = db.query(Form).filter(Form.id == form_id).first()

    if form is None:
        raise HTTPException(
            status_code=404,
            detail="Form not found",
        )

    trigger = (
        db.query(Field)
        .filter(
            Field.id == rule_data.trigger_field_id,
            Field.form_id == form_id,
        )
        .first()
    )

    target = (
        db.query(Field)
        .filter(
            Field.id == rule_data.target_field_id,
            Field.form_id == form_id,
        )
        .first()
    )

    if trigger is None or target is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid field selected",
        )

    rule = ConditionalRule(
        form_id=form_id,
        trigger_field_id=rule_data.trigger_field_id,
        operator=rule_data.operator,
        value=rule_data.value,
        target_field_id=rule_data.target_field_id,
        action=rule_data.action,
    )

    db.add(rule)
    db.commit()
    db.refresh(rule)

    return rule
def get_rules(
    db: Session,
    form_id: int,
):
    return (
        db.query(ConditionalRule)
        .filter(
            ConditionalRule.form_id == form_id
        )
        .all()
    )
def delete_rule(
    db: Session,
    form_id: int,
    rule_id: int,
):
    rule = (
        db.query(ConditionalRule)
        .filter(
            ConditionalRule.id == rule_id,
            ConditionalRule.form_id == form_id,
        )
        .first()
    )

    if rule is None:
        raise HTTPException(
            status_code=404,
            detail="Rule not found",
        )

    db.delete(rule)
    db.commit()

    return {
        "message": "Rule deleted successfully"
    }
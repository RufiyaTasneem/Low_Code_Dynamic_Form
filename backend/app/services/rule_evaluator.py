from typing import Any

from sqlalchemy.orm import Session

from app.models.conditional_rule import ConditionalRule
from app.models.field import Field


def _normalize_operator(operator: str | None) -> str:
    if operator is None:
        return ""

    normalized = str(operator).strip().lower()

    aliases = {
        "=": "equals",
        "==": "equals",
        "!=": "not_equals",
        ">": "greater_than",
        ">=": "greater_than_or_equal",
        "<": "less_than",
        "<=": "less_than_or_equal",
    }

    return aliases.get(normalized, normalized)


def _coerce_number(value: Any):
    if value is None:
        return None

    if isinstance(value, bool):
        return None

    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        stripped = value.strip()
        if stripped == "":
            return None

        try:
            return float(stripped)
        except ValueError:
            return None

    return None


def _evaluate_condition(rule, trigger_value, field_lookup=None) -> bool:
    operator = _normalize_operator(rule.operator)

    trigger_field = None
    if field_lookup is not None and rule.trigger_field_id in field_lookup:
        trigger_field = field_lookup[rule.trigger_field_id]

    if operator in {"equals", "not_equals"}:
        if trigger_field and getattr(trigger_field, "type", None) == "number":
            left = _coerce_number(trigger_value)
            right = _coerce_number(rule.value)

            if left is not None and right is not None:
                if operator == "equals":
                    return left == right
                return left != right

        if operator == "equals":
            return str(trigger_value) == str(rule.value)

        return str(trigger_value) != str(rule.value)

    if operator == "contains":
        return (
            trigger_value is not None
            and str(rule.value) in str(trigger_value)
        )

    if operator in {
        "greater_than",
        "greater_than_or_equal",
        "less_than",
        "less_than_or_equal",
    }:
        left = _coerce_number(trigger_value)
        right = _coerce_number(rule.value)

        if left is None or right is None:
            return False

        if operator == "greater_than":
            return left > right

        if operator == "greater_than_or_equal":
            return left >= right

        if operator == "less_than":
            return left < right

        return left <= right

    if operator == "is_empty":
        return (
            trigger_value is None
            or str(trigger_value).strip() == ""
        )

    return False


def evaluate_rules(rules, submitted_values, field_lookup=None):
    """
    Evaluate conditional rules against submitted values.

    Returns:
    {
        field_id: {
            "visible": True,
            "required": False
        }
    }
    """

    field_states = {}

    for rule in rules:
        trigger_value = submitted_values.get(
            str(rule.trigger_field_id),
            submitted_values.get(rule.trigger_field_id),
        )

        # Debug Logs
        print("\n----------------------------")
        print("Rule ID:", rule.id)
        print("Trigger Field:", rule.trigger_field_id)
        print("Operator:", rule.operator)
        print("Rule Value:", rule.value)
        print("Action:", rule.action)
        print("Submitted Values:", submitted_values)
        print("Trigger Value:", trigger_value)

        condition_met = _evaluate_condition(
            rule,
            trigger_value,
            field_lookup=field_lookup,
        )

        print("Condition Met:", condition_met)

        target_id = rule.target_field_id

        if target_id not in field_states:
            field_states[target_id] = {
                "visible": True,
                "required": False,
            }

        if rule.action == "show":
            field_states[target_id]["visible"] = condition_met

        elif rule.action == "hide":
            field_states[target_id]["visible"] = not condition_met

        elif rule.action == "require":
            field_states[target_id]["required"] = condition_met

        elif rule.action == "optional":
            field_states[target_id]["required"] = False

    return field_states


def evaluate_form_rules(
    db: Session,
    form_id: int,
    submitted_values: dict,
):
    """
    Evaluate all rules for a form and return the final state
    (visible/required) of every field.
    """

    fields = (
        db.query(Field)
        .filter(Field.form_id == form_id)
        .all()
    )

    rules = (
        db.query(ConditionalRule)
        .filter(ConditionalRule.form_id == form_id)
        .all()
    )

    field_states = {}

    for field in fields:
        field_states[field.id] = {
            "visible": True,
            "required": False,
        }

    # Fields controlled by "show" rules start hidden
    show_rule_targets = {
        rule.target_field_id
        for rule in rules
        if rule.action == "show"
    }

    for field_id in show_rule_targets:
        field_states[field_id]["visible"] = False

    field_lookup = {field.id: field for field in fields}

    rule_results = evaluate_rules(
        rules,
        submitted_values,
        field_lookup=field_lookup,
    )

    for field_id, state in rule_results.items():
        field_states[field_id].update(state)

    return field_states
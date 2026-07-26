from types import SimpleNamespace

from app.services.rule_evaluator import evaluate_rules, evaluate_form_rules


class DummyField:
    def __init__(self, field_id, field_type="text"):
        self.id = field_id
        self.form_id = 1
        self.type = field_type
        self.config = {}


def test_evaluate_rules_applies_numeric_comparison_and_visibility():
    rules = [
        SimpleNamespace(
            trigger_field_id=1,
            operator="greater_than_or_equal",
            value="10",
            target_field_id=2,
            action="hide",
        ),
        SimpleNamespace(
            trigger_field_id=1,
            operator="less_than",
            value="20",
            target_field_id=2,
            action="require",
        ),
    ]

    field_lookup = {1: DummyField(1, "number")}
    result = evaluate_rules(rules, {"1": "12"}, field_lookup=field_lookup)

    assert result[2]["visible"] is False
    assert result[2]["required"] is True


def test_evaluate_form_rules_uses_saved_rules_for_every_field():
    class DummySession:
        def query(self, *args, **kwargs):
            return self

        def filter(self, *args, **kwargs):
            return self

        def all(self):
            return []

    session = DummySession()
    session._fields = [DummyField(1, "number"), DummyField(2)]

    def query_side_effect(*args, **kwargs):
        if args and args[0].__name__ == "Field":
            return SimpleNamespace(
                filter=lambda *a, **k: SimpleNamespace(all=lambda: session._fields)
            )
        return SimpleNamespace(filter=lambda *a, **k: SimpleNamespace(all=lambda: []))

    session.query = query_side_effect

    result = evaluate_form_rules(session, 1, {"1": "12"})

    assert result[1]["visible"] is True
    assert result[2]["visible"] is True
    assert result[1]["required"] is False

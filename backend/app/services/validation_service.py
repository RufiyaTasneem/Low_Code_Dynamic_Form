import re
from datetime import datetime


EMAIL_REGEX = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"


def resolve_error_msg(field, default_en, default_te):
    config = field.config or {}
    val_msg = config.get("validation_message")
    if isinstance(val_msg, dict):
        return {
            "en": val_msg.get("en") or default_en,
            "te": val_msg.get("te") or default_te
        }
    if isinstance(val_msg, str) and val_msg.strip():
        return {"en": val_msg, "te": val_msg}
    return {"en": default_en, "te": default_te}


def validate_field(field, value):
    """
    Returns a list of validation errors for one field.
    Empty list = valid.
    """

    errors = []

    config = field.config or {}
    field_type = field.type

    # -------------------------
    # Required
    # -------------------------
    if config.get("required"):
        if value is None or str(value).strip() == "":
            label_en = field.label.get("en") if isinstance(field.label, dict) else str(field.label)
            label_te = field.label.get("te") if isinstance(field.label, dict) else str(field.label)
            errors.append(resolve_error_msg(field, f"{label_en} is required.", f"{label_te} తప్పనిసరి."))
            return errors

    # Skip further validation if empty and not required
    if value is None or str(value).strip() == "":
        return errors

    # -------------------------
    # TEXT
    # -------------------------
    if field_type == "text":

        min_len = config.get("min_length")
        max_len = config.get("max_length")

        if min_len is not None and len(str(value)) < int(min_len):
            errors.append(
                resolve_error_msg(field, f"Must contain at least {min_len} characters.", f"కనీసం {min_len} అక్షరాలు ఉండాలి.")
            )

        if max_len is not None and len(str(value)) > int(max_len):
            errors.append(
                resolve_error_msg(field, f"Cannot exceed {max_len} characters.", f"గరిష్టంగా {max_len} అక్షరాలు మించకూడదు.")
            )

    # -------------------------
    # EMAIL
    # -------------------------
    elif field_type == "email":

        if not re.match(EMAIL_REGEX, str(value)):
            errors.append(resolve_error_msg(field, "Invalid email address.", "చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామాను నమోదు చేయండి."))

    # -------------------------
    # NUMBER
    # -------------------------
    elif field_type == "number":

        try:
            number = float(value)

            if config.get("min") is not None:
                if number < float(config["min"]):
                    errors.append(
                        resolve_error_msg(field, f"Must be at least {config['min']}.", f"కనీసం {config['min']} అయి ఉండాలి.")
                    )

            if config.get("max") is not None:
                if number > float(config["max"]):
                    errors.append(
                        resolve_error_msg(field, f"Cannot exceed {config['max']}.", f"గరిష్టంగా {config['max']} మించకూడదు.")
                    )

        except (ValueError, TypeError):
            errors.append(resolve_error_msg(field, "Must be a valid number.", "చెల్లుబాటు అయ్యే సంఖ్య అయి ఉండాలి."))

    # -------------------------
    # DATE
    # -------------------------
    elif field_type == "date":

        try:
            date = datetime.strptime(str(value), "%Y-%m-%d")

            if config.get("min_date"):
                min_date = datetime.strptime(
                    config["min_date"],
                    "%Y-%m-%d",
                )

                if date < min_date:
                    errors.append(
                        resolve_error_msg(field, f"Must be after {config['min_date']}.", f"{config['min_date']} తర్వాత ఉండాలి.")
                    )

            if config.get("max_date"):
                max_date = datetime.strptime(
                    config["max_date"],
                    "%Y-%m-%d",
                )

                if date > max_date:
                    errors.append(
                        resolve_error_msg(field, f"Must be before {config['max_date']}.", f"{config['max_date']} కి ముందు ఉండాలి.")
                    )

        except ValueError:
            errors.append(resolve_error_msg(field, "Invalid date.", "చెల్లుబాటు అయ్యే తేదీ అయి ఉండాలి."))

    # -------------------------
    # DROPDOWN
    # -------------------------
    elif field_type == "dropdown":

        valid_options = []
        options = config.get("options") or []

        if isinstance(options, str):
            valid_options = [
                item.strip()
                for item in options.split(",")
                if item.strip()
            ]
        elif isinstance(options, list):
            for item in options:
                if isinstance(item, dict):
                    valid_options.append(str(item.get("value") or item.get("label", {}).get("en") or ""))
                elif item is not None:
                    valid_options.append(str(item))

        print("Submitted value:", value)
        print("Valid options:", valid_options)

        if value not in valid_options:
            errors.append(
                resolve_error_msg(field, f"'{value}' is not a valid option.", f"'{value}' చెల్లుబాటు అయ్యే ఐచ్ఛికం కాదు.")
            )

    # -------------------------
    # FILE
    # -------------------------
    elif field_type == "file":
        if value is None or str(value).strip() == "":
            label_en = field.label.get("en") if isinstance(field.label, dict) else str(field.label)
            label_te = field.label.get("te") if isinstance(field.label, dict) else str(field.label)
            errors.append(resolve_error_msg(field, f"{label_en} is required.", f"{label_te} తప్పనిసరి."))
    # File extension and size are already validated
    # during upload, so nothing more to validate here.
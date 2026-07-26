import re
from datetime import datetime


EMAIL_REGEX = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"


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
            errors.append(f"{field.label} is required.")
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
                f"{field.label} must contain at least {min_len} characters."
            )

        if max_len is not None and len(str(value)) > int(max_len):
            errors.append(
                f"{field.label} cannot exceed {max_len} characters."
            )

    # -------------------------
    # EMAIL
    # -------------------------
    elif field_type == "email":

        if not re.match(EMAIL_REGEX, str(value)):
            errors.append("Invalid email address.")

    # -------------------------
    # NUMBER
    # -------------------------
    elif field_type == "number":

        try:
            number = float(value)

            if config.get("min") is not None:
                if number < float(config["min"]):
                    errors.append(
                        f"{field.label} must be at least {config['min']}."
                    )

            if config.get("max") is not None:
                if number > float(config["max"]):
                    errors.append(
                        f"{field.label} cannot exceed {config['max']}."
                    )

        except (ValueError, TypeError):
            errors.append(f"{field.label} must be a valid number.")

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
                        f"{field.label} must be after {config['min_date']}."
                    )

            if config.get("max_date"):
                max_date = datetime.strptime(
                    config["max_date"],
                    "%Y-%m-%d",
                )

                if date > max_date:
                    errors.append(
                        f"{field.label} must be before {config['max_date']}."
                    )

        except ValueError:
            errors.append("Invalid date.")

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
            valid_options = [
                str(item) for item in options if item is not None
            ]

        print("Submitted value:", value)
        print("Valid options:", valid_options)

        if value not in valid_options:
            errors.append(
                f"'{value}' is not a valid option for {field.label}."
            )

    # -------------------------
    # FILE
    # -------------------------
    elif field_type == "file":
        if value is None or str(value).strip() == "":
            errors.append(f"{field.label} is required.")
    # File extension and size are already validated
    # during upload, so nothing more to validate here.
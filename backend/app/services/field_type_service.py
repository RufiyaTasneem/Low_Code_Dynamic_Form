from app.schemas.field_types import FieldType, ConfigProperty


def get_field_types():
    return [
        FieldType(
            type="text",
            label="Text",
            config=[
                ConfigProperty(
                    name="min_length",
                    type="number",
                    label="Minimum Length"
                ),
                ConfigProperty(
                    name="max_length",
                    type="number",
                    label="Maximum Length"
                ),
                ConfigProperty(
                    name="placeholder",
                    type="text",
                    label="Placeholder"
                ),
                ConfigProperty(
                    name="validation_message",
                    type="text",
                    label="Validation Message"
                )
            ]
        ),

        FieldType(
            type="number",
            label="Number",
            config=[
                ConfigProperty(
                    name="min",
                    type="number",
                    label="Minimum Value"
                ),
                ConfigProperty(
                    name="max",
                    type="number",
                    label="Maximum Value"
                ),
                ConfigProperty(
                    name="decimal",
                    type="boolean",
                    label="Allow Decimal"
                ),
                ConfigProperty(
                    name="validation_message",
                    type="text",
                    label="Validation Message"
                )
            ]
        ),

        FieldType(
            type="email",
            label="Email",
            config=[
                ConfigProperty(
                    name="placeholder",
                    type="text",
                    label="Placeholder"
                ),
                ConfigProperty(
                    name="required",
                    type="boolean",
                    label="Required"
                ),
                ConfigProperty(
                    name="validation_message",
                    type="text",
                    label="Validation Message"
                )
            ]
        ),

        FieldType(
            type="dropdown",
            label="Dropdown",
            config=[
                ConfigProperty(
                    name="options",
                    type="list",
                    label="Options"
                ),
                ConfigProperty(
                    name="validation_message",
                    type="text",
                    label="Validation Message"
                )
            ]
        ),

        FieldType(
            type="checkbox",
            label="Checkbox",
            config=[
                ConfigProperty(
                    name="options",
                    type="list",
                    label="Options"
                ),
                ConfigProperty(
                    name="validation_message",
                    type="text",
                    label="Validation Message"
                )
            ]
        ),

        FieldType(
            type="date",
            label="Date",
            config=[
                ConfigProperty(
                    name="min_date",
                    type="date",
                    label="Minimum Date"
                ),
                ConfigProperty(
                    name="max_date",
                    type="date",
                    label="Maximum Date"
                ),
                ConfigProperty(
                    name="validation_message",
                    type="text",
                    label="Validation Message"
                )
            ]
        ),

        FieldType(
            type="file",
            label="File Upload",
            config=[
                ConfigProperty(
                    name="file_types",
                    type="list",
                    label="Allowed File Types"
                ),
                ConfigProperty(
                    name="max_size",
                    type="number",
                    label="Maximum Size (MB)"
                ),
                ConfigProperty(
                    name="validation_message",
                    type="text",
                    label="Validation Message"
                )
            ]
        ),

        FieldType(
            type="rating",
            label="Rating",
            config=[
                ConfigProperty(
                    name="max_rating",
                    type="number",
                    label="Maximum Rating"
                ),
                ConfigProperty(
                    name="validation_message",
                    type="text",
                    label="Validation Message"
                )
            ]
        )
    ]
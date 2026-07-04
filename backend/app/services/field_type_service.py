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
                )
            ]
        ),

        FieldType(
            type="email",
            label="Email",
            config=[]
        ),

        FieldType(
            type="dropdown",
            label="Dropdown",
            config=[
                ConfigProperty(
                    name="options",
                    type="list",
                    label="Options"
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
                )
            ]
        )
    ]
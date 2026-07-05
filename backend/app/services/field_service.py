def get_field_types():
    return [

        {
            "type": "text",
            "label": "Text",
            "config": [
                {
                    "name": "min_length",
                    "type": "number",
                    "label": "Minimum Length"
                },
                {
                    "name": "max_length",
                    "type": "number",
                    "label": "Maximum Length"
                },
                {
                    "name": "placeholder",
                    "type": "text",
                    "label": "Placeholder"
                },
            ],
        },

        {
            "type": "number",
            "label": "Number",
            "config": [
                {
                    "name": "min",
                    "type": "number",
                    "label": "Minimum Value"
                },
                {
                    "name": "max",
                    "type": "number",
                    "label": "Maximum Value"
                },
                {
                    "name": "decimal",
                    "type": "boolean",
                    "label": "Allow Decimal"
                },
            ],
        },

        {
            "type": "email",
            "label": "Email",
            "config": [
                {
                    "name": "placeholder",
                    "type": "text",
                    "label": "Placeholder"
                },
                {
                    "name": "required",
                    "type": "boolean",
                    "label": "Required"
                },
            ],
        },

        {
            "type": "dropdown",
            "label": "Dropdown",
            "config": [
                {
                    "name": "options",
                    "type": "list",
                    "label": "Options"
                },
            ],
        },

        {
            "type": "checkbox",
            "label": "Checkbox",
            "config": [
                {
                    "name": "options",
                    "type": "list",
                    "label": "Options"
                },
            ],
        },

        {
            "type": "date",
            "label": "Date",
            "config": [
                {
                    "name": "min_date",
                    "type": "date",
                    "label": "Minimum Date"
                },
                {
                    "name": "max_date",
                    "type": "date",
                    "label": "Maximum Date"
                },
            ],
        },

        {
            "type": "file",
            "label": "File Upload",
            "config": [
                {
                    "name": "file_types",
                    "type": "list",
                    "label": "Allowed File Types"
                },
                {
                    "name": "max_size",
                    "type": "number",
                    "label": "Maximum Size (MB)"
                },
            ],
        },

        {
            "type": "rating",
            "label": "Rating",
            "config": [
                {
                    "name": "scale",
                    "type": "number",
                    "label": "Maximum Rating"
                },
            ],
        },

    ]
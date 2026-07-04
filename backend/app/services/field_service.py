def get_field_types():

    return [

        {
            "type": "text",
            "label": "Text",
            "config": [
                {"name": "min_length", "type": "number"},
                {"name": "max_length", "type": "number"},
                {"name": "placeholder", "type": "text"},
            ],
        },

        {
            "type": "number",
            "label": "Number",
            "config": [
                {"name": "min", "type": "number"},
                {"name": "max", "type": "number"},
                {"name": "decimal", "type": "boolean"},
            ],
        },

        {
            "type": "email",
            "label": "Email",
            "config": [],
        },

        {
            "type": "dropdown",
            "label": "Dropdown",
            "config": [
                {"name": "options", "type": "list"}
            ],
        },

        {
            "type": "checkbox",
            "label": "Checkbox",
            "config": [
                {"name": "options", "type": "list"}
            ],
        },

        {
            "type": "date",
            "label": "Date",
            "config": [
                {"name": "min_date", "type": "date"},
                {"name": "max_date", "type": "date"},
            ],
        },

        {
            "type": "file",
            "label": "File Upload",
            "config": [
                {"name": "max_size", "type": "number"},
                {"name": "file_types", "type": "list"},
            ],
        },

        {
            "type": "rating",
            "label": "Rating",
            "config": [
                {"name": "scale", "type": "number"},
            ],
        },

    ]
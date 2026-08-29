import { defineField, defineType } from "sanity";

export const projectSchema = defineType({
    name: "projects",
    title: "Project",
    type: "document",
    fields: [

        defineField({
            name: "active_project",
            title: "Active Project",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "user_id",
            title: "User Id",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "client_name",
            title: "Client Name",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "client_id",
            title: "Client Id",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "project_id",
            title: "Project Id",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "project_deadline",
            title: "Project Deadline",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "project_budget",
            title: "Project Budget",
            type: "number",
            validation: rule => rule.required()
        }),

        defineField({
            name: "project_status",
            title: "Project Status",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "project_currency",
            title: "Project Currency",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "project_description",
            title: "Project Description",
            type: "string",
            validation: rule => rule.required()
        }),
    ]
})
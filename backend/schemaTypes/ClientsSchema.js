import { defineField, defineType } from "sanity";

export const ClientsSchema = defineType({
    name: "clients",
    title: "Clients",
    type: "document",
    fields: [

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
            name: "user_id",
            title: "User Id",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "client_email",
            title: "Client Email",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "client_company",
            title: "Client Company",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "billing_type",
            title: "Billing Type",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "client_rate",
            title: "Client Rate",
            type: "number",
            validation: rule => rule.required()
        }),

        defineField({
            name: "client_currency",
            title: "Client Currency",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "client_status",
            title: "Client Status",
            type: "string",
            validation: rule => rule.required()
        }),
    ]
})
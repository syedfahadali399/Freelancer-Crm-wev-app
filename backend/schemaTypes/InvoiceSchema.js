import { defineField, defineType } from "sanity";

export const invoiceSchema = defineType({
    name: "invoices",
    title: "Invoices",
    type: "document",
    fields: [

        defineField({
            name: "invoice_id",
            title: "Invoice Id",
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
            name: "project_name",
            title: "Project Name",
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
            name: "invoice_status",
            title: "Invoice Status",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "invoice_duedate",
            title: "Invoice DueDate",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "invoice_notes",
            title: "Invoice Notes",
            type: "string",
            validation: rule => rule.required()
        }),

        defineField({
            name: "invoice_amount",
            title: "Invoice Amount",
            type: "number",
            validation: rule => rule.required().min(0)
        }),

        defineField({
            name: "items",
            title: "Line Items",
            type: "array",
            of: [{
                type: "object",
                fields: [
                    defineField({
                        name: "description",
                        title: "Description",
                        type: "string",
                        validation: rule => rule.required()
                    }),
                    defineField({
                        name: "qty",
                        title: "Quantity",
                        type: "number",
                        validation: rule => rule.required().min(1)
                    }),
                    defineField({
                        name: "price",
                        title: "Price",
                        type: "number",
                        validation: rule => rule.required().min(0)
                    }),
                    defineField({
                        name: "amount",
                        title: "Amount",
                        type: "number",
                        validation: rule => rule.required().min(0)
                    })
                ]
            }],
            validation: rule => rule.required().min(1)
        })
    ]
})
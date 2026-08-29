import {defineField, defineType} from 'sanity'

export const userSchema = defineType({
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
   
    defineField({
      name: 'fullname',
      title: "Fullname",
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    
    defineField({
      name: 'id',
      title: "Id",
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: rule => rule.required(),
    }),

    defineField({
      name: "password",
      title: "Password",
      type: "string",
      validation: rule => rule.required()
    }),

    defineField({
      name: 'clients',
      title: 'Clients',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'clients' }] }],
    }),

    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      of: [{ type: "reference", to: [{ type: 'projects' }] }],
    })
    
  ],
})
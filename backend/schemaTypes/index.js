import { ClientsSchema } from "./ClientsSchema";
import { invoiceSchema } from "./InvoiceSchema";
import { projectSchema } from "./ProjectSchema";
import { userSchema } from "./UserSchema";

export const schemaTypes = [userSchema, ClientsSchema, projectSchema, invoiceSchema]

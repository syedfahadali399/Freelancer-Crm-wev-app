import { X, ChevronDown, Calendar, Plus, Trash2, Send } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { client } from "../sanityClient";
import { toast } from "react-toastify";

const AddInvoice = () => {

  const { id } = useParams();
  
  const [invoiceId, setInvoiceId] = useState(0)
  const [disableSubmitBtn, setDisableSubmitBtn] = useState(true)
  const [changeSubmitBtnText, setChangeSubmitBtnText] = useState("Send Invoice")

  const {
    control,
    reset,
    watch,
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      selectClient: "",
      selectProjectId: "",
      invoiceStatus: "",
      dueDate: "",
      items: [{
        description: "",
        qty: 1,
        price: "0.00"
      }],
      notes: "",
      totalAmount: ""
    },
    mode: "onBlur"
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const itemsWatch = watch("items")

  const invoiceSubtotal = (itemsWatch || []).reduce((sum, item) => {
    const qty = item?.qty || 0
    const price = item?.price || 0
    return sum + qty * price
  }, 0)

  const invoiceTotal = invoiceSubtotal
  const taxAmount = invoiceTotal * (8 / 100)
  const invoiceAfterTax = invoiceTotal + taxAmount
  setValue("totalAmount", invoiceAfterTax)

  const multiplesValues = getValues(["selectClient", "selectProjectId", "invoiceStatus", "dueDate", "items", "notes", "totalAmount"])
  const [selectProjectIdWatch, invoiceStatusWatch, dueDateWatch, notesWatch] = watch(["selectProjectId", "invoiceStatus", "dueDate", "notes"])

  const { data: userList = [] } = useQuery({
    queryKey: ["userlist"],
    queryFn: async () => {
      const response = await client.fetch(`*[_type == "user"]`);
      return response;
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500,
  })

  const { data: clientList = [] } = useQuery({
    queryKey: ["clientlist"],
    queryFn: async () => {
      const response = await client.fetch(`*[_type == "clients"]`);
      return response;
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500,
  })

  const { data: projectList = [] } = useQuery({
    queryKey: ["projectlist"],
    queryFn: async () => {
      const response = await client.fetch(`*[_type == "projects"]`);
      return response;
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500,
  })

  const findUser = userList?.find((user) => user?.id === id)
  const findClients = clientList?.filter((client) => client?.user_id === findUser?.id)
  const findClient = clientList?.find((client) => client?.client_id === getValues("selectClient"))
  const findProjects = projectList?.filter((project) => project?.client_id === findClient?.client_id)

  useEffect(() => {
    if(multiplesValues.some((value) => value === "")) {
      setDisableSubmitBtn(true)
    } else {
      setDisableSubmitBtn(false)
    }
  }, [multiplesValues])

  const handleUserInvoice = () => {

    if(multiplesValues.some((value) => value === "")) {
      setDisableSubmitBtn(true)
      return
    }

    setDisableSubmitBtn(true)
    setInvoiceId(prev => prev + 1)
    setChangeSubmitBtnText("Creating Invoice")
    
    const invoiceName = `IN#V${invoiceId}`
    const totalAmountWatch = watch("totalAmount")

    const invoiceItems = (itemsWatch || []).map((item) => ({
      description: item.description,
      qty: item.qty || 0,
      price: item.price || 0,
      amount: item.qty || 0 * item.price || 0
    }))

    const findProjectName = projectList?.find((project) => project?.project_id === selectProjectIdWatch)

    const sanityData = {
      _type: 'invoices',
      user_id: id,
      invoice_id: invoiceName,
      client_name: findClient?.client_name,
      client_id: findClient?.client_id,
      project_name: findProjectName?.active_project,
      project_id: findProjectName?.project_id,
      invoice_status: invoiceStatusWatch,
      invoice_duedate: dueDateWatch,
      items: invoiceItems,
      invoice_notes: notesWatch,
      invoice_amount: totalAmountWatch
    }

    postInvoiceData.mutate(sanityData)

  }

  const postInvoiceData = useMutation({
    mutationFn: async (invoiceData) => {
      await client.create(invoiceData)
    },
    onSuccess: () => {
      reset()
      setDisableSubmitBtn(true)
      setChangeSubmitBtnText("Create Invoice")
      toast.success("Successfully create the invoice")
    },

    onError: () => {
      setDisableSubmitBtn(false)
      setChangeSubmitBtnText("Create Invoice")
      toast.error("Failed to create Invoice. Try again!")
    }
  })

  return (
    <>
      <main className="flex-1 p-4 lg:p-8 flex justify-center items-start">
        <div className="w-full max-w-4xl bg-white rounded-xl border border-[#c5c6cd]/30 shadow-[0_4px_20px_rgba(9,20,38,0.06)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#c5c6cd]/20 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#091426]">
                Create New Invoice
              </h2>
              <p className="text-sm text-[#45474c] mt-0.5">
                Generate a professional invoice for your client.
              </p>
            </div>
            <Link to={`/dashboard/invoices/${id}`} className="text-[#45474c] hover:text-[#091426] p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} />
            </Link>
          </div>

          <div className="p-6 lg:p-8 space-y-10">

            <form className="space-y-10" onSubmit={handleSubmit(handleUserInvoice)}>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2">
                <label className="text-xs font-bold text-[#45474c] uppercase tracking-wider">
                  Client
                </label>
                <div className="relative">
                  <select 
                    {...register("selectClient", {
                      required: "Client is required"
                    })}
                    required
                    id="client"
                    value={watch("selectClient")}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#c5c6cd] rounded-lg text-sm text-[#091426] appearance-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] outline-none transition-all cursor-pointer"
                  >
                    <option value={""}>Select Client</option>
                    {findClients?.map((client, idx) => {
                      return(
                        <option key={idx} value={`${client?.client_id}`}>{client?.client_name}</option>
                      )
                    })}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none"
                  />
                  {errors.selectClient && <p className="text-xs text-red-500 mt-1">{errors.selectClient.message}</p>}
                </div>
              </div>

              {getValues("selectClient") !== ""? (

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#45474c] uppercase tracking-wider">
                    Select Project
                  </label>
                  <div className="relative">
                    <select 
                      {...register("selectProjectId", {
                        required: "Project is required"
                      })}
                      required
                      id="project"
                      value={watch("selectProjectId")}
                      className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#c5c6cd] rounded-lg text-sm text-[#091426] appearance-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] outline-none transition-all cursor-pointer"
                    >
                      <option value={""}>Select Project</option>
                      {findProjects?.map((project, idx) => {
                        return(
                          <option key={idx} value={`${project?.project_id}`}>{project?.active_project}</option>
                        )
                      })}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none"
                    />
                   {errors.selectProject && <p className="text-xs text-red-500 mt-1">{errors.selectProject.message}</p>}
                  </div>
                </div>
                ) : (
                  null
                )
              }

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#45474c] uppercase tracking-wider">
                  Invoice Status
                </label>
                <div className="relative">
                  <select 
                    {...register("invoiceStatus", {
                      required: "Invoice status is required"
                    })}
                    required
                    id="status"
                    value={watch("invoiceStatus")}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#c5c6cd] rounded-lg text-sm text-[#091426] appearance-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] outline-none transition-all cursor-pointer"
                  >
                    <option value={""}>Select Status</option>
                    <option value={"paid"}>Paid</option>
                    <option value={"pending"}>Pending</option>
                    <option value={"overdue"}>Overdue</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none"
                  />
                  {errors.invoiceStatus && <p className="text-xs text-red-500 mt-1">{errors.invoiceStatus.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#45474c] uppercase tracking-wider">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45474c]"
                  />
                  <input
                    {...register("dueDate", {
                      required: "Please select a deadline for this invoice",
                      validate: {
                        notPast: (value) => {
                          const selectedDate = new Date(value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return selectedDate >= today || "Deadline cannot be in the past";
                        }
                      }
                    })}
                    required
                    type="date"
                    id="deadline"
                    className="w-full pl-10 pr-4 py-2.5 border border-[#c5c6cd] rounded-lg text-sm text-[#091426] focus:ring-2 focus:ring-[#4b41e1]/20 outline-none"
                  />
                  {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-bold text-[#45474c] uppercase tracking-widest border-b border-gray-100 pb-2">
                Line Items
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full min-w-175">
                  <thead>
                    <tr className="text-left text-xs font-bold text-[#45474c] uppercase tracking-wider">
                      <th className="pb-3 pr-4 w-1/2">Description</th>
                      <th className="pb-3 px-4 text-center">Qty</th>
                      <th className="pb-3 px-4 text-right">Price</th>
                      <th className="pb-3 px-4 text-right">Amount</th>
                      <th className="pb-3 pl-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fields.map((field, index) => {
                      const qty = itemsWatch?.[index]?.qty || 0
                      const price = itemsWatch?.[index]?.price || 0
                      const amount = (qty * price).toFixed(2)

                      return (
                        <tr className="group" key={field.id}>
                          <td className="py-4 pr-4">
                            <input
                              {...register(`items.${index}.description`)}
                              type="text"
                              required
                              placeholder="Item name or description"
                              className="w-full px-4 py-2 bg-[#f8fafc] border border-transparent rounded-lg text-sm focus:bg-white focus:border-[#c5c6cd] outline-none"
                            />
                            {errors.items?.[index]?.description && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors.items[index].description.message}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <input
                              {...register(`items.${index}.qty`, {
                                valueAsNumber: true,
                                min: { value: 1, message: "Quantity must be at least 1" }
                              })}
                              required
                              type="number"
                              placeholder="1"
                              className="w-20 mx-auto px-2 py-2 bg-[#f8fafc] border border-transparent rounded-lg text-sm text-center focus:bg-white focus:border-[#c5c6cd] outline-none"
                            />
                            {errors.items?.[index]?.qty && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors.items[index].qty.message}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <input
                              {...register(`items.${index}.price`, {
                                required: "Price is required",
                                valueAsNumber: true,
                                min: { value: 0, message: "Price must be 0 or more" }
                              })}
                              required
                              type="number"
                              placeholder="0.00"
                              className="w-32 ml-auto px-4 py-2 bg-[#f8fafc] border border-transparent rounded-lg text-sm text-right focus:bg-white focus:border-[#c5c6cd] outline-none"
                            />
                            {errors.items?.[index]?.price && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors.items[index].price.message}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right text-sm font-bold text-[#091426]">
                            ${amount}
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-[#ba1a1a] p-1.5 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => append({ description: "", qty: 1, price: 0 })}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#c5c6cd] rounded-lg text-xs font-bold text-[#45474c] hover:border-[#4b41e1] hover:text-[#4b41e1] transition-all w-full justify-center"
              >
                <Plus size={16} />
                Add Line Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#45474c] uppercase tracking-wider">
                  Internal Notes & Terms
                </label>
                <textarea
                  {...register("notes", {
                    required: "Notes is required",
                    minLength: { value: 10, message: "Must be atleast 10+ characters"},
                    maxLength: { value: 100, message: "Use below 100 characters"}
                  })}
                  rows="5"
                  required
                  placeholder="Enter payment terms, scope notes, or internal references here..."
                  className="w-full px-4 py-3 border border-[#c5c6cd] rounded-xl text-sm focus:ring-2 focus:ring-[#4b41e1]/20 outline-none resize-none bg-[#f8fafc] focus:bg-white transition-all"
                ></textarea>
                {errors.notes && <p className="text-xs text-red-600">{errors.notes.message}</p>}
              </div>

              <div className="bg-[#f8fafc] rounded-xl p-6 space-y-4 border border-[#c5c6cd]/20">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#45474c]">Subtotal</span>
                  <span className="font-bold text-[#091426]">${invoiceTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#45474c]">Tax (8%)</span>
                  <span className="font-bold text-[#091426]">${taxAmount}</span>
                </div>
                <div className="h-px bg-[#c5c6cd]/30 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-[#091426]">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-[#4b41e1]">
                    ${invoiceAfterTax.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 bg-[#f8fafc] border-t border-[#c5c6cd]/20 flex items-center justify-end gap-3">
              <button type="button" onClick={() => reset()} className="px-6 cursor-pointer py-2.5 text-sm font-bold text-[#091426] bg-white border border-[#c5c6cd] rounded-lg hover:bg-gray-50 transition-colors">
                Reset
              </button>
              <button type="submit" disabled={disableSubmitBtn || postInvoiceData.isPending || postInvoiceData.isLoading} className={`${(disableSubmitBtn || postInvoiceData.isPending || postInvoiceData.isLoading)? "bg-gray-600 cursor-not-allowed" : "bg-[#4b41e1] hover:bg-[#3323cc] cursor-pointer" } flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg shadow-[0_4px_12px_rgba(75,65,225,0.25)] transition-all active:scale-[0.98] `}>
                <Send size={18} />
                {(postInvoiceData.isPending || postInvoiceData.isLoading) ? "Creating..." : changeSubmitBtnText}
              </button>
            </div>
            </form>

          </div>
        </div>
      </main>
    </>
  );
};

export default AddInvoice;

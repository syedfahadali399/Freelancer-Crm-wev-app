import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { X, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { client } from '../sanityClient';
import { toast } from 'react-toastify';

const AddClient = () => {

  const { id } = useParams()

  const [disableSubmitBtn, setDisableSubmitBtn] = useState(true)
  const [submitBtnText, setSubmitBtnText] = useState("Add Client")

  const {
    watch,
    reset,
    register,
    getValues,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientCompanyName: "",
      billingType: "fixedRate",
      clientRate: "",
      clientCurrency: "",
      clientStatus: ""
    },
    mode: "onBlur"
  })

  const multipleValues = getValues(["clientName", "clientEmail", "clientCompanyName", "billingType", "clientRate", "clientCurrency", "clientStatus"])
  const [clientNameWatch, clientEmailWatch, clientCompanyWatch, billingTypeWatch, clientRateWatch, clientCurrencyWatch, clientStatusWatch] = watch(["clientName", "clientEmail", "clientCompanyName", "billingType", "clientRate", "clientCurrency", "clientStatus"])

  const { data: userData = [] } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      const response = await client.fetch(`*[_type == "user"]`)
      return response
    },
    staleTime: 6000,
    gcTime: 6000,
    retry: 3,
    retryDelay: 1500
  })

  const findCurrentUser = userData?.find((user) => user?.id === id)

  useEffect(() => {
    if(multipleValues.some((value) => value === "")) {
      setDisableSubmitBtn(true)
    } else [
      setDisableSubmitBtn(false)
    ]
  }, [multipleValues])

  const handleUserClientInfo = () => {
    
    try {
      
      if(multipleValues.some((value) => value === "")) {
        toast.error("kindly fill all the details first")
        return
      }

      setDisableSubmitBtn(true)
      setSubmitBtnText("Adding Client")

      const randomId = crypto.randomUUID()
      const sanityData = {
        _type: "clients",
        client_name: clientNameWatch,
        client_id:  randomId,
        user_id: id,
        client_email: clientEmailWatch,
        client_company: clientCompanyWatch,
        billing_type: billingTypeWatch,
        client_rate: clientRateWatch,
        client_currency: clientCurrencyWatch,
        client_status: clientStatusWatch
      }

      postClientData.mutate({ sanityData, userId: findCurrentUser?._id})

    } catch (error) {
      console.error(error)
      toast.error("Failed to add client Detail. Try again!")
    }
    
  }

  const postClientData = useMutation({

    mutationFn: async ({ sanityData, userId }) => {

      const newClient = await client.create(sanityData)

      const currentUser = await client.fetch(
        `*[_type == "user" && _id == $userId][0]{ clients }`,
        { userId }
      )
      const existingClients = currentUser?.clients || [];

      await client
        .patch(userId)
        .set({
          clients: [
            ...existingClients,
            {
              _key: crypto.randomUUID(),
              _type: "reference",
              _ref: newClient._id,
            },
          ],
        })
        .commit();
    },
    onSuccess: () => {
      toast.success("Successfully added client")
      setSubmitBtnText("Add Client")
      reset()
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to add client Info. Try again!")
      setSubmitBtnText("Add Client")
    }

  })

  return (
    <>
      <main className="flex-1 p-6 lg:p-10 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-white rounded-xl border border-[#F1F5F9] shadow-[0_4px_12px_rgba(9,20,38,0.05)] overflow-hidden">
          
          <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#191c1e]">Add New Client</h2>
              <p className="text-sm text-[#45474c] mt-1">Enter client details to create a new profile.</p>
            </div>
            <Link to={`/dashboard/clients/${id}`} className="text-[#45474c] hover:text-[#191c1e] transition-colors p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </Link>
          </div>

          <div className="p-6">
            <form className="space-y-8" onSubmit={handleSubmit(handleUserClientInfo)}>
              
              <div className="space-y-5">
                <h3 className="text-[11px] font-bold text-[#191c1e] uppercase tracking-wider border-b border-gray-100 pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fullName" className="text-xs font-medium text-[#45474c]">
                      Full Name <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input 
                      {...register("clientName", {
                        required: "Client Name is required",
                        minLength: { value: 2, message: "Client name must be atleast 2 characters long" }
                      })}
                      type="text" 
                      id="fullName"
                      placeholder="Jane Doe"
                      required
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#191c1e] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                    />
                    {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-medium text-[#45474c]">
                      Email Address <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input 
                      {...register("clientEmail", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address"
                        }
                      })}
                      id="email"
                      type="email" 
                      placeholder="jane@example.com"
                      required
                      className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#191c1e] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                    />
                   {errors.clientEmail && <p className="text-xs text-red-500 mt-1">{errors.clientEmail.message}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="companyName" className="text-xs font-medium text-[#45474c]">
                    Company Name
                  </label>
                  <input 
                    {...register("clientCompanyName", {
                      reqiured: "Company name is required",
                      minLength: { value: 2, message: "Company name must be at least 2 characters" }
                    })}
                    type="text" 
                    id="companyName"
                    required
                    placeholder="Acme Corp"
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#191c1e] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                  />
                 {errors.clientCompanyName && <p className="text-xs text-red-500 mt-1">{errors.clientCompanyName.message}</p>}
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-[11px] font-bold text-[#191c1e] uppercase tracking-wider border-b border-gray-100 pb-2">
                  Billing Details
                </h3>
                <div className="space-y-3">
                  <span className="text-xs font-medium text-[#45474c] mb-2">Billing Type</span>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        {...register("billingType", {
                          required: "Billing type is required"
                        })}
                        type="radio" 
                        value={"hourlyRate"}
                        checked={billingTypeWatch === "hourlyRate"}
                        className="w-4 h-4 text-[#4b41e1] border-[#CBD5E1] focus:ring-[#4b41e1]/20" 
                      />
                      <span className="text-sm text-[#191c1e]">Hourly Rate</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        {...register("billingType", {
                          required: "Billing type is required"
                        })}
                        type="radio" 
                        value={"fixedRate"}
                        checked={billingTypeWatch === "fixedRate"}
                        className="w-4 h-4 text-[#4b41e1] border-[#CBD5E1] focus:ring-[#4b41e1]/20" 

                      />
                      <span className="text-sm text-[#191c1e]">Fixed Project</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="rate" className="text-xs font-medium text-[#45474c]">{billingTypeWatch === "fixedRate"? "Fixed Rate" : "Hourly Rate" }</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
                      <input 
                        {...register("clientRate", {
                          required: "Rate is required",
                          min: { value: 0, message: "Rate must be a positive number" },
                          valueAsNumber: true
                        })}
                        id="rate"
                        type="number" 
                        required
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
                      />
                      {errors.clientRate && <p className="text-xs text-red-500 mt-1">{errors.clientRate.message}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="currency" className="text-xs font-medium text-[#45474c]">Currency</label>
                    <div className="relative">
                      <select 
                        {...register("clientCurrency", {
                          required: "Currency is required"
                        })}
                        id="currency"
                        required
                        value={watch("clientCurrency")}
                        className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#191c1e] appearance-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all cursor-pointer"
                      >
                        <option value={""}>select currency</option>
                        <option value={"pkr"}>PKR - Pakistani Rupee</option>
                        <option value={"usd"}>USD - US Dollar</option>
                        <option value={"eur"}>EUR - Euro</option>
                        <option value={"gbp"}>GBP - British Pound</option>
                        <option value={"jpy"}>JPY - Japanese Yen</option>
                        <option value={"aud"}>AUD - Australian Dollar</option>
                        <option value={"cad"}>CAD - Canadian Dollar</option>
                        <option value={"chf"}>CHF - Swiss Franc</option>  
                        <option value={"cny"}>CNY - Chinese Yuan</option>
                        <option value={"inr"}>INR - Indian Rupee</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none" />
                    </div>
                    {errors.clientCurrency && <p className="text-xs text-red-500 mt-1">{errors.clientCurrency.message}</p>}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col gap-1.5">
                <label htmlFor="status" className="text-xs font-medium text-[#45474c]">Client Status</label>
                <div className="relative">
                  <select 
                    {...register("clientStatus", {
                      required: "Client status is required"
                    })}
                    id="status"
                    required
                    value={watch("clientStatus")}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#191c1e] appearance-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all cursor-pointer"
                  >
                    <option value={""}>select status</option>
                    <option value={"active"}>Active</option>
                    <option value={"inactive"}>Inactive</option>
                    <option value={"on-hold"}>On Hold</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none" />
                </div>
                {errors.clientStatus && <p className="text-xs text-red-500 mt-1">{errors.clientStatus.message}</p>}
              </div>

              <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#F1F5F9] flex items-center justify-end gap-3">
                <button onClick={() => reset()} className="px-5 py-2 text-sm font-semibold text-[#091426] bg-white border border-[#CBD5E1] rounded-lg hover:bg-gray-50 transition-colors">
                  Reset
                </button>
                <button type='submit' disabled={disableSubmitBtn || postClientData.isPending || postClientData.isLoading} className={` ${(disableSubmitBtn || postClientData.isPending || postClientData.isLoading)? "bg-gray-600 cursor-not-allowed": "bg-[#4F46E5] hover:bg-[#4338CA] cursor-pointer" } px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all active:scale-[0.98]`} > 
                  {(postClientData.isPending || postClientData.isLoading) ? "Adding..." : submitBtnText}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default AddClient;
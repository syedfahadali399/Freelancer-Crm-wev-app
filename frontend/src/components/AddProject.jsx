import { X, ChevronDown, Calendar, DollarSign, Rocket } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { client } from '../sanityClient';
import { toast } from 'react-toastify';

const AddProject = () => {

  const { id } = useParams();

  const [submitBtnText, setSubmitBtnText] = useState("Create Project")
  const [disableSubmitBtn, setDisableSubmitBtn] = useState(true)

  const {
    reset,
    register,
    watch,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      activeProject: "",
      selectClient: "",
      deadline: "",
      totalBudget: "",
      projectStatus: "",
      projectCurrency: "",
      projectDescription: ""
    },
    mode: "onBlur"
  })

  const multipleValues = getValues(["activeProject", "selectClient", "deadline", "totalBudget", "projectStatus", "projectCurrency", "projectDescription"])
  const [activeProjectWatch, selectClientWatch, deadlineWatch, totalBudgetWatch, projectStatusWatch ,projectCurrencyWatch, projectDescriptionWatch] = watch(["activeProject", "selectClient", "deadline", "totalBudget", "projectStatus", "projectCurrency", "projectDescription"])
  
  const { data: userList = [] } = useQuery({
    queryKey: ["userdata"],
    queryFn: async () => {
      const response = await client.fetch(`*[_type == "user"]`)
      return response
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500
  })

  const { data: clientList = [] } = useQuery({
    queryKey: ["clientdata"],
    queryFn: async () => {
      const response = await client.fetch(`*[_type == "clients"]`)
      return response
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500
  })

  const findUserClients = clientList?.filter((client) => client?.user_id === id)

  useEffect(() => {
    if(multipleValues.some((value) => value === "")) {
      setDisableSubmitBtn(true)
    } else {
      setDisableSubmitBtn(false)
    }
  }, [multipleValues])

  const handleAddProject = () => {

    if(multipleValues.some((value) => value === "")) {
      toast.error("Kindly fill all the fields.")
      return
    } 
    
    setSubmitBtnText("Creating Project")
    setDisableSubmitBtn(true)

    const findUserId = userList?.find((user) => user?.id === id)
    const findSpecificClientId = findUserClients?.find((client) => client?.client_name === selectClientWatch)

    const randomID = crypto.randomUUID()
    const sanityData = {
      _type: "projects",
      active_project: activeProjectWatch,
      user_id: id,
      client_name: selectClientWatch,
      client_id: findSpecificClientId?.client_id,
      project_id: randomID,
      project_deadline: deadlineWatch,
      project_budget: totalBudgetWatch,
      project_status: projectStatusWatch,
      project_currency: projectCurrencyWatch,
      project_description: projectDescriptionWatch
    }

    postProjectData.mutate({ sanityData, userId: findUserId?._id})
  }

  const postProjectData = useMutation({
    mutationFn: async ({ sanityData: projectData, userId }) => {

      const newProject = await client.create(projectData)

      const currentUser = await client.fetch(`*[_type == "user" && _id == $userId][0]{ projects }`, { userId })
      const existingProjects = currentUser?.projects || []

      await client.patch(userId)
      .set({
        projects: [
          ...existingProjects,
          {
            _key: crypto.randomUUID(),
            _type: "reference",
            _ref: newProject._id,
          }
        ]
      })
      .commit()
    },
    onSuccess: () => {
      toast.success("Successfully added the project!")
      setSubmitBtnText("Create Project")
      setDisableSubmitBtn(true)
      reset()
    },
    onError: () => {
      toast.error("Failed to add project. Try again!")
      setDisableSubmitBtn(false)
      setSubmitBtnText("Create Project")
    }
  })

  return (
    <>
      <main className="flex-1 p-4 lg:p-10 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-white rounded-xl border border-[#c5c6cd]/30 shadow-[0_4px_20px_rgba(9,20,38,0.06)] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#c5c6cd]/20 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#091426]">Add New Project</h2>
              <p className="text-sm text-[#45474c] mt-0.5">Define the scope and timeline for your work.</p>
            </div>
            <Link to={`/dashboard/active-projects/${id}`} className="text-[#45474c] hover:text-[#091426] transition-colors p-2 rounded-full hover:bg-gray-100">
              <X size={20} />
            </Link>
          </div>

          <div className="p-6 lg:p-8">
            <form className="space-y-8" onSubmit={handleSubmit(handleAddProject)}>
              
              <div className="space-y-5">
                <h3 className="text-[11px] font-bold text-[#45474c] uppercase tracking-widest border-b border-gray-100 pb-2">
                  Project Details
                </h3>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="projectName" className="text-xs font-semibold text-[#091426]">
                    Project Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input 
                    {...register("activeProject", {
                      required: "Project name is required",
                      minLength: { value: 3, message: "Project name must be at least 3 characters" },
                      maxLength: { value: 50, message: "Project name cannot exceed 50 characters" }
                    })}
                    required
                    type="text" 
                    id="projectName"
                    placeholder="e.g., Marketing Website Redesign"
                    className="w-full px-4 py-2.5 bg-white border border-[#c5c6cd] rounded-lg text-sm text-[#091426] focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] outline-none transition-all"
                  />
                 {errors.activeProject && <p className="text-xs text-red-500">{errors.activeProject.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="client" className="text-xs font-semibold text-[#091426]">Select Client</label>
                  <div className="relative">
                    <select 
                      {...register("selectClient", {
                        required: "Please select a client for this project"
                      })}
                      required
                      id="client"
                      value={watch("selectClient")}
                      className="w-full px-4 py-2.5 bg-white border border-[#c5c6cd] rounded-lg text-sm text-[#091426] appearance-none focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] outline-none transition-all cursor-pointer"
                    >
                      <option value="">Select a client...</option>
                      {findUserClients?.map((client, idx) => {
                        return (
                          <option key={idx} value={`${client?.client_name}`}>{client?.client_name}</option>
                        )
                      })}
                    </select>
                    <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none" />
                  </div>
                 {errors.selectClient && <p className="text-xs text-red-500">{errors.selectClient.message}</p>}
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-[11px] font-bold text-[#45474c] uppercase tracking-widest border-b border-gray-100 pb-2">
                  Timeline & Budget
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="deadline" className="text-xs font-semibold text-[#091426]">Deadline</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45474c]" />
                      <input 
                        {...register("deadline", {
                          required: "Please select a deadline for this project",
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
                        id="deadline"
                        type="date" 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c5c6cd] rounded-lg text-sm text-[#091426] focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] outline-none transition-all"
                      />
                    </div>
                    {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="budget" className="text-xs font-semibold text-[#091426]">Total Budget</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45474c]" />
                      <input 
                        {...register("totalBudget", {
                          required: "Please enter the total budget for this project",
                          min: { value: 0, message: "Budget cannot be negative" },
                          max: { value: 10000000, message: "Budget cannot exceed $10 million" },
                          valueAsNumber: true
                        })}
                        required
                        id="budget"
                        type="number" 
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#c5c6cd] rounded-lg text-sm text-[#091426] focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] outline-none transition-all"
                      />
                    </div>
                    {errors.totalBudget && <p className="text-xs text-red-500 mt-1">{errors.totalBudget.message}</p>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="status" className="text-xs font-medium text-[#45474c]">Status</label>
                <div className="relative">
                  <select 
                    {...register("projectStatus", {
                      required: "Project status is required"
                    })}
                    id="status"
                    required
                    value={watch("projectStatus")}
                    className="w-full px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#191c1e] appearance-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all cursor-pointer"
                  >
                    <option value={""}>select status</option>
                    <option value={"on Track"}>On Track</option>
                    <option value={"on Pending"}>On Pending</option>
                    <option value={"on Risk"}>On Risk</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none" />
                </div>
                {errors.projectStatus && <p className="text-xs text-red-500 mt-1">{errors.projectStatus.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="currency" className="text-xs font-medium text-[#45474c]">Currency</label>
                <div className="relative">
                  <select 
                    {...register("projectCurrency", {
                      required: "Currency is required"
                    })}
                    id="currency"
                    required
                    value={watch("projectCurrency")}
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
                {errors.projectCurrency && <p className="text-xs text-red-500 mt-1">{errors.projectCurrency.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-semibold text-[#091426]">Project Description</label>
                <textarea 
                  {...register("projectDescription", {
                    required: "Please provide a description for this project",
                    minLength: { value: 10, message: "Description must be at least 10 characters" },
                    maxLength: { value: 2000, message: "Description cannot exceed 2000 characters" }
                  } )}
                  required
                  rows="4"
                  id="description"
                  placeholder="Outline the scope, deliverables, and any key notes..."
                  className="w-full px-4 py-3 bg-white border border-[#c5c6cd] rounded-lg text-sm text-[#091426] focus:ring-2 focus:ring-[#4b41e1]/20 focus:border-[#4b41e1] outline-none transition-all resize-none"
                />
              {errors.projectDescription && <p className="text-xs text-red-500 mt-1">{errors.projectDescription.message}</p>}
              </div>

              <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#c5c6cd]/20 flex items-center justify-end gap-3">
                <button type='button' onClick={() => reset()} className="px-5 py-2.5 text-sm font-bold text-[#091426] bg-white border border-[#c5c6cd] rounded-lg hover:bg-gray-50 transition-colors">
                  Reset
                </button>
                <button type='submit' disabled={disableSubmitBtn || postProjectData.isPending || postProjectData.isLoading} className={` ${(disableSubmitBtn || postProjectData.isPending || postProjectData.isLoading)? "bg-gray-600 cursor-not-allowed" : "bg-[#4b41e1] hover:bg-[#3323cc] cursor-pointer" } flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-lg  shadow-[0_2px_8px_rgba(75,65,225,0.25)] transition-all active:scale-[0.98]`}>
                  <Rocket size={18} />
                  {(postProjectData.isPending || postProjectData.isLoading) ? "Creating..." : submitBtnText}
               </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default AddProject
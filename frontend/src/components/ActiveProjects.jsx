import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import { toast } from 'react-toastify';

const ActiveProjects = () => {

  const { id } = useParams();
  const queryClient = useQueryClient()

  const status = ["All", "on Track", "on Pending", "on Risk"]

  const [prevIndex, setPrevIndex] = useState(1)
  const [nextIndex, setNextIndex] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPage, setCalculatePage] = useState(null)
  const [searchProject, setSearchProject] = useState("")
  const [currentStatus, setCurrentStatus] = useState("All")
  const [deleteProjectId, setDeleteProjectId] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteProjectId2, setDeleteProjectId2] = useState(null)
  const [disableNextIndexBtn, setDisableNextIndexBtn] = useState(true)
  const [disablePrevIndexBtn, setDisablePrevIndexBtn] = useState(true)

  const { data: projectList = [] } = useQuery({
    queryKey: ["projectData", id, currentStatus, searchProject],
    queryFn: async () => {
      try {
        let query = `*[_type == "projects" && user_id == $user_id`
        const params = { user_id: id } 
        
        if(currentStatus !== "All") {
          query += `&& project_status == $project_status`
          params.project_status = currentStatus
        }

        if(searchProject.trim() !== "" && searchProject) {
          query += `&& active_project match $search`
          params.search = `${searchProject.trim()}`
        }
        
        query += `]`
  
        const response = await client.fetch(query, params)
        return response || [];
      } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
      }
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500,
    enabled: true
  })

  const handlePrevBtn = () => {
    setCurrentPage(prev => prev - 1)
    setPrevIndex(prev => prev - 5)
    setNextIndex(prev => prev - 10)
    setDisableNextIndexBtn(false)
  }

  const handleNextBtn = () => {
    setCurrentPage(prev => prev + 1)
    setPrevIndex(prev => prev + 5)
    setNextIndex(prev => prev + 10)
    setDisablePrevIndexBtn(false)
  }

  useEffect(() => {

    const calculatePages = projectList?.length / 5
    setCalculatePage(calculatePages)

    if(nextIndex >= projectList?.length) {
      setDisableNextIndexBtn(true)
    } else {
      setDisableNextIndexBtn(false)
    }

    if(prevIndex === 1) {
      setDisablePrevIndexBtn(true)
    }

  }, [prevIndex, nextIndex, projectList])

  const deleteProject = useMutation({
    mutationFn: async ({ projectId, projectIdForInvoice }) => {

      // Step 1: Fetch both published and draft invoices related to this project
      const relatedInvoices = await client.fetch(
        `*[_type == "invoices" && project_id == $projectIdForInvoice]`,
        { projectIdForInvoice }
      )
      
      // Step 2: Delete all related invoice versions (published and drafts)
      if (relatedInvoices && relatedInvoices.length > 0) {
        const deleteTransactions = relatedInvoices.map(invoice => 
          client.delete(invoice._id)
        )
        await Promise.all(deleteTransactions)
      }

      // Step 3: Remove project reference from user's projects array
      const user = await client.fetch(`*[_type == "user" && id == $userId][0]`, { userId: id })
      if (user && user.projects) {
        const updatedProjects = user.projects.filter(proj => proj._ref !== projectId)
        await client.patch(user._id).set({ projects: updatedProjects }).commit()
      }
      
      return client.delete(projectId)
    },
    onSuccess: () => {
      setDeleteModalOpen(false)
      setDeleteProjectId(null)
      setDeleteProjectId2(null)
      toast.success("Successfully deleted the project")
      queryClient.invalidateQueries(["projectData", searchProject, currentStatus])
    },

    onError: (error) => {
      setDeleteModalOpen(false)
      toast.error(`Failed to delete. Try again`, error)
    }
  })

  return (
    <>
      <main className="p-6 lg:p-8 pt-20 lg:pt-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#091426] tracking-tight">Active Projects</h1>
            <p className="text-sm sm:text-sm text-[#45474c] mt-1">Manage and track your ongoing client work.</p>
          </div>
          <Link to={`/dashboard/active-projects/add-project/${id}`} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4b41e1] text-white font-bold rounded-lg hover:bg-[#3323cc] shadow-md transition-all active:scale-[0.98]">
            <Plus size={18} />
            Create Project
          </Link>
        </div>

        <div className="bg-white border border-[#c5c6cd]/30 rounded-xl shadow-sm overflow-hidden">
          
          <div className="p-5 border-b border-[#c5c6cd]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative w-full max-w-md group">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45474c] group-focus-within:text-[#4b41e1] transition-colors" />
              <input 
                type="text" 
                value={searchProject}
                placeholder="Search projects..." 
                onChange={(e) => setSearchProject(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#f2f4f6] border border-transparent rounded-xl text-sm text-[#091426] focus:bg-white focus:border-[#4b41e1] focus:ring-4 focus:ring-[#4b41e1]/10 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2">
                {status.map((status) => {
                  return (
                    <button 
                      key={status} 
                      onClick={() => setCurrentStatus(status)}
                      className={`${currentStatus === status? "bg-[#d8e3fb] text-[#111c2d]" : "bg-white text-[#45474c] border border-[#c5c6cd] hover:bg-gray-50" } px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap`}
                    >
                      {status}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-225">
              <thead>
                <tr className="bg-[#f2f4f6] text-[#45474c] uppercase text-[11px] tracking-widest font-bold border-b border-[#c5c6cd]/30">
                  <th className="px-14 py-4">Project Name</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Deadline</th>
                  <th className="px-6 py-4 text-right">Budget</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/10">
                {projectList?.map((project, index) => (
                  (index >= prevIndex - 1 && index <= nextIndex - 1? (
                    <tr key={index} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-[#fef3c7] text-[#92400e]`}>
                            {project?.active_project.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-[#091426] group-hover:text-[#4b41e1] transition-colors">
                            {project?.active_project}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#45474c] font-medium">{project?.client_name}</td>
                      <td className="px-6 py-5 text-sm text-[#091426] font-medium">{project?.project_deadline}</td>
                      <td className="px-6 py-5 text-sm font-bold text-[#091426] text-right">{project?.project_budget}{project?.project_currency.toUpperCase()}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${project?.project_status === "on Track"? "bg-[#DCFCE7] text-[#166534]" : project?.project_status === "on Pending"? "bg-[#FEF9C3] text-[#854D0E]" : "bg-red-200 text-red-700" }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${project?.project_status === "on Track"? "bg-[#166534]" : project?.project_status === "on Pending"? "bg-[#854D0E]" : "bg-red-700" }`}></span>
                          {project?.project_status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteProjectId(project?._id)
                            setDeleteProjectId2(project?.project_id)
                            setDeleteModalOpen(true)
                          }}
                          className="p-1.5 text-[#45474c] cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ) : (
                    null
                  ))
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#c5c6cd]/30 bg-white flex items-center justify-between">
            <p className="text-sm text-[#45474c]">
              Showing <span className="font-bold text-[#091426]">{currentPage}</span> to <span className="font-bold text-[#091426]">{Math.ceil(totalPage) || 0}</span> of <span className="font-bold text-[#091426]">{projectList?.length || 0}</span> projects
            </p>
            <div className="flex items-center gap-2">
              <button 
                type='button'
                onClick={handlePrevBtn}
                disabled={disablePrevIndexBtn}
                className="px-4 py-2 border border-[#c5c6cd] cursor-pointer rounded-lg text-sm font-bold text-[#45474c] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              >
                Previous
              </button>
              <button 
                type='button'
                onClick={handleNextBtn}
                disabled={disableNextIndexBtn}
                className="px-4 py-2 border border-[#c5c6cd] cursor-pointer rounded-lg text-sm font-bold text-[#091426] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-[#091426] mb-4">Delete Project</h2>
              <p className="text-sm text-[#4b5563] mb-6">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false)
                    setDeleteProjectId(null)
                    setDeleteProjectId2(null)
                  }}
                  className="px-4 py-2 rounded-lg border border-[#c5c6cd] text-[#091426] bg-white hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteProject.mutate({ projectId: deleteProjectId, projectIdForInvoice: deleteProjectId2 })}
                  disabled={deleteProject.isPending || deleteProject.isLoading}
                  className="px-4 py-2 rounded-lg bg-[#dc2626] text-white hover:bg-[#b91c1c] disabled:opacity-50"
                >
                  {(deleteProject.isPending || deleteProject.isLoading) ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default ActiveProjects;
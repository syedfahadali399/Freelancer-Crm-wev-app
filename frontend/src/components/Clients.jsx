import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import { toast } from 'react-toastify';

const Clients = () => {

  const { id } = useParams()
  const queryClient = useQueryClient()

  const tabs = ["All", "Active", "Inactive", "On-Hold"]

  const [prevIndex, setPrevIndex] = useState(1)
  const [nextIndex, setNextIndex] = useState(5)
  const [totalIndex, setTotalIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [currentIndex, setCurrentIndex] = useState(1)
  const [disablePrevBtn, setDisablePrevBtn] = useState(true)
  const [disableNextBtn, setDisableNextBtn] = useState(true)
  const [deleteClientId, setDeleteClientId] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const { data: clientsList = [] } = useQuery({
    queryKey: ['clientData', id, activeTab, searchQuery],
    queryFn: async () => {
      try {
        let query = `*[_type == "clients" && user_id == $user_id `
        const params = { user_id: id }

        if(activeTab !== "All") {
          query += `&& client_status == $client_status`
          params.client_status = activeTab.toLowerCase()
        }

        if(searchQuery && searchQuery.trim() !== "") {
          query += `&& client_name match $searchQuery`
          params.searchQuery = `*${searchQuery}*`
        }

        query += `]`

        const response = await client.fetch(query, params)
        return response || []
      } catch(error) {
        toast.error("Failed to fetch data. Try again!", error)  
        return []      
      }
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500,
    enabled: true
  })

  const { data: projectlist = [] } = useQuery({
    queryKey: ['projectData', id],
    queryFn: async () => {
      const params = { user_id: id }
      const response = await client.fetch(`*[_type == "projects" && user_id == $user_id]`, params)
      return response
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500,
    enabled: true
  })

  const handlePrevBtn = () => {
    setPrevIndex((prev) => prev - 5)
    setNextIndex((prev) => prev - 5)
    setCurrentIndex((prev) => prev - 1)
  }

  const handleNextBtn = () => {
    setPrevIndex((prev) => prev + 5)
    setNextIndex((prev) => prev + 5)
    setCurrentIndex((prev) => prev + 1)
  }

  const handleDeleteClient = useMutation({
    mutationFn: async (clientDocId) => {

      // Fetch the client document to get its custom client_id
      const clientDoc = await client.fetch(`*[_type == "clients" && _id == $id][0]`, { id: clientDocId })
      if (!clientDoc) throw new Error('Client not found')
      const client_custom_id = clientDoc.client_id

      // Step 1: Fetch all projects for this client (by custom client_id)
      const clientProjects = await client.fetch(
        `*[_type == "projects" && client_id == $clientId]`,
        { clientId: client_custom_id }
      )

      // Step 2: For each project, delete all related invoices (published and drafts)
      if (clientProjects && clientProjects.length > 0) {
        for (const project of clientProjects) {
          const relatedInvoices = await client.fetch(
            `*[_type == "invoices" && project_id == $projectId]`,
            { projectId: project.project_id }
          )

          if (relatedInvoices && relatedInvoices.length > 0) {
            const deleteInvoiceTransactions = relatedInvoices.map(inv => client.delete(inv._id))
            await Promise.all(deleteInvoiceTransactions)
          }

        }
      }

      // Step 3: Remove client and project references from user's arrays
      const user = await client.fetch(`*[_type == "user" && id == $userId][0]`, { userId: id })
      if (user) {
        let patchData = {}
        if (user.clients) {
          patchData.clients = user.clients.filter(cl => cl._ref !== clientDocId)
        }
        if (user.projects && clientProjects && clientProjects.length > 0) {
          const projectIdsToRemove = clientProjects.map(p => p._id)
          patchData.projects = user.projects.filter(proj => !projectIdsToRemove.includes(proj._ref))
        }
        
        if (Object.keys(patchData).length > 0) {
          await client.patch(user._id).set(patchData).commit()
        }
      }

      // Step 4: Delete all published projects for this client
      if (clientProjects && clientProjects.length > 0) {
        const deleteProjectTransactions = clientProjects.map(p => client.delete(p._id))
        await Promise.all(deleteProjectTransactions)
      }

      // Step 5: Delete client published doc and its draft if exists
      await client.delete(clientDocId)
      return true
    },
    onSuccess: () => {
      setDeleteModalOpen(false)
      setDeleteClientId(null)
      toast.success("Successfully deleted the client and related data")
      queryClient.invalidateQueries(['clientData', id, activeTab, searchQuery])
      queryClient.invalidateQueries(['projectData', id])
      queryClient.invalidateQueries(['invoiceData', id])
    },
    onError: (error) => {
      setDeleteModalOpen(false)
      console.error("Delete client error:", error)
      toast.error(`Failed to delete: ${error?.message || "Unknown error"}`)
    }
  })

  useEffect(() => {

    const findTotalIndex = clientsList?.length / 5
    setTotalIndex(findTotalIndex)

    if(prevIndex <= 1) {
      setDisablePrevBtn(true)
    } else {
      setDisablePrevBtn(false)
    }

    if(nextIndex >= clientsList?.length) {
      setDisableNextBtn(true)
    } else {
      setDisableNextBtn(false)
    }

  }, [clientsList, prevIndex, nextIndex])

  return (
    <>
      <main className="p-6 lg:p-8 pt-20 lg:pt-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-[#091426]">Clients</h1>
          <Link to={`/dashboard/clients/add-client/${id}`} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4b41e1] text-white font-semibold rounded-lg hover:bg-[#3323cc] shadow-sm transition-all active:scale-[0.98]">
            <Plus size={18} />
            Add Client
          </Link>
        </div>

        <div className="bg-white border border-[#c5c6cd]/30 rounded-xl shadow-sm overflow-hidden">
          
          <div className="p-5 border-b border-[#c5c6cd]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
            <div className="relative w-full max-w-sm group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#45474c] group-focus-within:text-[#4b41e1] transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or company..." 
                className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] border border-transparent rounded-lg text-sm text-[#091426] focus:bg-white focus:border-[#4b41e1] focus:ring-4 focus:ring-[#4b41e1]/10 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-4 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
              <div className="flex items-center gap-2">
                {tabs?.map((tab) => {
                  return (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={` ${activeTab === tab ? "bg-[#d8e3fb] text-[#111c2d]" : "bg-white text-[#45474c] border border-[#c5c6cd] hover:bg-gray-50" } px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors`}
                    >{tab}</button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-200">
              <thead className="bg-[#f2f4f6] border-b border-[#c5c6cd]/30">
                <tr className="text-[#45474c] uppercase text-[11px] tracking-wider font-bold">
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Billing Type</th>
                  <th className="px-6 py-4 text-right">Contract Value</th>
                  <th className="px-6 py-4 text-center">Projects</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/10">
                {clientsList?.map((client, index) => (

                  index >= prevIndex - 1 && index <= nextIndex - 1? (
                    <tr key={index} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] ${client.color}`}>
                            {client.initials}
                          </div>
                          <span className="text-sm font-bold text-[#091426]">{client?.client_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#45474c]">{client?.client_company || "No Company"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          client?.billing_type === 'hourlyRate' ? 'bg-[#e2dfff] text-[#0f0069]' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {client?.billing_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-[#091426]">{client?.client_rate}{client?.client_currency.toUpperCase()}</td>
                      <td className="px-6 py-4 text-center text-sm text-[#45474c]">{(projectlist?.filter((project) => project?.client_id === client?.client_id).length)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            client.status === 'Active' ? 'bg-[#DCFCE7] text-[#166534]' : 
                            client.status === 'On Hold' ? 'bg-[#FEF9C3] text-[#854D0E]' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              client?.client_status === 'active' ? 'bg-[#166534]' : 
                              client?.client_status === 'on-hold' ? 'bg-[#854D0E]' : 'bg-gray-500'
                            }`}></span>
                            {client?.client_status}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteClientId(client?._id)
                              setDeleteModalOpen(true)
                            }}
                            className="p-1.5 text-[#45474c] hover:text-[#4b41e1] hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : ( 
                    null 
                  )
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[#c5c6cd]/30 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-sm text-[#45474c]">Showing {currentIndex} to {Math.ceil(totalIndex)} of {clientsList?.length} clients</span>
            <div className="flex items-center gap-2">
              <button 
                type='button'
                onClick={handlePrevBtn}
                disabled={disablePrevBtn}
                className="px-4 py-2 border border-[#c5c6cd] rounded-lg text-sm font-semibold text-[#45474c] hover:bg-gray-50 transition-colors disabled:opacity-50" 
              >
                Previous
              </button>
              <button
                type='button'
                onClick={handleNextBtn}
                disabled={disableNextBtn} 
                className="px-4 py-2 border border-[#c5c6cd] rounded-lg text-sm font-semibold text-[#091426] hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-[#091426] mb-4">Delete Client</h2>
            <p className="text-sm text-[#4b5563] mb-6">
              Are you sure you want to delete this client? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false)
                  setDeleteClientId(null)
                }}
                className="px-4 py-2 rounded-lg border border-[#c5c6cd] text-[#091426] bg-white hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClient.mutate(deleteClientId)  }
                disabled={handleDeleteClient.isPending || handleDeleteClient.isLoading}
                className="px-4 py-2 rounded-lg bg-[#dc2626] text-white hover:bg-[#b91c1c] disabled:opacity-50"
              >
                {(handleDeleteClient.isPending || handleDeleteClient.isLoading) ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Clients;
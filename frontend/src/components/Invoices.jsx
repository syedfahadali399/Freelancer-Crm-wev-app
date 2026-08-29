import { Search, ChevronLeft, ChevronRight, Plus, Trash } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { client } from "../sanityClient";
import { toast } from "react-toastify";

const Invoices = () => {

  const { id } = useParams()
  const queryClient = useQueryClient()

  const statusTabs = ["all", "paid", "pending", "overdue"]
  
  const [disablePreviousIndexBtn, setDisablePreviousIndexBtn] = useState(true)
  const [disableNextIndexBtn, setDisableNextIndexBtn] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteInvoiceId, setDeleteInvoiceId] = useState(null)
  const [activeStatus, setActiveStatus] = useState("all")
  const [searchInvoice, setSearchInvoice] = useState("")
  const [prevoiusIndex, setPrevoiusIndex] = useState(1)
  const [currentIndex, setCurrentIndex] = useState(1)
  const [totalIndex, setTotalIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(5)

  const { data: invoiceList = [] } = useQuery({
    queryKey: ["invoicedata", id, activeStatus, searchInvoice],
    queryFn: async () => {
      try {
        let query = `*[_type == "invoices" && user_id == $user_id`;
        const params = { user_id: id };

        if (activeStatus !== "all") {
          query += ` && invoice_status == $invoice_status`;
          params.invoice_status = activeStatus;
        }

        if (searchInvoice && searchInvoice.trim() !== "") {
          query += ` && client_name match $search`;
          params.search = `*${searchInvoice.trim()}*`;
        }

        query += `]`;

        const response = await client.fetch(query, params);
        return response || [];

      } catch (error) {
        console.error("Error fetching invoices:", error);
        return [];
      }
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500,
    enabled: true
  })

  const { data: invoiceData = [] } = useQuery({
    queryKey: ["invoiceData", id],
    queryFn: async () => {
      const params = { user_id: id };
      const response = await client.fetch(`*[_type == "invoices" && user_id == $user_id]`, params)
      return response
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500,
  })

  const totalAmount = invoiceData?.reduce((sum, invoice) => sum + invoice?.invoice_amount, 0)

  const findPendingInvoice = invoiceData?.filter((invoice) => invoice?.invoice_status !== "paid")
  const pendingAmount = findPendingInvoice?.reduce((sum, invoice) => sum + invoice?.invoice_amount, 0)

  const paidAmount = invoiceData?.filter((invoice) => invoice?.invoice_status === "paid").reduce((sum, invoice) => sum + invoice?.invoice_amount, 0)

  const handleNextBtn = () => {
    setCurrentIndex(prev => prev + 1)
    setPrevoiusIndex(prev => prev + 5)
    setDisablePreviousIndexBtn(false)
    setNextIndex(prev => prev + 10)
  }

  const handlePrevBtn = () => {
    setCurrentIndex(prev => prev - 1)
    setPrevoiusIndex(prev => prev - 5)
    setNextIndex(prev => prev - 10)
    setDisableNextIndexBtn(false)
  }
  
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId) => {
      return client.delete(invoiceId)
    },
    onSuccess: () => {
      toast.success("Succesfully deleted the Invoice")
      queryClient.invalidateQueries(["invoicedata", id, activeStatus, searchInvoice])
      queryClient.invalidateQueries(["invoiceData", id])
      setDeleteModalOpen(false)
      setDeleteInvoiceId(null)
    },
    onError: (error) => {
      toast.error("Failed to delete the Invoice. Try Again")
      console.error("Failed to delete invoice:", error)
    }
  })
  
  useEffect(() => {

    const calculateIndex = invoiceList?.length / 5
    setTotalIndex(calculateIndex)    

    if(nextIndex >= invoiceList?.length) {
      setDisableNextIndexBtn(true)
    } else {
      setDisableNextIndexBtn(false)
    }

    if(prevoiusIndex === 1) {
        setDisablePreviousIndexBtn(true)
    }
     
  }, [nextIndex, prevoiusIndex, invoiceList, deleteInvoiceMutation])

  return (
    <>
      <main className="p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-[#091426]">
              All Invoices
            </h1>
          <Link
            to={`/dashboard/invoices/add-invoice/${id}`}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4b41e1] text-white font-bold rounded-lg hover:bg-[#3323cc] shadow-md transition-all active:scale-[0.98]"
          >
            <Plus size={18} />
            Add new Invoice
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-[#c5c6cd]/30 shadow-sm">
              <p className="text-xs font-bold text-[#45474c] uppercase tracking-wider mb-1">
                Total Invoiced
              </p>
              <p className="text-2xl font-bold text-[#091426]">${totalAmount.toFixed(2) || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#c5c6cd]/30 shadow-sm">
              <p className="text-xs font-bold text-[#45474c] uppercase tracking-wider mb-1">
                Pending Amount
              </p>
              <p className="text-2xl font-bold text-[#091426]">${pendingAmount.toFixed(2) || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-[#c5c6cd]/30 shadow-sm">
              <p className="text-xs font-bold text-[#45474c] uppercase tracking-wider mb-1">
                Paid Amount
              </p>
              <p className="text-2xl font-bold text-[#091426]">${paidAmount.toFixed(2) || 0}</p>
            </div>
        </div>

        <div className="bg-white border border-[#c5c6cd]/30 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#c5c6cd]/20 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="relative w-full max-w-md group">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45474c] group-focus-within:text-[#4b41e1]"
              />
              <input
                type="text"
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
                placeholder="Search with client name..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#f2f4f6] border border-transparent rounded-xl text-sm text-[#091426] focus:bg-white focus:border-[#4b41e1] focus:ring-4 focus:ring-[#4b41e1]/10 outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2">
                {statusTabs.map((tabs) => {
                  return (
                    <button 
                      key={tabs} 
                      onClick={() => setActiveStatus(tabs)} 
                      className={` ${tabs === activeStatus? "bg-[#d8e3fb] text-[#111c2d]" : "text-[#45474c] border-[#c5c6cd] hover:bg-gray-50" } cursor-pointer px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap`}
                    >
                      {tabs.charAt(0).toUpperCase()}{tabs.substring(1, tabs.length)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-225">
              <thead className="bg-[#f2f4f6] w-full">
                <tr className="text-[#45474c] uppercase text-[11px] tracking-widest font-bold border-b border-[#c5c6cd]/30">
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/10 text-[#091426]">
                {invoiceList.map((inv, index) => (
                  (index >= prevoiusIndex - 1 && index <= nextIndex - 1? (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-5 text-sm font-bold">{inv?.invoice_id}</td>
                      <td className="px-6 py-5 text-sm font-medium">
                        <Link to={`/dashboard/invoices/invoice-detail/${index}/${id}`} className="hover:underline">
                          {inv?.client_name}
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#45474c]">
                        {inv?.invoice_duedate}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-right">
                        {inv?.invoice_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={` ${inv?.invoice_status === "paid"? "bg-[#DCFCE7] text-[#166534]" : inv?.invoice_status === "pending" ? "bg-[#FEF9C3] text-[#854D0E]" : "bg-red-200 text-red-700" } inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${inv.statusColor}`}
                        >  
                          <div className="flex flex-row gap-1 items-center justify-center">
                            <span className={`w-1.5 h-1.5 rounded-full ${inv?.invoice_status === "paid"? "bg-[#166534]" : inv?.invoice_status === "pending" ? "bg-[#854D0E]" : "bg-red-700" }`}></span>
                            {inv?.invoice_status}
                          </div>
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteInvoiceId(inv?._id)
                            setDeleteModalOpen(true)
                          }}
                          className="p-3 hover:bg-red-700 hover:text-white cursor-pointer rounded-2xl transition-colors"
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

          <div className="p-4 border-t border-[#c5c6cd]/30 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#45474c]">
              Showing <span className="font-bold text-[#091426]">{currentIndex}</span> to{" "}
              <span className="font-bold text-[#091426]">{Math.ceil(totalIndex)}</span> of{" "}
              <span className="font-bold text-[#091426]">{invoiceList?.length}</span> invoices
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevBtn}
                disabled={disablePreviousIndexBtn}
                className={` ${disablePreviousIndexBtn? "cursor-not-allowed" : "cursor-pointer" } p-2 border border-[#c5c6cd] rounded-lg text-[#45474c] hover:bg-gray-50 disabled:opacity-50`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={handleNextBtn}
                disabled={disableNextIndexBtn}
                className={` ${disableNextIndexBtn? "cursor-not-allowed" : "cursor-pointer" } p-2 border border-[#c5c6cd] rounded-lg text-[#091426] hover:bg-gray-50 disabled:opacity-50`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-[#091426] mb-4">Delete Invoice</h2>
              <p className="text-sm text-[#4b5563] mb-6">
                Are you sure you want to delete this invoice? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false)
                    setDeleteInvoiceId(null)
                  }}
                  className="px-4 py-2 rounded-lg border border-[#c5c6cd] text-[#091426] bg-white hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => deleteInvoiceMutation.mutate(deleteInvoiceId)}
                  disabled={deleteInvoiceMutation.isPending || deleteInvoiceMutation.isLoading}
                  className="px-4 py-2 rounded-lg bg-[#dc2626] cursor-pointer text-white hover:bg-[#b91c1c] disabled:opacity-50"
                >
                  {(deleteInvoiceMutation.isPending || deleteInvoiceMutation.isLoading) ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Invoices;

import { AlertCircle, Clock, ChevronDown, Rocket, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router';
import { client } from '../sanityClient';
import { toast } from 'react-toastify';
import { useState } from 'react';

const Dashboard = () => {

  const { id } = useParams()
  
  const [timeFilter, setTimeFilter] = useState("all");

  const { data: invoiceList = [] } = useQuery({
    queryKey: ['invoiceData', id],
    queryFn: async () => {
      try {
        const query = `*[_type == "invoices" && user_id == $user_id]`
        const params = { user_id: id }

        const response = await client.fetch(query, params)
        return response || []
      } catch (error) {
        toast.error("Failed to fetch data", error)
      }
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500,
    enabled: true
  })

  const { data: projectList = [] } = useQuery({
    queryKey: ['projectData', id],
    queryFn: async () => {
      try {
        const query = `*[_type == "projects" && user_id == $user_id]`
        const params = { user_id: id }
  
        const response = await client.fetch(query, params)
        return response || []
      } catch (error) {
        toast.error("Failed to fetch data Try again", error)
      }
    },
    staleTime: 10000,
    gcTime: 10000,
    retry: 3,
    retryDelay: 1500,
    enabled: true
  })

  const filterByDate = (list) => {
    if (timeFilter === "all") return list;
    
    const now = new Date();
    return list?.filter(item => {
      if (!item._createdAt) return true;
      const createdAt = new Date(item._createdAt);
      if (timeFilter === "this_month") {
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      } else if (timeFilter === "last_month") {
        let lastMonth = now.getMonth() - 1;
        let lastMonthYear = now.getFullYear();
        if (lastMonth < 0) {
          lastMonth = 11;
          lastMonthYear -= 1;
        }
        return createdAt.getMonth() === lastMonth && createdAt.getFullYear() === lastMonthYear;
      }
      return true;
    }) || [];
  };

  const filteredInvoiceList = filterByDate(invoiceList);
  const filteredProjectList = filterByDate(projectList);

  const totalRevenue = filteredInvoiceList?.filter(invoice => invoice?.invoice_status === "paid").reduce((sum, invoice) => sum + invoice?.invoice_amount, 0) || 0;
  const outstandingAmount = filteredInvoiceList?.filter(invoice => invoice?.invoice_status === "pending" || invoice?.invoice_status === "overdue").reduce((sum, invoice) => sum + invoice?.invoice_amount, 0) || 0;
  const overdueInvoicesCount = filteredInvoiceList?.filter(invoice => invoice?.invoice_status === "overdue").length || 0;
  const activeProjectsCount = filteredProjectList?.length || 0;

  return (
    <>
      <main className="p-6 lg:p-8 space-y-8 pt-20 lg:pt-8">
          
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#091426]">Overview</h1>
            <p className="text-sm text-[#45474c]">Here's a summary of your business activities.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="appearance-none bg-white border border-[#c5c6cd]/50 rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-[#091426] focus:ring-2 focus:ring-[#4b41e1]/20 outline-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45474c] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={<Wallet size={20} />} />
          <StatCard title="Outstanding Amount" value={`$${outstandingAmount.toFixed(2)}`} icon={<Clock size={20} />} />
          <StatCard title="Overdue Invoices" value={overdueInvoicesCount} icon={<AlertCircle size={20} />} warning />
          <StatCard title="Active Projects" value={activeProjectsCount} icon={<Rocket size={20} />} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
          <div className="bg-white border border-[#c5c6cd]/30 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#c5c6cd]/20 flex justify-between items-center">
              <h3 className="font-bold text-[#091426]">Recent Invoices</h3>
              <Link to={`/dashboard/invoices/${id}`} className="text-sm font-semibold text-[#4b41e1] hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#f7f9fb] text-[#45474c] uppercase text-[11px] tracking-wider font-semibold">
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c6cd]/10">
                  {filteredInvoiceList?.map((invoice, index) => (
                    index < 4? (
                      <tr key={invoice} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-[#091426]">{invoice?.invoice_id}</td>
                        <td className="px-5 py-4 text-[#45474c]">{invoice?.client_name}</td>
                        <td className="px-5 py-4 font-bold text-[#091426]">{invoice?.invoice_amount}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide`}>
                            {invoice?.invoice_status}
                          </span>
                        </td>
                      </tr>
                    ) : (
                      null
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#c5c6cd]/30 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#c5c6cd]/20 flex justify-between items-center">
              <h3 className="font-bold text-[#091426]">Active Projects</h3>
              <Link to={`/dashboard/active-projects/${id}`} className="text-sm font-semibold text-[#4b41e1] hover:underline">View All</Link>
            </div>
            <div className="p-4 space-y-1">
              {filteredProjectList?.map((project, index) => (
                index < 4? (
                  <div key={project} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg border border-amber-500 bg-amber-400`}>
                        {project?.client_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#091426] group-hover:text-[#4b41e1] transition-colors">{project?.active_project}</span>
                        <span className="text-xs text-[#45474c]">{project?.client_name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#45474c] uppercase font-bold tracking-wider">Deadline</div>
                      <div className={`text-sm 'text-[#091426]`}>{project?.project_deadline}</div>
                    </div>
                  </div>
                ) : (
                  null
                )
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

const StatCard = ({ title, value, icon, warning }) => (
  <div className="bg-white border border-[#c5c6cd]/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute left-0 top-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity ${warning ? 'bg-red-500' : 'bg-[#4b41e1]'}`} />
    <div className="flex justify-between items-start mb-4">
      <span className="text-xs font-semibold text-[#45474c] uppercase tracking-wider">{title}</span>
      <div className={`${warning ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-[#45474c]'} p-2 rounded-lg`}>
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-[#091426] mb-1">{value}</div>
  </div>
);

export default Dashboard

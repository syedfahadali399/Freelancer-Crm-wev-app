import { LayoutDashboard, Users, FolderOpen, FileText, Settings } from 'lucide-react';
import { Link, NavLink, useParams } from 'react-router';

const Sidebar = () => {

  const { id } = useParams()

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: `/dashboard/main/${id}` },
    { icon: <Users size={20} />, label: 'Clients', path: `/dashboard/clients/${id}` },
    { icon: <FolderOpen size={20} />, label: 'Projects', path: `/dashboard/active-projects/${id}` },
    { icon: <FileText size={20} />, label: 'Invoices', path: `/dashboard/invoices/${id}` },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-65 bg-[#091426] text-white flex flex-col py-6 z-20 lg:flex">
      <div className="px-6 mb-8 flex flex-col gap-1">
        <span className="text-2xl font-bold tracking-tight">DevDesk</span>
        <span className="text-xs text-[#8590a6] uppercase tracking-wider font-semibold">Freelancer CRM</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {navItems.map((item, index) => (
          <NavLink
            to={`${item.path}`}
            key={index}
            href="#"
            className={({isActive}) => ` ${isActive? "border-[#4b41e1] bg-[#1e293b] text-white font-medium": "border-transparent text-[#8590a6] hover:text-white hover:bg-[#1e293b]/50"} flex items-center gap-3 px-4 py-3 rounded-r-lg border-l-4 transition-all duration-200`}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}

        <div className="mt-auto">
          <Link to={`/`} href="#" className="flex items-center gap-3 px-4 py-3 text-[#8590a6] hover:text-white hover:bg-[#1e293b]/50 transition-all rounded-r-lg border-l-4 border-transparent">
            <Settings size={20} />
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
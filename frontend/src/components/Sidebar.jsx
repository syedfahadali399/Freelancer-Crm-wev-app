import { LayoutDashboard, Users, FolderOpen, FileText, Settings, X } from 'lucide-react';
import { Link, NavLink, useParams } from 'react-router';

const Sidebar = ({ isOpen, onClose }) => {

  const { id } = useParams()

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: `/dashboard/main/${id}` },
    { icon: <Users size={20} />, label: 'Clients', path: `/dashboard/clients/${id}` },
    { icon: <FolderOpen size={20} />, label: 'Projects', path: `/dashboard/active-projects/${id}` },
    { icon: <FileText size={20} />, label: 'Invoices', path: `/dashboard/invoices/${id}` },
  ];

  return (
    <aside
      data-open={isOpen}
      className="mobile-sidebar fixed left-0 top-0 z-50 h-full w-[260px] max-w-[85vw] bg-[#091426] text-white flex flex-col py-6 shadow-xl lg:shadow-none"
    >
      <div className="px-6 mb-8 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-2xl font-bold tracking-tight">DevDesk</span>
          <span className="text-xs text-[#8590a6] uppercase tracking-wider font-semibold">Freelancer CRM</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden shrink-0 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={22} />
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
        {navItems.map((item, index) => (
          <NavLink
            to={`${item.path}`}
            key={index}
            onClick={onClose}
            className={({isActive}) => ` ${isActive? "border-[#4b41e1] bg-[#1e293b] text-white font-medium": "border-transparent text-[#8590a6] hover:text-white hover:bg-[#1e293b]/50"} flex items-center gap-3 px-4 py-3 rounded-r-lg border-l-4 transition-all duration-200`}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}

        <div className="mt-auto">
          <Link to={`/`} onClick={onClose} className="flex items-center gap-3 px-4 py-3 text-[#8590a6] hover:text-white hover:bg-[#1e293b]/50 transition-all rounded-r-lg border-l-4 border-transparent">
            <Settings size={20} />
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;

import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';

const MainPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeSidebar();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex bg-[#f8fafc] min-h-screen font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-default"
          onClick={closeSidebar}
          aria-label="Close sidebar"
        />
      )}

      <div className="flex-1 lg:ml-[260px] flex flex-col min-w-0 w-full">
        <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <Outlet />
      </div>
    </div>
  );
};

export default MainPage;

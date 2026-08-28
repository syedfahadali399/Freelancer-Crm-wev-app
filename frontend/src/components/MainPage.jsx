import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';

const MainPage = () => {
  return (
    <div className="flex bg-[#f8fafc] min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 lg:ml-65 flex flex-col">
        <Header/>
        <Outlet/>
      </div>
    </div>
  );
};

export default MainPage;
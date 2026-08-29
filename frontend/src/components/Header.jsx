import { useNavigate, useParams } from "react-router";
import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Menu } from "lucide-react";
import { client } from "../sanityClient";

const Header = ({ onMenuClick, isSidebarOpen }) => {

  const { id } = useParams()
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: userData = [] } = useQuery({
    queryKey: ["userdata"],
    queryFn: async () => {
      const response = await client.fetch(`*[_type == "user"]`)
      return response
    }
  })

  const findcurrentUser = userData?.find((user) => user?.id === id)

  const editNameForPic = findcurrentUser?.fullname
  const firstLetter = editNameForPic?.charAt(0).toUpperCase()
  const findSecondLetterIndex = editNameForPic?.indexOf(" ") + 1
  const SecondLetter = editNameForPic?.at(findSecondLetterIndex).toUpperCase()
  const finalName = `${firstLetter}${SecondLetter}`

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="h-16 border-b border-[#c5c6cd]/30 bg-white sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
        <div className="lg:hidden flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="p-2 text-[#091426] hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={isSidebarOpen}
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-[#091426] text-xl">DevDesk</span>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#45474c] hover:bg-gray-100 rounded-full transition-colors">
            <Bell size={20} />
          </button>
          <div className="relative" ref={profileRef}>
            <div
              className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-200 overflow-hidden cursor-pointer ring-1 ring-slate-100 shrink-0 hover:ring-2 hover:ring-slate-300 transition-all active:scale-95"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <p className="font-semibold">{finalName}</p>
            </div>

            <div
              className={`absolute right-0 top-12 w-72 sm:w-80 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden transition-all duration-300 origin-top-right ${
                isProfileOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="p-5 bg-linear-to-br from-[#0A1120] to-[#1a2740]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-slate-200 overflow-hidden ring-2 ring-white/20 shrink-0">
                    <p className="font-semibold">{finalName}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-sm truncate">
                      {findcurrentUser?.fullname || "No Name"}
                    </p>
                    <p className="text-slate-300 text-xs truncate mt-0.5">
                      {findcurrentUser?.email || "No email"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer group"
                >
                  <LogOut
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
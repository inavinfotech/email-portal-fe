import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileCode2,
  Send,
  History,
  ShieldCheck,
  Settings,
  LogOut,
  Mail,
  Menu,
  X,
  Bell,
  Layers
} from "lucide-react";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Templates", path: "/templates", icon: FileCode2 },
    { name: "Send Email", path: "/send", icon: Send },
    { name: "Email Logs", path: "/logs", icon: History },
    { name: "OTP Portal", path: "/otp", icon: ShieldCheck },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans antialiased overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex h-full w-full flex-col bg-sidebar text-gray-300 shadow-2xl">
          {/* Brand */}
          <div className="p-6 flex items-center justify-between border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Mail className="text-white" size={22} />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white leading-tight tracking-tight uppercase">
                  EMAIL PORTAL
                </h1>
                <p className="text-[10px] text-primary-400 font-semibold tracking-widest uppercase opacity-75">
                  CENTRAL SERVICE
                </p>
              </div>
            </div>
            <button
              className="rounded-md p-1 hover:bg-gray-800 lg:hidden text-gray-400"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 group
                  ${
                    isActive
                      ? "bg-sidebar-active text-white shadow-lg shadow-primary-600/20 translate-x-1 font-semibold"
                      : "text-gray-400 hover:bg-sidebar-hover hover:text-white"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`h-5 w-5 transition-transform duration-300 ${
                        isActive ? "scale-110 text-white" : "group-hover:scale-110 text-gray-400"
                      }`}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer / User Profile snippet */}
          <div className="border-t border-gray-800/50 p-4 bg-gray-900/20">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 group text-sm font-medium"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-8 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:hidden transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Email Management System
            </h2>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>admin@example.com</span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

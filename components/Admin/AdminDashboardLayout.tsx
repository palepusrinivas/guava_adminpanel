"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/utils/store/store";
import { adminLogout } from "@/utils/slices/adminSlice";
import Link from "next/link";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, token } = useAppSelector((state) => state.admin);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if admin is authenticated
    if (!token || !admin) {
      router.replace("/admin/login");
      return;
    }

    // Check if user has admin role
    if (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") {
      router.replace("/admin/login");
      return;
    }
  }, [token, admin, router]);

  const handleLogout = () => {
    dispatch(adminLogout());
    router.push("/admin/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { name: "Heat Map", href: "/admin/heat-map", icon: "🗺️" },
    { name: "Fleet View", href: "/admin/fleet-map", icon: "🚗" },
    { name: "Users", href: "/admin/users", icon: "👥" },
    { name: "Drivers", href: "/admin/drivers", icon: "🚙" },
    { name: "Pricing", href: "/admin/pricing", icon: "💰" },
    { name: "Zones", href: "/admin/zones", icon: "🌍" },
    { name: "Fleet", href: "/admin/fleet", icon: "🚛" },
    { name: "Analytics", href: "/admin/analytics", icon: "📈" },
    { name: "Wallet", href: "/admin/wallet", icon: "💳" },
  ];

  // Don't render anything until after hydration
  if (!mounted || !token || !admin) {
    return null;
  }

  return (
    // Make layout a flex container so children align to top and sidebar can be fixed on large screens
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ease-in-out ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-4">
            <button
              type="button"
                aria-label="Close sidebar"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-gray-800 bg-opacity-50 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar - fixed on the left to avoid pushing or overlapping content */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? "bg-blue-100 text-blue-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {admin.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{admin.username}</p>
                  <p className="text-xs text-gray-500">{admin.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  {/* Main content */}
  <div className="flex flex-col flex-1 lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-20 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center flex-1">
              <button
                type="button"
                aria-label="Open sidebar"
                className="lg:hidden -ml-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {navigation.find(item => item.href === pathname)?.name || "Admin Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {admin.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">Welcome, {admin.username}</span>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Breadcrumb - optional */}
          <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-2">
            <nav className="flex text-sm text-gray-500">
              <Link href="/admin/dashboard" className="hover:text-gray-700">Admin</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{navigation.find(item => item.href === pathname)?.name || "Dashboard"}</span>
            </nav>
          </div>
        </div>

        {/* Main content area with better responsive padding and max-width */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 sm:p-6 lg:p-8">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;

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

  const navigationSections = [
    {
      title: "DASHBOARD",
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
        { name: "Heat Map", href: "/admin/heat-map", icon: "🗺️" },
        { name: "Fleet View", href: "/admin/fleet-map", icon: "🚗" },
      ],
    },
    ...(admin && admin.role === "SUPER_ADMIN"
      ? [{
        title: "SUPER ADMIN",
        items: [
          {
            name: "Admin Users",
            href: "/admin/superadmin/admins",
            icon: "🧑‍💼",
          },
        ],
      }]
      : []),
    {
      title: "SYSTEM SETTINGS",
      items: [
        { name: "General Settings", href: "/admin/settings", icon: "⚙️" },
        { name: "API Keys", href: "/admin/settings/api-keys", icon: "🔑" },
        { name: "Wallet Management", href: "/admin/wallet", icon: "💰" },
        { name: "Banner Setup", href: "/admin/banner-setup", icon: "🖼️" },
        { name: "Legal Documents", href: "/admin/legal-documents", icon: "📄" },
        { name: "Mail Server", href: "/admin/mail-server", icon: "📧" },
      ],
    },
    {
      title: "SERVICE MANAGEMENT",
      items: [
        { name: "Ride Services", href: "/admin/services", icon: "🚗" },
      ],
    },
    {
      title: "ZONE MANAGEMENT",
      items: [
        { name: "Zones", href: "/admin/zones", icon: "🌍" },
      ],
    },
    {
      title: "TRIP MANAGEMENT",
      items: [
        { name: "Trips", href: "/admin/trips", icon: "🚕" },
      ],
    },
    {
      title: "INTERCITY TRANSPORT",
      items: [
        { name: "Dashboard", href: "/admin/intercity", icon: "🛣️" },
        { name: "Vehicle Setup", href: "/admin/intercity/vehicles", icon: "🚗" },
        { name: "Routes", href: "/admin/intercity/routes", icon: "🛤️" },
        { name: "Trips", href: "/admin/intercity/trips", icon: "🚌" },
        { name: "Bookings", href: "/admin/intercity/bookings", icon: "📋" },
        { name: "Cashback", href: "/admin/cashback", icon: "💰" },
      ],
    },
    {
      title: "SCHOOL TRANSPORT",
      items: [
        { name: "Dashboard", href: "/admin/school/dashboard", icon: "📊" },
        { name: "Overview", href: "/admin/school", icon: "🏫" },
        { name: "Institutions", href: "/admin/school/institutions", icon: "🏢" },
        { name: "All Branches", href: "/admin/school/branches", icon: "🏬" },
        { name: "Buses", href: "/admin/school/buses", icon: "🚌" },
        { name: "Parent Requests", href: "/admin/school/parent-requests", icon: "📋" },
        { name: "Live Tracking", href: "/admin/school/tracking", icon: "📍" },
        { name: "Alerts", href: "/admin/school/alerts", icon: "🔔" },
        { name: "Students Upload", href: "/admin/school/students/upload", icon: "📄" },
        { name: "Subscription Plans", href: "/admin/school/subscription", icon: "💳" },
      ],
    },
    {
      title: "PROMOTION MANAGEMENT",
      items: [
        { name: "Banner Setup", href: "/admin/banner-setup", icon: "🎯" },
        {
          name: "Coupon Setup",
          icon: "🏷️",
          children: [
            { name: "Coupon List", href: "/admin/coupons" },
            { name: "Add New Coupon", href: "/admin/coupons/new" },
          ],
        },
        {
          name: "Discount Setup",
          icon: "💸",
          children: [
            { name: "Discount List", href: "/admin/discounts" },
            { name: "Add New Discount", href: "/admin/discounts/new" },
          ],
        },
      ],
    },
    {
      title: "USER MANAGEMENT",
      items: [
        { name: "Users", href: "/admin/users", icon: "👥" },
        { name: "Drivers", href: "/admin/drivers", icon: "🚙" },
        { name: "Pending KYC", href: "/admin/drivers/pending-kyc", icon: "⏳" },
        {
          name: "Driver Level Setup",
          icon: "🧭",
          children: [
            { name: "Driver Levels", href: "/admin/driver-levels" },
            { name: "Add Driver Level", href: "/admin/driver-levels/new" },
          ],
        },
        {
          name: "Driver Setup",
          icon: "🚖",
          children: [
            { name: "Driver List", href: "/admin/driver-setup" },
            { name: "Add New Driver", href: "/admin/driver-setup/new" },
            { name: "Driver Registration", href: "/driver/register", icon: "📝" },
            { name: "Driver Identity Request List", href: "/admin/driver-setup/identity-requests" },
            { name: "Driver Access Rules", href: "/admin/driver-access" },
          ],
        },
        {
          name: "Customer Level Setup",
          icon: "🧑‍💼",
          children: [
            { name: "Customer Levels", href: "/admin/customer-levels" },
            { name: "Add Customer Level", href: "/admin/customer-levels/new" },
          ],
        },
        {
          name: "Customer Setup",
          icon: "👤",
          children: [
            { name: "Customer List", href: "/admin/customer" },
            { name: "Add New Customer", href: "/admin/customer/create" },
          ],
        },
        { name: "Customer Wallet", href: "/admin/customer/wallet", icon: "💳" },
        {
          name: "Withdraw",
          icon: "💳",
          children: [
            { name: "Method List", href: "/admin/withdraw/methods" },
            { name: "Add Method", href: "/admin/withdraw/methods/new" },
            { name: "Withdraw Requests", href: "/admin/withdraw/requests" },
          ],
        },
        {
          name: "Employee Setup",
          icon: "👥",
          children: [
            { name: "Attribute Setup", href: "/admin/employee/role" },
            { name: "Employee List", href: "/admin/employee" },
            { name: "Add New Employee", href: "/admin/employee/create" },
          ],
        },
      ],
    },
    {
      title: "PARCEL MANAGEMENT",
      items: [
        {
          name: "Parcel attributes",
          icon: "📦",
          children: [
            { name: "Parcel categories", href: "/admin/parcel/attribute/category" },
            { name: "Parcel weights", href: "/admin/parcel/attribute/weight" },
          ],
        },
      ],
    },
    {
      title: "VEHICLES MANAGEMENT",
      items: [
        {
          name: "Vehicle Attribute Setup",
          icon: "🚗",
          children: [
            { name: "Vehicle Attribute Setup", href: "/admin/vehicle/attribute-setup" },
            { name: "Vehicle List", href: "/admin/vehicle" },
            { name: "New Vehicle Request List", href: "/admin/vehicle/request/list" },
            { name: "Update Vehicle Request List", href: "/admin/vehicle/update/list" },
            { name: "Add New Vehicle", href: "/admin/vehicle/create" },
          ],
        },
      ],
    },
    {
      title: "FARE MANAGEMENT",
      items: [
        { name: "Trip Fare Setup", href: "/admin/fare/trip", icon: "💎" },
        { name: "Parcel Delivery Fare Setup", href: "/admin/fare/parcel", icon: "📦" },
      ],
    },
    {
      title: "TRANSACTIONS & REPORTS",
      items: [
        { name: "Transactions", href: "/admin/transaction", icon: "📄" },
        { name: "Reports", href: "/admin/report/earning", icon: "📊" },
      ],
    },
    {
      title: "HELP & SUPPORT",
      items: [
        { name: "Chatting", href: "/admin/chatting", icon: "💬" },
      ],
    },
    {
      title: "BUSINESS MANAGEMENT",
      items: [
        {
          name: "Business Setup",
          icon: "💼",
          children: [
            { name: "Business Info", href: "/admin/business/setup/info" },
            { name: "Driver", href: "/admin/business/setup/driver" },
            { name: "Customer", href: "/admin/business/setup/customer" },
            { name: "Fare & Penalty Settings", href: "/admin/business/setup/trip-fare/penalty" },
            { name: "Trips", href: "/admin/business/setup/trip-fare/trips" },
            { name: "Settings", href: "/admin/business/setup/info/settings" },
            { name: "Parcel", href: "/admin/business/setup/parcel" },
            { name: "Refund", href: "/admin/business/setup/refund" },
            { name: "Safety & Precautions", href: "/admin/business/setup/safety" },
            { name: "Referral earning", href: "/admin/business/setup/referral" },
            { name: "Chatting setup", href: "/admin/business/setup/chatting" },
          ],
        },
        {
          name: "Pages & Media",
          icon: "📄",
          children: [
            { name: "Business Pages", href: "/admin/business/pages-media/business-page" },
            { name: "Landing Page Setup", href: "/admin/business/pages-media/landing-page" },
            { name: "Social Media Links", href: "/admin/business/pages-media/social-media" },
          ],
        },
        {
          name: "Configurations",
          icon: "⚙️",
          children: [
            { name: "Notification", href: "/admin/business/configuration/notification/regular-trip" },
            { name: "3rd Party", href: "/admin/business/configuration/third-party" },
          ],
        },
      ],
    },
    {
      title: "OTHER",
      items: [
        {
          name: "Pricing",
          icon: "💰",
          children: [
            { name: "Pricing Management", href: "/admin/pricing" },
            { name: "Pricing Breakdown", href: "/admin/pricing/breakdown" },
          ],
        },
        { name: "Fleet", href: "/admin/fleet", icon: "🚛" },
        { name: "Analytics", href: "/admin/analytics", icon: "📈" },
        { name: "Wallet", href: "/admin/wallet", icon: "💳" },
      ],
    },
  ];

  // Flatten for breadcrumb and title lookup (includes nested children)
  const navigation = navigationSections.flatMap(section => section.items.flatMap((it: any) => it.children ? it.children : [it]));

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Coupon Setup": true,
    "Discount Setup": true,
    "Driver Level Setup": true,
    "Driver Setup": true,
    "Customer Level Setup": true,
    "Customer Setup": true,
    "Withdraw": true,
    "Employee Setup": true,
    "Parcel attributes": true,
    "Vehicle Attribute Setup": true,
    "Business Setup": true,
    "Pages & Media": true,
    "Configurations": true,
    "Pricing": true,
  });
  const toggleGroup = (name: string) => setOpenGroups((s) => ({ ...s, [name]: !s[name] }));

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
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
            <nav className="mt-5 px-2 space-y-4">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item: any) => {
                      if (item.children) {
                        const isOpen = openGroups[item.name];
                        return (
                          <div key={item.name}>
                            <button
                              onClick={() => toggleGroup(item.name)}
                              className="w-full flex items-center justify-between px-2 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                            >
                              <span className="flex items-center"><span className="mr-3">{item.icon}</span>{item.name}</span>
                              <span className="text-gray-400">{isOpen ? "▾" : "▸"}</span>
                            </button>
                            {isOpen && (
                              <div className="ml-6 space-y-1">
                                {item.children.map((child: any) => {
                                  const isActive = pathname === child.href;
                                  return (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      className={`${isActive ? "bg-teal-100 text-teal-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} block px-2 py-2 text-sm rounded-md`}
                                    >
                                      {child.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.name} href={item.href} className={`${isActive ? "bg-teal-100 text-teal-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} group flex items-center px-2 py-2 text-base font-medium rounded-md`}>
                          <span className="mr-3">{item.icon}</span>
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
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
              <nav className="mt-5 flex-1 px-2 space-y-4">
                {navigationSections.map((section) => (
                  <div key={section.title}>
                    <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item: any) => {
                        if (item.children) {
                          const isOpen = openGroups[item.name];
                          return (
                            <div key={item.name}>
                              <button
                                onClick={() => toggleGroup(item.name)}
                                className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                              >
                                <span className="flex items-center"><span className="mr-3">{item.icon}</span>{item.name}</span>
                                <span className="text-gray-400">{isOpen ? "▾" : "▸"}</span>
                              </button>
                              {isOpen && (
                                <div className="ml-6 space-y-1">
                                  {item.children.map((child: any) => {
                                    const isActive = pathname === child.href;
                                    return (
                                      <Link
                                        key={child.name}
                                        href={child.href}
                                        className={`${isActive ? "bg-teal-100 text-teal-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} block px-2 py-2 text-sm rounded-md`}
                                      >
                                        {child.name}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.name} href={item.href} className={`${isActive ? "bg-teal-100 text-teal-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                            <span className="mr-3">{item.icon}</span>
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
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

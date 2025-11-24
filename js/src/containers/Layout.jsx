// src/containers/Layout.jsx - Enhanced Modern Design
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../reducers/store/store';
import CarComponent from './CarComponent';
import MainComponent from './MainComponent'; 
import {
  Home,
  FileText,
  ShoppingCart,
  Package,
  Users,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  DollarSign,
  Truck,
  FileCheck,
  Building2,
  Bell,
  User,
  Menu,
  Search,
  ChevronDown,
  TrendingUp,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';

const LayoutContent = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 const [activeNav, setActiveNav] = useState('dashboard');


  // Navigation items with enhanced styling
  const navItems = [
    {
      title: 'Dashboard',
      id: 'dashboard',
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
    },
    // {
    //   title: 'CAR Requests',
    //   id: 'car',
    //   icon: FileText,
    //   color: 'text-purple-600',
    //   bgColor: 'bg-purple-50',
    //   hoverColor: 'hover:bg-purple-100',
    // },
    // {
    //   title: 'RFQ Management',
    //   id: 'rfq',
    //   icon: ShoppingCart,
    //   color: 'text-green-600',
    //   bgColor: 'bg-green-50',
    //   hoverColor: 'hover:bg-green-100',
    // },
    // {
    //   title: 'Approvals',
    //   id: 'approvals',
    //   icon: FileCheck,
    //   color: 'text-orange-600',
    //   bgColor: 'bg-orange-50',
    //   hoverColor: 'hover:bg-orange-100',
    // },
    // {
    //   title: 'Purchase Orders',
    //   id: 'po',
    //   icon: Package,
    //   color: 'text-indigo-600',
    //   bgColor: 'bg-indigo-50',
    //   hoverColor: 'hover:bg-indigo-100',
    // },
    // {
    //   title: 'Vendors',
    //   id: 'vendors',
    //   icon: Users,
    //   color: 'text-pink-600',
    //   bgColor: 'bg-pink-50',
    //   hoverColor: 'hover:bg-pink-100',
    // },
    // {
    //   title: 'Finance/Payment',
    //   id: 'finance',
    //   icon: DollarSign,
    //   color: 'text-emerald-600',
    //   bgColor: 'bg-emerald-50',
    //   hoverColor: 'hover:bg-emerald-100',
    // },
    // {
    //   title: 'EXIM/Dispatch',
    //   id: 'exim',
    //   icon: Truck,
    //   color: 'text-cyan-600',
    //   bgColor: 'bg-cyan-50',
    //   hoverColor: 'hover:bg-cyan-100',
    // },
    // {
    //   title: 'Asset Capitalization',
    //   id: 'assets',
    //   icon: Building2,
    //   color: 'text-amber-600',
    //   bgColor: 'bg-amber-50',
    //   hoverColor: 'hover:bg-amber-100',
    // },
    // {
    //   title: 'Reports & MIS',
    //   id: 'reports',
    //   icon: BarChart3,
    //   color: 'text-violet-600',
    //   bgColor: 'bg-violet-50',
    //   hoverColor: 'hover:bg-violet-100',
    // },
    {
      title: 'Masters Setup',
      id: 'masters',
      icon: Settings,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      hoverColor: 'hover:bg-slate-100',
    },
  ];

  const handleNavClick = (navId) => {
    setActiveNav(navId);
    console.log(`🔗 Navigation clicked: ${navId}`);
  };

  // Function to render content based on active navigation
  // Function to render content based on active navigation
  const renderContent = () => {
    switch (activeNav) {
      // 🟦 Dashboard → CarComponent
      case 'dashboard':
        return <CarComponent />;

      // 🟧 Masters Setup → MainComponent
      case 'masters':
        return <MainComponent />;

      // 🟪 CAR Requests agar alag view chahiye to yaha bana sakte ho
      case 'car':
        return (
          <div className="max-w-7xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold mb-2">CAR Requests</h2>
            <CarComponent />
          </div>
        );

      // 🔹 Baaki menu ke liye temporary placeholder
      default:
        return (
          <div className="max-w-7xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold capitalize">
              {activeNav.replace('_', ' ')}
            </h2>
            <p className="text-gray-600">
              This section is under construction. (ID: {activeNav})
            </p>
          </div>
        );
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* ========== ENHANCED TOP BAR ========== */}
      <header className="sticky top-0 z-50 w-full h-20 bg-white border-b border-gray-200 shadow-sm backdrop-blur-lg bg-white/95">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ?
                <Menu className="w-5 h-5 text-gray-600 group-hover:text-blue-600" /> :
                <Menu className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              }
            </button>

            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-gray-900 leading-none">CAPEX Portal</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
              <div className="hidden md:flex items-center ml-2 px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md">
                <span className="text-xs font-semibold text-blue-700">v1.0</span>
              </div>
            </div>
          </div>

          {/* Center - Search bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-lm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Quick stats (hidden on mobile) */}
            <div className="hidden xl:flex items-center gap-4 mr-4 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 leading-none">Active</p>
                  <p className="text-lm font-bold text-gray-900">24</p>
                </div>
              </div>
              <div className="w-px h-8 bg-green-200"></div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 leading-none">Pending</p>
                  <p className="text-lm font-bold text-gray-900">8</p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {/* <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button> */}

            {/* User menu */}
            <div className="flex items-center gap-2 ml-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-lm font-semibold text-gray-900 leading-none">Admin User</p>
                <p className="text-xs text-gray-500">admin@kalyani.com</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 hidden md:block" />
            </div>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTAINER ========== */}
      <div className="flex flex-grow overflow-hidden">
        {/* ========== ENHANCED SIDEBAR ========== */}
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg ${
            sidebarCollapsed ? 'w-20' : 'w-72'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <div>
                  <h2 className="text-lm font-bold text-gray-900">Kalyani</h2>
                  <p className="text-xs text-gray-500">Capex System</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title={sidebarCollapsed ? "Expand" : "Collapse"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation Section Label */}
          {!sidebarCollapsed && (
            <div className="px-4 pt-4 pb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</p>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={sidebarCollapsed ? item.title : ''}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r-full"></div>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        active
                          ? item.bgColor + ' ' + item.color
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                    </div>

                    {/* Label */}
                    {!sidebarCollapsed && (
                      <span className={`font-bold text-lg transition-colors ${active ? 'font-bold' : ''}`}>
                        {item.title}
                      </span>
                    )}

                    {/* Badge (optional) */}
                    {active && !sidebarCollapsed && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-100 p-4">
            {!sidebarCollapsed ? (
              <div className="space-y-3">
                {/* User profile card */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lm font-semibold text-gray-900 truncate">Admin User</p>
                    <p className="text-xs text-gray-500 truncate">admin@kalyani.com</p>
                  </div>
                </div>

                {/* Logout button */}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-bold text-lg">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                className="w-full p-3 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 mx-auto text-red-500 group-hover:text-red-600" />
              </button>
            )}
          </div>
        </aside>

        {/* ========== ENHANCED MAIN CONTENT AREA ========== */}
        <main className="flex-grow overflow-auto">
          <div className="h-full p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Main Layout component with Redux Provider
const Layout = () => {
  return (
    <Provider store={store}>
      <LayoutContent />
    </Provider>
  );
};

export default Layout;
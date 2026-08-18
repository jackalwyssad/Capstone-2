import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Toaster } from 'sonner';

/**
 * Layout Halaman Utama Dashboard
 * Menggabungkan Sidebar responsive, Topbar Navbar, container konten utama, Toast Notifications (Sonner), dan Footer.
 */
export const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans transition-colors duration-300">
      {/* Toast Notification Container */}
      <Toaster position="top-right" richColors />

      {/* Sidebar Navigasi */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Topbar Navbar */}
        <Navbar onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

        {/* Page Main Content Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

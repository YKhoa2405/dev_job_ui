import React, { useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Define routes where Header and Sidebar should not be shown
  const isAuthRoute = location.pathname === '/auth/login' || location.pathname === '/auth/register';

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {/* Page Wrapper */}
      <div className="flex h-screen overflow-hidden">
        {/* Render Sidebar only if not on auth routes */}
        {!isAuthRoute && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

        {/* Content Area */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* Render Header only if not on auth routes */}
          {!isAuthRoute && <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

          {/* Main Content */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;

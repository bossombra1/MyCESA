import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-light-bg">
      {/* Top Navigation */}
      <Navbar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-start overflow-hidden">
        <main className="flex-1 overflow-auto bg-light-bg p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

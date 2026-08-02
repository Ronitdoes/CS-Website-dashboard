import React from 'react';
import Sidebar from '@/components/admin/Sidebar';
import { redirect } from 'next/navigation';
import { logoutAction } from '@/lib/actions/auth';
import { cookies } from 'next/headers';
import { User, LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  const validToken = process.env.ADMIN_SESSION_TOKEN;

  if (!session || session !== validToken) {
    redirect('/login?error=unauthenticated');
  }

  const userEmail = cookieStore.get('admin_email')?.value || process.env.ADMIN_EMAIL || 'Administrator';

  return (
    <div className="min-h-screen bg-[#080808] text-gray-200 flex font-sans">
      {/* Sidebar navigation */}
      <Sidebar userEmail={userEmail} />

      
      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-16 border-b border-[#1f1f1f] bg-[#0c0c0c] flex items-center justify-between px-8">
          <div>
            <h1 className="text-xs text-gray-500 uppercase tracking-widest font-mono">Decoupled Dashboard</h1>
          </div>
          
          {/* Admin Profile & Logout Section in Header */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#f9ba1f]/10 border border-[#f9ba1f]/20 flex items-center justify-center text-[#f9ba1f] flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight font-sans">Administrator</p>
                <p className="text-[10px] text-gray-500 truncate font-mono max-w-[180px]" title={userEmail}>
                  {userEmail}
                </p>
              </div>
            </div>
            
            <div className="h-6 w-[1px] bg-[#1f1f1f]"></div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 transition-all font-sans cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </header>
        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
